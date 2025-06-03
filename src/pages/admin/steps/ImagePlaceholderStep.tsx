import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Transformer,
  Rect,
} from "react-konva";
import { useFormContext } from "react-hook-form";
import type { CreateEventFormData, ImagePlaceholderZone } from "../../../types";

export const ImagePlaceholderStep: React.FC = () => {
  const { watch, setValue } = useFormContext<CreateEventFormData>();
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<any>(null);
  const rectRef = useRef<any>(null);

  const flyer_file = watch("flyer_file");

  const imagePlaceholders = watch("image_placeholders");
  const placeholder = imagePlaceholders[0];

  const flyer_url = useMemo(
    () => (flyer_file?.name ? URL.createObjectURL(flyer_file) : null),
    [flyer_file]
  );

  useEffect(() => {
    if (!flyer_url) return;

    const img = new Image();
    img.src = flyer_url;
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
  }, [flyer_url]);

  useEffect(() => {
    if (transformerRef.current && rectRef.current) {
      transformerRef.current.nodes([rectRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, []);

  const handleTransformEnd = () => {
    if (rectRef.current) {
      const node = rectRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Reset scale and apply it to width/height
      node.scaleX(1);
      node.scaleY(1);

      const newPlaceholder: ImagePlaceholderZone = {
        x: Math.round(node.x()),
        y: Math.round(node.y()),
        width: Math.round(node.width() * scaleX),
        height: Math.round(node.height() * scaleY),
      };

      setValue("image_placeholders", [newPlaceholder]);
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
          Position Image Placeholder
        </h3>
        <p className="text-secondary">
          Drag and resize the box to set where user photos will appear
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
              <Rect
                ref={rectRef}
                x={placeholder.x}
                y={placeholder.y}
                width={placeholder.width}
                height={placeholder.height}
                fill="rgba(0, 123, 255, 0.3)"
                stroke="rgba(0, 123, 255, 0.8)"
                strokeWidth={2}
                draggable
                onTransformEnd={handleTransformEnd}
                onDragEnd={handleTransformEnd}
              />
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Limit resize
                  const minSize = 20;
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
            </Layer>
          </Stage>
        )}
      </div>

      <div className="text-center text-secondary text-sm">
        Tip: Drag the corners to resize, or drag the box to reposition
      </div>
    </motion.div>
  );
};
