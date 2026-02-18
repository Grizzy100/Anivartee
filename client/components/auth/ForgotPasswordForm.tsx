"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { forgotPassword, type ForgotPasswordPayload } from "@/lib/api/auth.api";
import { ApiError } from "@/lib/api/api";
import { fieldClass } from "./field-class";

/* ───────────────── Validation ───────────────── */

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordInputs = z.infer<typeof forgotPasswordSchema>;

/* ───────────────── Component ───────────────── */

export default function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInputs>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const clearAuthError = () => {
    if (authError) setAuthError(null);
    if (successMessage) setSuccessMessage(null);
  };

  async function onSubmit(data: ForgotPasswordInputs) {
    setIsSubmitting(true);
    setAuthError(null);
    setSuccessMessage(null);

    try {
      const payload: ForgotPasswordPayload = { email: data.email };
      const { message } = await forgotPassword(payload);
      setSuccessMessage(message);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setAuthError("Too many requests. Please wait 15 minutes and try again.");
      } else if (err instanceof ApiError) {
        setAuthError(err.message);
      } else {
        setAuthError("Could not connect to the server. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
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
          Forgot Password
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
          We&apos;ll send you a reset link
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-semibold text-white ml-1 pb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              autoComplete="email"
              {...register("email", { onChange: clearAuthError })}
              className={fieldClass(errors.email)}
            />
            {errors.email && (
              <p className="text-red-400 text-[10px] ml-1">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !!successMessage}
            className="
              w-full py-2 text-sm font-semibold rounded-lg
              bg-white text-black
              hover:bg-white/90
              active:bg-white active:text-black
              transition-all duration-200
            "
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </div>

      <div className="flex justify-center py-3">
        <p className="text-xs text-white/70">
          Remember your password?{" "}
          <Link href="/login" className="text-white hover:underline font-semibold">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
