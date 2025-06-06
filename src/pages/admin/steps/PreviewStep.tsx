import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Stage, Layer, Image as KonvaImage, Text, Rect, Circle, Shape } from "react-konva";
import { useFormContext } from "react-hook-form";
import type { CreateEventFormData } from "../../../types";

export const PreviewStep: React.FC = () => {
  const { watch } = useFormContext<CreateEventFormData>();
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
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
        setStageSize({
          width: containerWidth,
          height: img.height * scale,
        });
      }
    };
  }, [tempFlyerUrl]);

  const renderHoleShape = (placeholder: any) => {
    const { x, y, width, height, holeShape } = placeholder;

    switch (holeShape) {
      case 'circle':
        return (
          <Circle
            x={x + width / 2}
            y={y + height / 2}
            radius={Math.min(width, height) / 2}
            fill="rgba(0, 0, 0, 1)"
            globalCompositeOperation="destination-out"
          />
        );
      case 'triangle':
        return (
          <Shape
            sceneFunc={(context, shape) => {
              context.beginPath();
              context.moveTo(x + width / 2, y);
              context.lineTo(x + width, y + height);
              context.lineTo(x, y + height);
              context.closePath();
              context.fillStrokeShape(shape);
            }}
            fill="rgba(0, 0, 0, 1)"
            globalCompositeOperation="destination-out"
          />
        );
      case 'trapezium':
        return (
          <Shape
            sceneFunc={(context, shape) => {
              const offset = width * 0.2;
              context.beginPath();
              context.moveTo(x + offset, y);
              context.lineTo(x + width - offset, y);
              context.lineTo(x + width, y + height);
              context.lineTo(x, y + height);
              context.closePath();
              context.fillStrokeShape(shape);
            }}
            fill="rgba(0, 0, 0, 1)"
            globalCompositeOperation="destination-out"
          />
        );
      default: // box
        return (
          <Rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="rgba(0, 0, 0, 1)"
            globalCompositeOperation="destination-out"
          />
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
              {/* Base flyer image */}
              <KonvaImage
                image={image}
                width={stageSize.width}
                height={stageSize.height}
              />
              
              {/* Semi-transparent overlay */}
              <Rect
                x={0}
                y={0}
                width={stageSize.width}
                height={stageSize.height}
                fill="rgba(0, 0, 0, 0.5)"
              />
              
              {/* Hole shapes that cut through the overlay */}
              {image_placeholders.map((placeholder, index) => (
                <React.Fragment key={index}>
                  {renderHoleShape(placeholder)}
                </React.Fragment>
              ))}
              
              {/* Text placeholders */}
              {text_placeholders.map((placeholder, index) => (
                <Text key={index} {...placeholder} />
              ))}
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