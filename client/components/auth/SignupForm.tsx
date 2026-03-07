"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  signup,
  getGoogleOAuthUrl,
  type SignupPayload,
  type UserRole,
} from "@/lib/api/auth.api";
import { ApiError } from "@/lib/api/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { fieldClass } from "./field-class";
import LogoMark from "@/components/LogoMark";
import Image from "next/image";


/* ───────────────── Validation (aligned with backend signUpSchema) ───────────────── */

const signupFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username cannot exceed 32 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Only letters, numbers, and underscores allowed"
    ),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
  role: z.enum(["USER", "FACT_CHECKER"]),
});

type SignupFormInputs = z.infer<typeof signupFormSchema>;

/* ───────────────── Error message helper ───────────────── */

function getSignupErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) {
    return "Could not connect to the server. Please try again.";
  }

  if (err.status === 429) {
    return "Too many attempts. Please wait 15 minutes and try again.";
  }

  // Duplicate email/username (Prisma P2002 → 409)
  if (err.status === 409) {
    const msg = err.message.toLowerCase();
    if (msg.includes("email")) return "An account with this email already exists.";
    if (msg.includes("username")) return "This username is already taken.";
    return "An account with these details already exists.";
  }

  return err.message || "Signup failed. Please try again.";
}

/* ───────────────── Component ───────────────── */

export default function SignupForm() {
  const router = useRouter();
  const { setAuthenticated } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupFormInputs>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { username: "", email: "", password: "", role: "USER" },
  });

  const clearAuthError = () => {
    if (authError) setAuthError(null);
  };

  async function onSubmit(data: SignupFormInputs) {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const payload: SignupPayload = {
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
      };

      const { user, profile } = await signup(payload);

      // Sync auth context so RequireAuth sees us as authenticated
      setAuthenticated(profile);

      router.push(user.role === "FACT_CHECKER" ? "/fact-checker" : "/user");
    } catch (err) {
      setAuthError(getSignupErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-8 bg-black bg-cover bg-center"
      style={{
        backgroundImage: `
          linear-gradient(rgba(8,12,20,0.55), rgba(0,0,0,0.7)),
          url('/images/SignUP.png')
        `,
      }}
    >
      <div className="w-full max-w-[360px]">
        <div className="border border-white/50 bg-black/20 backdrop-blur-xs backdrop-saturate-150 p-5">

          {/* Header */}
          <div className="flex flex-col items-center pb-2">
          <Link href="/" className="flex flex-col items-center cursor-pointer group">
            <Image
              src="/images/logo-new-removebg-preview.png"
              alt="Anvartee"
              width={200}
              height={80}
              className="
                h-20 w-auto object-contain scale-150
                transition-all duration-300 ease-out
                brightness-90 contrast-110
                group-hover:brightness-125 group-hover:contrast-125
                group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]
              "
              priority
            />

          </Link>
            <h1 className="
              text-2xl font-bold mt-2
              bg-gradient-to-r from-gray-400 via-white to-gray-400
              bg-clip-text text-transparent
              transition-all duration-300
              group-hover:brightness-125
            ">
              Create Account
            </h1>
            <p className="text-sm text-white/70 mt-1">
              Join the platform.
            </p>
          </div>

          {authError && (
            <div className="bg-red-500/40 text-red-300 p-3 mb-4 border border-red-700/80 text-sm">
              {authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <input
                type="text"
                placeholder="Username"
                autoComplete="username"
                {...register("username", { onChange: clearAuthError })}
                className={fieldClass(errors.username)}
              />
              {errors.username && (
                <p className="text-red-400 text-[10px] mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                placeholder="Email address"
                autoComplete="email"
                {...register("email", { onChange: clearAuthError })}
                className={fieldClass(errors.email)}
              />
              {errors.email && (
                <p className="text-red-400 text-[10px] mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="new-password"
                  {...register("password", { onChange: clearAuthError })}
                  className={fieldClass(errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-[10px] mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Role Toggle */}
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <RoleToggle value={field.value} onChange={field.onChange} />
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 text-sm font-semibold bg-white text-black hover:bg-white/90 transition-all duration-200"
            >
              {isSubmitting ? "Creating..." : "Sign Up"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-2 my-4">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <span className="text-[10px] text-white/60 uppercase tracking-wider">
              or
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </div>

          {/* Google OAuth */}
          {/* <a */}
          {/* //   href={getGoogleOAuthUrl()}
          //   className="flex items-center justify-center gap-2 w-full h-9 border border-white/40 text-xs font-medium text-white hover:bg-white hover:text-black transition-all duration-200"
          // >
          //   <GoogleIcon /> */}
          {/* //   Continue with Google */}
          {/* // </a> */}

          <p className="text-xs text-white/70 text-center mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-white font-semibold hover:underline">
              Log In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

/* ───────────────── Helpers ───────────────── */

function RoleToggle({
  value,
  onChange,
}: {
  value: UserRole;
  onChange: (role: UserRole) => void;
}) {
  const isChecker = value === "FACT_CHECKER";

  return (
    <div className="flex justify-center py-2">
      <button
        type="button"
        onClick={() => onChange(isChecker ? "USER" : "FACT_CHECKER")}
        className="
          relative w-[190px] h-11
          rounded-full
          backdrop-blur-xl
          bg-gradient-to-b from-white/20 to-white/5
          border border-white/30
          shadow-[0_4px_20px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)]
          transition-all duration-300 ease-out
          hover:border-white/40
        "
      >
        {/* subtle glass highlight layer */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/25 via-transparent to-transparent opacity-60" />

        {/* sliding glass knob */}
        <div
          className={`
            absolute top-[4px] left-[4px]
            h-[34px] w-[88px]
            rounded-full
            backdrop-blur-md
            bg-gradient-to-b from-white/90 to-white/60
            border border-white/70
            shadow-[0_2px_10px_rgba(0,0,0,0.35)]
            transition-all duration-300 ease-out
            ${isChecker ? "translate-x-[94px]" : ""}
          `}
        >
          {/* knob inner shine */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/80 via-transparent to-transparent opacity-70" />
        </div>

        {/* labels */}
        <div className="absolute inset-0 flex items-center justify-between px-6 text-[14px] font-medium tracking-wide">
          <span
            className={`transition-colors duration-300 ${
              !isChecker ? "text-black" : "text-white/70"
            }`}
          >
            User
          </span>

          <span
            className={`transition-colors duration-300 ${
              isChecker ? "text-black" : "text-white/70"
            }`}
          >
            Checker
          </span>
        </div>
      </button>
    </div>
  );
}


function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-4 h-4">
      <path fill="#FFC107" d="M43.611,20.083H24v8h11.303C33.654,32.74 29.223,36 24,36c-6.627,0-12-5.373-12-12s5.373-12 12-12c3.059,0 5.842,1.154 7.961,3.039l5.657-5.657C34.046,6.053 29.268,4 24,4 12.955,4 4,12.955 4,24s8.955,20 20,20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108 18.961,12 24,12c3.059,0 5.842,1.154 7.961,3.039l5.657-5.657C34.046,6.053 29.268,4 24,4 16.318,4 9.656,8.337 6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211,35.091 26.715,36 24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556 16.227,44 24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H24v8h11.303c-.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205 44,34 44,24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}
