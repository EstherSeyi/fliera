import { z } from 'zod';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const imagePlaceholderSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  holeShape: z.enum(['box', 'circle', 'triangle']),
});

const textPlaceholderSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  text: z.string(),
  fontSize: z.number(),
  color: z.string(),
  textAlign: z.enum(['left', 'center', 'right']),
  fontFamily: z.string(),
  fontStyle: z.string(),
  textTransform: z.string(),
  fontWeight: z.union([z.string(), z.number()]),
  labelText: z.string().optional()
});

export const createEventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  date: z.string().min(1, "Event date is required"),
  description: z.string().nullable().optional(),
  flyer_file: z.instanceof(File, { message: "Flyer image is required" })
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "File size must be less than 2MB"
    )
    .refine(
      (file) => file.type.startsWith("image/"),
      "File must be an image (PNG, JPG)"
    ),
  image_placeholders: z.array(imagePlaceholderSchema),
  text_placeholders: z.array(textPlaceholderSchema).max(3, "You can add a maximum of 3 text placeholders."),
  visibility: z.enum(['private', 'public', 'archived']),
  category: z.enum(['business', 'technology', 'music', 'social', 'sports', 'activism', 'other']),
});

export type CreateEventSchema = z.infer<typeof createEventSchema>;