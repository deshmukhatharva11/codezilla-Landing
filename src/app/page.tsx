"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ImageSequencePlayer, {
  ImageSequenceHandle,
  TOTAL_FRAMES,
} from "@/components/ImageSequencePlayer";
import LoadingScreen from "@/components/LoadingScreen";
import CinematicIntro, { INTRO_END_FRAME } from "@/components/CinematicIntro";
import Navigation from "@/components/Navigation";
import ParticleField from "@/components/ParticleField";
import FogOverlay from "@/components/FogOverlay";
import SmoothScroll from "@/components/SmoothScroll";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ExpertiseSection from "@/components/sections/ExpertiseSection";
import SolutionsSection from "@/components/sections/SolutionsSection";
import ContactSection from "@/components/sections/ContactSection";
import FooterSection from "@/components/sections/FooterSection";
import ParticleOverlay from "@/components/ui/ParticleOverlay";
import { audioController } from "@/lib/audioController";

gsap.registerPlugin(ScrollTrigger);

type AppPhase = "loading" | "ready" | "intro" | "scrollable";

/**
 * Each section has a range (% of 800vh scroll height) where it lives.
 * start  = opacity begins rising
 * peak   = fully visible  
 * end    = fully faded out
 *
 * Hero is special: it starts fully visible and only has a fade-OUT range.
 */
const SECTION_RANGES = {
  hero:      { start: 0,   end: 12  },
  about:     { start: 10,  peak: 17, end: 28 },
  expertise: { start: 26,  peak: 33, end: 45 },
  solutions: { start: 43,  peak: 51, end: 65 },
  contact:   { start: 63,  peak: 72, end: 88 },
  footer:    { start: 86,  peak: 93, end: 100 },
};

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("loading");
  const [loadProgress, setLoadProgress] = useState(0);
  const sequenceRef = useRef<ImageSequenceHandle>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleLoadProgress = useCallback((progress: number) => {
    setLoadProgress(progress);
  }, []);

  const handleLoadComplete = useCallback(() => {
    setPhase("ready");
  }, []);

  const handleEnter = useCallback(() => {
    audioController.play();
    setPhase("intro");
  }, []);

  const handleIntroComplete = useCallback(() => {
    setPhase("scrollable");
  }, []);

  useEffect(() => {
    if (phase !== "scrollable" || !scrollContainerRef.current) return;

    // Pre-compile quickTo targets once — eliminates GSAP tween overhead on every mousemove
    const contentEls = document.querySelectorAll<HTMLElement>(".scroll-overlay-content");
    const quickSetters = Array.from(contentEls).map((el) => ({
      x: gsap.quickTo(el, "x", { duration: 1.4, ease: "power2.out" }),
      y: gsap.quickTo(el, "y", { duration: 1.4, ease: "power2.out" }),
    }));

    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 8;  // Subtle — not exaggerated
      const y = (e.clientY / window.innerHeight - 0.5) * 4;
      quickSetters.forEach(({ x: qx, y: qy }) => { qx(x); qy(y); });
    };

    const timer = setTimeout(() => {
      const container = scrollContainerRef.current!;

      // ── 1. Frame sequence driven by scroll ──
      const frameObj = { frame: INTRO_END_FRAME };
      gsap.to(frameObj, {
        frame: TOTAL_FRAMES - 1,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: true, // Lenis provides all momentum — GSAP just locks instantly
          onUpdate: () => {
            sequenceRef.current?.setFrame(Math.round(frameObj.frame));
          },
        },
      });

      // ── 2. Mouse parallax (desktop only) ──
      const isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
      if (!isMobile) {
        window.addEventListener("mousemove", onMouseMove, { passive: true });
      }

      // ── 3. Hero section — already visible, only FADE OUT on scroll ──
      const heroEl = container.querySelector<HTMLElement>(".scroll-overlay-section[data-section='hero']");
      if (heroEl) {
        gsap.fromTo(heroEl,
          { opacity: 1, y: 0 },
          {
            autoAlpha: 0,
            y: -30,
            ease: "power2.in",
            scrollTrigger: {
              trigger: container,
              start: "4% top",
              end:   "14% top",
              scrub: true,
            },
          }
        );
      }

      // ── 4. All other sections: fade in → hold → fade out ──
      const otherSections = container.querySelectorAll<HTMLElement>(
        ".scroll-overlay-section:not([data-section='hero'])"
      );
      otherSections.forEach((sectionEl) => {
        const sectionName = sectionEl.dataset.section as keyof typeof SECTION_RANGES;
        const range = SECTION_RANGES[sectionName];
        if (!range || !("peak" in range)) return;
        const r = range as { start: number; peak: number; end: number };

        const totalRange = r.end - r.start;
        const fadeInEnd = (r.peak - r.start) / totalRange;
        const holdEnd   = (r.peak + (r.end - r.peak) * 0.55 - r.start) / totalRange;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: `${r.start}% top`,
            end:   `${r.end}% top`,
            scrub: true,
          },
        });

        // Fade in: opacity + Y, NO blur
        tl.fromTo(sectionEl,
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: fadeInEnd, ease: "power2.out" }
        );
        // Hold
        tl.to(sectionEl, { duration: holdEnd - fadeInEnd });
        // Fade out (except for the footer, which stays visible at the end)
        if (sectionName !== "footer") {
          tl.to(sectionEl, { autoAlpha: 0, y: -20, duration: 1 - holdEnd, ease: "power2.in" });
        }
      });

      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", onMouseMove);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [phase]);

  const isScrollable = phase === "scrollable";
  const showLoading  = phase === "loading" || phase === "ready";

  return (
    <SmoothScroll enabled={isScrollable}>
      {/* Dragon canvas — fixed fullscreen, always rendered */}
      <ImageSequencePlayer
        ref={sequenceRef}
        onLoadProgress={handleLoadProgress}
        onLoadComplete={handleLoadComplete}
      />

      {/* Vignette fog — subtle edge darkening only */}
      <FogOverlay intensity={0.15} />

      {/* Ambient particles */}
      <ParticleField count={18} opacity={0.25} speed={0.10} />
      
      {/* Cinematic Glowing Embers */}
      <ParticleOverlay />

      {/* Loading gate */}
      {showLoading && (
        <LoadingScreen
          progress={loadProgress}
          isComplete={phase === "ready"}
          onEnter={handleEnter}
        />
      )}

      {/* Cinematic intro: frame 0 → 80 */}
      <CinematicIntro
        sequenceRef={sequenceRef}
        onComplete={handleIntroComplete}
        isPlaying={phase === "intro"}
      />

      {/* Navigation appears after intro */}
      {isScrollable && <Navigation visible={isScrollable} />}

      {/* Tall scroll container (700vh) driving frame sequence */}
      {isScrollable && (
        <div
          ref={scrollContainerRef}
          style={{ height: "700vh", position: "relative", zIndex: 5 }}
        >
          {/*
            All sections are fixed-position (via .scroll-overlay-section CSS).
            Hero starts at opacity:1 via CSS default.
            Others start at opacity:0, revealed by ScrollTrigger.
          */}
          <HeroSection />
          <AboutSection />
          <ExpertiseSection />
          <SolutionsSection />
          <ContactSection />
          <FooterSection />

          {/* Deep-link anchors */}
          <div id="hero"      style={{ position: "absolute", top: "0" }} />
          <div id="about"     style={{ position: "absolute", top: "100vh" }} />
          <div id="expertise" style={{ position: "absolute", top: "210vh" }} />
          <div id="solutions" style={{ position: "absolute", top: "330vh" }} />
          <div id="contact"   style={{ position: "absolute", top: "450vh" }} />
          <div id="contact-trigger" style={{ position: "absolute", top: "450vh" }} />
        </div>
      )}
    </SmoothScroll>
  );
}
