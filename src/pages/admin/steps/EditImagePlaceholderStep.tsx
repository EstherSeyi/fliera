import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Transformer,
  Rect,
  Circle,
  Shape,
} from "react-konva";
import { useFormContext, Controller } from "react-hook-form";
import type { EditEventFormData, ImagePlaceholderZone, Event } from "../../../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

const SHAPE_OPTIONS = [
  { value: 'box', label: 'Box' },
  { value: 'circle', label: 'Circle' },
  { value: 'triangle', label: 'Triangle' },
];

interface EditImagePlaceholderStepProps {
  event: Event;
  isEventPast: boolean;
}

export const EditImagePlaceholderStep: React.FC<EditImagePlaceholderStepProps> = ({
  event,
  isEventPast,
}) => {
  const { watch, setValue, control } = useFormContext<EditEventFormData>();
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<any>(null);
  const shapeRef = useRef<any>(null);

  const flyer_file = watch("flyer_file");
  const imagePlaceholders = watch("image_placeholders");
  const placeholder = imagePlaceholders[0];

  // Use new flyer file if uploaded, otherwise use existing event flyer
  const flyerUrl = useMemo(() => {
    if (flyer_file) {
      return URL.createObjectURL(flyer_file);
    }
    return event.flyer_url;
  }, [flyer_file, event.flyer_url]);

  useEffect(() => {
    if (!flyerUrl) return;

    const img = new Image();
    img.src = flyerUrl;
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

    // Cleanup object URL if it was created from a file
    return () => {
      if (flyer_file && flyerUrl.startsWith('blob:')) {
        URL.revokeObjectURL(flyerUrl);
      }
    };
  }, [flyerUrl, flyer_file]);

  useEffect(() => {
    if (transformerRef.current && shapeRef.current && !isEventPast) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [placeholder.holeShape, isEventPast]);

  const handleTransformEnd = () => {
    if (shapeRef.current && !isEventPast) {
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Reset scale and apply it to width/height
      node.scaleX(1);
      node.scaleY(1);

      // Convert scaled coordinates back to original image coordinates
      const newPlaceholder: ImagePlaceholderZone = {
        x: Math.round(node.x() / imageScale),
        y: Math.round(node.y() / imageScale),
        width: Math.round((node.width() * scaleX) / imageScale),
        height: Math.round((node.height() * scaleY) / imageScale),
        holeShape: placeholder.holeShape,
      };

      setValue("image_placeholders", [newPlaceholder]);
    }
  };

  const renderShape = () => {
    // Scale coordinates for display on the Konva stage
    const scaledX = placeholder.x * imageScale;
    const scaledY = placeholder.y * imageScale;
    const scaledWidth = placeholder.width * imageScale;
    const scaledHeight = placeholder.height * imageScale;

    const commonProps = {
      ref: shapeRef,
      x: scaledX,
      y: scaledY,
      fill: "rgba(0, 123, 255, 0.3)",
      stroke: "rgba(0, 123, 255, 0.8)",
      strokeWidth: 2,
      draggable: !isEventPast,
      onTransformEnd: handleTransformEnd,
      onDragEnd: handleTransformEnd,
    };

    switch (placeholder.holeShape) {
      case 'circle':
        return (
          <Circle
            {...commonProps}
            radius={Math.min(scaledWidth, scaledHeight) / 2}
            offsetX={0}
            offsetY={0}
          />
        );
      case 'triangle':
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
      case 'box':
      default:
        return (
          <Rect
            {...commonProps}
            width={scaledWidth}
            height={scaledHeight}
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-primary">
          Edit Image Placeholder
        </h3>
        <p className="text-secondary">
          {isEventPast 
            ? "View the image placeholder position and shape (editing disabled for past events)"
            : "Adjust the shape and position where user photos will appear"
          }
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-primary font-medium">
            Placeholder Shape
          </label>
          <Controller
            name="image_placeholders.0.holeShape"
            control={control}
            render={({ field }) => (
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
                disabled={isEventPast}
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Select shape" />
                </SelectTrigger>
                <SelectContent>
                  {SHAPE_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {isEventPast && (
            <p className="text-yellow-600 text-sm">
              Shape editing is disabled for past events
            </p>
          )}
        </div>

        <div ref={containerRef} className="border rounded-lg overflow-hidden">
          {image && stageSize.width > 0 && (
            <Stage width={stageSize.width} height={stageSize.height}>
              <Layer>
                <KonvaImage
                  image={image}
                  width={stageSize.width}
                  height={stageSize.height}
                />
                {renderShape()}
                {!isEventPast && (
                  <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      // Limit resize (accounting for scale)
                      const minSize = 20 * imageScale;
                      const maxSize = Math.min(stageSize.width, stageSize.height);
                      if (
                        newBox.width < minSize ||
                        newBox.height < minSize ||
                        newBox.width > maxSize ||
                        newBox.height > maxSize
                      ) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                  />
                )}
              </Layer>
            </Stage>
          )}
        </div>

        <div className="text-center text-secondary text-sm">
          {isEventPast 
            ? "Editing is disabled for past events"
            : "Tip: Drag the corners to resize, or drag the shape to reposition"
          }
        </div>
      </div>
    </motion.div>
  );
};