import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-8 bg-black bg-cover bg-center"
      style={{
        backgroundImage: `
          linear-gradient(rgba(8,12,20,0.55), rgba(0,0,0,0.7)),
          url('/images/wavy.png')
        `,
      }}
    >
      <ForgotPasswordForm />
    </div>
  );
}
