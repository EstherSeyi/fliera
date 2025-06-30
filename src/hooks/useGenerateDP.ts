import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventContext";

type UseGenerateDPReturn = {
  generateBlob: () => Promise<Blob | null>;
  generateFile: (filename?: string) => Promise<File | null>;
  generateDataURL: () => string | null;
  handleDownload: (filename?: string) => Promise<string | null>;
  isGenerating: boolean;
  error: string | null;
};

export function useGenerateDP(
  stageRef: React.RefObject<any>
): UseGenerateDPReturn {
  const { user } = useAuth();
  const { uploadGeneratedDPImage } = useEvents();

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDataURL = useCallback((): string | null => {
    if (!stageRef.current) {
      setError("Stage ref not available");
      return null;
    }

    try {
      return stageRef.current.toDataURL({
        mimeType: "image/png",
        quality: 1,
        pixelRatio: 2,
      });
    } catch (err) {
      console.error("Failed to generate data URL:", err);
      setError("Failed to generate data URL");
      return null;
    }
  }, [stageRef]);

  const generateBlob = useCallback(async (): Promise<Blob | null> => {
    const dataURL = generateDataURL();
    if (!dataURL) return null;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch(dataURL);
      return await res.blob();
    } catch (err) {
      console.error("Failed to convert data URL to Blob:", err);
      setError("Failed to generate image blob");
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [generateDataURL]);

  const generateFile = useCallback(
    async (filename = "generated-dp.png"): Promise<File | null> => {
      const blob = await generateBlob();
      if (!blob) return null;
      return new File([blob], filename, { type: "image/png" });
    },
    [generateBlob]
  );

  const handleDownload = useCallback(
    async (filename = "generated-dp.png"): Promise<string | null> => {
      const dataURL = generateDataURL();
      if (!dataURL) return null;

      setIsGenerating(true);
      setError(null);

      try {
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = filename;
        a.click();

        if (user) {
          const publicUrl = await uploadGeneratedDPImage(dataURL);
          return publicUrl;
        } else {
          return null;
        }
      } catch (err: any) {
        console.error("Download/upload error:", err);
        setError(err.message || "Something went wrong");
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [generateDataURL, uploadGeneratedDPImage, user]
  );

  return {
    generateBlob,
    generateFile,
    generateDataURL,
    handleDownload,
    isGenerating,
    error,
  };
}
