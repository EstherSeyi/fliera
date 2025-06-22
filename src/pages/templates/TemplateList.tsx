import { useState, useEffect } from "react";
import { Search, Loader2, ImageIcon, AlertCircle, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from "framer-motion";
import { Template, useTemplateList } from "../../hooks/useTemplates";
import { TemplateCard } from "../../components/template/list/TemplateCard";
import { TemplatePreviewModal } from "../../components/template/list/TemplatePreviewModal";
import { useAuth } from "../../context/AuthContext";
import { useDebounce } from "../../hooks/useDebounce";
import { useToast } from "../../context/ToastContext";
import type { TemplateFilterType } from "../../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const FILTER_OPTIONS: { value: TemplateFilterType; label: string }[] = [
  { value: "all", label: "All Templates" },
  { value: "my", label: "My Templates" },
  { value: "others", label: "Other Users' Templates" },
];

export const TemplateList = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    loading,
    error,
    deleting,
    fetchTemplates,
    deleteTemplate,
  } = useTemplateList();

  // State for templates and pagination
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const templatesPerPage = 12;

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<TemplateFilterType>("all");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Preview modal state
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Calculate total pages
  const totalPages = Math.ceil(totalTemplates / templatesPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterType, dateFrom, dateTo]);

  // Load templates when filters or page changes
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const filters = {
          filterType,
          ...(debouncedSearchTerm && { searchTerm: debouncedSearchTerm }),
          ...(dateFrom && { dateFrom: dateFrom.toISOString().split("T")[0] }),
          ...(dateTo && { dateTo: dateTo.toISOString().split("T")[0] }),
        };

        const result = await fetchTemplates(currentPage, templatesPerPage, filters);
        setTemplates(result.templates);
        setTotalTemplates(result.totalCount);
      } catch (err) {
        console.error("Error loading templates:", err);
      }
    };

    loadTemplates();
  }, [fetchTemplates, currentPage, debouncedSearchTerm, filterType, dateFrom, dateTo]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setDateFrom(null);
    setDateTo(null);
  };

  const hasActiveFilters = debouncedSearchTerm || filterType !== "all" || dateFrom || dateTo;

  const handleDelete = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
      // Remove the deleted template from local state
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      setTotalTemplates(prev => prev - 1);
      showToast("Template deleted successfully!", "success");
      
      // If we deleted the last item on the current page and it's not the first page, go back one page
      if (templates.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err) {
      console.error("Error deleting template:", err);
      showToast("Failed to delete template", "error");
    }
  };

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
          Showing {(currentPage - 1) * templatesPerPage + 1} to{" "}
          {Math.min(currentPage * templatesPerPage, totalTemplates)} of {totalTemplates} templates
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
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Templates
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Search and Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-lg p-6 space-y-4 mb-8"
      >
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates by title..."
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
                Filter Type
              </label>
              <Select
                value={filterType}
                onValueChange={(value: TemplateFilterType) => setFilterType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select filter type" />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_OPTIONS.map(({ value, label }) => (
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
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-secondary">Loading templates...</p>
          </div>
        </div>
      ) : totalTemplates === 0 && !hasActiveFilters ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-lg shadow-lg"
        >
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="w-12 h-12 text-secondary" />
          </div>
          <h3 className="text-xl font-semibold text-primary mb-2">
            No Templates Yet
          </h3>
          <p className="text-secondary max-w-md mx-auto mb-6">
            Get started by creating your first template. Design beautiful
            templates with our intuitive editor.
          </p>
          <button 
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set("tab", "create");
              window.history.pushState({}, "", url.toString());
              window.location.reload();
            }}
            className="bg-primary text-neutral px-6 py-3 rounded-lg hover:bg-secondary transition-all duration-200 transform hover:scale-105"
          >
            Create Your First Template
          </button>
        </motion.div>
      ) : totalTemplates === 0 && hasActiveFilters ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-lg shadow-lg"
        >
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Templates Found
          </h3>
          <p className="text-gray-500 mb-6">
            No templates match your search criteria. Try adjusting your filters.
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
          {/* Templates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TemplateCard
                  template={template}
                  currentUserId={user?.id || ""}
                  onPreview={setSelectedTemplate}
                  onDelete={handleDelete}
                  deleting={deleting ?? ""}
                />
              </motion.div>
            ))}
          </div>

          {/* Pagination Controls */}
          {renderPaginationControls()}
        </motion.div>
      )}

      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </>
  );
};