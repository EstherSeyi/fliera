import { motion } from "framer-motion";
import { Search, Filter, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { EVENT_CATEGORY_OPTIONS } from "../../constants";
import { Dispatch, SetStateAction } from "react";
import { EventCategory } from "../../types";

interface Props {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory?: EventCategory;
  setSelectedCategory: Dispatch<SetStateAction<EventCategory | undefined>>;
  dateFrom: Date | null;
  setDateFrom: Dispatch<React.SetStateAction<Date | null>>;
  dateTo: Date | null;
  setDateTo: Dispatch<React.SetStateAction<Date | null>>;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

export const SearchFilterControls = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  showFilters,
  setShowFilters,
  hasActiveFilters,
  clearFilters,
}: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="bg-white rounded-lg shadow-lg p-6 space-y-4"
  >
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
                value === "all-categories"
                  ? undefined
                  : (value as EventCategory)
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">All categories</SelectItem>
              {EVENT_CATEGORY_OPTIONS.map(({ value, label }) => (
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
);
