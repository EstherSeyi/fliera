import z from "zod";
import { step1Schema } from "../validation/createTemplateSchema";

export interface TemplatePlaceholder {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
  text?: string;
  labelText: string;
  fontStyle?: "normal" | "bold" | "italic";
  width?: number;
  height?: number;
  holeShape?: "circle" | "rectangle";
}

export interface Template {
  id: string;
  title: string;
  template_image_url: string;
  template_placeholders: TemplatePlaceholder[];
}

export interface TemplateImageData {
  image: HTMLImageElement;
  displayX: number;
  displayY: number;
  displayWidth: number;
  displayHeight: number;
}

export type Step1FormData = z.infer<typeof step1Schema>;
