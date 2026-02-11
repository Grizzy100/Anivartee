//server\user-service\src\validators\schema.ts
// Barrel export file for all validators
export { signUpSchema } from './signUpSchema.js';
export type { SignUpInput } from './signUpSchema.js';

export { loginSchema } from './loginSchema.js';
export type { LoginInput } from './loginSchema.js';

export { forgotPasswordSchema } from './forgotPasswordSchema.js';
export type { ForgotPasswordInput } from './forgotPasswordSchema.js';

export { resetPasswordSchema } from './resetPasswordSchema.js';
export type { ResetPasswordInput } from './resetPasswordSchema.js';

export { updateProfileSchema } from './updateProfileSchema.js';
export type { UpdateProfileInput } from './updateProfileSchema.js';

export { updateAvatarSchema } from './updateAvatarSchema.js';
export type { UpdateAvatarInput } from './updateAvatarSchema.js';