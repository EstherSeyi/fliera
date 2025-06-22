import { useState } from "react";
import { Search, Loader2, ImageIcon, AlertCircle } from "lucide-react";

import { motion } from "framer-motion";
import { Template, useTemplates } from "../../hooks/useTemplates";
import { TemplateCard } from "../../components/template/list/TemplateCard";
import { TemplatePreviewModal } from "../../components/template/list/TemplatePreviewModal";

export const TemplateList = () => {
  const {
    templates,
    loading,
    error,
    deleting,
    fetchTemplates,
    deleteTemplate,
  } = useTemplates();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  const filteredTemplates = templates.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-secondary">Loading your templates...</p>
        </div>
      </div>
    );

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
            onClick={fetchTemplates}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <>
        <div className="space-y-4">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
            <ImageIcon className="w-12 h-12 text-secondary" />
          </div>
          <h3 className="text-xl font-semibold text-primary">
            No Templates Yet
          </h3>
          <p className="text-secondary max-w-md mx-auto">
            Get started by creating your first template. Design beautiful
            templates with our intuitive editor.
          </p>
          <button className="bg-primary text-neutral px-6 py-3 rounded-lg hover:bg-secondary transition-all duration-200 transform hover:scale-105">
            Create Your First Template
          </button>
        </div>
        ) : (
        <div className="space-y-4">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Search className="w-12 h-12 text-secondary" />
          </div>
          <h3 className="text-xl font-semibold text-primary">
            No Results Found
          </h3>
          <p className="text-secondary">
            No templates match your search term "{searchTerm}". Try a different
            search.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search templates..."
          className="w-full pl-10 pr-4 py-3 border rounded-lg bg-neutral"
        />
      </div>

      {filteredTemplates.length === 0 ? (
        <p className="text-center py-12 text-secondary">
          No results for "{searchTerm}"
        </p>
      ) : (
        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={setSelectedTemplate}
              onDelete={deleteTemplate}
              deleting={deleting ?? ""}
            />
          ))}
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
