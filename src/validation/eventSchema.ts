import { z } from "zod";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const imagePlaceholderSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  holeShape: z.enum(["box", "circle", "triangle"]),
});

const textPlaceholderSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  text: z.string(),
  fontSize: z.number(),
  color: z.string(),
  textAlign: z.enum(["left", "center", "right"]),
  fontFamily: z.string(),
  fontStyle: z.string(),
  textTransform: z.string().optional(),
  labelText: z.string().optional(),
});

export const createEventSchema = z
  .object({
    title: z.string().min(1, "Event title is required"),
    date: z.string().min(1, "Event date is required"),
    description: z.string().max(1000).nullable().optional(),
    use_template: z.boolean().optional(),
    template_id: z.string().optional(),
    flyer_file: z
      .instanceof(File)
      .refine(
        file => file.size <= MAX_FILE_SIZE,
        "File size must be less than 2MB"
      )
      .refine(
        file => file.type.startsWith("image/"),
        "File must be an image (PNG, JPG)"
      )
      .nullable()
      .optional(),
    image_placeholders: z.array(imagePlaceholderSchema),
    text_placeholders: z
      .array(textPlaceholderSchema)
      .max(3, "You can add a maximum of 3 text placeholders."),
    visibility: z.enum(["private", "public", "archived"]),
    category: z.enum([
      "business",
      "technology",
      "music",
      "social",
      "sports",
      "activism",
      "other",
    ]),
  })
  .refine(
    data => {
      // Either flyer_file must be provided OR use_template must be true
      return data.flyer_file !== null || data.use_template === true;
    },
    {
      message: "Either upload a flyer or choose a template",
      path: ["flyer_file"],
    }
  );

export type CreateEventSchema = z.infer<typeof createEventSchema>;
