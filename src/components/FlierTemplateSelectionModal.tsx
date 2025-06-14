import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Upload, Eye, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { Stage, Layer, Image as KonvaImage, Text } from 'react-konva';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from './LoadingSpinner';
import { FileUploadInput } from './FileUploadInput';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import type { FlierTemplate, TemplatePlaceholder, TemplateInputValues, ImagePlaceholderZone, TextPlaceholderZone } from '../types';

interface FlierTemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelected: (
    generatedImageUrl: string,
    imagePlaceholders: ImagePlaceholderZone[],
    textPlaceholders: TextPlaceholderZone[]
  ) => void;
}

type ModalStep = 'selection' | 'input' | 'preview';

export const FlierTemplateSelectionModal: React.FC<FlierTemplateSelectionModalProps> = ({
  isOpen,
  onClose,
  onTemplateSelected,
}) => {
  const [templates, setTemplates] = useState<FlierTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentStep, setCurrentStep] = useState<ModalStep>('selection');
  const [selectedTemplate, setSelectedTemplate] = useState<FlierTemplate | null>(null);
  const [inputValues, setInputValues] = useState<TemplateInputValues>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Konva stage states
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [templateImage, setTemplateImage] = useState<HTMLImageElement | null>(null);
  const [userImages, setUserImages] = useState<{ [key: string]: HTMLImageElement }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    } else {
      // Reset state when modal closes
      setCurrentStep('selection');
      setSelectedTemplate(null);
      setInputValues({});
      setGeneratedImageUrl(null);
      setTemplateImage(null);
      setUserImages({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTemplate && containerRef.current) {
      loadTemplateImage();
    }
  }, [selectedTemplate]);

  useEffect(() => {
    // Load user images when input values change
    if (selectedTemplate) {
      loadUserImages();
    }
  }, [inputValues, selectedTemplate]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('flier_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateImage = async () => {
    if (!selectedTemplate || !containerRef.current) return;

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedTemplate.template_image_url;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      setTemplateImage(img);
      
      // Calculate scale and stage size
      const containerWidth = containerRef.current.offsetWidth;
      const scale = Math.min(containerWidth / img.width, 400 / img.height);
      setImageScale(scale);
      
      setStageSize({
        width: img.width * scale,
        height: img.height * scale,
      });
    } catch (err) {
      console.error('Error loading template image:', err);
      setError('Failed to load template image');
    }
  };

  const loadUserImages = async () => {
    if (!selectedTemplate) return;

    const newUserImages: { [key: string]: HTMLImageElement } = {};
    
    for (const placeholder of selectedTemplate.template_placeholders) {
      if (placeholder.type === 'image' && inputValues[placeholder.id] instanceof File) {
        const file = inputValues[placeholder.id] as File;
        const imageUrl = URL.createObjectURL(file);
        
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = imageUrl;
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          newUserImages[placeholder.id] = img;
        } catch (err) {
          console.error('Error loading user image:', err);
        }
      }
    }
    
    setUserImages(newUserImages);
  };

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.created_by?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTemplateSelect = (template: FlierTemplate) => {
    setSelectedTemplate(template);
    // Initialize input values
    const initialValues: TemplateInputValues = {};
    template.template_placeholders.forEach(placeholder => {
      initialValues[placeholder.id] = placeholder.type === 'text' ? '' : null;
    });
    setInputValues(initialValues);
    setCurrentStep('input');
  };

  const handleInputChange = (placeholderId: string, value: string | File | null) => {
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
      if (placeholder.type === 'text') {
        return typeof value === 'string' && value.trim() !== '';
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
            mimeType: 'image/png',
            quality: 1,
            pixelRatio: 2,
          });
          
          setGeneratedImageUrl(dataURL);
          setCurrentStep('preview');
        }
        setIsGenerating(false);
      }, 100);
    } catch (err) {
      console.error('Error generating preview:', err);
      setError('Failed to generate preview');
      setIsGenerating(false);
    }
  };

  const handleUseTemplate = () => {
    if (!selectedTemplate || !generatedImageUrl) return;

    onTemplateSelected(
      generatedImageUrl,
      selectedTemplate.user_image_placeholders,
      selectedTemplate.user_text_placeholders
    );
    onClose();
  };

  const renderTemplatePlaceholder = (placeholder: TemplatePlaceholder) => {
    const scaledX = placeholder.x * imageScale;
    const scaledY = placeholder.y * imageScale;
    const scaledWidth = placeholder.width * imageScale;
    const scaledHeight = placeholder.height * imageScale;

    if (placeholder.type === 'image') {
      const userImage = userImages[placeholder.id];
      if (!userImage) return null;

      // Calculate object-fit: cover scaling
      const imageAspectRatio = userImage.width / userImage.height;
      const placeholderAspectRatio = placeholder.width / placeholder.height;

      let cropX = 0;
      let cropY = 0;
      let cropWidth = userImage.width;
      let cropHeight = userImage.height;

      if (imageAspectRatio > placeholderAspectRatio) {
        cropWidth = userImage.height * placeholderAspectRatio;
        cropX = (userImage.width - cropWidth) / 2;
      } else {
        cropHeight = userImage.width / placeholderAspectRatio;
        cropY = (userImage.height - cropHeight) / 2;
      }

      return (
        <KonvaImage
          key={placeholder.id}
          image={userImage}
          x={scaledX}
          y={scaledY}
          width={scaledWidth}
          height={scaledHeight}
          crop={{
            x: cropX,
            y: cropY,
            width: cropWidth,
            height: cropHeight,
          }}
        />
      );
    } else {
      const textValue = inputValues[placeholder.id] as string;
      if (!textValue) return null;

      // Apply text transform
      let displayText = textValue;
      if (placeholder.textTransform === 'uppercase') {
        displayText = displayText.toUpperCase();
      } else if (placeholder.textTransform === 'lowercase') {
        displayText = displayText.toLowerCase();
      } else if (placeholder.textTransform === 'capitalize') {
        displayText = displayText
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      return (
        <Text
          key={placeholder.id}
          x={scaledX}
          y={scaledY}
          width={scaledWidth}
          height={scaledHeight}
          text={displayText}
          fontSize={(placeholder.fontSize || 24) * imageScale}
          fill={placeholder.color || '#000000'}
          align={placeholder.textAlign || 'center'}
          fontFamily={placeholder.fontFamily || 'Open Sans'}
          fontStyle={placeholder.fontStyle || 'normal'}
          fontWeight={placeholder.fontWeight || 'normal'}
          wrap="word"
          ellipsis={true}
        />
      );
    }
  };

  const renderSelectionStep = () => (
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

  const renderInputStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCurrentStep('selection')}
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
          {selectedTemplate?.template_placeholders.map((placeholder) => (
            <div key={placeholder.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {placeholder?.labelText}
                {placeholder.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {placeholder.type === 'text' ? (
                <input
                  type="text"
                  value={(inputValues[placeholder.id] as string) || ''}
                  onChange={(e) => handleInputChange(placeholder.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder={`Enter ${placeholder?.labelText?.toLowerCase()}`}
                  required={placeholder.required}
                />
              ) : (
                <FileUploadInput
                  value={inputValues[placeholder.id] as File | null}
                  onChange={(file) => handleInputChange(placeholder.id, file)}
                  accept="image/*"
                  maxSize={2 * 1024 * 1024}
                />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-primary">Live Preview</h4>
          <div ref={containerRef} className="border rounded-lg overflow-hidden bg-gray-50">
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
                  {selectedTemplate?.template_placeholders.map(renderTemplatePlaceholder)}
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

  const renderPreviewStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCurrentStep('input')}
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
          onClick={() => setCurrentStep('input')}
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Flier Template</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {currentStep === 'selection' && renderSelectionStep()}
          {currentStep === 'input' && renderInputStep()}
          {currentStep === 'preview' && renderPreviewStep()}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};