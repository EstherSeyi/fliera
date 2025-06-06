import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Image as ImageIcon, Info, X, File } from "lucide-react";
import { useEvents } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EventDetailsModal } from "../components/EventDetailsModal";
import { getPlainTextSnippet } from "../lib/utils";
import type { Event } from "../types";

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getEvent, saveGeneratedDP } = useEvents();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [userPhotoPreview, setUserPhotoPreview] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [hasGeneratedDP, setHasGeneratedDP] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventData = await getEvent(id || "");
        if (!eventData) {
          throw new Error("Event not found");
        }
        setEvent(eventData);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, getEvent]);

  // Initialize canvas with flyer when event loads
  useEffect(() => {
    if (event && canvasRef.current) {
      drawInitialFlyer();
    }
  }, [event]);

  const drawInitialFlyer = async () => {
    if (!event || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      const flyerImage = new Image();
      flyerImage.crossOrigin = "anonymous";
      flyerImage.src = event.flyer_url;
      
      await new Promise((resolve, reject) => {
        flyerImage.onload = resolve;
        flyerImage.onerror = reject;
      });

      canvas.width = flyerImage.width;
      canvas.height = flyerImage.height;
      ctx.drawImage(flyerImage, 0, 0);
    } catch (err) {
      console.error("Error drawing initial flyer:", err);
    }
  };

  const handlePhotoUpload = (file: File | null) => {
    setUserPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUserPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setUserPhotoPreview(null);
    }
  };

  const clearPhoto = () => {
    setUserPhoto(null);
    setUserPhotoPreview(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const drawClippedImage = (
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    placeholder: any
  ) => {
    const { x, y, width, height, holeShape } = placeholder;

    ctx.save();
    ctx.beginPath();

    switch (holeShape) {
      case "circle": {
        const radius = Math.min(width, height) / 2;
        const centerX = x + radius;
        const centerY = y + radius;
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        break;
      }
      case "triangle":
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        break;
      case "box":
      default:
        ctx.rect(x, y, width, height);
        break;
    }

    ctx.clip();

    // Calculate object-fit: cover scaling and positioning
    const imageAspectRatio = image.width / image.height;
    const placeholderAspectRatio = width / height;

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = image.width;
    let sourceHeight = image.height;

    if (imageAspectRatio > placeholderAspectRatio) {
      // Image is wider than placeholder - crop horizontally
      sourceWidth = image.height * placeholderAspectRatio;
      sourceX = (image.width - sourceWidth) / 2;
    } else {
      // Image is taller than placeholder - crop vertically
      sourceHeight = image.width / placeholderAspectRatio;
      sourceY = (image.height - sourceHeight) / 2;
    }

    // Draw the image with proper scaling and cropping
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight, // Source rectangle
      x,
      y,
      width,
      height // Destination rectangle
    );

    ctx.restore();
  };

  const generateDP = async () => {
    if (!event || !canvasRef.current) return;

    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      // Load and draw the flyer template
      const flyerImage = new Image();
      flyerImage.crossOrigin = "anonymous";
      flyerImage.src = event.flyer_url;
      await new Promise((resolve, reject) => {
        flyerImage.onload = resolve;
        flyerImage.onerror = reject;
      });

      canvas.width = flyerImage.width;
      canvas.height = flyerImage.height;
      ctx.drawImage(flyerImage, 0, 0);

      // Draw user's photo if available
      if (userPhotoPreview) {
        const userImage = new Image();
        userImage.src = userPhotoPreview;
        await new Promise((resolve, reject) => {
          userImage.onload = resolve;
          userImage.onerror = reject;
        });

        const imagePlaceholder = event.image_placeholders[0];
        if (imagePlaceholder) {
          drawClippedImage(ctx, userImage, imagePlaceholder);
        }
      }

      // Draw all text placeholders with proper positioning
      event.text_placeholders.forEach((placeholder) => {
        const {
          x,
          y,
          width,
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
        let displayText = userName ?? "";
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

        // Calculate proper x position based on textAlign
        let textX = x;
        if (textAlign === "center") {
          textX = x + width / 2;
        } else if (textAlign === "right") {
          textX = x + width;
        }

        // Calculate proper y position (Canvas fillText uses baseline, not top)
        // Add fontSize to y to account for the difference between Konva.Text (top) and Canvas fillText (baseline)
        const textY = y + fontSize;

        ctx.fillText(displayText, textX, textY);
      });

      setHasGeneratedDP(true);
    } catch (err) {
      console.error("Error generating DP:", err);
      setError("Failed to generate DP");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadDP = async () => {
    if (!canvasRef.current || !hasGeneratedDP) return;

    try {
      setIsSaving(true);
      
      // Download the DP
      const link = document.createElement("a");
      link.download = `${event?.title}-dp.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();

      // Save to database if user is logged in
      if (user && userPhoto && userName && event) {
        const canvasDataUrl = canvasRef.current.toDataURL();
        await saveGeneratedDP({
          event_id: event.id,
          user_name: userName,
          user_photo: userPhoto,
          generated_image_data: canvasDataUrl,
        });
      }
    } catch (err) {
      console.error("Error saving DP:", err);
      setError("Failed to save DP");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (userPhotoPreview || userName) {
      generateDP();
    }
  }, [userPhotoPreview, userName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center text-red-500 min-h-[50vh] flex items-center justify-center">
        <p>{error || "Event not found"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-4">
          <h1 className="text-4xl font-bold text-primary">{event.title}</h1>
          <button
            onClick={() => setShowEventModal(true)}
            className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
            title="View event details"
          >
            <Info className="w-6 h-6" />
          </button>
        </div>
        {event.description && (
          <div className="max-w-2xl mx-auto">
            <p className="text-secondary italic">
              {getPlainTextSnippet(event.description, 150)}
            </p>
            <button
              onClick={() => setShowEventModal(true)}
              className="text-primary hover:text-primary/80 text-sm mt-1 underline"
            >
              Read more
            </button>
          </div>
        )}
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
            
            {!userPhoto ? (
              <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/40 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e.target.files?.[0] || null)}
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
            ) : (
              <div className="space-y-3">
                {userPhotoPreview && (
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={userPhotoPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={clearPhoto}
                      className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                    >
                      <X className="w-5 h-5 text-primary" />
                    </button>
                  </div>
                )}
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <File className="w-4 h-4 text-gray-500" />
                      <span className="text-primary font-medium">{userPhoto.name}</span>
                    </div>
                    <button
                      onClick={clearPhoto}
                      className="text-red-500 hover:text-red-600 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatFileSize(userPhoto.size)}
                  </div>
                </div>
              </div>
            )}
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
                <LoadingSpinner size={32} />
              </div>
            )}
          </div>

          <button
            onClick={downloadDP}
            disabled={!hasGeneratedDP || isSaving}
            className="w-full flex items-center justify-center px-6 py-3 bg-thistle text-primary hover:bg-thistle/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <LoadingSpinner className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download Your DP
              </>
            )}
          </button>
          
          {user && hasGeneratedDP && (
            <p className="text-xs text-gray-500 text-center">
              Your DP will be saved to your account when downloaded
            </p>
          )}
        </motion.div>
      </div>

      <EventDetailsModal
        event={event}
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
      />
    </div>
  );
};