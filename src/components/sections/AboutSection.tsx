"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CardContainer, CardBody } from "@/components/ui/3d-card";

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    gsap.set([headingRef.current, textRef.current], { opacity: 0, y: 20 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
    });
    tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" })
      .to(textRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.5");

    return () => { ScrollTrigger.getAll().forEach(t => { if (t.trigger === el) t.kill(); }); };
  }, []);

  return (
    <div ref={sectionRef} className="scroll-overlay-section" data-section="about">
      <div className="scroll-overlay-content">
        <div className="content-left-col">
          <CardContainer containerClassName="py-0 w-full" className="w-full">
            <CardBody className="awwwards-card w-full px-8 md:px-14 py-10 md:py-14 flex flex-col gap-6">
              {/* Logo Header */}
              <div className="flex items-center gap-4">
                <div className="icon-badge">
                  <svg className="w-5 h-5" style={{ color: "var(--electric-blue)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
                  </svg>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/35 mb-1">
                    EST. 2026
                  </p>
                  <p className="text-[13px] font-bold uppercase tracking-widest text-[var(--electric-blue)]">
                    CODEZILLA
                  </p>
                </div>
              </div>

              {/* Heading */}
              <h2 ref={headingRef} className="text-section-title">
                Born from<br />
                <span className="text-[var(--electric-blue)]">Fire.</span>
              </h2>

              {/* Body text */}
              <div ref={textRef} className="flex flex-col gap-5 max-w-[480px]">
                <p className="text-[15px] md:text-[17px] font-medium leading-relaxed text-white/90">
                  We are a collective of engineers, designers, and visionaries who believe technology should feel{" "}
                  <span className="text-white font-semibold">extraordinary</span>.
                </p>
                <p className="text-[13px] md:text-[14px] text-white/60 leading-loose">
                  Born from the passion to push boundaries, CodeZilla stands as a guardian of innovation in the digital landscape. Every project we undertake is treated as a{" "}
                  <span className="text-white/80 font-medium">masterpiece</span>.
                </p>
              </div>
            </CardBody>
          </CardContainer>
        </div>
      </div>
    </div>
  );
}
