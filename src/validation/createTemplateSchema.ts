import { z } from "zod";

export const step1Schema = z.object({
  title: z
    .string()
    .min(1, "Template title is required")
    .min(3, "Title must be at least 3 characters"),
  template_image_url: z.string().min(1, "Template image is required"),
});
