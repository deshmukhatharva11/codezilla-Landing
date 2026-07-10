"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

gsap.registerPlugin(ScrollTrigger);

const SOLUTIONS = [
  {
    num: "01",
    title: "Enterprise AI",
    desc: "End-to-end AI solutions with predictive analytics and intelligent automation at scale.",
    tags: ["ML", "NLP", "Analytics"],
    icon: (
      <svg className="w-5 h-5" style={{ color: "var(--electric-blue)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Digital Transformation",
    desc: "Legacy system modernization into resilient cloud-native architectures.",
    tags: ["Cloud", "Migration", "DevOps"],
    icon: (
      <svg className="w-5 h-5" style={{ color: "var(--electric-blue)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Immersive Experiences",
    desc: "Award-worthy web applications pushing every browser boundary.",
    tags: ["WebGL", "Animation", "3D"],
    icon: (
      <svg className="w-5 h-5" style={{ color: "var(--electric-blue)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Mobile Ecosystem",
    desc: "Cross-platform apps with native performance and real-time sync.",
    tags: ["iOS", "Android", "Flutter"],
    icon: (
      <svg className="w-5 h-5" style={{ color: "var(--electric-blue)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function SolutionsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const items = listRef.current?.querySelectorAll(".sol-card-wrapper");
    gsap.set(headingRef.current, { opacity: 0, y: 30 });
    if (items) gsap.set(items, { opacity: 0, y: 30, scale: 0.95 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });

    tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
    if (items) {
      tl.to(items, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12, ease: "back.out(1.2)" }, "-=0.4");
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => { if (t.trigger === el) t.kill(); });
    };
  }, []);

  return (
    <div ref={sectionRef} className="scroll-overlay-section" data-section="solutions">
      <div className="scroll-overlay-content">
        <div className="content-left-col">
          {/* Heading */}
          <div ref={headingRef} className="mb-5">
            <div className="section-meta-row">
              <p className="text-label">What We Do</p>
            </div>
            <h2 className="text-section-title" style={{ fontFamily: "var(--font-heading)" }}>
              Our <span className="text-accent-blue">Solutions.</span>
            </h2>
          </div>

          {/* Stack of 3D cards */}
          <div ref={listRef} className="flex flex-col gap-4">
            {SOLUTIONS.map((s, i) => (
              <div key={i} className="sol-card-wrapper">
                <CardContainer containerClassName="py-0 w-full" className="w-full">
                  <CardBody className="awwwards-card w-full px-8 md:px-10 py-7 md:py-8 flex flex-col gap-3">
                    
                    <CardItem translateZ={30} className="w-full flex flex-col gap-3">
                      {/* Header Layout (Icon + Top Text + Title + Tags) */}
                      <div className="flex items-start gap-3">
                        {s.icon && (
                          <div className="icon-badge mt-0.5">
                            {s.icon}
                          </div>
                        )}
                        <div className="flex flex-col justify-center flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 mb-1">
                            SOLUTION • {s.num}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <p className="text-[14px] md:text-[15px] font-bold uppercase tracking-widest text-[var(--electric-blue)]">
                              {s.title}
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {s.tags.map(tag => (
                                <span key={tag} className="tag-chip">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description below */}
                      <div className="w-full">
                        <p className="text-[13px] md:text-[14px] text-white/65 leading-relaxed font-medium">
                          {s.desc}
                        </p>
                      </div>
                    </CardItem>

                  </CardBody>
                </CardContainer>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
