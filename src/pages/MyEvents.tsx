import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Eye, Edit, Plus } from "lucide-react";
import { useEvents } from "../context/EventContext";
import { LoadingSpinner } from "../components/LoadingSpinner";
import type { Event } from "../types";

export const MyEvents: React.FC = () => {
  const { fetchEventsByUser } = useEvents();
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const events = await fetchEventsByUser();
        setUserEvents(events);
      } catch (err) {
        console.error("Error loading user events:", err);
        setError("Failed to load your events");
      } finally {
        setLoading(false);
      }
    };

    loadUserEvents();
  }, [fetchEventsByUser]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getVisibilityBadge = (visibility: string) => {
    // Handle null/undefined visibility with fallback
    const safeVisibility = visibility || "public";
    
    const colors = {
      public: "bg-green-100 text-green-800",
      private: "bg-yellow-100 text-yellow-800",
      archived: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          colors[safeVisibility as keyof typeof colors] || colors.public
        }`}
      >
        {safeVisibility.charAt(0).toUpperCase() + safeVisibility.slice(1)}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    // Handle null/undefined category with fallback
    const safeCategory = category || "other";
    
    const colors = {
      business: "bg-blue-100 text-blue-800",
      technology: "bg-purple-100 text-purple-800",
      music: "bg-pink-100 text-pink-800",
      social: "bg-orange-100 text-orange-800",
      sports: "bg-red-100 text-red-800",
      activism: "bg-indigo-100 text-indigo-800",
      other: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          colors[safeCategory as keyof typeof colors] || colors.other
        }`}
      >
        {safeCategory.charAt(0).toUpperCase() + safeCategory.slice(1)}
      </span>
    );
  };

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
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-bold text-primary">My Events</h1>
          <p className="text-secondary mt-2">
            Manage and view all the events you've created
          </p>
        </div>
        <Link
          to="/admin/create"
          className="flex items-center px-6 py-3 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Event
        </Link>
      </motion.div>

      {userEvents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-lg shadow-lg"
        >
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No events created yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start by creating your first event to generate personalized DPs
          </p>
          <Link
            to="/admin/create"
            className="inline-flex items-center px-6 py-3 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Event
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visibility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userEvents.map((event, index) => (
                  <motion.tr
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={event.flyer_url}
                            alt={event.title}
                          />
                        </div>
                        <div className="ml-4">
                          <Link
                            to={`/events/${event.id}`}
                            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                          >
                            {event.title}
                          </Link>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {event.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(event.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCategoryBadge(event.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getVisibilityBadge(event.visibility)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        to={`/events/${event.id}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                      <Link
                        to={`/admin/edit/${event.id}`}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4">
            {userEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start space-x-3">
                  <img
                    className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                    src={event.flyer_url}
                    alt={event.title}
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/events/${event.id}`}
                      className="text-lg font-medium text-primary hover:text-primary/80 transition-colors block"
                    >
                      {event.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">
                    📅 {formatDate(event.date)}
                  </span>
                  {getCategoryBadge(event.category)}
                  {getVisibilityBadge(event.visibility)}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Link
                    to={`/events/${event.id}`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                  <Link
                    to={`/admin/edit/${event.id}`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};