import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Image as ImageIcon, 
  User, 
  Calendar, 
  Search, 
  Filter,
  X,
  Eye,
  Download,
  Sparkles
} from "lucide-react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { TemplateDetailModal } from "../components/TemplateDetailModal";
import { useToast } from "../context/ToastContext";
import { seedTemplates, shouldSeedTemplates, resetSeedingFlag } from "../utils/seedTemplates";
import type { FlierTemplate } from "../types";

// Dummy templates data for display when no database templates exist
const DUMMY_TEMPLATES: FlierTemplate[] = [
  {
    id: "witc_2025_01",
    user_id: "dummy-user-1",
    title: "Women In Tech Conference",
    createdBy: "Judith",
    template_image_url: "https://pdpwpmavkqbeypdnxvef.supabase.co/storage/v1/object/public/template-images/pinkish_template.png",
    user_image_placeholders: [{
      x: 190,
      y: 130,
      width: 220,
      height: 220,
      holeShape: "circle"
    }],
    user_text_placeholders: [{
      x: 140,
      y: 400,
      width: 100,
      height: 100,
      fontSize: 22,
      color: "#000000",
      fontFamily: "Poppins",
      textAlign: "center",
      labelText: "Your Name",
      text: "Sample Text",
      fontStyle: "normal",
      textTransform: "none",
      fontWeight: "normal"
    }],
    template_placeholders: [
      {
        type: "text",
        x: 140,
        y: 440,
        fontSize: 20,
        color: "#000000",
        fontFamily: "Poppins",
        textAlign: "left",
        text: "I'll be attending WITC 2025",
        labelText: "Bottom Quote",
        fontStyle: "normal"
      },
      {
        type: "image",
        x: 190,
        y: 130,
        width: 220,
        height: 220,
        labelText: "Logo Image"
      }
    ],
    created_at: "2024-12-01T10:00:00Z"
  },
  {
    id: "tech_summit_2025",
    user_id: "dummy-user-2",
    title: "Tech Summit 2025",
    createdBy: "Alex Chen",
    template_image_url: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800",
    user_image_placeholders: [{
      x: 150,
      y: 100,
      width: 200,
      height: 200,
      holeShape: "box"
    }],
    user_text_placeholders: [
      {
        x: 100,
        y: 350,
        width: 300,
        height: 50,
        fontSize: 24,
        color: "#FFFFFF",
        fontFamily: "Arial",
        textAlign: "center",
        labelText: "Your Name",
        text: "John Doe",
        fontStyle: "bold",
        textTransform: "uppercase",
        fontWeight: "bold"
      },
      {
        x: 100,
        y: 400,
        width: 300,
        height: 30,
        fontSize: 16,
        color: "#CCCCCC",
        fontFamily: "Arial",
        textAlign: "center",
        labelText: "Your Title",
        text: "Software Engineer",
        fontStyle: "normal",
        textTransform: "none",
        fontWeight: "normal"
      }
    ],
    template_placeholders: [
      {
        type: "text",
        x: 50,
        y: 50,
        fontSize: 32,
        color: "#FFFFFF",
        fontFamily: "Arial",
        textAlign: "left",
        text: "TECH SUMMIT 2025",
        labelText: "Event Title",
        fontStyle: "bold"
      }
    ],
    created_at: "2024-11-15T14:30:00Z"
  },
  {
    id: "music_fest_2025",
    user_id: "dummy-user-3",
    title: "Summer Music Festival",
    createdBy: "Maria Rodriguez",
    template_image_url: "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800",
    user_image_placeholders: [{
      x: 200,
      y: 150,
      width: 180,
      height: 180,
      holeShape: "circle"
    }],
    user_text_placeholders: [{
      x: 120,
      y: 380,
      width: 260,
      height: 40,
      fontSize: 20,
      color: "#FF6B6B",
      fontFamily: "Open Sans",
      textAlign: "center",
      labelText: "Your Name",
      text: "Music Lover",
      fontStyle: "normal",
      textTransform: "none",
      fontWeight: "600"
    }],
    template_placeholders: [
      {
        type: "text",
        x: 50,
        y: 450,
        fontSize: 18,
        color: "#FFFFFF",
        fontFamily: "Open Sans",
        textAlign: "center",
        text: "🎵 Ready to rock the festival! 🎵",
        labelText: "Festival Message",
        fontStyle: "normal"
      }
    ],
    created_at: "2024-10-20T09:15:00Z"
  }
];

export const Templates: React.FC = () => {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<FlierTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<FlierTemplate | null>(null);
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
        
        // For now, use dummy templates for display
        // In a real implementation, you would fetch from the database here
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTemplates(DUMMY_TEMPLATES);
      } catch (error) {
        console.error('Error loading templates:', error);
        showToast('Failed to load templates', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [showToast]);

  // Handle template seeding
  const handleSeedTemplates = async () => {
    setSeeding(true);
    try {
      await seedTemplates();
      showToast('Templates seeded successfully!', 'success');
      setShowSeedButton(false);
      
      // Reload templates after seeding
      // In a real implementation, you would fetch from the database here
      setTemplates(DUMMY_TEMPLATES);
    } catch (error) {
      console.error('Error seeding templates:', error);
      showToast('Failed to seed templates. Please try again.', 'error');
    } finally {
      setSeeding(false);
    }
  };

  // Handle reset seeding flag (for development)
  const handleResetSeedingFlag = async () => {
    try {
      await resetSeedingFlag();
      setShowSeedButton(true);
      showToast('Seeding flag reset. You can now seed templates again.', 'info');
    } catch (error) {
      console.error('Error resetting seeding flag:', error);
      showToast('Failed to reset seeding flag', 'error');
    }
  };

  // Filter templates based on search term
  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.createdBy && template.createdBy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleTemplateClick = (template: FlierTemplate) => {
    setSelectedTemplate(template);
    setShowDetailModal(true);
  };

  const handleUseTemplate = (template: FlierTemplate) => {
    // TODO: Implement template usage logic
    showToast(`Template "${template.title}" selected! This feature will be implemented soon.`, "info");
  };

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
    img.src = "https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=800";
    
    // Remove loading animation from container
    if (container) {
      container.classList.remove('animate-pulse', 'bg-gray-200');
    }
    
    // Make image visible
    img.classList.remove('opacity-0');
    img.classList.add('opacity-100');
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
          Choose from our collection of professionally designed templates to create stunning event fliers
        </p>
      </motion.div>

      {/* Development Controls */}
      {(showSeedButton || process.env.NODE_ENV === 'development') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">
            Development Tools
          </h3>
          <div className="flex flex-wrap gap-3">
            {showSeedButton && (
              <button
                onClick={handleSeedTemplates}
                disabled={seeding}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {seeding ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Seeding Templates...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Seed Templates
                  </>
                )}
              </button>
            )}
            
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={handleResetSeedingFlag}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Reset Seeding Flag
              </button>
            )}
          </div>
          <p className="text-sm text-yellow-700 mt-3">
            {showSeedButton 
              ? "Click 'Seed Templates' to add sample templates to your account."
              : "Templates have been seeded for your account."
            }
          </p>
        </motion.div>
      )}

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
            Found {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} 
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
              : "Templates will be available soon"
            }
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
                      {template.user_image_placeholders.length} image{template.user_image_placeholders.length !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center">
                      📝 {template.user_text_placeholders.length} text{template.user_text_placeholders.length !== 1 ? 's' : ''}
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