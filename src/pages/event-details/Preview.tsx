import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { motion } from "framer-motion";

import { RenderImagePlaceholder } from "./RenderImagePlaceholder";
import { RenderTextPlaceholders } from "./RenderTextPlaceholder";
import { useEffect, useRef, useState } from "react";

import { DownloadButton } from "./DownloadButton";
import { useEventDetailContext } from "../../context/EventDetails";

export const Preview = () => {
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [flyerImage, setFlyerImage] = useState<HTMLImageElement | null>(null);
  const [flyerImageLoading, setFlyerImageLoading] = useState(false);
  const [hasGeneratedDP, setHasGeneratedDP] = useState(false);

  const { userImage, containerRef, setError, event } = useEventDetailContext();

  const stageRef = useRef<any>(null);

  const loadFlyerImage = async () => {
    if (!event || !containerRef.current) return;

    try {
      setFlyerImageLoading(true);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = event.flyer_url;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      setFlyerImage(img);

      // Calculate scale and stage size based on container width
      const containerWidth = containerRef.current.offsetWidth;
      const scale = Math.min(containerWidth / img.width, 600 / img.height);
      setImageScale(scale);

      setStageSize({
        width: img.width * scale,
        height: img.height * scale,
      });
    } catch (err) {
      console.error("Error loading flyer image:", err);
      setError("Failed to load event flyer");
    } finally {
      setFlyerImageLoading(false);
    }
  };

  // Load flyer image when event loads and container is available
  useEffect(() => {
    if (event && containerRef.current) {
      loadFlyerImage();
    }
  }, [event, containerRef]);

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-xl font-semibold text-primary">Preview</h3>
      <div className="relative overflow-hidden rounded-lg">
        <div ref={containerRef} className="w-full mb-4 shadow-lg">
          {/* Show skeleton loader while flyer image is loading */}
          {flyerImageLoading && (
            <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full animate-pulse mx-auto"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-32 mx-auto animate-pulse"></div>
                  <div className="h-3 bg-gray-300 rounded w-24 mx-auto animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* Show Konva stage when flyer image is loaded */}
          {flyerImage && stageSize.width > 0 && !flyerImageLoading && (
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
            >
              <Layer>
                {/* Flyer Background */}
                <KonvaImage
                  image={flyerImage}
                  x={0}
                  y={0}
                  width={stageSize.width}
                  height={stageSize.height}
                />

                {/* User Image Placeholder */}
                <RenderImagePlaceholder
                  imageScale={imageScale}
                  userImage={userImage}
                />

                {/* Text Placeholders */}
                <RenderTextPlaceholders imageScale={imageScale} />
              </Layer>
            </Stage>
          )}
        </div>

        <DownloadButton
          hasGeneratedDP={hasGeneratedDP}
          setHasGeneratedDP={setHasGeneratedDP}
          stageRef={stageRef}
        />
      </div>
    </motion.div>
  );
};
