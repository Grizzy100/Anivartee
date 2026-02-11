//server\user-service\src\validators\forgotPasswordSchema.ts
import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required." })
    .email({ message: "Please enter a valid email address." }),
});

export type ForgotPasswordFormInputs = z.infer<typeof forgotPasswordSchema>;
export type ForgotPasswordInput = ForgotPasswordFormInputs;
