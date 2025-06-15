import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import {
  FlierTemplate,
  ImagePlaceholderZone,
  TextPlaceholderZone,
} from "../types";
import { ModalStep } from "./FlierTemplateSelectionModal";

interface Props {
  setCurrentStep: Dispatch<SetStateAction<ModalStep>>;
  generatedImageUrl: string | null;
  selectedTemplate: FlierTemplate | null;
  onTemplateSelected: (
    generatedImageUrl: string,
    imagePlaceholders: ImagePlaceholderZone[],
    textPlaceholders: TextPlaceholderZone[]
  ) => void;
  onClose: () => void;
}

export const TemplatePreviewStep = ({
  setCurrentStep,
  generatedImageUrl,
  selectedTemplate,
  onTemplateSelected,
  onClose,
}: Props) => {
  const handleUseTemplate = () => {
    if (!selectedTemplate || !generatedImageUrl) return;

    onTemplateSelected(
      generatedImageUrl,
      selectedTemplate.user_image_placeholders,
      selectedTemplate.user_text_placeholders
    );
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCurrentStep("input")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h3 className="text-lg font-semibold text-primary">
            Preview Generated Flyer
          </h3>
          <p className="text-sm text-gray-500">
            Review your customized template
          </p>
        </div>
      </div>

      {generatedImageUrl && (
        <div className="text-center">
          <div className="inline-block border rounded-lg overflow-hidden shadow-lg">
            <img
              src={generatedImageUrl}
              alt="Generated flyer preview"
              className="max-w-full h-auto max-h-96"
            />
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep("input")}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Edit
        </button>
        <button
          onClick={handleUseTemplate}
          className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Check className="w-5 h-5 mr-2" />
          Use This Template
        </button>
      </div>
    </motion.div>
  );
};
