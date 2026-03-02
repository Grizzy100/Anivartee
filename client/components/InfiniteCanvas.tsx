//client\components\InfiniteCanvas.tsx
"use client";

import { useMemo } from "react";
import ScreenshotCard from "./ScreenshotCard";
import HeroBlock from "./HeroBlock";
import { CANVAS_CONFIG } from "@/lib/canvas-config";
import { MotionValue } from "framer-motion";

interface Props {
  motionX: MotionValue<number>;
  motionY: MotionValue<number>;
}

const IMAGES = [
  "/images/proofs/back3.jpg",
  "/images/proofs/front1.jpg",
  "/images/proofs/front4.jpg",
  "/images/proofs/front6.jpg",
  "/images/proofs/l1.jpg",
  "/images/proofs/l2.jpg",
  "/images/proofs/l3.jpg",
  "/images/proofs/l4.jpg",
  "/images/proofs/l5.jpg",
  "/images/proofs/l7.jpg",
  "/images/proofs/l9.jpg",
  "/images/proofs/l10.jpg",
  "/images/proofs/proof3.jpeg",
  "/images/proofs/proof4.jpeg",
  "/images/proofs/proof5.jpeg",
  "/images/proofs/proof6.jpeg",
  "/images/proofs/proof7.jpeg",
  "/images/proofs/proof8.jpeg",
  "/images/proofs/racial slur 1.png",
  "/images/proofs/racial slur 2.png",
];

function generateItems() {

  const items = [];

  const columnWidth = 360;
  const gap = 110;

  const columnCount =
    Math.floor(CANVAS_CONFIG.width / (columnWidth + gap));

  const columnHeights = new Array(columnCount).fill(200);

  const centerX = CANVAS_CONFIG.width / 2;
  const centerY = CANVAS_CONFIG.height / 2;

  for (let i = 0; i < 140; i++) {

    const src = IMAGES[i % IMAGES.length];

    const colIndex =
      columnHeights.indexOf(Math.min(...columnHeights));

    let x = colIndex * (columnWidth + gap);
    let y = columnHeights[colIndex];

    const dx = x - centerX;
    const dy = y - centerY;

    const dist = Math.sqrt(dx * dx + dy * dy);

    const maxDist = CANVAS_CONFIG.width * 0.7;

    const focus =
      1 - Math.min(dist / maxDist, 1);

    /*
    Premium balanced visibility
    */
    const scale = 0.85 + focus * 0.25;

    const blur = (1 - focus) * 0.8;

    const opacity = 0.35 + focus * 0.65;

    const depth = 0.4 + focus * 0.6;

    const rotation =
      (Math.random() - 0.5) * 3;

    const height =
      columnWidth *
      (0.9 + Math.random() * 0.6) *
      scale;

    items.push({
      id: i,
      src,
      x,
      y,

      width: columnWidth * scale,
      height,

      scale,
      blur,
      opacity,
      depth,
      rotation,

      delay: i * 0.015,
    });

    columnHeights[colIndex] += height + gap;
  }

  return items;
}

export default function InfiniteCanvas({
  motionX,
  motionY,
}: Props) {

  const items =
    useMemo(generateItems, []);

  return (
    <div
      className="relative"
      style={{
        width: CANVAS_CONFIG.width,
        height: CANVAS_CONFIG.height,
      }}
    >

      {items.map(item => (
        <ScreenshotCard
          key={item.id}
          {...item}
          motionX={motionX}
          motionY={motionY}
        />
      ))}

      {/* Hero stays dominant */}
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

      {/* cinematic depth atmosphere */}
      <div className="
        pointer-events-none
        absolute inset-0
        bg-[radial-gradient(circle_at_center,transparent_35%,rgba(7,11,16,0.75)_100%)]
      "/>

    </div>
  );
}


