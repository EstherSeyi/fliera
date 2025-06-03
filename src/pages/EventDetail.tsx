import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Image as ImageIcon } from "lucide-react";
import { useEvents } from "../context/EventContext";

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getEvent } = useEvents();
  const event = getEvent(id || "");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUserPhoto(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateDP = async () => {
    if (!event || !userPhoto || !canvasRef.current) return;

    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load and draw the flyer template
    const flyerImage = new Image();
    flyerImage.crossOrigin = "anonymous";
    flyerImage.src = event.flyer_url;
    await new Promise((resolve) => {
      flyerImage.onload = resolve;
    });

    canvas.width = flyerImage.width;
    canvas.height = flyerImage.height;
    ctx.drawImage(flyerImage, 0, 0);

    // Load and draw the user's photo in the first image placeholder
    const userImage = new Image();
    userImage.src = userPhoto;
    await new Promise((resolve) => {
      userImage.onload = resolve;
    });

    const imagePlaceholder = event.image_placeholders[0];
    if (imagePlaceholder) {
      const { x, y, width, height } = imagePlaceholder;
      ctx.drawImage(userImage, x, y, width, height);
    }

    // Draw all text placeholders
    event.text_placeholders.forEach((placeholder) => {
      const {
        x,
        y,
        text,
        fontSize,
        color,
        textAlign,
        fontFamily,
        fontStyle,
        fontWeight,
        textTransform,
      } = placeholder;

      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}"`;
      ctx.fillStyle = color;
      ctx.textAlign = textAlign;

      // Transform the text according to textTransform
      let displayText = text || userName;
      if (textTransform === "uppercase") {
        displayText = displayText.toUpperCase();
      } else if (textTransform === "lowercase") {
        displayText = displayText.toLowerCase();
      } else if (textTransform === "capitalize") {
        displayText = displayText
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }

      ctx.fillText(displayText, x, y);
    });

    setIsGenerating(false);
  };

  const downloadDP = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `${event?.title}-dp.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  useEffect(() => {
    if (userPhoto && userName) {
      generateDP();
    }
  }, [userPhoto, userName]);

  if (!event) {
    return <div className="text-center text-primary">Event not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-primary">{event.title}</h1>
        <p className="text-secondary">{event.description}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-4">
            <label className="block text-primary font-medium">
              Upload Your Photo
            </label>
            <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/40 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer space-y-2 block"
              >
                <ImageIcon className="w-8 h-8 mx-auto text-primary/60" />
                <span className="text-secondary">
                  Click to upload your photo
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="block text-primary font-medium">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Enter your name"
            />
          </div>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-primary">Preview</h3>
          <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-auto" />
            {isGenerating && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          <button
            onClick={downloadDP}
            disabled={!userPhoto || !userName || isGenerating}
            className="w-full flex items-center justify-center px-6 py-3 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Your DP
          </button>
        </motion.div>
      </div>
    </div>
  );
};
