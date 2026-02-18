//client\components\Navbar.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import LogoMark from "./LogoMark";


export default function Navbar() {
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
          px-2 py-1.5
          rounded-full
          text-white
          shadow-[0_8px_28px_rgba(0,0,0,0.35)]
          border border-white/10
          overflow-hidden
        "
      >
        {/* Animated Base Gradient */}
        <motion.div
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%"],
          }}
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

        {/* Seamless Metallic Flow */}
        <motion.div
          animate={{
            backgroundPosition: ["0% 0%", "200% 0%"],
          }}
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

        {/* Top Gloss Edge */}
        <div
          className="
            absolute top-0 left-6 right-6 h-[1px]
            bg-gradient-to-r from-transparent via-white/20 to-transparent
            pointer-events-none
          "
        />

        <Link
          href="/"
          className="relative z-10 flex items-center"
        >
          <div className="relative flex items-center justify-center w-8 h-8">

            {/* Silver Shiny Border Ring */}
            <div
              className="
                absolute inset-0 rounded-full
                bg-[linear-gradient(135deg,#f5f5f5,#cfcfcf,#ffffff,#bdbdbd)]
                p-[1px]
                shadow-[0_0_10px_rgba(255,255,255,0.9)]
              "
            >
              <div className="w-full  h-full rounded-full bg-neutral-950 flex items-center justify-center">
                <LogoMark />
              </div>
            </div>

          </div>
        </Link>



        {/* Links */}
        <div
          className="
            relative z-10
            hidden md:flex
            items-center gap-2.5
          "
        >
          {["Home","Why", "About", "Pricing"].map((item) => (
            <Link
              key={item}
              href="#"
              className="
                text-[10px]
                tracking-[0.02em]
                font-medium
                text-white/60
                transition-all duration-300
                hover:text-white
                hover:[text-shadow:0_0_10px_rgba(255,255,255,0.9)]
              "
            >
              {item}
            </Link>
          ))}

        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.05 }}
          className="
            relative z-10
            px-3 py-1
            rounded-full
            bg-white
            text-black
            text-[10px]
            font-(--font-space)
            transition-all duration-300
            hover:bg-white/90
            hover:shadow-[0_0_15px_rgba(255,255,255,0.35)]
          "
        >
          Get Started
        </motion.button>
      </motion.nav>
    </div>
  );
}
