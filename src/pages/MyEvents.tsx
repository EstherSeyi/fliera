import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Eye,
  Edit,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useEvents } from "../context/EventContext";
import { MyEventTableSkeleton } from "../components/MyEventTableSkeleton";
import { MyEventCardSkeleton } from "../components/MyEventCardSkeleton";
import { getPlainTextSnippet } from "../lib/utils";
import { useDebounce } from "../hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import type { Event, EventCategory, EventVisibility } from "../types";

const CATEGORY_OPTIONS: { value: EventCategory; label: string }[] = [
  { value: "business", label: "Business" },
  { value: "technology", label: "Technology" },
  { value: "music", label: "Music" },
  { value: "social", label: "Social" },
  { value: "sports", label: "Sports" },
  { value: "activism", label: "Activism" },
  { value: "other", label: "Other" },
];

const VISIBILITY_OPTIONS: { value: EventVisibility; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "archived", label: "Archived" },
];

export const MyEvents: React.FC = () => {
  const { fetchEventsByUser } = useEvents();
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const eventsPerPage = 10;

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "">(
    ""
  );
  const [selectedVisibility, setSelectedVisibility] = useState<
    EventVisibility | ""
  >("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Calculate total pages
  const totalPages = Math.ceil(totalEvents / eventsPerPage);

  // Image loading handlers
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const container = img.parentElement;
    
    // Remove loading animation from container
    if (container) {
      container.classList.remove('animate-pulse', 'bg-gray-200');
    }
    
    // Make image visible
    img.classList.remove('opacity-0');
    img.classList.add('opacity-100');
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const container = img.parentElement;
    
    // Set fallback image
    img.src = "https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
    
    // Remove loading animation from container
    if (container) {
      container.classList.remove('animate-pulse', 'bg-gray-200');
    }
    
    // Make image visible
    img.classList.remove('opacity-0');
    img.classList.add('opacity-100');
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchTerm,
    selectedCategory,
    selectedVisibility,
    dateFrom,
    dateTo,
  ]);

  useEffect(() => {
    const loadUserEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters = {
          ...(debouncedSearchTerm && { title: debouncedSearchTerm }),
          ...(selectedCategory && { category: selectedCategory }),
          ...(selectedVisibility && { visibility: selectedVisibility }),
          ...(dateFrom && { dateFrom: dateFrom.toISOString().split("T")[0] }),
          ...(dateTo && { dateTo: dateTo.toISOString().split("T")[0] }),
        };

        const result = await fetchEventsByUser(
          currentPage,
          eventsPerPage,
          filters
        );
        setUserEvents(result.events);
        setTotalEvents(result.totalCount);
      } catch (err) {
        console.error("Error loading user events:", err);
        setError("Failed to load your events");
      } finally {
        setLoading(false);
      }
    };

    loadUserEvents();
  }, [
    fetchEventsByUser,
    currentPage,
    debouncedSearchTerm,
    selectedCategory,
    selectedVisibility,
    dateFrom,
    dateTo,
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getVisibilityBadge = (visibility: string) => {
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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedVisibility("");
    setDateFrom(null);
    setDateTo(null);
  };

  const hasActiveFilters =
    debouncedSearchTerm ||
    selectedCategory ||
    selectedVisibility ||
    dateFrom ||
    dateTo;

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          Showing {(currentPage - 1) * eventsPerPage + 1} to{" "}
          {Math.min(currentPage * eventsPerPage, totalEvents)} of {totalEvents}{" "}
          events
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <div className="flex space-x-1">
            {startPage > 1 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  1
                </button>
                {startPage > 2 && (
                  <span className="px-3 py-2 text-sm text-gray-500">...</span>
                )}
              </>
            )}

            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  page === currentPage
                    ? "text-primary bg-thistle border border-primary"
                    : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <span className="px-3 py-2 text-sm text-gray-500">...</span>
                )}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    );
  };

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
            Manage and view all the events you've created ({totalEvents} total)
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

      {/* Search and Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-lg p-6 space-y-4"
      >
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-white text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                !
              </span>
            )}
          </button>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200"
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <Select
                value={selectedCategory || "all-categories"}
                onValueChange={(value) =>
                  setSelectedCategory(
                    value === "all-categories" ? "" : (value as EventCategory)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All categories</SelectItem>
                  {CATEGORY_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Visibility
              </label>
              <Select
                value={selectedVisibility || "all-visibility"}
                onValueChange={(value) =>
                  setSelectedVisibility(
                    value === "all-visibility" ? "" : (value as EventVisibility)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-visibility">All visibility</SelectItem>
                  {VISIBILITY_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date From
              </label>
              <DatePicker
                selected={dateFrom}
                onChange={(date) => setDateFrom(date)}
                dateFormat="MMM d, yyyy"
                placeholderText="Select start date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                maxDate={dateTo || undefined}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date To
              </label>
              <DatePicker
                selected={dateTo}
                onChange={(date) => setDateTo(date)}
                dateFormat="MMM d, yyyy"
                placeholderText="Select end date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                minDate={dateFrom || undefined}
              />
            </div>
          </motion.div>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-end pt-2">
            <button
              onClick={clearFilters}
              className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Clear all filters
            </button>
          </div>
        )}
      </motion.div>

      {totalEvents === 0 && !hasActiveFilters ? (
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
      ) : totalEvents === 0 && hasActiveFilters ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-lg shadow-lg"
        >
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No events found
          </h3>
          <p className="text-gray-500 mb-6">
            Try adjusting your search criteria or filters
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-6 py-3 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors"
          >
            <X className="w-5 h-5 mr-2" />
            Clear Filters
          </button>
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
              <thead className="bg-gray-50 sticky top-16 z-10">
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
                {loading
                  ? // Show skeleton loaders while loading
                    Array.from({ length: eventsPerPage }).map((_, index) => (
                      <MyEventTableSkeleton key={index} />
                    ))
                  : userEvents.map((event, index) => (
                      <motion.tr
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-gray-200 animate-pulse rounded-lg">
                              <img
                                className="h-12 w-12 rounded-lg object-cover transition-opacity duration-300 opacity-0"
                                src={event.flyer_url}
                                alt={event.title}
                                onLoad={handleImageLoad}
                                onError={handleImageError}
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
                                {getPlainTextSnippet(event.description, 100)}
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
            {loading
              ? // Show skeleton loaders for mobile view
                Array.from({ length: eventsPerPage }).map((_, index) => (
                  <MyEventCardSkeleton key={index} />
                ))
              : userEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="h-16 w-16 rounded-lg bg-gray-200 animate-pulse flex-shrink-0">
                        <img
                          className="h-16 w-16 rounded-lg object-cover transition-opacity duration-300 opacity-0"
                          src={event.flyer_url}
                          alt={event.title}
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/events/${event.id}`}
                          className="text-lg font-medium text-primary hover:text-primary/80 transition-colors block"
                        >
                          {event.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {getPlainTextSnippet(event.description, 120)}
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

          {/* Pagination Controls */}
          {renderPaginationControls()}
        </motion.div>
      )}
    </div>
  );
};