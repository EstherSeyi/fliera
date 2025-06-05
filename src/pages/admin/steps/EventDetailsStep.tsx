import React from "react";
import { motion } from "framer-motion";
import { useFormContext, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { CreateEventFormData, EventVisibility, EventCategory } from "../../../types";
import { FileUploadInput } from "../../../components/FileUploadInput";
import { RichTextEditor } from "../../../components/RichTextEditor";
import { Eye, EyeOff, Archive } from "lucide-react";

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
  } = useFormContext<CreateEventFormData>();

  const selectedVisibility = watch("visibility");

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
              className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
              placeholderText="Select date and time"
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
        <select
          id="category"
          {...register("category")}
          className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="">Select a category</option>
          {CATEGORY_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-primary font-medium">
          Description
        </label>
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

      <Controller
        name="flyer_file"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <FileUploadInput
            label="Flyer Image"
            value={value}
            onChange={onChange}
            error={error?.message}
            accept="image/*"
            maxSize={2 * 1024 * 1024}
          />
        )}
      />
    </motion.div>
  );
};