//server\user-service\src\validators\loginSchema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .max(72, { message: "Password is too long" }),
});

export type LoginFormInputs = z.infer<typeof loginSchema>;
export type LoginInput = LoginFormInputs;
