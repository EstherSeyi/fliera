import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Rect,
  Text,
  Circle,
  Transformer,
} from "react-konva";
import {
  Upload,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Save,
  Type,
  ImageIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../context/ToastContext";
import { step1Schema } from "../../validation/createTemplateSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { TwitterColorPickerInput } from "../../components/TwitterColorPickerInput";
import { STEPS, CATEGORIZED_FONTS } from "../../constants";

type Step1FormData = z.infer<typeof step1Schema>;

// TypeScript interfaces
interface TemplatePlaceholder {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
  text?: string;
  labelText: string;
  fontStyle?: "normal" | "bold" | "italic";
  width?: number;
  height?: number;
  holeShape?: "circle" | "rectangle";
}

interface Template {
  id: string;
  title: string;
  template_image_url: string;
  template_placeholders: TemplatePlaceholder[];
}

export const CreateTemplate = () => {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [template, setTemplate] = useState<Template>({
    id: "",
    title: "",
    template_image_url: "",
    template_placeholders: [],
  });

  // Responsive canvas states
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [originalImageSize, setOriginalImageSize] = useState({ width: 0, height: 0 });
  const [loadedBackgroundImage, setLoadedBackgroundImage] = useState<HTMLImageElement | null>(null);
  
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<string | null>(
    null
  );
  const [placeholderType, setPlaceholderType] = useState<"image" | "text">(
    "image"
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const shapeRefs = useRef<{ [key: string]: any }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    watch,
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      title: template.title,
      template_image_url: template.template_image_url,
    },
  });

  // Watch form values to sync with template state
  const watchedTitle = watch("title");
  const watchedImageUrl = watch("template_image_url");

  // Sync form values with template state
  useEffect(() => {
    setTemplate((prev) => ({
      ...prev,
      title: watchedTitle || "",
      template_image_url: watchedImageUrl || "",
    }));
  }, [watchedTitle, watchedImageUrl]);

  // Load background image when template_image_url changes
  useEffect(() => {
    if (template.template_image_url) {
      const img = new window.Image();
      img.crossOrigin = "anonymous"; // Important for images from external URLs
      img.src = template.template_image_url;
      img.onload = () => {
        setLoadedBackgroundImage(img);
        // Set original image size once the image is loaded
        setOriginalImageSize({ width: img.width, height: img.height });
      };
      img.onerror = (err) => {
        console.error("Error loading background image for Konva:", err);
        setLoadedBackgroundImage(null);
        setOriginalImageSize({ width: 0, height: 0 }); // Reset size on error
      };
    } else {
      setLoadedBackgroundImage(null);
      setOriginalImageSize({ width: 0, height: 0 }); // Reset size if URL is empty
    }
  }, [template.template_image_url]);

  // Update stage size when container size changes or window resizes
  useEffect(() => {
    const updateStageSize = () => {
      if (containerRef.current && originalImageSize.width > 0) {
        const containerWidth = containerRef.current.offsetWidth;
        const scale = containerWidth / originalImageSize.width;
        
        setImageScale(scale);
        setStageSize({
          width: containerWidth,
          height: originalImageSize.height * scale,
        });
      }
    };

    // Initial update
    updateStageSize();

    // Add resize listener
    window.addEventListener('resize', updateStageSize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateStageSize);
    };
  }, [containerRef, originalImageSize]);

  // Handle image upload
  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setValue("template_image_url", imageUrl);
          trigger("template_image_url");
        };
        reader.readAsDataURL(file);
      }
    },
    [setValue, trigger]
  );

  // Handle canvas click to add placeholders
  const handleCanvasClick = useCallback(
    (e: any) => {
      if (currentStep !== 2) return;
      if (originalImageSize.width === 0) return;

      const stage = e.target.getStage();
      const point = stage.getPointerPosition();

      // If clicking on a shape, don't add new placeholder
      if (e.target !== stage) {
        return;
      }

      // Calculate relative position in original image coordinates
      const relativeX = point.x / imageScale;
      const relativeY = point.y / imageScale;

      // Add template placeholders
      const newPlaceholder: TemplatePlaceholder = {
        id: `template_${Date.now()}`,
        type: placeholderType,
        x: relativeX,
        y: relativeY,
        labelText:
          placeholderType === "image" ? "Template Image" : "Template Text",
        ...(placeholderType === "text" && {
          fontSize: 16,
          color: "#000000",
          fontFamily: "Open Sans",
          textAlign: "left",
          text: "Template Text",
          fontStyle: "normal",
          width: 150,
          height: 30,
        }),
        ...(placeholderType === "image" && {
          width: 100,
          height: 100,
          holeShape: "rectangle",
        }),
      };
      setTemplate((prev) => ({
        ...prev,
        template_placeholders: [...prev.template_placeholders, newPlaceholder],
      }));
      // Auto-select the newly created placeholder
      setSelectedPlaceholder(newPlaceholder.id);
    },
    [currentStep, placeholderType, imageScale, originalImageSize]
  );

  // Handle placeholder selection
  const handlePlaceholderSelect = useCallback((id: string, e: any) => {
    // Stop event propagation to prevent creating a new placeholder
    e.cancelBubble = true;
    setSelectedPlaceholder(id);
  }, []);

  // Handle placeholder drag
  const handlePlaceholderDrag = useCallback(
    (id: string, newX: number, newY: number) => {
      // Convert to original image coordinates
      const relativeX = newX / imageScale;
      const relativeY = newY / imageScale;

      setTemplate((prev) => ({
        ...prev,
        template_placeholders: prev.template_placeholders.map((p) =>
          p.id === id ? { ...p, x: relativeX, y: relativeY } : p
        ),
      }));
    },
    [imageScale]
  );

  // Handle placeholder transform
  const handlePlaceholderTransform = useCallback(
    (id: string, node: any) => {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const newWidth = Math.max(5, node.width() * scaleX);
      const newHeight = Math.max(5, node.height() * scaleY);

      // Reset scale
      node.scaleX(1);
      node.scaleY(1);

      // Check if this is a circle image placeholder
      const isCircleImagePlaceholder = template.template_placeholders.find(
        (p) => p.id === id && p.holeShape === "circle"
      );

      let relativeX: number;
      let relativeY: number;

      if (isCircleImagePlaceholder) {
        // For circles, node.x() and node.y() represent the center after transformation
        // Convert center coordinates to top-left coordinates for storage
        relativeX = node.x() / imageScale;
        relativeY = node.y() / imageScale;
      } else {
        // For rectangles and text, node.x() and node.y() represent top-left coordinates
        relativeX = node.x() / imageScale;
        relativeY = node.y() / imageScale;
      }

      setTemplate((prev) => ({
        ...prev,
        template_placeholders: prev.template_placeholders.map((p) => {
          if (p.id === id) {
            if (p.type === "text") {
              const fontSizeScale = Math.min(scaleX, scaleY);
              const newFontSize = Math.max(
                8,
                (p.fontSize || 16) * fontSizeScale
              );
              return {
                ...p,
                x: relativeX,
                y: relativeY,
                width: newWidth / imageScale,
                height: newHeight / imageScale,
                fontSize: newFontSize,
              };
            }
            return {
              ...p,
              x: relativeX,
              y: relativeY,
              width: newWidth / imageScale,
              height: newHeight / imageScale,
            };
          }
          return p;
        }),
      }));
    },
    [imageScale, template.template_placeholders]
  );

  // Update placeholder property
  const updatePlaceholderProperty = useCallback(
    (id: string, property: string, value: any) => {
      setTemplate((prev) => ({
        ...prev,
        template_placeholders: prev.template_placeholders.map((p) =>
          p.id === id ? { ...p, [property]: value } : p
        ),
      }));
    },
    []
  );

  // Get selected placeholder data
  const getSelectedPlaceholder = useCallback(() => {
    if (!selectedPlaceholder) return null;

    const templatePlaceholder = template.template_placeholders.find(
      (p) => p.id === selectedPlaceholder
    );
    if (templatePlaceholder)
      return { ...templatePlaceholder, kind: "template" };

    return null;
  }, [selectedPlaceholder, template]);

  // Attach transformer to selected placeholder
  useEffect(() => {
    if (selectedPlaceholder && transformerRef.current) {
      const selectedNode = shapeRefs.current[selectedPlaceholder];
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedPlaceholder, template.template_placeholders]);

  // Delete placeholder
  const deletePlaceholder = useCallback(
    (id: string) => {
      // Clean up the shape reference
      delete shapeRefs.current[id];

      setTemplate((prev) => ({
        ...prev,
        template_placeholders: prev.template_placeholders.filter(
          (p) => p.id !== id
        ),
      }));

      if (selectedPlaceholder === id) {
        setSelectedPlaceholder(null);
      }
    },
    [selectedPlaceholder]
  );

  // Upload image to Supabase Storage
  const uploadImageToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `templates/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("template-images")
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from("template-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Save template to Supabase
  const handleSaveTemplate = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      // Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("You must be logged in to save templates");
      }

      let imageUrl = template.template_image_url;

      // Upload image if a new file was selected
      if (imageFile) {
        imageUrl = await uploadImageToStorage(imageFile);
      }

      // Get user data for created_by field
      const { data: userData } = await supabase
        .from("users")
        .select("username")
        .eq("id", session.user.id)
        .single();

      const createdBy =
        userData?.username || session.user.email || "Unknown User";

      // Prepare template data for database
      const templateData = {
        id: template.id || `template_${Date.now()}`,
        user_id: session.user.id,
        title: template.title.trim(),
        template_image_url: imageUrl,
        user_image_placeholders: [], // Empty array to match database schema
        user_text_placeholders: [], // Empty array to match database schema
        template_placeholders: template.template_placeholders,
        created_by: createdBy,
      };

      // Save to database
      const { error: insertError } = await supabase
        .from("flier_templates")
        .insert(templateData);

      if (insertError) {
        throw new Error(`Failed to save template: ${insertError.message}`);
      }

      // Reset form on success
      setTemplate({
        id: "",
        title: "",
        template_image_url: "",
        template_placeholders: [],
      });
      setOriginalImageSize({ width: 0, height: 0 });
      setStageSize({ width: 0, height: 0 });
      setImageFile(null);
      setSelectedPlaceholder(null);
      setCurrentStep(1);
      setValue("title", "");
      setValue("template_image_url", "");

      // Show success toast
      showToast("Template saved successfully!", "success");
    } catch (error: any) {
      console.error("Error saving template:", error);
      setError(error.message || "Failed to save template");
      showToast(error.message || "Failed to save template", "error");
    } finally {
      setSaving(false);
    }
  }, [template, imageFile, setValue, showToast]);

  // Navigation functions with validation
  const onValidStep1 = (data: Step1FormData) => {
    setSelectedPlaceholder(null);
    setCurrentStep(2);
  };

  const nextStep = () => {
    if (currentStep === 1) {
      handleSubmit(onValidStep1)();
    } else {
      setSelectedPlaceholder(null);
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setSelectedPlaceholder(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Render placeholder properties panel
  const renderPlaceholderProperties = () => {
    const selectedData = getSelectedPlaceholder();
    if (!selectedData) return null;

    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-primary mb-4">
          Placeholder Properties
        </h4>

        {/* Common properties */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Label Text
            </label>
            <input
              type="text"
              value={selectedData.labelText}
              onChange={(e) =>
                updatePlaceholderProperty(
                  selectedData.id,
                  "labelText",
                  e.target.value
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Width
              </label>
              <input
                type="number"
                value={Math.round(selectedData.width || 0)}
                onChange={(e) =>
                  updatePlaceholderProperty(
                    selectedData.id,
                    "width",
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                min="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Height
              </label>
              <input
                type="number"
                value={Math.round(selectedData.height || 0)}
                onChange={(e) =>
                  updatePlaceholderProperty(
                    selectedData.id,
                    "height",
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                min="5"
              />
            </div>
          </div>
        </div>

        {/* Image-specific properties */}
        {selectedData.type === "image" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-primary mb-2">
              Shape
            </label>
            <Select
              value={selectedData.holeShape || "rectangle"}
              onValueChange={(value) =>
                updatePlaceholderProperty(selectedData.id, "holeShape", value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select shape" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rectangle">Rectangle</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Text-specific properties */}
        {selectedData.type === "text" && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Text Content
              </label>
              <input
                type="text"
                value={selectedData.text || ""}
                onChange={(e) =>
                  updatePlaceholderProperty(
                    selectedData.id,
                    "text",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Font Size
                </label>
                <input
                  type="number"
                  value={selectedData.fontSize || 16}
                  onChange={(e) =>
                    updatePlaceholderProperty(
                      selectedData.id,
                      "fontSize",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  min="8"
                  max="72"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Color
                </label>
                <TwitterColorPickerInput
                  value={selectedData.color || "#000000"}
                  onChange={(color) =>
                    updatePlaceholderProperty(selectedData.id, "color", color)
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Font Family
              </label>
              <Select
                value={selectedData.fontFamily || "Open Sans"}
                onValueChange={(value) =>
                  updatePlaceholderProperty(selectedData.id, "fontFamily", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select font family" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(CATEGORIZED_FONTS).map(
                    ([category, fonts]) => (
                      <div key={category}>
                        <p className="font-semibold capitalize pl-8 pr-2 mt-4">
                          {category}
                        </p>
                        {fonts.map((font) => (
                          <SelectItem
                            key={font}
                            value={font}
                            style={{ fontFamily: font }}
                          >
                            {font}
                          </SelectItem>
                        ))}
                      </div>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Font Style
              </label>
              <Select
                value={selectedData.fontStyle || "normal"}
                onValueChange={(value) =>
                  updatePlaceholderProperty(selectedData.id, "fontStyle", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select font style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="italic">Italic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Text Align
              </label>
              <Select
                value={selectedData.textAlign || "left"}
                onValueChange={(value) =>
                  updatePlaceholderProperty(selectedData.id, "textAlign", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select text alignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <button
          onClick={() => deletePlaceholder(selectedData.id)}
          className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-red-700 transition-colors"
        >
          Delete Placeholder
        </button>
      </div>
    );
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Template Title *
              </label>
              <input
                type="text"
                {...register("title")}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter template title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.title.message}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Template Image *
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors ${
                  errors.template_image_url ? "border-red-500" : "border-gray-300"
                }`}
              >
                {template.template_image_url ? (
                  <img
                    src={template.template_image_url}
                    alt="Template"
                    className="max-w-full max-h-64 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-gray-500">
                      Click to upload template image
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {errors.template_image_url && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.template_image_url.message}</span>
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary">
                Template Elements
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPlaceholderType("image")}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                    placeholderType === "image"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Image</span>
                </button>
                <button
                  onClick={() => setPlaceholderType("text")}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                    placeholderType === "text"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span>Text</span>
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Click on the canvas to add fixed {placeholderType} elements that
              will appear on every generated template. The properties panel will
              automatically appear for each new element you create.
            </p>

            {/* Template placeholder list */}
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {template.template_placeholders.map((placeholder) => (
                <div
                  key={placeholder.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <span className="text-sm text-primary">
                    {placeholder.labelText} ({Math.round(placeholder.x)},{" "}
                    {Math.round(placeholder.y)})
                  </span>
                  <button
                    onClick={() => deletePlaceholder(placeholder.id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {renderPlaceholderProperties()}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-primary">
              Template Preview
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-primary mb-2">
                Template Details:
              </h4>
              <p className="text-gray-700">
                <strong>Title:</strong> {template.title}
              </p>
              <p className="text-gray-700">
                <strong>Template Elements:</strong>{" "}
                {template.template_placeholders.length}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleSaveTemplate}
              disabled={saving}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving Template...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Template</span>
                </>
              )}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center space-x-2 ${
                  currentStep >= step.id ? "text-primary" : "text-gray-500"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step.id}
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-xs">{step.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={nextStep}
              disabled={currentStep === 3}
              className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Panel - Canvas */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Canvas Preview
          </h3>
          <div 
            ref={containerRef} 
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            {stageSize.width > 0 && stageSize.height > 0 && (
              <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                onClick={handleCanvasClick}
                className="cursor-crosshair"
              >
                <Layer>
                  {/* Background Image */}
                  {loadedBackgroundImage && (
                    <KonvaImage
                      image={loadedBackgroundImage}
                      x={0}
                      y={0}
                      width={stageSize.width}
                      height={stageSize.height}
                      listening={false}
                    />
                  )}

                  {/* Template Placeholders */}
                  {template.template_placeholders.map((placeholder) => (
                    <React.Fragment key={placeholder.id}>
                      {placeholder.type === "image" ? (
                        placeholder.holeShape === "circle" ? (
                          <Circle
                            ref={(node) => {
                              if (node) {
                                shapeRefs.current[placeholder.id] = node;
                              } else {
                                delete shapeRefs.current[placeholder.id];
                              }
                            }}
                            x={(placeholder.x + (placeholder.width || 100) / 2) * imageScale}
                            y={(placeholder.y + (placeholder.height || 100) / 2) * imageScale}
                            radius={(placeholder.width || 100) / 2 * imageScale}
                            stroke="#BFACC8"
                            strokeWidth={2}
                            fill="rgba(191, 172, 200, 0.2)"
                            draggable
                            onClick={(e) => handlePlaceholderSelect(placeholder.id, e)}
                            onTap={(e) => handlePlaceholderSelect(placeholder.id, e)}
                            onDragEnd={(e) => {
                              const newX = e.target.x() - ((placeholder.width || 100) / 2 * imageScale);
                              const newY = e.target.y() - ((placeholder.height || 100) / 2 * imageScale);
                              handlePlaceholderDrag(placeholder.id, newX, newY);
                            }}
                            onTransformEnd={(e) =>
                              handlePlaceholderTransform(
                                placeholder.id,
                                e.target
                              )
                            }
                          />
                        ) : (
                          <Rect
                            ref={(node) => {
                              if (node) {
                                shapeRefs.current[placeholder.id] = node;
                              } else {
                                delete shapeRefs.current[placeholder.id];
                              }
                            }}
                            x={placeholder.x * imageScale}
                            y={placeholder.y * imageScale}
                            width={(placeholder.width || 100) * imageScale}
                            height={(placeholder.height || 100) * imageScale}
                            stroke="#BFACC8"
                            strokeWidth={2}
                            fill="rgba(191, 172, 200, 0.2)"
                            draggable
                            onClick={(e) => handlePlaceholderSelect(placeholder.id, e)}
                            onTap={(e) => handlePlaceholderSelect(placeholder.id, e)}
                            onDragEnd={(e) =>
                              handlePlaceholderDrag(
                                placeholder.id,
                                e.target.x(),
                                e.target.y()
                              )
                            }
                            onTransformEnd={(e) =>
                              handlePlaceholderTransform(
                                placeholder.id,
                                e.target
                              )
                            }
                          />
                        )
                      ) : (
                        <>
                          <Rect
                            ref={(node) => {
                              if (node) {
                                shapeRefs.current[placeholder.id] = node;
                              } else {
                                delete shapeRefs.current[placeholder.id];
                              }
                            }}
                            x={placeholder.x * imageScale}
                            y={placeholder.y * imageScale}
                            width={(placeholder.width || 150) * imageScale}
                            height={(placeholder.height || 30) * imageScale}
                            stroke="#BFACC8"
                            strokeWidth={1}
                            fill="rgba(191, 172, 200, 0.1)"
                            draggable
                            onClick={(e) => handlePlaceholderSelect(placeholder.id, e)}
                            onTap={(e) => handlePlaceholderSelect(placeholder.id, e)}
                            onDragEnd={(e) =>
                              handlePlaceholderDrag(
                                placeholder.id,
                                e.target.x(),
                                e.target.y()
                              )
                            }
                            onTransformEnd={(e) =>
                              handlePlaceholderTransform(
                                placeholder.id,
                                e.target
                              )
                            }
                          />
                          <Text
                            x={(placeholder.x + 5) * imageScale}
                            y={(placeholder.y + 5) * imageScale}
                            text={placeholder.text || "Template Text"}
                            fontSize={(placeholder.fontSize || 16) * imageScale}
                            fill={placeholder.color || "#000000"}
                            fontFamily={placeholder.fontFamily || "Open Sans"}
                            listening={false}
                            align={placeholder.textAlign}
                            fontStyle={placeholder.fontStyle}
                            width={(placeholder.width || 150) * imageScale - 10}
                          />
                        </>
                      )}
                    </React.Fragment>
                  ))}

                  {/* Transformer */}
                  <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      // Limit resize
                      if (newBox.width < 5 || newBox.height < 5) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                  />
                </Layer>
              </Stage>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-thistle bg-thistle/20 rounded"></div>
              <span className="text-gray-600">Template Elements</span>
            </div>
            {selectedPlaceholder && (
              <div className="text-primary font-medium">
                Selected: Click and drag to move, use handles to resize
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};