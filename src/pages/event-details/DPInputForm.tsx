import { motion } from "framer-motion";
import { ImageIcon, File, X } from "lucide-react";
import { useState } from "react";

import { ImageCropperModal } from "../../components/ImageCropperModal";
import { formatFileSize } from "../../lib/utils";
import { useEventDetailContext } from "../../context/EventDetails";

export const DPInputForm = () => {
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [originalImageSrc, setOriginalImageSrc] = useState<string>("");
  const [originalFileName, setOriginalFileName] = useState<string>("");

  const {
    userPhoto,
    setUserPhoto,
    userPhotoPreview,
    setUserPhotoPreview,
    event,
    userTextInputs,
    setUserTextInputs,
  } = useEventDetailContext();

  const handlePhotoUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
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

  const handleTextInputChange = (index: number, value: string) => {
    const newInputs = [...userTextInputs];
    newInputs[index] = value;

    setUserTextInputs(newInputs);
  };

  return (
    <>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="space-y-4">
          <label className="block text-primary font-medium">
            Upload Your Photo *
          </label>

          {!userPhoto ? (
            <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/40 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={e => handlePhotoUpload(e.target.files?.[0] || null)}
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
                    <span className="text-primary font-medium">
                      {userPhoto.name}
                    </span>
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
        {event?.text_placeholders.map((placeholder, index) => (
          <div key={index} className="space-y-2">
            <label
              htmlFor={`text-input-${index}`}
              className="block text-primary font-medium"
            >
              {placeholder.labelText || `Text ${index + 1}`} *
            </label>
            <input
              type="text"
              id={`text-input-${index}`}
              value={userTextInputs?.[index] || ""}
              onChange={e => handleTextInputChange(index, e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder={`Enter ${
                placeholder.labelText || `text ${index + 1}`
              }`}
              required
            />
          </div>
        ))}
      </motion.div>

      <ImageCropperModal
        isOpen={showImageCropper}
        onClose={() => setShowImageCropper(false)}
        imageSrc={originalImageSrc}
        onCropComplete={handleCropComplete}
        originalFileName={originalFileName}
      />
    </>
  );
};
