import React from "react";
import { motion } from "framer-motion";
import { Calendar, Eye, Tag, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "./ui/dialog";
import type { Event } from "../types";

interface EventDetailsModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const getVisibilityInfo = (visibility: string) => {
    const visibilityMap = {
      public: { label: "Public", color: "text-green-600", bg: "bg-green-100" },
      private: {
        label: "Private",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      },
      archived: {
        label: "Archived",
        color: "text-gray-600",
        bg: "bg-gray-100",
      },
    };
    return (
      visibilityMap[visibility as keyof typeof visibilityMap] ||
      visibilityMap.public
    );
  };

  const getCategoryInfo = (category: string) => {
    const categoryMap = {
      business: {
        label: "Business",
        color: "text-blue-600",
        bg: "bg-blue-100",
      },
      technology: {
        label: "Technology",
        color: "text-purple-600",
        bg: "bg-purple-100",
      },
      music: { label: "Music", color: "text-pink-600", bg: "bg-pink-100" },
      social: {
        label: "Social",
        color: "text-orange-600",
        bg: "bg-orange-100",
      },
      sports: { label: "Sports", color: "text-red-600", bg: "bg-red-100" },
      activism: {
        label: "Activism",
        color: "text-indigo-600",
        bg: "bg-indigo-100",
      },
      other: { label: "Other", color: "text-gray-600", bg: "bg-gray-100" },
    };
    return (
      categoryMap[category as keyof typeof categoryMap] || categoryMap.other
    );
  };

  const { date, time } = formatDateTime(event.date);
  const visibilityInfo = getVisibilityInfo(event.visibility);
  const categoryInfo = getCategoryInfo(event.category);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Event Details</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Event Title */}
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">
                {event.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${categoryInfo.bg} ${categoryInfo.color}`}
                >
                  <Tag className="w-4 h-4 mr-1" />
                  {categoryInfo.label}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${visibilityInfo.bg} ${visibilityInfo.color}`}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {visibilityInfo.label}
                </span>
              </div>
            </div>

            {/* Date and Time */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 text-primary mr-2" />
                <span className="font-semibold text-primary">
                  Date & Time
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-gray-800 font-medium">{date}</p>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-500 mr-1" />
                  <p className="text-gray-600">{time}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <h4 className="font-semibold text-primary mb-3">
                  Description
                </h4>
                <div
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              </div>
            )}

            {/* Event Flyer */}
            <div>
              <h4 className="font-semibold text-primary mb-3">Event Flyer</h4>
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={event.flyer_url}
                  alt={event.title}
                  className="w-full h-auto max-h-96 object-contain bg-gray-50"
                />
              </div>
            </div>

            {/* Template Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-2">
                Template Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Image Placeholders:</span>
                  <span className="ml-2 font-medium">
                    {event.image_placeholders.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Text Placeholders:</span>
                  <span className="ml-2 font-medium">
                    {event.text_placeholders.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Created Date */}
            {event.created_at && (
              <div className="text-sm text-gray-500 border-t pt-4">
                Created on{" "}
                {new Date(event.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}
          </motion.div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};