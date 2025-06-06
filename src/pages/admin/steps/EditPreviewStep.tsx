import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Stage, Layer, Image as KonvaImage, Text, Rect, Circle, Shape } from "react-konva";
import { useFormContext } from "react-hook-form";
import type { EditEventFormData, Event } from "../../../types";

interface EditPreviewStepProps {
  event: Event;
  isEventPast: boolean;
}

export const EditPreviewStep: React.FC<EditPreviewStepProps> = ({
  event,
  isEventPast,
}) => {
  const { watch } = useFormContext<EditEventFormData>();
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { image_placeholders, text_placeholders, flyer_file } = watch();

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

  const renderPlaceholderShape = (placeholder: any, index: number) => {
    // Scale coordinates for display on the Konva stage
    const scaledX = placeholder.x * imageScale;
    const scaledY = placeholder.y * imageScale;
    const scaledWidth = placeholder.width * imageScale;
    const scaledHeight = placeholder.height * imageScale;

    const commonProps = {
      key: index,
      x: scaledX,
      y: scaledY,
      fill: "rgba(0, 123, 255, 0.3)",
      stroke: "rgba(0, 123, 255, 0.8)",
      strokeWidth: 2,
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

  if (!flyerUrl) {
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
          Preview Your Template
        </h3>
        <p className="text-secondary">
          {isEventPast 
            ? "Review your event template configuration"
            : "Review how your updated DP template will look"
          }
        </p>
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
              {image_placeholders.map((placeholder, index) => 
                renderPlaceholderShape(placeholder, index)
              )}
              {text_placeholders.map((placeholder, index) => (
                <Text 
                  key={index} 
                  x={placeholder.x * imageScale}
                  y={placeholder.y * imageScale}
                  width={placeholder.width * imageScale}
                  height={placeholder.height * imageScale}
                  text={placeholder.text}
                  fontSize={placeholder.fontSize * imageScale}
                  fill={placeholder.color}
                  align={placeholder.textAlign}
                  fontFamily={placeholder.fontFamily}
                  fontStyle={placeholder.fontStyle}
                  fontWeight={placeholder.fontWeight}
                />
              ))}
            </Layer>
          </Stage>
        )}
      </div>

      <div className="text-center text-secondary">
        {isEventPast 
          ? "This template configuration is from a past event"
          : "Click Save Changes below to update your template"
        }
      </div>
    </motion.div>
  );
};