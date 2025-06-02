import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Stage, Layer, Image as KonvaImage, Text, Rect } from 'react-konva';
import { useFormContext } from 'react-hook-form';
import type { CreateEventFormData } from '../../../types';

export const PreviewStep: React.FC = () => {
  const { watch } = useFormContext<CreateEventFormData>();
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { temp_flyer_url, image_placeholders, text_placeholders } = watch();

  useEffect(() => {
    if (!temp_flyer_url) return;

    const img = new Image();
    img.src = temp_flyer_url;
    img.onload = () => {
      setImage(img);
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const scale = containerWidth / img.width;
        setStageSize({
          width: containerWidth,
          height: img.height * scale
        });
      }
    };
  }, [temp_flyer_url]);

  if (!temp_flyer_url) {
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
        <h3 className="text-xl font-semibold text-primary">Preview Your Template</h3>
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
              {image_placeholders.map((placeholder, index) => (
                <Rect
                  key={index}
                  {...placeholder}
                  fill="rgba(0, 123, 255, 0.3)"
                  stroke="rgba(0, 123, 255, 0.8)"
                  strokeWidth={2}
                />
              ))}
              {text_placeholders.map((placeholder, index) => (
                <Text
                  key={index}
                  {...placeholder}
                />
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