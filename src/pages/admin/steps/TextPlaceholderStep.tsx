import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text,
  Transformer,
  Rect,
  Circle,
  Shape,
} from "react-konva";
import { useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import type { CreateEventFormData, TextPlaceholderZone } from "../../../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { TwitterColorPickerInput } from "../../../components/TwitterColorPickerInput";
import { transformText } from "../../../lib/utils";

const TEXT_STYLE_OPTIONS = [
  {
    key: "fontFamily",
    label: "Font Family",
    options: [
      { value: "Open Sans", label: "Open Sans" },
      { value: "Arial", label: "Arial" },
      { value: "Times New Roman", label: "Times New Roman" },
    ],
  },
  {
    key: "fontStyle",
    label: "Font Style",
    options: [
      { value: "normal", label: "Normal" },
      { value: "italic", label: "Italic" },
      { value: "bold", label: "Bold" },
      { value: "italic bold", label: "Italic Bold" },
    ],
  },
  {
    key: "textAlign",
    label: "Text Align",
    options: [
      { value: "left", label: "Left" },
      { value: "center", label: "Center" },
      { value: "right", label: "Right" },
    ],
  },
  {
    key: "textTransform",
    label: "Text Transform",
    options: [
      { value: "none", label: "None" },
      { value: "uppercase", label: "Uppercase" },
      { value: "lowercase", label: "Lowercase" },
      { value: "capitalize", label: "Capitalize" },
    ],
  },
];

export const TextPlaceholderStep: React.FC = () => {
  const { watch, setValue } = useFormContext<CreateEventFormData>();
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<any>(null);
  const textRefs = useRef<any[]>([]);

  const flyer_file = watch("flyer_file");
  const textPlaceholders = watch("text_placeholders");
  const imagePlaceholders = watch("image_placeholders");

  const tempFlyerUrl = useMemo(
    () => (flyer_file?.name ? URL.createObjectURL(flyer_file) : null),
    [flyer_file]
  );

  useEffect(() => {
    if (!tempFlyerUrl) return;

    const img = new Image();
    img.src = tempFlyerUrl;
    img.onload = () => {
      setImage(img);
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const scale = containerWidth / img.width;
        setImageScale(scale);
        setStageSize({
          width: containerWidth,
          height: img.height * scale,
        });
      }
    };
  }, [tempFlyerUrl]);

  useEffect(() => {
    if (transformerRef.current && selectedIndex >= 0) {
      transformerRef.current.nodes([textRefs.current[selectedIndex]]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedIndex]);

  const handleTransformEnd = (index: number) => {
    if (textRefs.current[index]) {
      const node = textRefs.current[index];
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      node.scaleX(1);
      node.scaleY(1);

      // Convert scaled coordinates back to original image coordinates
      const newPlaceholder: TextPlaceholderZone = {
        ...textPlaceholders[index],
        x: Math.round(node.x() / imageScale),
        y: Math.round(node.y() / imageScale),
        width: Math.round((node.width() * scaleX) / imageScale),
        height: Math.round((node.height() * scaleY) / imageScale),
        fontSize: Math.round((node.fontSize() * scaleY) / imageScale),
      };

      const newPlaceholders = [...textPlaceholders];
      newPlaceholders[index] = newPlaceholder;
      setValue("text_placeholders", newPlaceholders);
    }
  };

  const addTextPlaceholder = () => {
    // Create new placeholder with coordinates relative to original image dimensions
    const newPlaceholder: TextPlaceholderZone = {
      x: Math.round(50 / imageScale),
      y: Math.round(50 / imageScale),
      width: Math.round(200 / imageScale),
      height: Math.round(50 / imageScale),
      text: "Sample Text",
      fontSize: Math.round(24 / imageScale),
      color: "#000000",
      textAlign: "center",
      fontFamily: "Open Sans",
      fontStyle: "normal",
      textTransform: "none",
      // fontWeight: "normal",
      labelText: "",
    };
    setValue("text_placeholders", [...textPlaceholders, newPlaceholder]);
  };

  const removeTextPlaceholder = (index: number) => {
    const newPlaceholders = textPlaceholders.filter((_, i) => i !== index);
    setValue("text_placeholders", newPlaceholders);
    setSelectedIndex(-1);
  };

  const updateTextStyle = (
    index: number,
    field: keyof TextPlaceholderZone,
    value: any
  ) => {
    const newPlaceholders = [...textPlaceholders];

    // For fontSize, convert from display value to original image scale
    if (field === "fontSize") {
      value = Math.round(value / imageScale);
    }

    newPlaceholders[index] = { ...newPlaceholders[index], [field]: value };
    setValue("text_placeholders", newPlaceholders);
  };

  const renderImagePlaceholderShape = () => {
    if (!imagePlaceholders || imagePlaceholders.length === 0) return null;

    const placeholder = imagePlaceholders[0];

    // Scale coordinates for display on the Konva stage
    const scaledX = placeholder.x * imageScale;
    const scaledY = placeholder.y * imageScale;
    const scaledWidth = placeholder.width * imageScale;
    const scaledHeight = placeholder.height * imageScale;

    const commonProps = {
      x: scaledX,
      y: scaledY,
      fill: "rgba(255, 165, 0, 0.3)", // Orange fill to distinguish from text placeholders
      stroke: "rgba(255, 165, 0, 0.8)", // Orange stroke
      strokeWidth: 2,
      listening: false, // Make it non-interactive
    };

    switch (placeholder.holeShape) {
      case "circle":
        return (
          <Circle
            {...commonProps}
            radius={Math.min(scaledWidth, scaledHeight) / 2}
            offsetX={0}
            offsetY={0}
          />
        );
      case "triangle":
        return (
          <Shape
            {...commonProps}
            sceneFunc={(context, shape) => {
              context.beginPath();
              context.moveTo(scaledWidth / 2, 0);
              context.lineTo(scaledWidth, scaledHeight);
              context.lineTo(0, scaledHeight);
              context.closePath();
              context.fillStrokeShape(shape);
            }}
            width={scaledWidth}
            height={scaledHeight}
          />
        );
      case "box":
      default:
        return (
          <Rect {...commonProps} width={scaledWidth} height={scaledHeight} />
        );
    }
  };

  if (!tempFlyerUrl) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-primary">
          Position Text Elements
        </h3>
        <p className="text-secondary">
          Add and style text placeholders for your event DP. The orange area
          shows where the user's photo will appear.
        </p>
      </div>

      <div className="flex gap-6">
        <div
          ref={containerRef}
          className="flex-1 border rounded-lg overflow-hidden"
        >
          {image && stageSize.width > 0 && (
            <Stage width={stageSize.width} height={stageSize.height}>
              <Layer>
                <KonvaImage
                  image={image}
                  width={stageSize.width}
                  height={stageSize.height}
                />
                {/* Render image placeholder shape */}
                {renderImagePlaceholderShape()}
                {/* Render text placeholders */}
                {textPlaceholders.map((placeholder, index) => {
                  // Apply text transform
                  const displayText = transformText(
                    placeholder.text,
                    placeholder.textTransform ?? ""
                  );

                  return (
                    <Text
                      key={index}
                      ref={(el) => (textRefs.current[index] = el)}
                      x={placeholder.x * imageScale}
                      y={placeholder.y * imageScale}
                      width={placeholder.width * imageScale}
                      height={placeholder.height * imageScale}
                      text={displayText}
                      fontSize={placeholder.fontSize * imageScale}
                      fill={placeholder.color}
                      align={placeholder.textAlign}
                      fontFamily={placeholder.fontFamily}
                      fontStyle={placeholder.fontStyle}
                      // fontWeight={placeholder.fontWeight}
                      draggable
                      onClick={() => setSelectedIndex(index)}
                      onTap={() => setSelectedIndex(index)}
                      onDragEnd={() => handleTransformEnd(index)}
                      onTransformEnd={() => handleTransformEnd(index)}
                    />
                  );
                })}
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    const minSize = 20 * imageScale;
                    return newBox.width < minSize || newBox.height < minSize
                      ? oldBox
                      : newBox;
                  }}
                />
              </Layer>
            </Stage>
          )}
        </div>

        <div className="w-72 space-y-4">
          <button
            type="button"
            onClick={addTextPlaceholder}
            className="w-full flex items-center justify-center px-4 py-2 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors"
            disabled={textPlaceholders?.length >= 3}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Text Placeholder
          </button>

          {selectedIndex >= 0 && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-primary">Text Settings</h4>
                <button
                  type="button"
                  onClick={() => removeTextPlaceholder(selectedIndex)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-secondary">
                  Sample Text
                </label>
                <input
                  type="text"
                  value={textPlaceholders[selectedIndex].text}
                  onChange={(e) =>
                    updateTextStyle(selectedIndex, "text", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-secondary">
                  Label Text
                </label>
                <input
                  type="text"
                  value={textPlaceholders[selectedIndex].labelText}
                  onChange={(e) =>
                    updateTextStyle(selectedIndex, "labelText", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-secondary">
                  Font Size
                </label>
                <input
                  type="number"
                  value={Math.round(
                    textPlaceholders[selectedIndex].fontSize * imageScale
                  )}
                  onChange={(e) =>
                    updateTextStyle(
                      selectedIndex,
                      "fontSize",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <TwitterColorPickerInput
                label="Color"
                value={textPlaceholders[selectedIndex].color}
                onChange={(color) =>
                  updateTextStyle(selectedIndex, "color", color)
                }
              />

              {TEXT_STYLE_OPTIONS.map(({ key, label, options }) => (
                <div key={key} className="space-y-2">
                  <label className="block text-sm text-secondary">
                    {label}
                  </label>
                  <Select
                    value={
                      textPlaceholders[selectedIndex][
                        key as keyof TextPlaceholderZone
                      ] as string
                    }
                    onValueChange={(value) =>
                      updateTextStyle(
                        selectedIndex,
                        key as keyof TextPlaceholderZone,
                        value
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={`Select ${label.toLowerCase()}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map(({ value, label: optionLabel }) => (
                        <SelectItem key={value} value={value}>
                          {optionLabel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
