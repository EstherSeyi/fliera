import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, ArrowRight, Clock } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isPast } from "date-fns";
import { useEvents } from "../../context/EventContext";
import { useToast } from "../../context/ToastContext";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { supabase } from "../../lib/supabase";
import type { Event, EditEventFormData } from "../../types";
import { editEventSchema } from "../../validation/editEventSchema";
import { EditEventDetailsStep } from "./steps/EditEventDetailsStep";
import { EditImagePlaceholderStep } from "./steps/EditImagePlaceholderStep";
import { EditTextPlaceholderStep } from "./steps/EditTextPlaceholderStep";
import { EditPreviewStep } from "./steps/EditPreviewStep";

const STEPS = [
  { id: "details", title: "Event Details" },
  { id: "image", title: "Image Placeholder" },
  { id: "text", title: "Text Placeholders" },
  { id: "preview", title: "Preview" },
];

export const EditEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEvent, updateEvent } = useEvents();
  const { showToast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const methods = useForm<EditEventFormData>({
    resolver: zodResolver(editEventSchema),
    mode: "onChange",
  });

  const isEventPast = event ? isPast(new Date(event.date)) : false;

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError("Event ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const eventData = await getEvent(id);
        if (!eventData) {
          throw new Error("Event not found");
        }
        setEvent(eventData);

        // Populate form with event data
        methods.reset({
          title: eventData.title,
          date: eventData.date,
          description: eventData.description || "",
          visibility: eventData.visibility,
          category: eventData.category,
          image_placeholders: eventData.image_placeholders,
          text_placeholders: eventData.text_placeholders,
          flyer_file: null, // File will be handled separately
        });
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, getEvent, methods]);

  const onSubmit = async (data: EditEventFormData) => {
    if (!event || !id) return;

    // Only proceed with form submission if we're on the last step
    if (currentStep !== STEPS.length - 1) return;

    setSaving(true);
    setError(null);

    try {
      let flyerUrl = event.flyer_url; // Keep existing flyer URL by default

      // If a new flyer file is uploaded, upload it and get the new URL
      if (data.flyer_file) {
        const file = data.flyer_file;
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `event-flyers/${fileName}`;

        // Upload new file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("event-flyers")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get the public URL for the uploaded file
        const {
          data: { publicUrl },
        } = supabase.storage.from("event-flyers").getPublicUrl(filePath);

        flyerUrl = publicUrl;

        // Optionally, delete the old flyer file
        try {
          const oldUrl = new URL(event.flyer_url);
          const oldPathParts = oldUrl.pathname.split('/');
          const oldFileName = oldPathParts[oldPathParts.length - 1];
          const oldFilePath = `event-flyers/${oldFileName}`;
          
          await supabase.storage
            .from("event-flyers")
            .remove([oldFilePath]);
        } catch (deleteError) {
          console.warn("Failed to delete old flyer:", deleteError);
          // Continue even if old file deletion fails
        }
      }

      const updatedEventData: Partial<Event> = {
        title: data.title,
        date: data.date,
        description: data.description,
        visibility: data.visibility,
        category: data.category,
        image_placeholders: data.image_placeholders,
        text_placeholders: data.text_placeholders,
        flyer_url: flyerUrl,
      };

      await updateEvent(id, updatedEventData);
      showToast("Event updated successfully!", "success");
      navigate("/my-events");
    } catch (err) {
      console.error("Error updating event:", err);
      setError("Failed to update event. Please try again.");
      showToast("Failed to update event", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    const isValid = await methods.trigger();
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
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
        <div>
          <p className="mb-4">{error || "Event not found"}</p>
          <button
            onClick={() => navigate("/my-events")}
            className="inline-flex items-center px-4 py-2 bg-primary text-neutral rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to My Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/my-events")}
              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to My Events
            </button>
            <h1 className="text-4xl font-bold text-primary">Edit Event</h1>
            <p className="mt-2 text-secondary">
              Modify your event details and settings
            </p>
            {isEventPast && (
              <div className="mt-3 flex items-center px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <Clock className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">
                  This event has already passed. Changes are limited to prevent data inconsistency.
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {STEPS.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index <= currentStep
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="ml-2 text-sm font-medium hidden sm:block">
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 mx-4 h-0.5 bg-gray-200">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{
                          width: `${index < currentStep ? "100%" : "0%"}`,
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <EditEventDetailsStep 
                    event={event} 
                    isEventPast={isEventPast} 
                  />
                )}
                {currentStep === 1 && (
                  <EditImagePlaceholderStep 
                    event={event} 
                    isEventPast={isEventPast} 
                  />
                )}
                {currentStep === 2 && (
                  <EditTextPlaceholderStep 
                    event={event} 
                    isEventPast={isEventPast} 
                  />
                )}
                {currentStep === 3 && (
                  <EditPreviewStep 
                    event={event} 
                    isEventPast={isEventPast} 
                  />
                )}
              </AnimatePresence>

              <div className="flex justify-between pt-6 border-t">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center px-4 py-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                )}

                {currentStep < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={(evt) => {
                      evt.preventDefault();
                      handleNext();
                    }}
                    className="ml-auto flex items-center px-6 py-2 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors"
                  >
                    Next
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={saving || isEventPast}
                    className="ml-auto flex items-center px-6 py-2 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <LoadingSpinner className="mr-2" />
                        Saving changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </FormProvider>
        </div>

        {isEventPast && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-yellow-800 font-medium mb-2">Past Event Notice</h3>
            <p className="text-yellow-700 text-sm">
              This event has already occurred. While you can view and make minor adjustments to the event details, 
              major changes like the event date are restricted to maintain data integrity. 
              Consider creating a new event for future dates.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};