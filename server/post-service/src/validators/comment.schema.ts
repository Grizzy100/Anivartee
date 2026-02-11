//server\post-service\src\validators\comment.schema.ts
import { z } from "zod";
import { CONSTANTS } from "../config/constants.js";

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(CONSTANTS.COMMENT_MIN_LENGTH, { message: "Comment cannot be empty." })
    .max(CONSTANTS.COMMENT_MAX_LENGTH, { message: "Comment must be 500 characters or less." }),
  
  parentId: z
    .string()
    .uuid({ message: "Invalid parent comment ID." })
    .optional()
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(CONSTANTS.COMMENT_MIN_LENGTH, { message: "Comment cannot be empty." })
    .max(CONSTANTS.COMMENT_MAX_LENGTH, { message: "Comment must be 500 characters or less." })
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;