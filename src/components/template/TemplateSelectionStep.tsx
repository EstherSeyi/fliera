import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";
import { FlierTemplate, TemplateInputValues } from "../../types";
import { Dispatch, SetStateAction, useState } from "react";
import { ModalStep } from "../FlierTemplateSelectionModal";

interface Props {
  loading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  setSelectedTemplate: Dispatch<SetStateAction<FlierTemplate | null>>;
  setInputValues: Dispatch<SetStateAction<TemplateInputValues>>;
  templates: FlierTemplate[];
  setCurrentStep: Dispatch<SetStateAction<ModalStep>>;
}

export const TemplateSelectionStep = ({
  loading,
  error,
  fetchTemplates,
  setSelectedTemplate,
  setInputValues,
  templates,
  setCurrentStep,
}: Props) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleTemplateSelect = (template: FlierTemplate) => {
    console.log("got called!!!!!!!!", template);
    setSelectedTemplate(template);
    // Initialize input values
    const initialValues: TemplateInputValues = {};
    template.template_placeholders.forEach((placeholder) => {
      initialValues[placeholder.id] = placeholder.type === "text" ? "" : null;
    });
    setInputValues(initialValues);
    setCurrentStep("input");
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.created_by?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size={32} />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>{error}</p>
            <button
              onClick={fetchTemplates}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No templates found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTemplateSelect(template)}
                className="cursor-pointer bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <div className="aspect-video bg-gray-200">
                  <img
                    src={template.template_image_url}
                    alt={template.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-primary text-sm truncate">
                    {template.title}
                  </h3>
                  {template.created_by && (
                    <p className="text-xs text-gray-500 mt-1">
                      by {template.created_by}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {template.template_placeholders.length} placeholders
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
