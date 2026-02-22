// "use client";

// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { signin, type SigninPayload } from "@/lib/api/auth.api";
// import { ApiError } from "@/lib/api/api";
// import { useAuth } from "@/lib/auth/AuthContext";
// import { fieldClass } from "./field-class";

// /* ───────────────── Validation ───────────────── */

// const loginFormSchema = z.object({
//   email: z
//     .string()
//     .trim()
//     .min(1, "Email is required")
//     .email("Please enter a valid email address"),
//   password: z
//     .string()
//     .min(1, "Password is required")
//     .max(72, "Password cannot exceed 72 characters"),
// });

// type LoginFormInputs = z.infer<typeof loginFormSchema>;

// /* ───────────────── Error message helper ───────────────── */

// function getAuthErrorMessage(err: unknown): string {
//   if (!(err instanceof ApiError)) {
//     return "Could not connect to the server. Please try again.";
//   }

//   // Rate-limited
//   if (err.status === 429) {
//     return "Too many login attempts. Please wait 15 minutes and try again.";
//   }

//   // Disabled account
//   if (err.status === 401 && err.message.toLowerCase().includes("disabled")) {
//     return "This account has been disabled. Please contact support.";
//   }

//   return err.message || "Invalid email or password.";
// }

// /* ───────────────── Component ───────────────── */

// export default function LoginForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { setAuthenticated } = useAuth();
//   const signupSuccess = searchParams.get("signupSuccess");

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [authError, setAuthError] = useState<string | null>(null);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<LoginFormInputs>({
//     resolver: zodResolver(loginFormSchema),
//     defaultValues: { email: "", password: "" },
//   });

//   // Clear server error whenever user types
//   const clearAuthError = () => {
//     if (authError) setAuthError(null);
//   };

//   async function onSubmit(data: LoginFormInputs) {
//     setIsSubmitting(true);
//     setAuthError(null);

//     try {
//       const payload: SigninPayload = {
//         email: data.email,
//         password: data.password,
//       };

//       const { user, profile } = await signin(payload);

//       // Sync auth context so RequireAuth sees us as authenticated
//       setAuthenticated(profile);

//       // Redirect to intended page, or the role-appropriate dashboard
//       const redirect = searchParams.get("redirect");
//       const defaultDash = user.role === "FACT_CHECKER" ? "/fact-checker" : "/user";
//       router.push(redirect || defaultDash);
//     } catch (err) {
//       setAuthError(getAuthErrorMessage(err));
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   return (
//     <div
//       className="
//         w-76 max-w-[360px]
//         border border-white
//         bg-black/20
//         backdrop-blur-xs
//         backdrop-saturate-150
        
//         overflow-hidden
//         px-3 py-5
//       "
//     >
//       {/* Header */}
//       <div className="flex flex-col gap-1 items-center pb-2">
//         <h1 className="text-2xl font-bold mb-2 bg-linear-to-r from-gray-400 via-white to-gray-400 bg-clip-text text-transparent pt-4">
//           Log In to Your Account
//         </h1>

//         <p
//           className="
//             text-center text-sm font-semibold tracking-wide
//             bg-linear-to-r from-gray-400 via-white to-gray-400
//             bg-clip-text text-transparent
//             transition
//             hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35)]
//           "
//         >
//           Welcome back
//         </p>

//         <div className="w-full flex justify-center my-4">
//           <div
//             className="
//               h-[1px] w-64
//               bg-gradient-to-r from-transparent via-white to-transparent
//               opacity-70
//             "
//           />
//         </div>
//       </div>

//       {/* Body */}
//       <div className="py-3 px-2">
//         {signupSuccess && (
//           <div className="bg-green-500/40 text-green-300 p-3 rounded-lg mb-4 flex items-center gap-2 border border-green-700/80">
//             <CheckCircle className="h-4 w-4" />
//             <p className="text-sm">Account created successfully! Please log in.</p>
//           </div>
//         )}

//         {authError && (
//           <div className="bg-red-500/40 text-red-300 p-3 rounded-lg mb-4 flex items-center gap-2 border border-red-700/80">
//             <XCircle className="h-4 w-4" />
//             <p className="text-sm">{authError}</p>
//           </div>
//         )}

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

//           <div className="space-y-1">
//             <label htmlFor="email" className="text-xs font-semibold text-white ml-1 pb-1">
//               Email
//             </label>
//             <input
//               id="email"
//               type="email"
//               placeholder="Enter your email"
//               {...register("email", { onChange: clearAuthError })}
//               className={fieldClass(errors.email)}
//               autoComplete="email"
//             />
//             {errors.email && (
//               <p className="text-red-400 text-[10px] ml-1">{errors.email.message}</p>
//             )}
//           </div>

//           <div className="space-y-1">
//             <div className="flex justify-between items-center">
//               <label htmlFor="password" className="text-xs font-semibold text-white ml-1 pb-1">
//                 Password
//               </label>
//               <Link
//                 href="/forgot-password"
//                 className="text-[10px] text-blue-400 hover:underline font-medium"
//               >
//                 Forgot password?
//               </Link>
//             </div>

//             <div className="relative">
//               <input
//                 id="password"
//                 type={showPassword ? "text" : "password"}
//                 placeholder="••••••••"
//                 {...register("password", { onChange: clearAuthError })}
//                 className={fieldClass(errors.password)}
//                 autoComplete="current-password"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
//               >
//                 {showPassword ? (
//                   <EyeOff className="h-4 w-4" />
//                 ) : (
//                   <Eye className="h-4 w-4" />
//                 )}
//               </button>
//             </div>

//             {errors.password && (
//               <p className="text-red-400 text-[10px] ml-1">{errors.password.message}</p>
//             )}
//           </div>

//           <Button
//             type="submit"
//             disabled={isSubmitting}
//             className="
//               w-full py-2 text-sm font-semibold rounded-lg
//               bg-white text-black
//               hover:bg-white/90
//               active:bg-white active:text-black
//               transition-all duration-200
//             "
//           >
//             {isSubmitting ? "Logging in..." : "Log In"}
//           </Button>

//         </form>
//       </div>

//       <div className="flex justify-center py-3">
//         <p className="text-xs text-white/70">
//           Don&apos;t have an account?{" "}
//           <Link href="/signup" className="text-white hover:underline font-semibold">
//             Sign up
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }





"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signin, type SigninPayload } from "@/lib/api/auth.api";
import { ApiError } from "@/lib/api/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { fieldClass } from "./field-class";

/* ───────────────── Validation ───────────────── */

const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(72, "Password cannot exceed 72 characters"),
});

type LoginFormInputs = z.infer<typeof loginFormSchema>;

/* ───────────────── Error message helper ───────────────── */

function getAuthErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) {
    return "Could not connect to the server. Please try again.";
  }

  if (err.status === 429) {
    return "Too many login attempts. Please wait 15 minutes and try again.";
  }

  if (err.status === 401 && err.message.toLowerCase().includes("disabled")) {
    return "This account has been disabled. Please contact support.";
  }

  return err.message || "Invalid email or password.";
}

/* ───────────────── Component ───────────────── */

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthenticated } = useAuth();
  const signupSuccess = searchParams.get("signupSuccess");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const clearAuthError = () => {
    if (authError) setAuthError(null);
  };

  async function onSubmit(data: LoginFormInputs) {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const payload: SigninPayload = {
        email: data.email,
        password: data.password,
      };

      const { user, profile } = await signin(payload);

      setAuthenticated(profile);

      const redirect = searchParams.get("redirect");
      const defaultDash =
        user.role === "FACT_CHECKER" ? "/fact-checker" : "/user";

      router.push(redirect || defaultDash);
    } catch (err) {
      setAuthError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="
        relative
        w-76 max-w-[360px]
        rounded-lg

        bg-black/15
        backdrop-blur-[32px]
        backdrop-saturate-150

        ring-1 ring-white/10
        shadow-[0_20px_60px_rgba(0,0,0,0.55)]

        overflow-hidden
        px-4 py-6
      "
    >
      {/* Frosted light diffusion */}
      <div
        className="
          pointer-events-none
          absolute inset-0
          rounded-lg
          bg-gradient-to-b
          from-white/[0.14]
          via-white/[0.06]
          to-transparent
          opacity-40
        "
      />

      {/* Ambient top glow */}
      <div
        className="
          pointer-events-none
          absolute inset-0
          rounded-2xl
          bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_55%)]
          opacity-30
        "
      />

      {/* Header */}
      <div className="relative flex flex-col gap-1 items-center pb-2">
        <h1 className="text-2xl font-bold mb-2 bg-linear-to-r from-gray-400 via-white to-gray-400 bg-clip-text text-transparent pt-4">
          Log In to Your Account
        </h1>

        <p className="text-center text-sm font-semibold tracking-wide bg-linear-to-r from-gray-400 via-white to-gray-400 bg-clip-text text-transparent">
          Welcome back
        </p>

        <div className="w-full flex justify-center my-4">
          <div className="h-[1px] w-64 bg-gradient-to-r from-transparent via-white to-transparent opacity-70" />
        </div>
      </div>

      {/* Body */}
      <div className="relative py-3 px-2">
        {signupSuccess && (
          <div className="bg-green-500/40 text-green-300 p-3 rounded-lg mb-4 flex items-center gap-2 border border-green-700/80">
            <CheckCircle className="h-4 w-4" />
            <p className="text-sm">
              Account created successfully! Please log in.
            </p>
          </div>
        )}

        {authError && (
          <div className="bg-red-500/40 text-red-300 p-3 rounded-lg mb-4 flex items-center gap-2 border border-red-700/80">
            <XCircle className="h-4 w-4" />
            <p className="text-sm">{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs font-semibold text-white ml-1 pb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email", { onChange: clearAuthError })}
              className={fieldClass(errors.email)}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-400 text-[10px] ml-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-white ml-1 pb-1"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[10px] text-blue-400 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password", { onChange: clearAuthError })}
                className={fieldClass(errors.password)}
                autoComplete="current-password"
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

            {errors.password && (
              <p className="text-red-400 text-[10px] ml-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="
              w-full py-2 text-sm font-semibold rounded-lg
              bg-white text-black
              hover:bg-white/90
              transition-all duration-200
            "
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </Button>
        </form>
      </div>

      <div className="relative flex justify-center py-3">
        <p className="text-xs text-white/70">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-white hover:underline font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}