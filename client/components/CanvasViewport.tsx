// //client\components\CanvasViewport.tsx
// "use client";

// import { useRef, useEffect, useState } from "react";
// import { motion, useMotionValue } from "framer-motion";
// import InfiniteCanvas from "./InfiniteCanvas";
// import { CANVAS_CONFIG } from "@/lib/canvas-config";

// export default function CanvasViewport() {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const x = useMotionValue(0);
//   const y = useMotionValue(0);

//   const [constraints, setConstraints] = useState<any>(null);

//   useEffect(() => {
//     const vw = window.innerWidth;
//     const vh = window.innerHeight;

//     x.set(-(CANVAS_CONFIG.width / 2 - vw / 2));
//     y.set(-(CANVAS_CONFIG.height / 2 - vh / 2));

//     setConstraints({
//       left: -(CANVAS_CONFIG.width - vw),
//       right: 0,
//       top: -(CANVAS_CONFIG.height - vh),
//       bottom: 0,
//     });
//   }, [x, y]);

//   return (
//     <div
//       ref={containerRef}
//       className="fixed inset-0 w-screen h-screen overflow-hidden cursor-grab active:cursor-grabbing"
//     >
//       {constraints && (
//         <motion.div
//           drag
//           dragConstraints={constraints}
//           dragElastic={0.2}
//           dragMomentum
//           dragTransition={{ power: 0.1, timeConstant: 300 }}
//           style={{ x, y }}
//           className="will-change-transform"
//         >
//           <InfiniteCanvas />
//         </motion.div>
//       )}
//     </div>
//   );
// }



//option2
"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import InfiniteCanvas from "./InfiniteCanvas";
import { CANVAS_CONFIG } from "@/lib/canvas-config";

export default function CanvasViewport() {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [constraints, setConstraints] = useState<any>(null);

  useEffect(() => {
    const centerHero = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const heroCenterX = CANVAS_CONFIG.width / 2;
      const heroCenterY = CANVAS_CONFIG.height / 2;

      x.set(-(heroCenterX - vw / 2));
      y.set(-(heroCenterY - vh / 2));

      setConstraints({
        left: -(CANVAS_CONFIG.width - vw),
        right: 0,
        top: -(CANVAS_CONFIG.height - vh),
        bottom: 0,
      });
    };

    centerHero();
    window.addEventListener("resize", centerHero);
    return () => window.removeEventListener("resize", centerHero);
  }, [x, y]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#070B10] cursor-grab active:cursor-grabbing"
    >
      {constraints && (
        <motion.div
          drag
          dragConstraints={constraints}
          dragElastic={0.08}
          dragMomentum
          dragTransition={{ power: 0.06, timeConstant: 300 }}
          style={{ x, y }}
          className="will-change-transform"
        >
          <InfiniteCanvas />
        </motion.div>
      )}

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_40%,rgba(0,0,0,0.65)_100%)]" />

      {/* Subtle lift */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_60%)]" />

      {/* Grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('/noise.png')]" />
    </div>
  );
}
