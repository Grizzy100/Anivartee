/**
 * Shared Tailwind class builder for auth-form input fields.
 *
 * @param hasError - truthy when the field has a validation error
 */
export function fieldClass(hasError?: unknown): string {
  return `
    w-full h-9 bg-default-100
    text-white
    placeholder:text-white/40
    focus:placeholder:text-white/80
    border text-[11px] px-2.5 outline-none transition-all duration-200
    ${
      hasError
        ? "border-red-500 focus:border-red-500"
        : "border-white/30 focus:border-white"
    }
  `;
}
