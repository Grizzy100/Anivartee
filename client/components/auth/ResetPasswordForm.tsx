"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { resetPassword, type ResetPasswordPayload } from "@/lib/api/auth.api";
import { ApiError } from "@/lib/api/api";
import { fieldClass } from "./field-class";

/* ───────────────── Validation ───────────────── */

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
    passwordConfirmation: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

type ResetPasswordInputs = z.infer<typeof resetPasswordSchema>;

/* ───────────────── Error message helper ───────────────── */

function getResetErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) {
    return "Could not connect to the server. Please try again.";
  }
  if (err.status === 429) {
    return "Too many attempts. Please wait 15 minutes and try again.";
  }
  if (err.status === 400) {
    const msg = err.message.toLowerCase();
    if (msg.includes("expired") || msg.includes("invalid")) {
      return "This reset link has expired or is invalid. Please request a new one.";
    }
  }
  return err.message || "Reset failed. Please try again.";
}

/* ───────────────── Component ───────────────── */

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInputs>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", passwordConfirmation: "" },
  });

  const clearAuthError = () => {
    if (authError) setAuthError(null);
  };

  async function onSubmit(data: ResetPasswordInputs) {
    if (!token) {
      setAuthError("Missing reset token. Please use the link from your email.");
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);
    setSuccessMessage(null);

    try {
      const payload: ResetPasswordPayload = {
        token,
        newPassword: data.newPassword,
        passwordConfirmation: data.passwordConfirmation,
      };

      const { message } = await resetPassword(payload);
      setSuccessMessage(message);

      // Redirect to login after a short delay
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setAuthError(getResetErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  // No token in URL — show an error state
  if (!token) {
    return (
      <div
        className="
          w-full max-w-[360px]
          border border-white
          bg-black/20
          backdrop-blur-xs
          backdrop-saturate-150
          overflow-hidden
          p-5
        "
      >
        <div className="flex flex-col gap-3 items-center py-6">
          <XCircle className="h-8 w-8 text-red-400" />
          <h1 className="text-xl font-bold text-white">Invalid Reset Link</h1>
          <p className="text-sm text-white/70 text-center">
            This link is missing the reset token. Please request a new password
            reset.
          </p>
          <Link
            href="/forgot-password"
            className="text-sm text-white hover:underline font-semibold mt-2"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        w-full max-w-[360px]
        border border-white
        bg-black/20
        backdrop-blur-xs
        backdrop-saturate-150
        overflow-hidden
        p-5
      "
    >
      {/* Header */}
      <div className="flex flex-col gap-1 items-center pb-2">
        <h1 className="text-2xl font-bold mb-2 bg-linear-to-r from-gray-400 via-white to-gray-400 bg-clip-text text-transparent pt-4">
          Reset Password
        </h1>

        <p
          className="
            text-center text-sm font-semibold tracking-wide
            bg-linear-to-r from-gray-400 via-white to-gray-400
            bg-clip-text text-transparent
            transition
            hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35)]
          "
        >
          Enter your new password
        </p>

        <div className="w-full flex justify-center my-4">
          <div
            className="
              h-[1px] w-64
              bg-gradient-to-r from-transparent via-white to-transparent
              opacity-70
            "
          />
        </div>
      </div>

      {/* Body */}
      <div className="py-3 px-2">
        {successMessage && (
          <div className="bg-green-500/40 text-green-300 p-3 rounded-lg mb-4 flex items-center gap-2 border border-green-700/80">
            <CheckCircle className="h-4 w-4" />
            <p className="text-sm">{successMessage}</p>
          </div>
        )}

        {authError && (
          <div className="bg-red-500/40 text-red-300 p-3 rounded-lg mb-4 flex items-center gap-2 border border-red-700/80">
            <XCircle className="h-4 w-4" />
            <p className="text-sm">{authError}</p>
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1">
              <label htmlFor="newPassword" className="text-xs font-semibold text-white ml-1 pb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 chars, upper, lower, number, special"
                  autoComplete="new-password"
                  {...register("newPassword", { onChange: clearAuthError })}
                  className={fieldClass(errors.newPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-400 text-[10px] ml-1">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label htmlFor="passwordConfirmation" className="text-xs font-semibold text-white ml-1 pb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="passwordConfirmation"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  {...register("passwordConfirmation", { onChange: clearAuthError })}
                  className={fieldClass(errors.passwordConfirmation)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.passwordConfirmation && (
                <p className="text-red-400 text-[10px] ml-1">{errors.passwordConfirmation.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full py-2 text-sm font-semibold rounded-lg
                bg-white text-black
                hover:bg-white/90
                active:bg-white active:text-black
                transition-all duration-200
              "
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}
      </div>

      <div className="flex justify-center py-3">
        <p className="text-xs text-white/70">
          Back to{" "}
          <Link href="/login" className="text-white hover:underline font-semibold">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
