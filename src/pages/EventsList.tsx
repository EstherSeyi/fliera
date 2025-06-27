import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useEvents } from "../context/EventContext";
import { 
  Calendar, 
  ArrowRight, 
  Search, 
  Filter, 
  X, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useDebounce } from "../hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import type { Event, EventCategory } from "../types";

const CATEGORY_OPTIONS: { value: EventCategory; label: string }[] = [
  { value: "business", label: "Business" },
  { value: "technology", label: "Technology" },
  { value: "music", label: "Music" },
  { value: "social", label: "Social" },
  { value: "sports", label: "Sports" },
  { value: "activism", label: "Activism" },
  { value: "other", label: "Other" },
];

export const EventsList: React.FC = () => {
  const { fetchPublicEvents } = useEvents();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for events and pagination
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const eventsPerPage = 12;

  // Filter state - initialize from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "">(
    (searchParams.get("category") as EventCategory) || ""
  );
  const [dateFrom, setDateFrom] = useState<Date | null>(
    searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : null
  );
  const [dateTo, setDateTo] = useState<Date | null>(
    searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : null
  );
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Calculate total pages
  const totalPages = Math.ceil(totalEvents / eventsPerPage);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearchTerm) params.set("search", debouncedSearchTerm);
    if (selectedCategory) params.set("category", selectedCategory);
    if (dateFrom) params.set("dateFrom", dateFrom.toISOString().split("T")[0]);
    if (dateTo) params.set("dateTo", dateTo.toISOString().split("T")[0]);
    if (currentPage > 1) params.set("page", currentPage.toString());

    setSearchParams(params);
  }, [debouncedSearchTerm, selectedCategory, dateFrom, dateTo, currentPage, setSearchParams]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory, dateFrom, dateTo]);

  // Load events when filters or page changes
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters = {
          ...(debouncedSearchTerm && { title: debouncedSearchTerm }),
          ...(selectedCategory && { category: selectedCategory }),
          ...(dateFrom && { dateFrom: dateFrom.toISOString().split("T")[0] }),
          ...(dateTo && { dateTo: dateTo.toISOString().split("T")[0] }),
        };

        const result = await fetchPublicEvents(currentPage, eventsPerPage, filters);
        setEvents(result.events);
        setTotalEvents(result.totalCount);
      } catch (err) {
        console.error("Error loading events:", err);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [fetchPublicEvents, currentPage, debouncedSearchTerm, selectedCategory, dateFrom, dateTo]);

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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setDateFrom(null);
    setDateTo(null);
    setCurrentPage(1);
  };

  const hasActiveFilters = debouncedSearchTerm || selectedCategory || dateFrom || dateTo;

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
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center text-sm text-gray-500">
          Showing {(currentPage - 1) * eventsPerPage + 1} to{" "}
          {Math.min(currentPage * eventsPerPage, totalEvents)} of {totalEvents} events
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
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-primary">Upcoming Events</h1>
        <p className="text-secondary max-w-2xl mx-auto">
          Choose an event to create your personalized display picture ({totalEvents} events available)
        </p>
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200"
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

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner size={32} />
        </div>
      ) : totalEvents === 0 && !hasActiveFilters ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-secondary py-12"
        >
          <p>No events available at the moment.</p>
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
          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="aspect-video relative overflow-hidden bg-gray-200 animate-pulse">
                  <img
                    src={event.flyer_url}
                    alt={event.title}
                    className="w-full h-full object-cover transition-opacity duration-300 opacity-0"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center text-secondary">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>

                  <h3 className="text-xl font-bold text-primary">{event.title}</h3>
                  
                  {event.description && (
                    <p className="text-secondary line-clamp-2">
                      {event.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </p>
                  )}

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

          {/* Pagination Controls */}
          {renderPaginationControls()}
        </motion.div>
      )}
    </div>
  );
};