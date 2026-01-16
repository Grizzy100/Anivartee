import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().max(80, { message: "Display name must be 80 characters or less" }).optional(),
  bio: z.string().max(280, { message: "Bio must be 280 characters or less" }).optional(),
  firstName: z.string().max(60, { message: "First name must be 60 characters or less" }).optional(),
  lastName: z.string().max(60, { message: "Last name must be 60 characters or less" }).optional(),
  state: z.string().max(80, { message: "State must be 80 characters or less" }).optional(),
  country: z.string().max(60, { message: "Country must be 60 characters or less" }).optional(),
  organization: z.string().max(120, { message: "Organization must be 120 characters or less" }).optional()
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
