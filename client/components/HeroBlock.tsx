// //client\components\HeroBlock.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function HeroBlock() {
  const router = useRouter();
  const [titleIndex, setTitleIndex] = useState(0);

  const titles = useMemo(
    () => [
      "COW DUNG",
      "UGLY",
      "PAJEET",
      "SCAMMER",
      "STREET SHITTER",
    ],
    []
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % titles.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [titles]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9 }}
      className="relative w-full h-full flex items-center justify-center pointer-events-none"
    >
      {/* Ultra subtle ambient blur — NOT a visible box */}
      <div
        className="
          absolute
          w-[340px]
          h-[160px]
          bg-white/[0.02]
          backdrop-blur-[4px]
          rounded-full
          blur-xl
          opacity-40
        "
      />

      {/* Content */}
      <div
        className="
          relative z-10
          w-[70%] max-w-3xl
          px-2 py-2
          text-center
          flex flex-col items-center
        "
      >
        {/* Headline */}
        <h1
          className="
            text-2xl md:text-3xl
            font-light
            tracking-[-0.02em]
            text-white/80
            leading-tight
          "
        >
          Repeated. Normalized. Intentional.
        </h1>

        {/* Rotating Word */}
        <div className="mt-4 relative h-14 flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            <motion.h2
              key={titleIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="
                absolute
                text-5xl md:text-6xl
                font-extrabold
                tracking-[-0.03em]
                text-white
                drop-shadow-[0_8px_30px_rgba(0,0,0,0.6)]
              "
            >
              {titles[titleIndex]}
            </motion.h2>
          </AnimatePresence>
        </div>

        {/* Subtext */}
        <p
          className="
            mt-4
            text-xs md:text-sm
            text-white/50
            leading-snug
          "
        >
          What looks scattered is often coordinated in effect.
          <br />
          <span className="text-white/70">
            Structure shapes perception.
          </span>
        </p>

        {/* CTA */}
        <div className="mt-3 pointer-events-auto">
          <button
            onClick={() => router.push("/signup")}
            className="
              px-4 py-1.5
              rounded-full
              border border-white/15
              text-white/80
              text-[11px]
              tracking-wide
              transition-all duration-300
              hover:border-white/30
              hover:text-white
            "
          >
            Get Started
          </button>
        </div>
      </div>
    </motion.div>
  );
}