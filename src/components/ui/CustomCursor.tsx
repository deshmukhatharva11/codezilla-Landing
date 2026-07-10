"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const glow = glowRef.current;
    if (!dot || !glow) return;

    // Hide default cursor
    document.documentElement.style.cursor = "none";

    const onMouseMove = (e: MouseEvent) => {
      // Dot follows exactly, no lag
      gsap.set(dot, { x: e.clientX, y: e.clientY });
      // Glow follows with lag
      gsap.to(glow, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.55,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      document.documentElement.style.cursor = "";
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <>
      {/* Precise dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{ transform: "translate(-50%, -50%)" }}
      />
      {/* Soft glow */}
      <div
        ref={glowRef}
        className="fixed top-0 left-0 w-40 h-40 rounded-full pointer-events-none z-[9998]"
        style={{
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(0,163,255,0.10) 0%, transparent 70%)",
        }}
      />
    </>
  );
}
