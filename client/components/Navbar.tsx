//client\components\Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { RiLoginBoxLine } from "react-icons/ri";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-3">
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="
          relative
          flex items-center justify-between
          gap-6
          px-3 py-1.5
          rounded-full
          text-white
          shadow-[0_8px_28px_rgba(0,0,0,0.35)]
          border border-white/10
          overflow-hidden
        "
      >
        {/* Animated Base Gradient */}
        <motion.div
          animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
          transition={{
            duration: 14,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "linear",
          }}
          className="
            absolute inset-0 rounded-full
            bg-gradient-to-r from-black via-neutral-900 to-neutral-800
            bg-[length:200%_200%]
          "
        />

        {/* Soft Radial Shine */}
        <div
          className="
            absolute inset-0 rounded-full
            bg-[radial-gradient(circle_at_25%_30%,rgba(255,255,255,0.1),transparent_65%)]
            pointer-events-none
          "
        />

        {/* Metallic Flow */}
        <motion.div
          animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
          className="
            absolute inset-0 rounded-full
            bg-[linear-gradient(120deg,transparent_40%,rgba(255,255,255,0.12)_50%,transparent_60%)]
            bg-[length:200%_100%]
            opacity-50
            pointer-events-none
          "
        />

        {/* Gloss Edge */}
        <div
          className="
            absolute top-0 left-6 right-6 h-[1px]
            bg-gradient-to-r from-transparent via-white/20 to-transparent
            pointer-events-none
          "
        />

        {/* LOGO */}
        <Link href="/" className="relative z-10 flex items-center">
          <div className="relative flex items-center justify-center w-10 h-10">

            {/* Metallic ring */}
            <div
              className="
                absolute inset-0 rounded-full
                bg-[linear-gradient(135deg,#f5f5f5,#cfcfcf,#ffffff,#bdbdbd)]
                p-[1px]
                shadow-[0_0_10px_rgba(255,255,255,0.9)]
              "
            >
              <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden bg-neutral-950">
              <Image
                src="/images/logo-new-removebg-preview.png"
                alt="Anvartee"
                width={34}
                height={34}
                className="object-contain scale-150"
                priority
              />
            </div>

            </div>

          </div>
        </Link>

        {/* Links */}
        <div className="relative z-10 hidden md:flex items-center gap-3">
          {["Home", "Why", "About", "Pricing"].map((item) => (
            <Link
              key={item}
              href="#"
              className="
                text-[11px]
                tracking-[0.04em]
                font-medium
                text-white/60
                transition-all duration-300
                hover:text-white
                hover:[text-shadow:0_0_12px_rgba(255,255,255,0.9)]
              "
            >
              {item}
            </Link>
          ))}
        </div>

        {/* CTA */}
        {/* Login CTA */}
<div className="relative z-10 group">

  <motion.button
    whileTap={{ scale: 0.92 }}
    whileHover={{ scale: 1.12 }}
    onClick={() => router.push("/login")}
    className="
      relative
      flex items-center justify-center
      w-6 h-6
     
      text-white/60
      transition-all duration-300
      hover:text-white
      hover:border-white/30
      hover:bg-white/[0.06]
      hover:shadow-[0_0_20px_rgba(255,255,255,0.35)]
      backdrop-blur-md
    "
  >
    <RiLoginBoxLine size={18} />
  </motion.button>

  {/* Tooltip */}
  <div
    className="
      pointer-events-none
      absolute
      left-1/2 -translate-x-1/2
      top-[130%]
      whitespace-nowrap
      text-[10px]
      font-medium
      text-white/75
      px-2 py-1
      rounded-md
      border border-white/10
      bg-black/60
      backdrop-blur-md
      opacity-0
      translate-y-1
      transition-all duration-500 ease-out
      group-hover:opacity-100
      group-hover:translate-y-0
    "
  >
    Login Button
  </div>

</div>

      </motion.nav>
    </div>
  );
}
