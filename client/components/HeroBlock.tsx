// //client\components\HeroBlock.tsx
// "use client";

// import { motion } from "framer-motion";

// export default function HeroBlock() {
//   return (
//     <div className="flex flex-col items-center text-center max-w-4xl px-4 select-none pointer-events-none">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8 }}
//         className="pointer-events-auto"
//       >
//         <h1 className="text-7xl tracking-tight leading-[1.05] mb-6 font-[var(--font-bebas)]">
//           Design beyond
//           <br />
//           the screen.
//         </h1>

//         <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-[var(--font-oxanium)]">
//           An infinite canvas built for modern SaaS teams.
//         </p>

//         <div className="flex gap-4 justify-center">
//           <button className="px-8 py-3 rounded-xl bg-primary text-primary-foreground">
//             Start Free
//           </button>
//           <button className="px-8 py-3 rounded-xl border border-border">
//             View Demo
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// }




"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroBlock() {
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
      <div
        className="
          w-[75%] max-w-4xl
          px-6
          py-6
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
            text-[#C5C7CA]
            leading-[1.05]
            font-[var(--font-oxanium)]
          "
        >
          Repeated. Normalized. Intentional.
        </h1>

        {/* Rotating Word */}
        <div className="mt-6 relative h-12 flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            <motion.h2
              key={titleIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="
                absolute
                text-5xl md:text-6xl
                font-extrabold
                tracking-[-0.03em]
                text-[#C5C7CA]
                leading-[1]
              "
            >
              {titles[titleIndex]}
            </motion.h2>
          </AnimatePresence>
        </div>

        {/* Subtext */}
        <p
          className="
            mt-6
            text-xs md:text-sm
            text-white/40
            max-w-4xl
            leading-snug
            font-[var(--font-oxanium)]
          "
        >
          What looks scattered is often coordinated in effect.
          <br />
          <span className="text-white/55">
            Structure shapes perception.
          </span>
        </p>

        {/* CTA */}
        <div className="mt-4 pointer-events-auto">
          <button
            className="
              px-4 py-1.5
              rounded-full
              border border-white/15
              text-[#C5C7CA]
              text-[11px]
              tracking-wide
              transition-all duration-300
              hover:border-white/30
              hover:text-white
            "
          >
            Examine the evidence
          </button>
        </div>
      </div>
    </motion.div>
  );
}
