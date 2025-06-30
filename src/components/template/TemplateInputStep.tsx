import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { motion } from "framer-motion";
import { ArrowLeft, Eye } from "lucide-react";
import { Dispatch, RefObject, SetStateAction, useRef, useState } from "react";

import { FileUploadInput } from "../FileUploadInput";
import { TemplatePlaceholderRender } from "./TemplatePlaceholderRender";
import { LoadingSpinner } from "../LoadingSpinner";
import { ModalStep } from "../FlierTemplateSelectionModal";
import { FlierTemplate, TemplateInputValues } from "../../types";

interface Props {
  setCurrentStep: Dispatch<SetStateAction<ModalStep>>;
  selectedTemplate: FlierTemplate | null;
  inputValues: TemplateInputValues;
  containerRef: RefObject<HTMLDivElement>;
  templateImage: HTMLImageElement | null;
  stageSize: {
    width: number;
    height: number;
  };
  userImages: {
    [key: string]: HTMLImageElement;
  };
  imageScale: number;
  setInputValues: Dispatch<SetStateAction<TemplateInputValues>>;
  setGeneratedImageUrl: Dispatch<SetStateAction<string | null>>;
  setError: Dispatch<SetStateAction<string | null>>;
}

export const TemplateInputStep = ({
  setCurrentStep,
  selectedTemplate,
  inputValues,
  containerRef,
  templateImage,
  stageSize,
  userImages,
  imageScale,
  setInputValues,
  setGeneratedImageUrl,
  setError,
}: Props) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const stageRef = useRef<any>(null);

  const handleInputChange = (
    placeholderId: string,
    value: string | File | null
  ) => {
    setInputValues(prev => ({
      ...prev,
      [placeholderId]: value,
    }));
  };

  const isFormValid = () => {
    if (!selectedTemplate) return false;

    return selectedTemplate.template_placeholders.every(placeholder => {
      if (!placeholder.required) return true;

      const value = inputValues[placeholder.id];
      if (placeholder.type === "text") {
        return typeof value === "string" && value.trim() !== "";
      } else {
        return value instanceof File;
      }
    });
  };

  const generatePreview = async () => {
    if (!selectedTemplate || !templateImage || !stageRef.current) return;

    setIsGenerating(true);
    try {
      // Small delay to ensure the stage is fully rendered
      setTimeout(async () => {
        if (stageRef.current) {
          const dataURL = stageRef.current.toDataURL({
            mimeType: "image/png",
            quality: 1,
            pixelRatio: 2,
          });

          setGeneratedImageUrl(dataURL);
          setCurrentStep("preview");
        }
        setIsGenerating(false);
      }, 100);
    } catch (err) {
      console.error("Error generating preview:", err);
      setError("Failed to generate preview");
      setIsGenerating(false);
    }
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
          onClick={() => setCurrentStep("selection")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h3 className="text-lg font-semibold text-primary">
            {selectedTemplate?.title}
          </h3>
          <p className="text-sm text-gray-500">
            Fill in the template placeholders
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {selectedTemplate?.template_placeholders.map((placeholder, index) => (
            <div key={`${placeholder.id}_${index}`} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {placeholder?.labelText}
                {placeholder.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>

              {placeholder.type === "text" ? (
                <input
                  type="text"
                  value={(inputValues[placeholder.id] as string) || ""}
                  onChange={e =>
                    handleInputChange(placeholder.id, e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder={`Enter ${placeholder?.labelText?.toLowerCase()}`}
                  required={placeholder.required}
                />
              ) : (
                <FileUploadInput
                  value={inputValues[placeholder.id] as File | null}
                  onChange={file => handleInputChange(placeholder.id, file)}
                  accept="image/*"
                  maxSize={2 * 1024 * 1024}
                />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-primary">Live Preview</h4>
          <div
            ref={containerRef}
            className="border rounded-lg overflow-hidden bg-gray-50"
          >
            {templateImage && stageSize.width > 0 && (
              <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
              >
                <Layer>
                  <KonvaImage
                    image={templateImage}
                    x={0}
                    y={0}
                    width={stageSize.width}
                    height={stageSize.height}
                  />
                  {selectedTemplate?.template_placeholders.map(placeholder => (
                    <TemplatePlaceholderRender
                      key={placeholder?.id}
                      placeholder={placeholder}
                      userImages={userImages}
                      imageScale={imageScale}
                      inputValues={inputValues}
                    />
                  ))}
                </Layer>
              </Stage>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={generatePreview}
          disabled={!isFormValid() || isGenerating}
          className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <LoadingSpinner className="mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Eye className="w-5 h-5 mr-2" />
              Preview Template
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};
