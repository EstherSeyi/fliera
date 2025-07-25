import React from "react";
import { motion } from "framer-motion";
import { useFormContext, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type {
  EditEventFormData,
  EventVisibility,
  EventCategory,
  Event,
} from "../../../types";
import { FileUploadInput } from "../../../components/FileUploadInput";
import { Eye, EyeOff, Archive } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import clsx from "clsx";

const VISIBILITY_OPTIONS: {
  value: EventVisibility;
  label: string;
  icon: React.FC;
}[] = [
  { value: "public", label: "Public", icon: Eye },
  { value: "private", label: "Private", icon: EyeOff },
  { value: "archived", label: "Archived", icon: Archive },
];

const CATEGORY_OPTIONS: { value: EventCategory; label: string }[] = [
  { value: "business", label: "Business" },
  { value: "technology", label: "Technology" },
  { value: "music", label: "Music" },
  { value: "social", label: "Social" },
  { value: "sports", label: "Sports" },
  { value: "activism", label: "Activism" },
  { value: "other", label: "Other" },
];

interface EditEventDetailsStepProps {
  event: Event;
  isEventPast: boolean;
  currentFlyerPreviewUrl: string;
}

export const EditEventDetailsStep: React.FC<EditEventDetailsStepProps> = ({
  event,
  isEventPast,
  currentFlyerPreviewUrl,
}) => {
  const {
    register,
    formState: { errors },
    control,
    watch,
  } = useFormContext<EditEventFormData>();

  const selectedVisibility = watch("visibility");
  const currentDescriptionLength = watch("description")?.length ?? 0;

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
              minDate={isEventPast ? undefined : new Date()}
              className="w-full"
              placeholderText="Select date and time"
              disabled={isEventPast}
              filterTime={(time) => {
                if (isEventPast) return true; // Allow all times for past events

                const selectedDate = field.value
                  ? new Date(field.value)
                  : new Date();
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
        {isEventPast && (
          <p className="text-yellow-600 text-sm">
            Date editing is disabled for past events
          </p>
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
        <label htmlFor="description" className="block text-primary font-medium">
          Description
        </label>
        <div className="relative">
          <textarea
            {...register("description")}
            id="description"
            placeholder="Briefly describe the purpose, theme, or mood of this event..."
            className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
            rows={8}
            maxLength={1000}
          ></textarea>
          <span
            className={clsx(
              "absolute right-2 bottom-2 text-xs text-black bg-white",
              currentDescriptionLength >= 1000
                ? "text-red-500"
                : "text-gray-500"
            )}
          >
            {currentDescriptionLength}/1000
          </span>
        </div>
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-primary font-medium">
            Current Flyer
          </label>
          <div className="border rounded-lg p-4 bg-gray-50">
            <img
              src={currentFlyerPreviewUrl || event.flyer_url}
              alt={event.title}
              className="max-w-xs h-auto rounded-lg mx-auto"
            />
          </div>
        </div>

        <Controller
          name="flyer_file"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <FileUploadInput
              label="Replace Flyer Image (Optional)"
              value={value}
              onChange={onChange}
              error={error?.message}
              accept="image/*"
              maxSize={2 * 1024 * 1024}
            />
          )}
        />
        <p className="text-sm text-gray-600">
          Leave empty to keep the current flyer image
        </p>
      </div>
    </motion.div>
  );
};
