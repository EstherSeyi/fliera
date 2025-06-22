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
import { step1Schema } from "../../validation/createTemplateSchema";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  FONT_FAMILIES,
  STEPS,
} from "../../constants";

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

interface TemplateImageData {
  image: HTMLImageElement;
  displayX: number;
  displayY: number;
  displayWidth: number;
  displayHeight: number;
}

// const STEPS = [
//   { id: 1, title: "Basic Info", description: "Upload image and set title" },
//   {
//     id: 2,
//     title: "Template Elements",
//     description: "Add fixed template content",
//   },
//   { id: 3, title: "Preview", description: "Review and save template" },
// ];

// const CANVAS_WIDTH = 600;
// const CANVAS_HEIGHT = 400;

// const FONT_FAMILIES = [
//   "Open Sans",
//   "Arial",
//   "Helvetica",
//   "Times New Roman",
//   "Georgia",
//   "Verdana",
// ];

export const CreateTemplate = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [template, setTemplate] = useState<Template>({
    id: "",
    title: "",
    template_image_url: "",
    template_placeholders: [],
  });

  const [templateImage, setTemplateImage] = useState<TemplateImageData | null>(
    null
  );
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

  // Calculate image display properties to maintain aspect ratio
  const calculateImageDisplayProperties = (
    img: HTMLImageElement
  ): Omit<TemplateImageData, "image"> => {
    const imageAspectRatio = img.width / img.height;
    const canvasAspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;

    let displayWidth: number;
    let displayHeight: number;

    if (imageAspectRatio > canvasAspectRatio) {
      // Image is wider than canvas aspect ratio
      displayWidth = CANVAS_WIDTH;
      displayHeight = CANVAS_WIDTH / imageAspectRatio;
    } else {
      // Image is taller than canvas aspect ratio
      displayHeight = CANVAS_HEIGHT;
      displayWidth = CANVAS_HEIGHT * imageAspectRatio;
    }

    // Center the image
    const displayX = (CANVAS_WIDTH - displayWidth) / 2;
    const displayY = (CANVAS_HEIGHT - displayHeight) / 2;

    return {
      displayX,
      displayY,
      displayWidth,
      displayHeight,
    };
  };

  // Handle image upload
  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const displayProps = calculateImageDisplayProperties(img);
            setTemplateImage({
              image: img,
              ...displayProps,
            });
            const imageUrl = e.target?.result as string;
            setValue("template_image_url", imageUrl);
            trigger("template_image_url");
          };
          img.src = e.target?.result as string;
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
      if (!templateImage) return;

      const stage = e.target.getStage();
      const point = stage.getPointerPosition();

      // If clicking on a shape, don't add new placeholder
      if (e.target !== stage) {
        return;
      }

      // Convert canvas coordinates to image-relative coordinates
      const relativeX = point.x - templateImage.displayX;
      const relativeY = point.y - templateImage.displayY;

      // Check if click is within the image bounds
      if (
        relativeX < 0 ||
        relativeY < 0 ||
        relativeX > templateImage.displayWidth ||
        relativeY > templateImage.displayHeight
      ) {
        return; // Click is outside the image
      }

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
    [currentStep, placeholderType, templateImage]
  );

  // Handle placeholder selection
  const handlePlaceholderSelect = useCallback((id: string) => {
    setSelectedPlaceholder(id);
  }, []);

  // Handle placeholder drag
  const handlePlaceholderDrag = useCallback(
    (id: string, newX: number, newY: number) => {
      if (!templateImage) return;

      // Convert back to relative coordinates
      const relativeX = newX - templateImage.displayX;
      const relativeY = newY - templateImage.displayY;

      setTemplate((prev) => ({
        ...prev,
        template_placeholders: prev.template_placeholders.map((p) =>
          p.id === id ? { ...p, x: relativeX, y: relativeY } : p
        ),
      }));
    },
    [templateImage]
  );

  // Handle placeholder transform
  const handlePlaceholderTransform = useCallback(
    (id: string, node: any) => {
      if (!templateImage) return;

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
        relativeX = node.x() - newWidth / 2 - templateImage.displayX;
        relativeY = node.y() - newHeight / 2 - templateImage.displayY;
      } else {
        // For rectangles and text, node.x() and node.y() represent top-left coordinates
        relativeX = node.x() - templateImage.displayX;
        relativeY = node.y() - templateImage.displayY;
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
                width: newWidth,
                height: newHeight,
                fontSize: newFontSize,
              };
            }
            return {
              ...p,
              x: relativeX,
              y: relativeY,
              width: newWidth,
              height: newHeight,
            };
          }
          return p;
        }),
      }));
    },
    [templateImage, template.template_placeholders]
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
      setTemplateImage(null);
      setImageFile(null);
      setSelectedPlaceholder(null);
      setCurrentStep(1);
      setValue("title", "");
      setValue("template_image_url", "");

      // Show success message
      alert("Template saved successfully!");
    } catch (error: any) {
      console.error("Error saving template:", error);
      setError(error.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  }, [template, imageFile, setValue]);

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
      <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
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
              className="w-full px-3 py-1 border border-border rounded text-sm"
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
                className="w-full px-3 py-1 border border-border rounded text-sm"
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
                className="w-full px-3 py-1 border border-border rounded text-sm"
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
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  updatePlaceholderProperty(
                    selectedData.id,
                    "holeShape",
                    "rectangle"
                  )
                }
                className={`px-3 py-1 rounded text-sm ${
                  selectedData.holeShape === "rectangle"
                    ? "bg-primary text-neutral"
                    : "bg-neutral border border-border"
                }`}
              >
                Rectangle
              </button>
              <button
                onClick={() =>
                  updatePlaceholderProperty(
                    selectedData.id,
                    "holeShape",
                    "circle"
                  )
                }
                className={`px-3 py-1 rounded text-sm ${
                  selectedData.holeShape === "circle"
                    ? "bg-primary text-neutral"
                    : "bg-neutral border border-border"
                }`}
              >
                Circle
              </button>
            </div>
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
                className="w-full px-3 py-1 border border-border rounded text-sm"
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
                  className="w-full px-3 py-1 border border-border rounded text-sm"
                  min="8"
                  max="72"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={selectedData.color || "#000000"}
                  onChange={(e) =>
                    updatePlaceholderProperty(
                      selectedData.id,
                      "color",
                      e.target.value
                    )
                  }
                  className="w-full h-8 border border-border rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Font Family
              </label>
              <select
                value={selectedData.fontFamily || "Open Sans"}
                onChange={(e) =>
                  updatePlaceholderProperty(
                    selectedData.id,
                    "fontFamily",
                    e.target.value
                  )
                }
                className="w-full px-3 py-1 border border-border rounded text-sm"
              >
                {FONT_FAMILIES.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Font Style
              </label>
              <div className="flex space-x-2">
                {["normal", "bold", "italic"].map((style) => (
                  <button
                    key={style}
                    onClick={() =>
                      updatePlaceholderProperty(
                        selectedData.id,
                        "fontStyle",
                        style
                      )
                    }
                    className={`px-3 py-1 rounded text-sm capitalize ${
                      selectedData.fontStyle === style
                        ? "bg-primary text-neutral"
                        : "bg-neutral border border-border"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Text Align
              </label>
              <div className="flex space-x-2">
                {["left", "center", "right"].map((align) => (
                  <button
                    key={align}
                    onClick={() =>
                      updatePlaceholderProperty(
                        selectedData.id,
                        "textAlign",
                        align
                      )
                    }
                    className={`px-3 py-1 rounded text-sm capitalize ${
                      selectedData.textAlign === align
                        ? "bg-primary text-neutral"
                        : "bg-neutral border border-border"
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => deletePlaceholder(selectedData.id)}
          className="mt-4 w-full bg-imperialred text-neutral py-2 rounded text-sm hover:bg-red-700 transition-colors"
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent ${
                  errors.title ? "border-red-500" : "border-border"
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
                  errors.template_image_url ? "border-red-500" : "border-border"
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
                    <Upload className="w-12 h-12 text-secondary mx-auto" />
                    <p className="text-secondary">
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
                  className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
                    placeholderType === "image"
                      ? "bg-primary text-neutral"
                      : "bg-muted text-secondary"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Image</span>
                </button>
                <button
                  onClick={() => setPlaceholderType("text")}
                  className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
                    placeholderType === "text"
                      ? "bg-primary text-neutral"
                      : "bg-muted text-secondary"
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span>Text</span>
                </button>
              </div>
            </div>

            <p className="text-sm text-secondary">
              Click on the canvas to add fixed {placeholderType} elements that
              will appear on every generated template. The properties panel will
              automatically appear for each new element you create.
            </p>

            {/* Template placeholder list */}
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {template.template_placeholders.map((placeholder) => (
                <div
                  key={placeholder.id}
                  className="flex items-center justify-between bg-muted p-2 rounded"
                >
                  <span className="text-sm">
                    {placeholder.labelText} ({Math.round(placeholder.x)},{" "}
                    {Math.round(placeholder.y)})
                  </span>
                  <button
                    onClick={() => deletePlaceholder(placeholder.id)}
                    className="text-imperialred hover:text-red-700"
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
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium text-primary mb-2">
                Template Details:
              </h4>
              <p>
                <strong>Title:</strong> {template.title}
              </p>
              <p>
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
              className="w-full bg-primary text-neutral py-3 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  currentStep >= step.id ? "text-primary" : "text-secondary"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id
                      ? "bg-primary text-neutral"
                      : "bg-muted text-secondary"
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
                <ChevronRight className="w-4 h-4 text-secondary mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Form */}
        <div className="bg-neutral border border-border rounded-lg p-6">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={nextStep}
              disabled={currentStep === 3}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-neutral rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Panel - Canvas */}
        <div className="bg-neutral border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Canvas Preview
          </h3>
          <div className="border border-border rounded-lg overflow-hidden">
            <Stage
              ref={stageRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onClick={handleCanvasClick}
              className="cursor-crosshair"
            >
              <Layer>
                {/* Background Image */}
                {templateImage && (
                  <KonvaImage
                    image={templateImage.image}
                    x={templateImage.displayX}
                    y={templateImage.displayY}
                    width={templateImage.displayWidth}
                    height={templateImage.displayHeight}
                    listening={false}
                  />
                )}

                {/* Template Placeholders */}
                {templateImage &&
                  template.template_placeholders.map((placeholder) => (
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
                            x={
                              templateImage.displayX +
                              placeholder.x +
                              (placeholder.width || 100) / 2
                            }
                            y={
                              templateImage.displayY +
                              placeholder.y +
                              (placeholder.height || 100) / 2
                            }
                            radius={(placeholder.width || 100) / 2}
                            stroke="#BFACC8"
                            strokeWidth={2}
                            fill="rgba(191, 172, 200, 0.2)"
                            draggable
                            onClick={() =>
                              handlePlaceholderSelect(placeholder.id)
                            }
                            onDragEnd={(e) => {
                              const newX =
                                e.target.x() - (placeholder.width || 100) / 2;
                              const newY =
                                e.target.y() - (placeholder.height || 100) / 2;
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
                            x={templateImage.displayX + placeholder.x}
                            y={templateImage.displayY + placeholder.y}
                            width={placeholder.width || 100}
                            height={placeholder.height || 100}
                            stroke="#BFACC8"
                            strokeWidth={2}
                            fill="rgba(191, 172, 200, 0.2)"
                            draggable
                            onClick={() =>
                              handlePlaceholderSelect(placeholder.id)
                            }
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
                            x={templateImage.displayX + placeholder.x}
                            y={templateImage.displayY + placeholder.y}
                            width={placeholder.width || 150}
                            height={placeholder.height || 30}
                            stroke="#BFACC8"
                            strokeWidth={1}
                            fill="rgba(191, 172, 200, 0.1)"
                            draggable
                            onClick={() =>
                              handlePlaceholderSelect(placeholder.id)
                            }
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
                            x={templateImage.displayX + placeholder.x + 5}
                            y={templateImage.displayY + placeholder.y + 5}
                            text={placeholder.text || "Template Text"}
                            fontSize={placeholder.fontSize || 16}
                            fill={placeholder.color || "#000000"}
                            fontFamily={placeholder.fontFamily || "Open Sans"}
                            listening={false}
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
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-thistle bg-thistle/20"></div>
              <span>Template Elements</span>
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
