//server\post-service\src\validators\post.schema.ts
// src/validators/post.schema.ts
import { z } from "zod";
import { CONSTANTS } from "../config/constants.js";

export const createPostSchema = z.object({
  title: z
    .string()
    .min(CONSTANTS.POST_TITLE_MIN_LENGTH, { message: "Title is required." })
    .max(CONSTANTS.POST_TITLE_MAX_LENGTH, { message: "Title must be 150 characters or less." }),
  
  url: z
    .string()
    .url({ message: "Please enter a valid URL." }),
  
  description: z
    .string()
    .max(CONSTANTS.POST_DESCRIPTION_MAX_LENGTH, { message: "Description must be 400 characters or less." })
    .optional(),
  
  category: z.enum(["WAR", "FOOD", "SOCIAL", "OTHER"], {
    message: "Please select a valid category.",
  }).default("OTHER"),
  
  screenRecordingUrl: z
    .preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().url({ message: "Invalid screen recording URL." }).optional()
    ),
  
  sources: z
    .array(z.string().url({ message: "Each source must be a valid URL." }))
    .max(3, { message: "You can add up to 3 source links only." })
    .optional()
    .default([])
});

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(CONSTANTS.POST_TITLE_MIN_LENGTH)
    .max(CONSTANTS.POST_TITLE_MAX_LENGTH)
    .optional(),
  
  description: z
    .string()
    .max(CONSTANTS.POST_DESCRIPTION_MAX_LENGTH)
    .optional(),
  
  category: z.enum(["WAR", "FOOD", "SOCIAL", "OTHER"]).optional()
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;