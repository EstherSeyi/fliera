import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { Upload, X } from 'lucide-react';
import type { CreateEventFormData } from '../../../types';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

export const EventDetailsStep: React.FC = () => {
  const { register, formState: { errors }, watch, setValue } = useFormContext<CreateEventFormData>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const flyerFile = watch('flyer_file');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearFile = () => {
    setValue('flyer_file', undefined as any);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <label htmlFor="title" className="block text-primary font-medium">
          Event Title
        </label>
        <input
          type="text"
          id="title"
          {...register('title', { required: 'Title is required' })}
          className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="date" className="block text-primary font-medium">
          Event Date
        </label>
        <input
          type="date"
          id="date"
          {...register('date', { required: 'Date is required' })}
          className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {errors.date && (
          <p className="text-red-500 text-sm">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-primary font-medium">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary h-32"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-primary font-medium">
          Flyer Image
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            id="flyer_file"
            className="hidden"
            {...register('flyer_file', {
              required: 'Flyer image is required',
              validate: {
                fileSize: (files) => {
                  const file = files?.[0];
                  if (file && file.size > MAX_FILE_SIZE) {
                    return 'File size must be less than 2MB';
                  }
                  return true;
                },
                fileType: (files) => {
                  const file = files?.[0];
                  if (file && !file.type.startsWith('image/')) {
                    return 'File must be an image';
                  }
                  return true;
                },
              },
            })}
            onChange={handleFileChange}
          />
          
          <AnimatePresence mode="wait">
            {!flyerFile?.length ? (
              <motion.label
                htmlFor="flyer_file"
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
                  <p className="text-primary/80 font-medium mb-1">Click to upload your flyer image</p>
                  <p className="text-secondary text-sm">PNG, JPG up to 2MB</p>
                </motion.div>
              </motion.label>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative rounded-lg overflow-hidden"
              >
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5 text-primary" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {errors.flyer_file && (
          <p className="text-red-500 text-sm">{errors.flyer_file.message}</p>
        )}
      </div>
    </motion.div>
  );
};