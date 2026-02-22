// //client\components\ScreenshotCard.tsx
// "use client";

// import { motion } from "framer-motion";
// import Image from "next/image";

// interface Props {
//   src: string;
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   delay?: number;
// }

// export default function ScreenshotCard({
//   src,
//   x,
//   y,
//   width,
//   height,
//   delay = 0,
// }: Props) {
//   return (
//     <motion.div
//       className="absolute group"
//       style={{ left: x, top: y, width, height }}
//       initial={{ opacity: 0, y: 40 }}
//       animate={{ opacity: 0.85, y: 0 }}
//       transition={{ duration: 1, delay, ease: "easeOut" }}
//     >
//       <div
//         className="
//           relative
//           w-full h-full
//           rounded-[28px]
//           overflow-hidden
//           border border-white/10
//           shadow-[0_25px_80px_rgba(0,0,0,0.55)]
//           bg-black
//         "
//       >
//         {/* Image */}
//         <Image
//           src={src}
//           alt="Archive entry"
//           fill
//           draggable={false}
//           className="
//             object-cover
//             brightness-70
//             contrast-95
//             saturate-50
//             transition-all duration-700 ease-out
//             group-hover:brightness-95
//             group-hover:saturate-80
//           "
//         />

//         {/* Subtle documentary dark veil */}
//         <div className="absolute inset-0 bg-black/25 transition-opacity duration-700 group-hover:bg-black/15" />

//         {/* Edge fade */}
//         <div className="
//           absolute inset-0
//           bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.6))]
//         " />
//       </div>
//     </motion.div>
//   );
// }



//client\components\ScreenshotCard.tsx
"use client";

import {
  motion,
  MotionValue,
  useTransform,
} from "framer-motion";
import Image from "next/image";

interface Props {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  blur: number;
  opacity: number;
  depth: number;
  rotation: number;
  delay: number;
  motionX: MotionValue<number>;
  motionY: MotionValue<number>;
}

export default function ScreenshotCard({
  src,
  x,
  y,
  width,
  height,
  scale,
  blur,
  opacity,
  depth,
  rotation,
  delay,
  motionX,
  motionY,
}: Props) {

  const parallaxX = useTransform(motionX, v => v * depth * 0.6);
  const parallaxY = useTransform(motionY, v => v * depth * 0.6);

  return (
    <motion.div
      className="absolute group will-change-transform"
      style={{
        left: x,
        top: y,
        width,
        height,

        x: parallaxX,
        y: parallaxY,

        rotate: rotation,

        scale,
        opacity,

        filter: `blur(${blur}px)`,

        transformPerspective: 1400,

        // FIXED: never compete with hero
        zIndex: 1,
      }}
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity, y: 0 }}
      transition={{
        duration: 1.1,
        delay,
        ease: "easeOut",
      }}
    >
      <motion.div
        animate={{ y: [0, -6 * depth, 0] }}
        transition={{
          duration: 14 + Math.random() * 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          relative w-full h-full
          rounded-xl overflow-hidden

          bg-[#0c1117]/95
          border border-white/[0.08]

          shadow-
          [0_0_0_1px_rgba(255,255,255,0.03)_inset,
           0_1px_0_rgba(255,255,255,0.06)_inset,
           0_20px_50px_rgba(0,0,0,0.55),
           0_60px_140px_rgba(0,0,0,0.7)]

          backdrop-blur-[3px]
          transition-all duration-500
          group-hover:border-white/[0.14]
        "
      >
        <Image
          src={src}
          alt=""
          fill
          draggable={false}
          className="
            object-cover
            brightness-[0.94]
            contrast-[0.97]
            saturate-[0.96]
            transition-all duration-500
            group-hover:brightness-[1]
            group-hover:saturate-[1]
          "
        />

        <div
          className="
            pointer-events-none
            absolute inset-0
            rounded-xl
            bg-[linear-gradient(180deg,
              rgba(255,255,255,0.10)_0%,
              rgba(255,255,255,0.05)_6%,
              transparent_20%
            )]
            opacity-70
          "
        />

        <div
          className="
            pointer-events-none
            absolute inset-0
            rounded-xl
            shadow-[inset_0_0_40px_rgba(0,0,0,0.35)]
          "
        />
      </motion.div>
    </motion.div>
  );
}


