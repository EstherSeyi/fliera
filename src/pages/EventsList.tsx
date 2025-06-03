import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEvents } from "../context/EventContext";
import { Calendar, ArrowRight } from "lucide-react";
import { LoadingSpinner } from "../components/LoadingSpinner";

export const EventsList: React.FC = () => {
  const { events, loading, error } = useEvents();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 min-h-[50vh] flex items-center justify-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-primary">Upcoming Events</h1>
        <p className="text-secondary max-w-2xl mx-auto">
          Choose an event to create your personalized display picture
        </p>
      </motion.div>

      {events.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-secondary py-12"
        >
          <p>No events available at the moment.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={event.flyer_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center text-secondary">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>

                <h3 className="text-xl font-bold text-primary">{event.title}</h3>
                <p className="text-secondary line-clamp-2">{event.description}</p>

                <Link
                  to={`/events/${event.id}`}
                  className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                >
                  Create Your DP
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};