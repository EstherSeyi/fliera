import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useDebounce } from "../hooks/useDebounce";

import { usePaginatedPublicEvents } from "../hooks/queries/usePginatedPublicEvents";

import { Pagination } from "../components/events_list/Pagination";
import { SearchFilterControls } from "../components/events_list/SearchFiltersControl";
import { EventCard } from "../components/events_list/EventCard";
import { EventCategory } from "../types";

const eventCategories: EventCategory[] = [
  "business",
  "technology",
  "music",
  "social",
  "sports",
  "activism",
  "other",
];

const stringToEventCategory = (
  value: string | null | undefined
): EventCategory | undefined => {
  if (!value) {
    return undefined;
  }
  if (eventCategories.includes(value as EventCategory)) {
    return value as EventCategory;
  }
  return undefined;
};

export const EventsList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 12;

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState<
    EventCategory | undefined
  >(stringToEventCategory(searchParams.get("category") || undefined));
  const [dateFrom, setDateFrom] = useState(
    searchParams.get("dateFrom")
      ? new Date(searchParams.get("dateFrom")!)
      : null
  );
  const [dateTo, setDateTo] = useState(
    searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : null
  );
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { data, isPending, error } = usePaginatedPublicEvents(
    currentPage,
    eventsPerPage,
    {
      title: debouncedSearchTerm,
      category: selectedCategory,
      dateFrom: dateFrom?.toISOString().split("T")[0],
      dateTo: dateTo?.toISOString().split("T")[0],
    }
  );

  const events = data?.events ?? [];
  const totalEvents = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalEvents / eventsPerPage);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(undefined);
    setDateFrom(null);
    setDateTo(null);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    !!debouncedSearchTerm || !!selectedCategory || !!dateFrom || !!dateTo;

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.set("search", debouncedSearchTerm);
    if (selectedCategory) {
      params.set("category", selectedCategory);
    }
    if (dateFrom) params.set("dateFrom", dateFrom.toISOString().split("T")[0]);
    if (dateTo) params.set("dateTo", dateTo.toISOString().split("T")[0]);
    if (currentPage > 1) params.set("page", currentPage.toString());
    setSearchParams(params);
  }, [
    debouncedSearchTerm,
    selectedCategory,
    dateFrom,
    dateTo,
    currentPage,
    setSearchParams,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory, dateFrom, dateTo]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (error) {
    return (
      <div className="text-center text-red-500 min-h-[50vh] flex items-center justify-center">
        <p>{error.message}</p>
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
          Choose an event to create your personalized display picture (
          {totalEvents} events available)
        </p>
      </motion.div>

      <SearchFilterControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
      />

      {isPending ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner size={32} />
        </div>
      ) : totalEvents === 0 ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalEvents}
            itemsPerPage={eventsPerPage}
            onPageChange={handlePageChange}
          />
        </motion.div>
      )}
    </div>
  );
};
