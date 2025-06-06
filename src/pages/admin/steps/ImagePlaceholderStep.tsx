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
import { useFormContext } from "react-hook-form";
import type { CreateEventFormData, ImagePlaceholderZone } from "../../../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

const SHAPE_OPTIONS = [
  { value: 'box', label: 'Rectangle' },
  { value: 'circle', label: 'Circle' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'trapezium', label: 'Trapezium' },
];

export const ImagePlaceholderStep: React.FC = () => {
  const { watch, setValue } = useFormContext<CreateEventFormData>();
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<any>(null);
  const boundingBoxRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);
  const holeShapeRef = useRef<any>(null);

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
    if (transformerRef.current && boundingBoxRef.current) {
      transformerRef.current.nodes([boundingBoxRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, []);

  const handleTransformEnd = () => {
    if (boundingBoxRef.current) {
      const node = boundingBoxRef.current;
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
        holeShape: placeholder.holeShape,
      };

      setValue("image_placeholders", [newPlaceholder]);
    }
  };

  const handleShapeChange = (newShape: string) => {
    const newPlaceholder: ImagePlaceholderZone = {
      ...placeholder,
      holeShape: newShape as 'box' | 'circle' | 'triangle' | 'trapezium',
    };
    setValue("image_placeholders", [newPlaceholder]);
  };

  const renderHoleShape = () => {
    const { x, y, width, height, holeShape } = placeholder;

    switch (holeShape) {
      case 'circle':
        return (
          <Circle
            ref={holeShapeRef}
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
            ref={holeShapeRef}
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
            ref={holeShapeRef}
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
            ref={holeShapeRef}
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
          Drag and resize the hole to set where user photos will appear
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-primary font-medium">Hole Shape</label>
          <Select value={placeholder.holeShape} onValueChange={handleShapeChange}>
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
                  ref={overlayRef}
                  x={0}
                  y={0}
                  width={stageSize.width}
                  height={stageSize.height}
                  fill="rgba(0, 0, 0, 0.5)"
                />
                
                {/* Hole shape that cuts through the overlay */}
                {renderHoleShape()}
                
                {/* Invisible bounding box for transformation */}
                <Rect
                  ref={boundingBoxRef}
                  x={placeholder.x}
                  y={placeholder.y}
                  width={placeholder.width}
                  height={placeholder.height}
                  fill="transparent"
                  stroke="rgba(0, 123, 255, 0.8)"
                  strokeWidth={2}
                  draggable
                  onTransformEnd={handleTransformEnd}
                  onDragEnd={handleTransformEnd}
                  onMouseEnter={(e) => {
                    e.target.getStage().container().style.cursor = 'move';
                  }}
                  onMouseLeave={(e) => {
                    e.target.getStage().container().style.cursor = 'default';
                  }}
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
      </div>

      <div className="text-center text-secondary text-sm">
        Tip: Drag the corners to resize, or drag the box to reposition. The dark area shows the overlay effect.
      </div>
    </motion.div>
  );
};