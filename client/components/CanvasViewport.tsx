//client\components\CanvasViewport.tsx
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";

import InfiniteCanvas from "./InfiniteCanvas";
import { CANVAS_CONFIG } from "@/lib/canvas-config";

interface Constraints {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export default function CanvasViewport() {
  const containerRef = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const x = useSpring(rawX, {
    stiffness: 80,
    damping: 22,
    mass: 0.6,
  });

  const y = useSpring(rawY, {
    stiffness: 80,
    damping: 22,
    mass: 0.6,
  });

  const [constraints, setConstraints] = useState<Constraints | null>(null);

  const centerHero = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const heroCenterX = CANVAS_CONFIG.width / 2;
    const heroCenterY = CANVAS_CONFIG.height / 2;

    rawX.set(-(heroCenterX - vw / 2));
    rawY.set(-(heroCenterY - vh / 2));

    setConstraints({
      left: -(CANVAS_CONFIG.width - vw),
      right: 0,
      top: -(CANVAS_CONFIG.height - vh),
      bottom: 0,
    });
  }, [rawX, rawY]);

  useEffect(() => {
    centerHero();

    let timeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(centerHero, 120);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeout);
    };
  }, [centerHero]);

  return (
    <div
      ref={containerRef}
      className="
        fixed inset-0
        w-screen h-screen
        overflow-hidden
        bg-[#070B10]
        cursor-grab active:cursor-grabbing
        select-none touch-none
      "
    >
      {constraints && (
        <motion.div
          drag
          dragConstraints={constraints}
          dragElastic={0.035}
          dragMomentum
          dragTransition={{
            power: 0.18,
            timeConstant: 240,
            bounceStiffness: 40,
            bounceDamping: 20,
          }}
          style={{ x: rawX, y: rawY }}
          className="will-change-transform"
        >
          <InfiniteCanvas motionX={x} motionY={y} />
        </motion.div>
      )}

      {/* cinematic vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_18%,rgba(0,0,0,0.92)_100%)]"/>

      {/* spotlight focus */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_25%,transparent_60%)]"/>

      {/* grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay bg-[url('/noise.png')]"/>
    </div>
  );
}


