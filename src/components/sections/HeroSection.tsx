"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

export default function HeroSection() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const tagRef = useRef<HTMLParagraphElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  // Animate in on mount — no ScrollTrigger, hero is immediately visible
  useEffect(() => {
    const els = [tagRef.current, headingRef.current, infoRef.current];
    gsap.set(els, { opacity: 0, y: 20 });

    // Stagger reveal once mounted (after intro completes)
    const tl = gsap.timeline({ delay: 0.1 });
    tl.to(tagRef.current,     { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" })
      .to(headingRef.current, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }, "-=0.4")
      .to(infoRef.current,    { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.5");

    return () => { tl.kill(); };
  }, []);

  return (
    <div className="scroll-overlay-section" data-section="hero">
      <div className="scroll-overlay-content">
        <div className="content-left-col">

          {/* ── Electric label with decorative line ── */}
          <div className="section-meta-row" ref={tagRef}>
            <p className="text-label">Guardians of Innovation</p>
          </div>

          {/* ── HERO HEADING — pure white + electric accent ── */}
          <h1 ref={headingRef} className="text-hero-massive mb-10 md:mb-20">
            Designed<br />
            to command<br />
            <span className="text-accent-blue">depth.</span>
          </h1>

          {/* ── Info card — now a 3D floating card ── */}
          <div ref={infoRef} className="w-full mt-10 md:mt-0">
            <CardContainer containerClassName="py-0 w-full" className="w-full">
              <CardBody className="glass-card w-full px-10 md:px-12 py-8 md:py-10 flex flex-col gap-5">

                <CardItem translateZ={30} className="w-full flex flex-col gap-5">
                  {/* Icon row */}
                  <div className="flex items-center gap-4">
                    <div className="icon-badge">
                      <svg
                        className="w-5 h-5"
                        style={{ color: "var(--electric-blue)" }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
                      </svg>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/35 mb-1">Est. 2026</p>
                      <p className="text-[13px] font-bold uppercase tracking-widest" style={{ color: "rgba(0,168,255,0.85)" }}>CodeZilla</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[15px] md:text-[17px] text-white/75 leading-relaxed font-medium" style={{ maxWidth: "360px" }}>
                    Websites, AI products, and brands built for clarity, scale, and cinematic impact.
                  </p>
                </CardItem>

              </CardBody>
            </CardContainer>
          </div>

        </div>
      </div>
    </div>
  );
}
