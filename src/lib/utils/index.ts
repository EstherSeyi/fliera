import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely extracts plain text from HTML and truncates it to a specified length.
 * Uses DOMParser for secure HTML parsing and entity decoding.
 *
 * @param htmlString - The HTML string to process
 * @param maxLength - Maximum length of the resulting plain text (default: 150)
 * @returns Truncated plain text with ellipsis if needed
 */
export function getPlainTextSnippet(
  htmlString: string | null | undefined,
  maxLength: number = 150
): string {
  // Handle null, undefined, or empty strings
  if (!htmlString || typeof htmlString !== "string") {
    return "";
  }

  // If the string doesn't contain HTML tags, just truncate it directly
  if (!htmlString.includes("<")) {
    return htmlString.length > maxLength
      ? htmlString.substring(0, maxLength).trim() + "..."
      : htmlString.trim();
  }

  try {
    // Use DOMParser to safely parse HTML and extract text content
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Extract plain text content
    const plainText = doc.body.textContent || doc.body.innerText || "";

    // Trim whitespace and normalize spaces
    const normalizedText = plainText.replace(/\s+/g, " ").trim();

    // Truncate if necessary
    if (normalizedText.length > maxLength) {
      return normalizedText.substring(0, maxLength).trim() + "...";
    }

    return normalizedText;
  } catch (error) {
    // Fallback: if DOMParser fails, try to strip basic HTML tags manually
    console.warn("DOMParser failed, using fallback text extraction:", error);

    const fallbackText = htmlString
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&[^;]+;/g, " ") // Replace HTML entities with spaces
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    return fallbackText.length > maxLength
      ? fallbackText.substring(0, maxLength).trim() + "..."
      : fallbackText;
  }
}

export function transformText(text: string, transformType: string) {
  if (!text) return "";

  switch (transformType) {
    case "uppercase":
      return text.toUpperCase();
    case "lowercase":
      return text.toLowerCase();
    case "capitalize":
      return text
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    default:
      return text;
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
