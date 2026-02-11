//server\user-service\src\validators\updateAvatarSchema.ts
import { z } from "zod";

export const updateAvatarSchema = z.object({
  avatarUrl: z.string().url({ message: "Invalid avatar URL" }),
  avatarPublicId: z.string().min(1, { message: "Avatar public ID is required" })
});

export type UpdateAvatarInput = z.infer<typeof updateAvatarSchema>;
