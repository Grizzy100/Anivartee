// //client\components\InfiniteCanvas.tsx
// "use client";

// import { useMemo } from "react";
// import ScreenshotCard from "./ScreenshotCard";
// import HeroBlock from "./HeroBlock";
// import { CANVAS_CONFIG } from "@/lib/canvas-config";

// const IMAGES = [
//   "/images/back1.jpg",
//   "/images/back2.jpg",
//   "/images/back3.jpg",
//   "/images/back4.jpg",
//   "/images/back5.jpg",
//   "/images/back6.jpg",
//   "/images/front1.jpg",
//   "/images/front2.jpg",
//   "/images/front3.jpg",
//   "/images/front4.jpg",
//   "/images/front5.jpg",
//   "/images/front6.jpg",
//   "/images/l1.jpg",
//   "/images/l2.jpg",
//   "/images/l3.jpg",
//   "/images/l4.jpg",
//   "/images/l5.jpg",
//   "/images/l6.jpg",
//   "/images/l7.jpg",
//   "/images/l8.jpg",
//   "/images/l9.jpg",
//   "/images/l10.jpg",
// ];

// function intersectsHero(
//   x: number,
//   y: number,
//   w: number,
//   h: number,
//   heroX: number,
//   heroY: number,
//   heroW: number,
//   heroH: number
// ) {
//   return !(
//     x + w < heroX ||
//     x > heroX + heroW ||
//     y + h < heroY ||
//     y > heroY + heroH
//   );
// }

// function generateItems() {
//   const items: any[] = [];

//   const columnWidth = 380;
//   const gap = 100;
//   const columnCount = Math.floor(
//     CANVAS_CONFIG.width / (columnWidth + gap)
//   );

//   const columnHeights = new Array(columnCount).fill(200);

//   // Slight stagger to avoid flat alignment
//   columnHeights.forEach((_, i) => {
//     columnHeights[i] += (i % 2 === 0 ? 120 : 40);
//   });

//   const heroWidth = 1000;
//   const heroHeight = 550;
//   const heroX = CANVAS_CONFIG.width / 2 - heroWidth / 2;
//   const heroY = CANVAS_CONFIG.height / 2 - heroHeight / 2;

//   const totalIterations = 120; // repeat image pool

//   for (let i = 0; i < totalIterations; i++) {
//     const src = IMAGES[i % IMAGES.length];

//     // Controlled portrait-like height variation
//     const height =
//       columnWidth * (0.9 + Math.random() * 0.6);

//     // shortest column
//     let colIndex = 0;
//     for (let j = 1; j < columnCount; j++) {
//       if (columnHeights[j] < columnHeights[colIndex]) {
//         colIndex = j;
//       }
//     }

//     let x = colIndex * (columnWidth + gap);
//     let y = columnHeights[colIndex];

//     // Subtle horizontal drift
//     x += (Math.random() - 0.5) * 20;

//     // Hero exclusion
//     if (
//       intersectsHero(
//         x,
//         y,
//         columnWidth,
//         height,
//         heroX,
//         heroY,
//         heroWidth,
//         heroHeight
//       )
//     ) {
//       columnHeights[colIndex] += heroHeight + gap;
//       y = columnHeights[colIndex];
//     }

//     items.push({
//       id: i,
//       src,
//       x,
//       y,
//       width: columnWidth,
//       height,
//       delay: i * 0.02,
//     });

//     columnHeights[colIndex] += height + gap;
//   }

//   return items;
// }

// export default function InfiniteCanvas() {
//   const items = useMemo(() => generateItems(), []);

//   return (
//     <div
//       className="relative"
//       style={{
//         width: CANVAS_CONFIG.width,
//         height: CANVAS_CONFIG.height,
//       }}
//     >
//       {items.map((item) => (
//         <ScreenshotCard key={item.id} {...item} />
//       ))}

//       <div
//         className="absolute z-30"
//         style={{
//           width: 1000,
//           height: 550,
//           left: CANVAS_CONFIG.width / 2 - 500,
//           top: CANVAS_CONFIG.height / 2 - 275,
//         }}
//       >
//         <HeroBlock />
//       </div>
//     </div>
//   );
// }


//option1
"use client";

import { useMemo } from "react";
import ScreenshotCard from "./ScreenshotCard";
import HeroBlock from "./HeroBlock";
import { CANVAS_CONFIG } from "@/lib/canvas-config";

const IMAGES = [
  "/images/back1.jpg",
  "/images/back2.jpg",
  "/images/back3.jpg",
  "/images/back4.jpg",
  "/images/back5.jpg",
  "/images/back6.jpg",
  "/images/front1.jpg",
  "/images/front2.jpg",
  "/images/front3.jpg",
  "/images/front4.jpg",
  "/images/front5.jpg",
  "/images/front6.jpg",
  "/images/l1.jpg",
  "/images/l2.jpg",
  "/images/l3.jpg",
  "/images/l4.jpg",
  "/images/l5.jpg",
  "/images/l6.jpg",
  "/images/l7.jpg",
  "/images/l8.jpg",
  "/images/l9.jpg",
  "/images/l10.jpg",
];

function generateItems() {
  const items: any[] = [];
  const columnWidth = 360;
  const gap = 110;
  const columnCount = Math.floor(
    CANVAS_CONFIG.width / (columnWidth + gap)
  );

  const columnHeights = new Array(columnCount).fill(200);

  const heroWidth = 1000;
  const heroHeight = 550;
  const heroX = CANVAS_CONFIG.width / 2 - heroWidth / 2;
  const heroY = CANVAS_CONFIG.height / 2 - heroHeight / 2;

  const totalIterations = 140;

  for (let i = 0; i < totalIterations; i++) {
    const src = IMAGES[i % IMAGES.length];
    const colIndex = columnHeights.indexOf(Math.min(...columnHeights));

    const depthTier = colIndex % 3;

    let depthScale = 1;
    let depthOpacity = 0.9;

    if (depthTier === 0) {
      depthScale = 1;
      depthOpacity = 0.95;
    } else if (depthTier === 1) {
      depthScale = 0.92;
      depthOpacity = 0.8;
    } else {
      depthScale = 0.85;
      depthOpacity = 0.65;
    }

    const height =
      columnWidth * (0.95 + Math.random() * 0.6) * depthScale;

    let x = colIndex * (columnWidth + gap);
    let y = columnHeights[colIndex];

    if (
      x < heroX + heroWidth &&
      x + columnWidth > heroX &&
      y < heroY + heroHeight &&
      y + height > heroY
    ) {
      columnHeights[colIndex] += heroHeight + gap;
      y = columnHeights[colIndex];
    }

    items.push({
      id: i,
      src,
      x,
      y,
      width: columnWidth * depthScale,
      height,
      delay: i * 0.015,
      opacity: depthOpacity,
    });

    columnHeights[colIndex] += height + gap;
  }

  return items;
}

export default function InfiniteCanvas() {
  const items = useMemo(() => generateItems(), []);

  return (
    <div
      className="relative"
      style={{
        width: CANVAS_CONFIG.width,
        height: CANVAS_CONFIG.height,
      }}
    >
      {items.map((item) => (
        <div key={item.id} style={{ opacity: item.opacity }}>
          <ScreenshotCard {...item} />
        </div>
      ))}

      {/* HERO CENTERED IN CANVAS SPACE */}
      <div
        className="absolute z-30"
        style={{
          left: CANVAS_CONFIG.width / 2,
          top: CANVAS_CONFIG.height / 2,
          transform: "translate(-50%, -50%)",
          width: 1000,
          height: 550,
        }}
      >
        <HeroBlock />
      </div>
    </div>
  );
}
