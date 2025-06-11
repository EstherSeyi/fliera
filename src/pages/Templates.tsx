import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  User,
  Calendar,
  Search,
  X,
  Eye,
  Download,
} from "lucide-react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { TemplateDetailModal } from "../components/TemplateDetailModal";
import { useEvents } from "../context/EventContext";
import { useToast } from "../context/ToastContext";
import { shouldSeedTemplates } from "../utils/seedTemplates";
import type { FlierTemplate } from "../types";

export const Templates: React.FC = () => {
  const { fetchFlierTemplates } = useEvents();
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<FlierTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<FlierTemplate | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSeedButton, setShowSeedButton] = useState(false);

  // Load templates and check if seeding is needed
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        // Check if we should show the seed button
        const shouldSeed = await shouldSeedTemplates();
        setShowSeedButton(shouldSeed);

        // Fetch templates from Supabase
        const templatesData = await fetchFlierTemplates();
        setTemplates(templatesData);
      } catch (error) {
        console.error("Error loading templates:", error);
        showToast("Failed to load templates", "error");
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [fetchFlierTemplates, showToast]);

  // Filter templates based on search term
  const filteredTemplates = templates.filter(
    (template) =>
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.createdBy &&
        template.createdBy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleTemplateClick = (template: FlierTemplate) => {
    setSelectedTemplate(template);
    setShowDetailModal(true);
  };

  const handleUseTemplate = (template: FlierTemplate) => {
    // TODO: Implement template usage logic
    showToast(
      `Template "${template.title}" selected! This feature will be implemented soon.`,
      "info"
    );
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const container = img.parentElement;

    // Remove loading animation from container
    if (container) {
      container.classList.remove("animate-pulse", "bg-gray-200");
    }

    // Make image visible
    img.classList.remove("opacity-0");
    img.classList.add("opacity-100");
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const container = img.parentElement;

    // Set fallback image
    img.src =
      "https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=800";

    // Remove loading animation from container
    if (container) {
      container.classList.remove("animate-pulse", "bg-gray-200");
    }

    // Make image visible
    img.classList.remove("opacity-0");
    img.classList.add("opacity-100");
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="space-y-8">
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-primary">Flier Templates</h1>
        <p className="text-secondary max-w-2xl mx-auto">
          Choose from our collection of professionally designed templates to
          create stunning event fliers
        </p>
      </motion.div>

      {/* Search and Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates by title or creator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {searchTerm && (
          <div className="mt-4 text-sm text-gray-600">
            Found {filteredTemplates.length} template
            {filteredTemplates.length !== 1 ? "s" : ""}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner size={32} />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-lg shadow-lg"
        >
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm ? "No templates found" : "No templates available"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? "Try adjusting your search criteria"
              : showSeedButton
              ? "Click 'Seed Templates' above to add sample templates"
              : "Templates will be available soon"}
          </p>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="inline-flex items-center px-6 py-3 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors"
            >
              <X className="w-5 h-5 mr-2" />
              Clear Search
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleTemplateClick(template)}
            >
              {/* Template Image */}
              <div className="aspect-video relative overflow-hidden bg-gray-200 animate-pulse">
                <img
                  src={template.template_image_url}
                  alt={template.title}
                  className="w-full h-full object-cover transition-all duration-300 opacity-0 group-hover:scale-105"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Hover Actions */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplateClick(template);
                      }}
                      className="p-3 bg-white/90 text-gray-800 rounded-full hover:bg-white transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTemplate(template);
                      }}
                      className="p-3 bg-primary/90 text-white rounded-full hover:bg-primary transition-colors"
                      title="Use Template"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-primary group-hover:text-primary/80 transition-colors">
                    {template.title}
                  </h3>
                  {template.createdBy && (
                    <div className="flex items-center text-secondary mt-2">
                      <User className="w-4 h-4 mr-2" />
                      <span className="text-sm">by {template.createdBy}</span>
                    </div>
                  )}
                </div>

                {/* Template Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <ImageIcon className="w-4 h-4 mr-1" />
                      {template.user_image_placeholders.length} image
                      {template.user_image_placeholders.length !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center">
                      📝 {template.user_text_placeholders.length} text
                      {template.user_text_placeholders.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-center text-xs text-gray-400 pt-2 border-t border-gray-100">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(template.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Template Detail Modal */}
      <TemplateDetailModal
        template={selectedTemplate}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTemplate(null);
        }}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
};
