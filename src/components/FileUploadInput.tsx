import React, { useEffect, useState } from "react";
import { Upload, X, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadInputProps {
  value: File | null;
  onChange: (file: File | null) => void;
  label?: string;
  accept?: string;
  maxSize?: number;
  error?: string;
  disabled?: boolean;
}

export const FileUploadInput: React.FC<FileUploadInputProps> = ({
  value,
  onChange,
  label = "Upload File",
  accept = "image/*",
  maxSize = 2 * 1024 * 1024,
  error,
  disabled = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (value && value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl("");
    }
    return () => {};
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > maxSize) {
        onChange(null);
        return;
      }
      onChange(file);
    }
  };

  const clearFile = () => {
    onChange(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor="file-upload" className="block text-primary font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id="file-upload"
          type="file"
          accept={accept}
          className="absolute -z-[1] h-[0.1px] w-[0.1px] overflow-hidden opacity-0"
          onChange={handleFileChange}
          disabled={disabled}
        />

        <AnimatePresence mode="wait">
          {!value ? (
            <motion.label
              htmlFor="file-upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="group cursor-pointer flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-primary/20 rounded-lg hover:border-primary/40 transition-colors bg-neutral/50"
            >
              <motion.div
                className="flex flex-col items-center justify-center px-4 py-6 text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="w-12 h-12 text-primary/60 mb-4 group-hover:text-primary/80 transition-colors" />
                <p className="text-primary/80 font-medium mb-1">
                  Click to upload your file
                </p>
                <p className="text-secondary text-sm">
                  {accept === "image/*" ? "PNG, JPG" : accept} up to{" "}
                  {Math.round(maxSize / 1024 / 1024)}MB
                </p>
              </motion.div>
            </motion.label>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {previewUrl ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={clearFile}
                    disabled={disabled}
                    className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                  >
                    <X className="w-5 h-5 text-primary" />
                  </button>
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-primary/20 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <File className="w-8 h-8 text-primary/60" />
                      <div>
                        <p className="text-primary font-medium">{value.name}</p>
                        <p className="text-secondary text-sm">
                          {formatFileSize(value.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearFile}
                      disabled={disabled}
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* File info display */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">File selected:</span>
                  <span className="text-primary font-medium">{value.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Size:</span>
                  <span className="text-secondary">{formatFileSize(value.size)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};