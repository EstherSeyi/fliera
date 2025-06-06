import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { useEvents } from "../../context/EventContext";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import type { Event } from "../../types";

export const EditEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEvent, updateEvent } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, getEvent]);

  const handleSave = async () => {
    if (!event || !id) return;

    try {
      setSaving(true);
      setError(null);
      
      // For now, we'll just update basic fields
      // In a full implementation, you'd have a form to edit all event properties
      await updateEvent(id, {
        title: event.title,
        description: event.description,
        visibility: event.visibility,
        category: event.category,
      });

      navigate("/my-events");
    } catch (err) {
      console.error("Error updating event:", err);
      setError("Failed to update event");
    } finally {
      setSaving(false);
    }
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
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-primary font-medium">
                  Event Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={event.title}
                  onChange={(e) => setEvent({ ...event, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="block text-primary font-medium">
                  Category
                </label>
                <select
                  id="category"
                  value={event.category}
                  onChange={(e) => setEvent({ ...event, category: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="business">Business</option>
                  <option value="technology">Technology</option>
                  <option value="music">Music</option>
                  <option value="social">Social</option>
                  <option value="sports">Sports</option>
                  <option value="activism">Activism</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="visibility" className="block text-primary font-medium">
                Visibility
              </label>
              <select
                id="visibility"
                value={event.visibility}
                onChange={(e) => setEvent({ ...event, visibility: e.target.value as any })}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-primary font-medium">
                Description
              </label>
              <textarea
                id="description"
                value={event.description || ""}
                onChange={(e) => setEvent({ ...event, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Event description..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-primary font-medium">
                Current Flyer
              </label>
              <div className="border rounded-lg p-4">
                <img
                  src={event.flyer_url}
                  alt={event.title}
                  className="max-w-xs h-auto rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-6 py-2 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-medium mb-2">Note</h3>
          <p className="text-yellow-700 text-sm">
            This is a basic edit interface. In a full implementation, you would be able to 
            edit the flyer image, image placeholders, and text placeholders as well. 
            For now, you can only modify the basic event information.
          </p>
        </div>
      </motion.div>
    </div>
  );
};