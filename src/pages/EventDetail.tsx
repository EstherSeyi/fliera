import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Image as ImageIcon, Info, X, File } from "lucide-react";
import { Stage, Layer, Image as KonvaImage, Text, Group, Rect, Circle, Shape } from "react-konva";
import { useEvents } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EventDetailsModal } from "../components/EventDetailsModal";
import { ImageCropperModal } from "../components/ImageCropperModal";
import { getPlainTextSnippet } from "../lib/utils";
import type { Event } from "../types";

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getEvent, saveGeneratedDP } = useEvents();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stageRef = useRef<any>(null);

  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [userPhotoPreview, setUserPhotoPreview] = useState<string | null>(null);
  const [userTextInputs, setUserTextInputs] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [hasGeneratedDP, setHasGeneratedDP] = useState(false);

  // Image cropper states
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [originalImageSrc, setOriginalImageSrc] = useState<string>("");
  const [originalFileName, setOriginalFileName] = useState<string>("");

  // Konva stage states
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [flyerImage, setFlyerImage] = useState<HTMLImageElement | null>(null);
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
        
        // Initialize userTextInputs based on text placeholders
        const initialTextInputs = eventData.text_placeholders.map(() => "");
        setUserTextInputs(initialTextInputs);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, getEvent]);

  // Load flyer image when event loads
  useEffect(() => {
    if (event && containerRef.current) {
      loadFlyerImage();
    }
  }, [event]);

  // Load user image when photo preview changes
  useEffect(() => {
    if (userPhotoPreview) {
      loadUserImage();
    } else {
      setUserImage(null);
    }
  }, [userPhotoPreview]);

  // Generate DP when user photo or text inputs change
  useEffect(() => {
    if ((userPhotoPreview || userTextInputs.some(input => input.trim())) && event) {
      generateDP();
    }
  }, [userPhotoPreview, userTextInputs, event, flyerImage, userImage]);

  const loadFlyerImage = async () => {
    if (!event || !containerRef.current) return;

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = event.flyer_url;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      setFlyerImage(img);
      
      // Set stage size based on container and image dimensions
      const containerWidth = containerRef.current.offsetWidth;
      const scale = Math.min(containerWidth / img.width, 600 / img.height);
      
      setStageSize({
        width: img.width * scale,
        height: img.height * scale,
      });
    } catch (err) {
      console.error("Error loading flyer image:", err);
      setError("Failed to load event flyer");
    }
  };

  const loadUserImage = async () => {
    if (!userPhotoPreview) return;

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = userPhotoPreview;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      setUserImage(img);
    } catch (err) {
      console.error("Error loading user image:", err);
    }
  };

  const generateDP = async () => {
    if (!event || !flyerImage || !stageRef.current) return;

    setIsGenerating(true);
    try {
      // The Konva stage will automatically render with the current state
      // We just need to mark that we have a generated DP
      setHasGeneratedDP(true);
    } catch (err) {
      console.error("Error generating DP:", err);
      setError("Failed to generate DP");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePhotoUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string;
        setOriginalImageSrc(imageSrc);
        setOriginalFileName(file.name);
        setShowImageCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedFile: File, croppedImageUrl: string) => {
    setUserPhoto(croppedFile);
    setUserPhotoPreview(croppedImageUrl);
    setShowImageCropper(false);
  };

  const clearPhoto = () => {
    setUserPhoto(null);
    setUserPhotoPreview(null);
    // Clean up object URL to prevent memory leaks
    if (userPhotoPreview) {
      URL.revokeObjectURL(userPhotoPreview);
    }
  };

  const resetPageState = () => {
    setUserPhoto(null);
    if (userPhotoPreview) {
      URL.revokeObjectURL(userPhotoPreview);
    }
    setUserPhotoPreview(null);
    setUserTextInputs(event?.text_placeholders.map(() => "") || []);
    setHasGeneratedDP(false);
    setUserImage(null);
  };

  const handleTextInputChange = (index: number, value: string) => {
    const newInputs = [...userTextInputs];
    newInputs[index] = value;
    setUserTextInputs(newInputs);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const downloadDP = async () => {
    if (!stageRef.current || !hasGeneratedDP) return;

    try {
      setIsSaving(true);
      
      // Export the Konva stage as data URL
      const dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 2, // Higher quality export
      });

      // Download the DP
      const link = document.createElement("a");
      link.download = `${event?.title}-dp.png`;
      link.href = dataURL;
      link.click();

      // Save to database if user is logged in
      if (user && userPhoto && userTextInputs.some(input => input.trim()) && event) {
        await saveGeneratedDP({
          event_id: event.id,
          user_text_inputs: userTextInputs,
          user_photo: userPhoto,
          generated_image_data: dataURL,
        });

        // Show success toast and reset page
        showToast("Your DP has been successfully saved!", "success");
        
        // Reset the page state after a short delay to allow the toast to show
        setTimeout(() => {
          resetPageState();
        }, 500);
      } else {
        // For non-logged in users, just show download success
        showToast("Your DP has been downloaded successfully!", "success");
        
        // Reset the page state after a short delay
        setTimeout(() => {
          resetPageState();
        }, 500);
      }
    } catch (err) {
      console.error("Error saving DP:", err);
      showToast("Failed to save your DP. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const renderImagePlaceholder = () => {
    if (!event || !userImage) return null;

    const imagePlaceholder = event.image_placeholders[0];
    if (!imagePlaceholder) return null;

    const { x, y, width, height, holeShape } = imagePlaceholder;

    // Calculate object-fit: cover scaling and positioning
    const imageAspectRatio = userImage.width / userImage.height;
    const placeholderAspectRatio = width / height;

    let cropX = 0;
    let cropY = 0;
    let cropWidth = userImage.width;
    let cropHeight = userImage.height;

    if (imageAspectRatio > placeholderAspectRatio) {
      // Image is wider than placeholder - crop horizontally
      cropWidth = userImage.height * placeholderAspectRatio;
      cropX = (userImage.width - cropWidth) / 2;
    } else {
      // Image is taller than placeholder - crop vertically
      cropHeight = userImage.width / placeholderAspectRatio;
      cropY = (userImage.height - cropHeight) / 2;
    }

    return (
      <Group x={x} y={y} clipFunc={(ctx) => {
        ctx.beginPath();
        switch (holeShape) {
          case "circle": {
            const radius = Math.min(width, height) / 2;
            const centerX = radius;
            const centerY = radius;
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            break;
          }
          case "triangle":
            ctx.moveTo(width / 2, 0);
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            break;
          case "box":
          default:
            ctx.rect(0, 0, width, height);
            break;
        }
      }}>
        <KonvaImage
          image={userImage}
          x={0}
          y={0}
          width={width}
          height={height}
          crop={{
            x: cropX,
            y: cropY,
            width: cropWidth,
            height: cropHeight,
          }}
        />
      </Group>
    );
  };

  const renderTextPlaceholders = () => {
    if (!event || userTextInputs.length === 0) return null;

    return event.text_placeholders.map((placeholder, index) => {
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

      // Get the user input for this placeholder
      const userInput = userTextInputs[index] || "";
      if (!userInput.trim()) return null;

      // Transform the text according to textTransform
      let displayText = userInput;
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

      return (
        <Text
          key={index}
          x={x}
          y={y}
          width={width}
          text={displayText}
          fontSize={fontSize}
          fill={color}
          align={textAlign}
          fontFamily={fontFamily}
          fontStyle={fontStyle}
          fontWeight={fontWeight}
        />
      );
    });
  };

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

  const hasRequiredInputs = userTextInputs.some(input => input.trim()) || userPhotoPreview;

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
                  <p className="text-xs text-gray-500">
                    You'll be able to crop and edit your photo before using it
                  </p>
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

          {/* Dynamic Text Input Fields */}
          {event.text_placeholders.map((placeholder, index) => (
            <div key={index} className="space-y-2">
              <label htmlFor={`text-input-${index}`} className="block text-primary font-medium">
                {placeholder.labelText || `Text ${index + 1}`}
              </label>
              <input
                type="text"
                id={`text-input-${index}`}
                value={userTextInputs[index] || ""}
                onChange={(e) => handleTextInputChange(index, e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder={`Enter ${placeholder.labelText || `text ${index + 1}`}`}
              />
            </div>
          ))}
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-primary">Preview</h3>
          <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
            <div ref={containerRef} className="w-full">
              {flyerImage && stageSize.width > 0 && (
                <Stage
                  ref={stageRef}
                  width={stageSize.width}
                  height={stageSize.height}
                  scaleX={stageSize.width / flyerImage.width}
                  scaleY={stageSize.height / flyerImage.height}
                >
                  <Layer>
                    {/* Flyer Background */}
                    <KonvaImage
                      image={flyerImage}
                      x={0}
                      y={0}
                      width={flyerImage.width}
                      height={flyerImage.height}
                    />
                    
                    {/* User Image Placeholder */}
                    {renderImagePlaceholder()}
                    
                    {/* Text Placeholders */}
                    {renderTextPlaceholders()}
                  </Layer>
                </Stage>
              )}
            </div>
            {isGenerating && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <LoadingSpinner size={32} />
              </div>
            )}
          </div>

          <button
            onClick={downloadDP}
            disabled={!hasGeneratedDP || !hasRequiredInputs || isSaving}
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

      <ImageCropperModal
        isOpen={showImageCropper}
        onClose={() => setShowImageCropper(false)}
        imageSrc={originalImageSrc}
        onCropComplete={handleCropComplete}
        originalFileName={originalFileName}
      />
    </div>
  );
};