"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

// Props: an array of 3 image URLs (you can give more, component will use first 3)
export default function NewCoursesSection({
  images = ["/placeholder1.png", "/placeholder2.png", "/placeholder3.png"],
}: {
  images?: string[];
}) {
  const imgs = images.slice(0, 3);
  const [centerIdx, setCenterIdx] = useState(1); // index in imgs that sits in center
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // initial placement
    placeCardsInstant();
    // cleanup timeline on unmount
    return () => {
      tlRef.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // animate to new placement whenever centerIdx changes
    animateToPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerIdx]);

  function placeCardsInstant() {
    const positions = getPositions(centerIdx);
    imgs.forEach((_, i) => {
      const el = cardRefs.current[i];
      if (!el) return;
      gsap.set(el, positions[i]);
    });
  }

  function animateToPositions() {
    const positions = getPositions(centerIdx);
    tlRef.current?.kill();
    const tl = gsap.timeline();
    imgs.forEach((_, i) => {
      const el = cardRefs.current[i];
      if (!el) return;
      tl.to(
        el,
        {
          duration: 0.45,
          x: positions[i].x,
          y: positions[i].y,
          scale: positions[i].scale,
          zIndex: positions[i].zIndex,
          rotate: positions[i].rotate,
          ease: "power2.out",
        },
        0
      );
    });
    tlRef.current = tl;
  }

  function getPositions(center: number) {
    // Responsive offsets
    const isMobile = window.innerWidth < 640;
    const offsetX = isMobile ? 80 : 220;
    const offsetY = isMobile ? 10 : 26;
    const scaleLeftRight = isMobile ? 0.85 : 0.9;
    const scaleCenter = 1;

    // Determine which array index is left/center/right
    const idxs = [
      (center + 2) % 3, // left
      center, // center
      (center + 1) % 3, // right
    ];

    // Build a positions map by image index
    const map: Record<number, any> = {};

    map[idxs[0]] = {
      x: -offsetX,
      y: offsetY,
      scale: scaleLeftRight,
      zIndex: 10,
      rotate: -4,
    };

    map[idxs[1]] = {
      x: 0,
      y: 0,
      scale: scaleCenter,
      zIndex: 50,
      rotate: 0,
    };

    map[idxs[2]] = {
      x: offsetX,
      y: offsetY,
      scale: scaleLeftRight,
      zIndex: 10,
      rotate: 4,
    };

    return [map[0], map[1], map[2]];
  }

  function next() {
    setCenterIdx((s) => (s + 1) % 3);
  }
  function prev() {
    setCenterIdx((s) => (s + 2) % 3);
  }

  return (
    <div className="bg-[#E6F4FB] mx-auto py-8 sm:py-12">
      <div
        className="relative h-[320px] sm:h-[500px] md:h-[600px] flex items-center justify-center"
        id="courses"
      >
        {/* cards container (position: center of area) */}
        <div className="relative w-full h-full flex items-center justify-center">
          {imgs.map((src, i) => (
            <div
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={`absolute cursor-pointer rounded-2xl shadow-2xl overflow-hidden select-none w-[220px] h-[160px] sm:w-[420px] sm:h-[340px] md:w-[540px] md:h-[440px] transform`}
              onClick={() => setCenterIdx(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setCenterIdx(i);
              }}
            >
              <img
                src={src}
                alt={`card-${i}`}
                className="w-full h-full object-cover block"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4 sm:gap-8">
        <button
          onClick={prev}
          className="p-2 sm:p-3 rounded-full border border-gray-300 bg-white hover:bg-gray-100 shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
          aria-label="Previous"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <button
          onClick={next}
          className="p-2 sm:p-3 rounded-full border border-gray-300 bg-white hover:bg-gray-100 shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
          aria-label="Next"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/*
Usage example:

import NewCoursesSection from "./NewCoursesSection";

<NewCoursesSection
  images={["/img/left.jpg", "/img/center.jpg", "/img/right.jpg"]}
/>

Notes / customisation tips:
- Tweak offsetX / offsetY / scales in getPositions() to match your design.
- You can increase zIndex for the center to ensure it sits on top.
- If you don't want GSAP, you can replace the animation with CSS transitions and change the style attributes directly.
- Component expects 3 images; if you pass more, only first 3 are used.
*/
