//server\post-service\src\validators\common.schema.ts
import { z } from "zod";
import { CONSTANTS } from "../config/constants.js";

export const paginationSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, { message: "Page must be a positive number" })
    .transform(Number)
    .refine(val => val > 0, { message: "Page must be greater than 0" })
    .default(1),
  
  pageSize: z
    .string()
    .regex(/^\d+$/, { message: "Page size must be a positive number" })
    .transform(Number)
    .refine(val => val > 0 && val <= CONSTANTS.MAX_PAGE_SIZE, {
      message: `Page size must be between 1 and ${CONSTANTS.MAX_PAGE_SIZE}`
    })
    .default(CONSTANTS.DEFAULT_PAGE_SIZE)
});

export const uuidSchema = z.string().uuid({ message: "Invalid ID format" });

export type PaginationInput = z.infer<typeof paginationSchema>;