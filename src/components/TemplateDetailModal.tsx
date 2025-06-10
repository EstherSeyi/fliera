import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, User, Image as ImageIcon, Type, Download } from "lucide-react";
import type { FlierTemplate } from "../types";

interface TemplateDetailModalProps {
  template: FlierTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate?: (template: FlierTemplate) => void;
}

export const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  template,
  isOpen,
  onClose,
  onUseTemplate,
}) => {
  if (!template) return null;

  const handleUseTemplate = () => {
    if (onUseTemplate) {
      onUseTemplate(template);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 !mt-0"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-2xl font-bold text-primary">Template Details</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Template Title and Creator */}
              <div>
                <h3 className="text-3xl font-bold text-primary mb-2">
                  {template.title}
                </h3>
                {template.createdBy && (
                  <div className="flex items-center text-secondary">
                    <User className="w-4 h-4 mr-2" />
                    <span>Created by {template.createdBy}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Template Preview */}
                <div>
                  <h4 className="font-semibold text-primary mb-3 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Template Preview
                  </h4>
                  <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={template.template_image_url}
                      alt={template.title}
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                </div>

                {/* Template Information */}
                <div className="space-y-4">
                  {/* User Placeholders Info */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-primary mb-3">
                      User Customization Options
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Image Placeholders:</span>
                        <span className="font-medium">
                          {template.user_image_placeholders.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Text Placeholders:</span>
                        <span className="font-medium">
                          {template.user_text_placeholders.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Text Placeholders Details */}
                  {template.user_text_placeholders.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-3 flex items-center">
                        <Type className="w-4 h-4 mr-2" />
                        Text Fields
                      </h4>
                      <div className="space-y-2">
                        {template.user_text_placeholders.map((placeholder, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium text-gray-700">
                              {placeholder.labelText || `Text Field ${index + 1}`}:
                            </span>
                            <span className="ml-2 text-gray-600">
                              {placeholder.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Template Elements */}
                  {template.template_placeholders.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-3">
                        Template Elements
                      </h4>
                      <div className="space-y-2">
                        {template.template_placeholders.map((placeholder, index) => (
                          <div key={index} className="text-sm flex items-center">
                            {placeholder.type === 'text' ? (
                              <Type className="w-4 h-4 mr-2 text-purple-600" />
                            ) : (
                              <ImageIcon className="w-4 h-4 mr-2 text-purple-600" />
                            )}
                            <span className="font-medium text-gray-700">
                              {placeholder.labelText || `${placeholder.type} element`}
                            </span>
                            {placeholder.text && (
                              <span className="ml-2 text-gray-600">
                                - "{placeholder.text}"
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="text-sm text-gray-500 border-t pt-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Created on{" "}
                      {new Date(template.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                {onUseTemplate && (
                  <button
                    onClick={handleUseTemplate}
                    className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Use This Template
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};