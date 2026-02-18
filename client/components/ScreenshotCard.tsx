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
//       className="absolute"
//       style={{ left: x, top: y, width, height }}
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.8, delay }}
//       whileHover={{ scale: 1.025 }}
//     >
//       <div className="relative w-full h-full rounded-3xl overflow-hidden bg-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-white/10">

//         {/* Blurred Fill Background */}
//         <div className="absolute inset-0 scale-110 blur-2xl opacity-30">
//           <Image
//             src={src}
//             alt="Background"
//             fill
//             className="object-cover"
//             draggable={false}
//           />
//         </div>

//         {/* Dark Overlay for premium depth */}
//         <div className="absolute inset-0 bg-black/20" />

//         {/* Contained Screenshot */}
//         <div className="absolute inset-0 p-4">
//           <div className="relative w-full h-full rounded-xl overflow-hidden bg-black">
//             <Image
//               src={src}
//               alt="Screenshot"
//               fill
//               className="object-contain"
//               draggable={false}
//             />
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }




//option 1
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface Props {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  delay?: number;
}

export default function ScreenshotCard({
  src,
  x,
  y,
  width,
  height,
  delay = 0,
}: Props) {
  return (
    <motion.div
      className="absolute group"
      style={{ left: x, top: y, width, height }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 0.85, y: 0 }}
      transition={{ duration: 1, delay, ease: "easeOut" }}
    >
      <div
        className="
          relative
          w-full h-full
          rounded-[28px]
          overflow-hidden
          border border-white/10
          shadow-[0_25px_80px_rgba(0,0,0,0.55)]
          bg-black
        "
      >
        {/* Image */}
        <Image
          src={src}
          alt="Archive entry"
          fill
          draggable={false}
          className="
            object-cover
            brightness-70
            contrast-95
            saturate-50
            transition-all duration-700 ease-out
            group-hover:brightness-95
            group-hover:saturate-80
          "
        />

        {/* Subtle documentary dark veil */}
        <div className="absolute inset-0 bg-black/25 transition-opacity duration-700 group-hover:bg-black/15" />

        {/* Edge fade */}
        <div className="
          absolute inset-0
          bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.6))]
        " />
      </div>
    </motion.div>
  );
}


