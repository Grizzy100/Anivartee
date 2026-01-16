import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: "Reset token is required." }),
    newPassword: z
      .string()
      .min(8, { message: "New password must be at least 8 characters" })
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
    passwordConfirmation: z
      .string()
      .min(1, { message: "New password confirmation is required" }),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.passwordConfirmation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["passwordConfirmation"],
      });
    }
  });

export type ResetPasswordFormInputs = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordInput = ResetPasswordFormInputs;
