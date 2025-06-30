import React, { useState } from "react";
import { motion } from "framer-motion";
import { Info, Share2 } from "lucide-react";

import { useToast } from "../context/ToastContext";
import { useEventDetailContext } from "../context/EventDetails";

import { LoadingSpinner } from "../components/LoadingSpinner";
import { EventDetailsModal } from "../components/EventDetailsModal";
import { getPlainTextSnippet } from "../lib/utils";
import { Preview } from "./event-details/Preview";
import { DPInputForm } from "./event-details/DPInputForm";

export const EventDetail: React.FC = () => {
  const { showToast } = useToast();

  const [showEventModal, setShowEventModal] = useState(false);

  const {
    error,
    event,
    isLoading: loading,
    getEventError,
  } = useEventDetailContext();

  const handleShare = async () => {
    if (!event) return;

    const eventUrl = `${window.location.origin}/events/${event.id}`;
    const shareData = {
      title: event.title,
      text: `Check out this event: ${event.title}`,
      url: eventUrl,
    };

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
        showToast("Event shared successfully!", "success");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(eventUrl);
        showToast("Event link copied to clipboard!", "success");
      }
    } catch (error) {
      console.error("Error sharing event:", error);
      // Final fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(eventUrl);
        showToast("Event link copied to clipboard!", "success");
      } catch (clipboardError) {
        console.error("Error copying to clipboard:", clipboardError);
        showToast(
          "Unable to share event. Please copy the URL manually.",
          "error"
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (getEventError || error || !event) {
    return (
      <div className="text-center text-red-500 min-h-[50vh] flex items-center justify-center">
        <p>{getEventError?.message ?? error ?? "Event not found"}</p>
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEventModal(true)}
              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="View event details"
            >
              <Info className="w-6 h-6" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="Share event"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
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
        <DPInputForm />
        <Preview />
      </div>

      <EventDetailsModal
        event={event}
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
      />
    </div>
  );
};
