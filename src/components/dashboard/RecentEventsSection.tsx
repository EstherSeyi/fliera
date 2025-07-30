import { Calendar, Edit, Eye, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { useRecentEvents } from "../../hooks/queries/useGetRecentQueries";
import { getPlainTextSnippet } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";

const Skeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse"
      >
        <div className="h-12 w-12 bg-gray-200 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-8 w-16 bg-gray-200 rounded" />
      </div>
    ))}
  </div>
);

export const RecentEventsSection = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useRecentEvents(user?.id);

  if (isLoading) return <Skeleton />;

  if (error)
    return (
      <div className="bg-red-100 text-red-600 p-4 rounded-md">
        {error.message || "Could not fetch recent events"}
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Recent Events</h2>
        <Link
          to="/my-events"
          className="text-primary text-sm font-medium hover:underline"
        >
          View All Events →
        </Link>
      </div>

      {data?.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No events created yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start by creating your first event to generate personalized DPs
          </p>
          <Link
            to="/admin/create"
            className="inline-flex items-center px-6 py-3 bg-thistle text-primary rounded-lg hover:bg-thistle/90"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="h-12 w-12 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={event.flyer_url}
                  alt={event.title}
                  className="h-12 w-12 object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg";
                  }}
                />
              </div>
              <div className="flex-1">
                <Link
                  to={`/events/${event.id}`}
                  className="text-lg font-medium text-primary block truncate"
                >
                  {event.title}
                </Link>
                <p className="text-sm text-gray-500 truncate">
                  {getPlainTextSnippet(event.description, 60)}
                </p>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/events/${event.id}`}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Link>
                <Link
                  to={`/admin/edit/${event.id}`}
                  className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
