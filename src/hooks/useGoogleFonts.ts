import { useEffect, useState, useCallback } from "react";

export interface GoogleFont {
  family: string;
  category: string;
  variants: string[];
  files: Record<string, string>; // variant => font file URL
}

export function useGoogleFonts() {
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch font list
  useEffect(() => {
    const fetchFonts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        if (!apiKey) {
          throw new Error("Google API key not found in environment variables");
        }

        const res = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=${apiKey}`
        );
        
        if (!res.ok) {
          throw new Error(`Failed to fetch fonts: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        
        if (data.error) {
          throw new Error(data.error.message || "API error occurred");
        }
        
        // Filter to get only the most popular fonts to avoid overwhelming the user
        const popularFonts = data.items?.slice(0, 100) || [];
        setFonts(popularFonts);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch fonts";
        setError(errorMessage);
        console.error("Error fetching Google Fonts:", err);
        
        // Fallback to common web-safe fonts
        setFonts([
          { family: "Open Sans", category: "sans-serif", variants: ["regular"], files: {} },
          { family: "Arial", category: "sans-serif", variants: ["regular"], files: {} },
          { family: "Helvetica", category: "sans-serif", variants: ["regular"], files: {} },
          { family: "Times New Roman", category: "serif", variants: ["regular"], files: {} },
          { family: "Georgia", category: "serif", variants: ["regular"], files: {} },
          { family: "Verdana", category: "sans-serif", variants: ["regular"], files: {} },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFonts();
  }, []);

  // Load selected font dynamically
  const loadFont = useCallback((fontFamily: string) => {
    // Skip loading for web-safe fonts
    const webSafeFonts = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana"];
    if (webSafeFonts.includes(fontFamily)) {
      return;
    }

    const fontName = fontFamily.replace(/ /g, "+");
    const linkId = `google-font-${fontName}`;

    // Prevent multiple injections
    if (document.getElementById(linkId)) return;

    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700&display=swap`;

    document.head.appendChild(link);
  }, []);

  return { fonts, loading, error, loadFont };
}