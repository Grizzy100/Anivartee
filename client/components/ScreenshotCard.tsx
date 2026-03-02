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

  const depthBrightness = 1 - depth * 0.08;
  const depthSaturation = 1 - depth * 0.05;

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

        filter: `
          blur(${blur * 0.6}px)
          brightness(${depthBrightness})
          saturate(${depthSaturation})
        `,

        transformPerspective: 1400,
        zIndex: 1,
      }}
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity, y: 0 }}
      transition={{
        duration: 1,
        delay,
        ease: "easeOut",
      }}
      whileHover={{
        scale: scale * 1.02,
        z: 40,
      }}
    >
      <motion.div
        animate={{ y: [0, -3 * depth, 0] }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          relative w-full h-full
          rounded-xl overflow-hidden

          bg-[#0c1117]/95
          border border-white/[0.06]

          shadow-
          [0_0_0_1px_rgba(255,255,255,0.04)_inset,
           0_1px_0_rgba(255,255,255,0.08)_inset,
           0_30px_80px_rgba(0,0,0,0.65),
           0_80px_160px_rgba(0,0,0,0.75)]

          backdrop-blur-[3px]
          transition-all duration-500
          group-hover:border-white/[0.12]
        "
      >
        <Image
          src={src}
          alt=""
          fill
          draggable={false}
          className="
            object-cover
            brightness-[0.97]
            contrast-[1.03]
            saturate-[1.02]
            transition-all duration-500
            group-hover:brightness-[1]
          "
        />

        {/* Studio radial light */}
        <div
          className="
            pointer-events-none
            absolute inset-0
            rounded-xl
            bg-[radial-gradient(circle_at_30%_20%,
              rgba(255,255,255,0.08),
              transparent_55%
            )]
          "
        />

        {/* Top soft gloss */}
        <div
          className="
            pointer-events-none
            absolute inset-0
            rounded-xl
            bg-[linear-gradient(180deg,
              rgba(255,255,255,0.10)_0%,
              rgba(255,255,255,0.04)_8%,
              transparent_22%
            )]
            opacity-70
          "
        />

        {/* Inner depth shadow */}
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