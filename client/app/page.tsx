// app/page.tsx
import Navbar from "@/components/Navbar";
import CanvasViewport from "@/components/CanvasViewport";

export default function Home() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">

      {/* Background Image Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/landing%20page%20image.png')",
        }}
      />

      {/* Optional soft dark overlay for readability */}
      <div className="absolute inset-0 bg-black/30" />

      <Navbar />
      <CanvasViewport />
    </div>
  );
}


