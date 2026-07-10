"use client";

import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export default function SmoothScroll({ children, enabled = true }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;

    const lenis = new Lenis({
      duration: isMobile ? 1.0 : 0.9,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      // On mobile: let Lenis handle native touch with smooth interpolation
      // but keep lerp gentle so ScrollTrigger scrub stays in sync
      syncTouch: isMobile,
      syncTouchLerp: isMobile ? 0.075 : 0.1,
      touchMultiplier: isMobile ? 1.8 : 2.0,
      wheelMultiplier: 1.0,
      infinite: false,
    });

    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    gsap.ticker.lagSmoothing(0);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  return <>{children}</>;
}
