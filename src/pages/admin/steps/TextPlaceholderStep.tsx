import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Stage, Layer, Image, Text, Transformer } from 'react-konva';
import { useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import type { CreateEventFormData, TextPlaceholderZone } from '../../../types';

const TEXT_STYLES = {
  fontFamilies: ['Open Sans', 'Arial', 'Times New Roman'],
  fontStyles: ['normal', 'italic'],
  fontWeights: ['normal', 'bold'],
  textTransforms: ['none', 'uppercase', 'lowercase', 'capitalize'],
  textAligns: ['left', 'center', 'right'] as CanvasTextAlign[]
};

export const TextPlaceholderStep: React.FC = () => {
  const { watch, setValue } = useFormContext<CreateEventFormData>();
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<any>(null);
  const textRefs = useRef<any[]>([]);
  
  const tempFlyerUrl = watch('temp_flyer_url');
  const textPlaceholders = watch('text_placeholders');

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
          height: img.height * scale
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

      const newPlaceholder: TextPlaceholderZone = {
        ...textPlaceholders[index],
        x: Math.round(node.x()),
        y: Math.round(node.y()),
        width: Math.round(node.width() * scaleX),
        height: Math.round(node.height() * scaleY)
      };

      const newPlaceholders = [...textPlaceholders];
      newPlaceholders[index] = newPlaceholder;
      setValue('text_placeholders', newPlaceholders);
    }
  };

  const addTextPlaceholder = () => {
    const newPlaceholder: TextPlaceholderZone = {
      x: 50,
      y: 50,
      width: 200,
      height: 50,
      text: 'Sample Text',
      fontSize: 24,
      color: '#000000',
      textAlign: 'center',
      fontFamily: 'Open Sans',
      fontStyle: 'normal',
      textTransform: 'none',
      fontWeight: 'normal'
    };
    setValue('text_placeholders', [...textPlaceholders, newPlaceholder]);
  };

  const removeTextPlaceholder = (index: number) => {
    const newPlaceholders = textPlaceholders.filter((_, i) => i !== index);
    setValue('text_placeholders', newPlaceholders);
    setSelectedIndex(-1);
  };

  const updateTextStyle = (index: number, field: keyof TextPlaceholderZone, value: any) => {
    const newPlaceholders = [...textPlaceholders];
    newPlaceholders[index] = { ...newPlaceholders[index], [field]: value };
    setValue('text_placeholders', newPlaceholders);
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
        <h3 className="text-xl font-semibold text-primary">Position Text Elements</h3>
        <p className="text-secondary">Add and style text placeholders for your event DP</p>
      </div>

      <div className="flex gap-6">
        <div ref={containerRef} className="flex-1 border rounded-lg overflow-hidden">
          {image && stageSize.width > 0 && (
            <Stage width={stageSize.width} height={stageSize.height}>
              <Layer>
                <Image
                  image={image}
                  width={stageSize.width}
                  height={stageSize.height}
                />
                {textPlaceholders.map((placeholder, index) => (
                  <Text
                    key={index}
                    ref={el => textRefs.current[index] = el}
                    {...placeholder}
                    draggable
                    onClick={() => setSelectedIndex(index)}
                    onTap={() => setSelectedIndex(index)}
                    onDragEnd={() => handleTransformEnd(index)}
                    onTransformEnd={() => handleTransformEnd(index)}
                  />
                ))}
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    const minSize = 20;
                    return newBox.width < minSize || newBox.height < minSize ? oldBox : newBox;
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
                <label className="block text-sm text-secondary">Sample Text</label>
                <input
                  type="text"
                  value={textPlaceholders[selectedIndex].text}
                  onChange={(e) => updateTextStyle(selectedIndex, 'text', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-secondary">Font Size</label>
                <input
                  type="number"
                  value={textPlaceholders[selectedIndex].fontSize}
                  onChange={(e) => updateTextStyle(selectedIndex, 'fontSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-secondary">Color</label>
                <input
                  type="color"
                  value={textPlaceholders[selectedIndex].color}
                  onChange={(e) => updateTextStyle(selectedIndex, 'color', e.target.value)}
                  className="w-full h-10 p-1 rounded"
                />
              </div>

              {Object.entries(TEXT_STYLES).map(([key, values]) => (
                <div key={key} className="space-y-2">
                  <label className="block text-sm text-secondary">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <select
                    value={textPlaceholders[selectedIndex][key.replace('ies', 'y') as keyof TextPlaceholderZone]}
                    onChange={(e) => updateTextStyle(selectedIndex, key.replace('ies', 'y') as keyof TextPlaceholderZone, e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  >
                    {values.map((value) => (
                      <option key={value} value={value}>
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};