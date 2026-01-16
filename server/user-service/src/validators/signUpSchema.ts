//server\user-service\src\validators\signUpSchema.ts
import { z } from "zod";

const publicRoles = ["USER", "FACT_CHECKER"] as const;

export const signUpSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(32, { message: "Username must be 32 characters or less." })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required." })
    .email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character." }),
  role: z.enum(publicRoles, {
    message: "Role must be either USER or FACT_CHECKER.",
  }),
  image: z
    .string()
    .url({ message: "Invalid image URL." })
    .max(255, { message: "Image URL must be 255 characters or less." })
    .optional(),
});

export const completeSignUpSchema = signUpSchema;
export type BackendSignUpInputs = z.infer<typeof completeSignUpSchema>;
export type SignUpInput = BackendSignUpInputs;
