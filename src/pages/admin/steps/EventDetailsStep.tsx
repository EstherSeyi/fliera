import React, { useState } from "react";
import { motion } from "framer-motion";
import { useFormContext, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Upload, FileImage, Sparkles } from "lucide-react";
import type { CreateEventFormData, EventVisibility, EventCategory } from "../../../types";
import { FileUploadInput } from "../../../components/FileUploadInput";
import { RichTextEditor } from "../../../components/RichTextEditor";
import { FlierTemplateSelectionModal } from "../../../components/FlierTemplateSelectionModal";
import { AIDescriptionGeneratorDialog } from "../../../components/AIDescriptionGeneratorDialog";
import { Eye, EyeOff, Archive } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

const VISIBILITY_OPTIONS: { value: EventVisibility; label: string; icon: React.FC }[] = [
  { value: 'public', label: 'Public', icon: Eye },
  { value: 'private', label: 'Private', icon: EyeOff },
  { value: 'archived', label: 'Archived', icon: Archive },
];

const CATEGORY_OPTIONS: { value: EventCategory; label: string }[] = [
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Technology' },
  { value: 'music', label: 'Music' },
  { value: 'social', label: 'Social' },
  { value: 'sports', label: 'Sports' },
  { value: 'activism', label: 'Activism' },
  { value: 'other', label: 'Other' },
];

export const EventDetailsStep: React.FC = () => {
  const {
    register,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useFormContext<CreateEventFormData>();

  const selectedVisibility = watch("visibility");
  const useTemplate = watch("use_template");
  const flyerFile = watch("flyer_file");
  const currentTitle = watch("title");
  const currentDate = watch("date");
  const currentDescription = watch("description");

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [generatedFlyerUrl, setGeneratedFlyerUrl] = useState<string | null>(null);

  const handleTemplateSelected = (
    generatedImageUrl: string,
    imagePlaceholders: any[],
    textPlaceholders: any[]
  ) => {
    // Convert the data URL to a File object
    fetch(generatedImageUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'template-flyer.png', { type: 'image/png' });
        setValue('flyer_file', file);
        setValue('image_placeholders', imagePlaceholders);
        setValue('text_placeholders', textPlaceholders);
        setGeneratedFlyerUrl(generatedImageUrl);
      });
  };

  const handleFlyerMethodChange = (method: 'upload' | 'template') => {
    setValue('use_template', method === 'template');
    if (method === 'upload') {
      setValue('flyer_file', null);
      setGeneratedFlyerUrl(null);
    }
  };

  const handleAIDescriptionGenerated = (description: string) => {
    setValue('description', description);
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
          {...register("title")}
          className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="e.g. John & Ada's Wedding, Tech Connect 2025, Gospel Vibes Concert"
        />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="date" className="block text-primary font-medium">
          Event Date & Time
        </label>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DatePicker
              selected={field.value ? new Date(field.value) : null}
              onChange={(date) => field.onChange(date?.toISOString())}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              className="w-full"
              placeholderText="Select date and time"
              filterTime={(time) => {
                const selectedDate = field.value ? new Date(field.value) : new Date();
                const now = new Date();
                
                // If the selected date is today, disable past times
                if (selectedDate.toDateString() === now.toDateString()) {
                  return time.getTime() > now.getTime();
                }
                
                // For future dates, all times are allowed
                return true;
              }}
            />
          )}
        />
        {errors.date && (
          <p className="text-red-500 text-sm">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-primary font-medium">Visibility</label>
        <div className="grid grid-cols-3 gap-4">
          {VISIBILITY_OPTIONS.map(({ value, label, icon: Icon }) => (
            <label
              key={value}
              className={`
                flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                ${
                  selectedVisibility === value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-primary/20 hover:border-primary/40"
                }
              `}
            >
              <input
                type="radio"
                {...register("visibility")}
                value={value}
                className="sr-only"
              />
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </label>
          ))}
        </div>
        {errors.visibility && (
          <p className="text-red-500 text-sm">{errors.visibility.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="category" className="block text-primary font-medium">
          Category
        </label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && (
          <p className="text-red-500 text-sm">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="description" className="block text-primary font-medium">
            Description
          </label>
          <button
            type="button"
            onClick={() => setShowAIDialog(true)}
            className="flex items-center px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Generate with AI
          </button>
        </div>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="Briefly describe the purpose, theme, or mood of this event..."
            />
          )}
        />
      </div>

      {/* Flyer Selection Method */}
      <div className="space-y-4">
        <label className="block text-primary font-medium">
          Event Flyer
        </label>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleFlyerMethodChange('upload')}
            className={`p-4 border-2 rounded-lg transition-all ${
              !useTemplate
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <div className="text-sm font-medium">Upload Custom Flyer</div>
            <div className="text-xs text-gray-500 mt-1">
              Upload your own flyer image
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleFlyerMethodChange('template')}
            className={`p-4 border-2 rounded-lg transition-all ${
              useTemplate
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <FileImage className="w-8 h-8 mx-auto mb-2" />
            <div className="text-sm font-medium">Use Template</div>
            <div className="text-xs text-gray-500 mt-1">
              Choose from pre-made templates
            </div>
          </button>
        </div>

        {useTemplate ? (
          <div className="space-y-4">
            {generatedFlyerUrl ? (
              <div className="space-y-3">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img
                    src={generatedFlyerUrl}
                    alt="Generated flyer"
                    className="max-w-xs h-auto rounded-lg mx-auto"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(true)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Choose Different Template
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowTemplateModal(true)}
                className="w-full px-4 py-2 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors"
              >
                Choose Template
              </button>
            )}
          </div>
        ) : (
          <Controller
            name="flyer_file"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <FileUploadInput
                label=""
                value={value}
                onChange={onChange}
                error={error?.message}
                accept="image/*"
                maxSize={2 * 1024 * 1024}
              />
            )}
          />
        )}
      </div>

      <FlierTemplateSelectionModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onTemplateSelected={handleTemplateSelected}
      />

      <AIDescriptionGeneratorDialog
        isOpen={showAIDialog}
        onClose={() => setShowAIDialog(false)}
        onDescriptionGenerated={handleAIDescriptionGenerated}
        initialTitle={currentTitle}
        initialDate={currentDate}
      />
    </motion.div>
  );
};