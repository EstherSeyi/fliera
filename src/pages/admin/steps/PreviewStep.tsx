import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text,
  Rect,
  Circle,
  Shape,
} from "react-konva";
import { useFormContext } from "react-hook-form";
import type { CreateEventFormData } from "../../../types";
import { transformText } from "../../../lib/utils";

export const PreviewStep: React.FC = () => {
  const { watch } = useFormContext<CreateEventFormData>();
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { image_placeholders, text_placeholders, flyer_file } = watch();

  const tempFlyerUrl = useMemo(
    () => (flyer_file ? URL.createObjectURL(flyer_file) : null),
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
          Preview Your Template
        </h3>
        <p className="text-secondary">Review how your DP template will look</p>
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
              {text_placeholders.map((placeholder, index) => {
                const displayText = transformText(
                  placeholder.text,
                  placeholder.textTransform ?? ""
                );

                return (
                  <Text
                    key={index}
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
                  />
                );
              })}
            </Layer>
          </Stage>
        )}
      </div>

      <div className="text-center text-secondary">
        Click Create Event below to save your template
      </div>
    </motion.div>
  );
};
