"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CardFanCarousel from "@/components/ui/card-fan-carousel";

gsap.registerPlugin(ScrollTrigger);

// Portrait tech images (400×700) — one per service
const SERVICE_CARDS = [
  {
    imgUrl: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&h=700&fit=crop",
    alt: "AI & Machine Learning",
    title: "AI & Machine Learning",
    desc: "Predictive analytics, NLP, and intelligent automation at enterprise scale.",
    icon: (
      <svg className="w-5 h-5" style={{ color: "var(--electric-blue)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    imgUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=700&fit=crop",
    alt: "Web Development",
    title: "Web Development",
    desc: "High-performance applications pushing every browser boundary.",
    icon: (
      <svg className="w-5 h-5" style={{ color: "var(--electric-blue)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    imgUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=700&fit=crop",
    alt: "Mobile Apps",
    title: "Mobile Apps",
    desc: "Cross-platform excellence with native performance and real-time sync.",
    icon: (
      <svg className="w-5 h-5" style={{ color: "var(--electric-blue)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    imgUrl: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=700&fit=crop",
    alt: "UI/UX Design",
    title: "UI/UX Design",
    desc: "Award-worthy interfaces and intuitive, frictionless journeys.",
    icon: (
      <svg className="w-5 h-5" style={{ color: "var(--electric-blue)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    imgUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=700&fit=crop",
    alt: "Cloud Architecture",
    title: "Cloud Architecture",
    desc: "AWS, GCP, Azure — infrastructures resilient by design.",
    icon: (
      <svg className="w-5 h-5" style={{ color: "var(--electric-blue)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
  },
  {
    imgUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=700&fit=crop",
    alt: "Blockchain & Web3",
    title: "Blockchain & Web3",
    desc: "Smart contracts, DeFi, and decentralized trust ecosystems.",
    icon: (
      <svg className="w-5 h-5" style={{ color: "var(--electric-blue)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
];

export default function ExpertiseSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    gsap.set(headingRef.current, { opacity: 0, y: 30 });
    gsap.set(carouselRef.current, { opacity: 0, y: 20 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 80%", once: true },
    });

    tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
      .to(carouselRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3");
  }, []);

  return (
    <div ref={sectionRef} className="scroll-overlay-section" data-section="expertise">
      <div className="scroll-overlay-content">

        {/* Heading snaps to the global left column */}
        <div ref={headingRef} className="content-left-col mb-4 md:mb-6">
          <div className="section-meta-row">
            <p className="text-label">What We Master</p>
          </div>
          <h2 className="text-section-title">
            Our <span className="text-accent-blue">Arsenal.</span>
          </h2>
        </div>

        {/* Carousel spans the full 12 columns to fan out gracefully */}
        <div ref={carouselRef} className="col-span-12 w-full h-[380px] md:h-[440px] -mt-2 md:-mt-6">
          <CardFanCarousel cards={SERVICE_CARDS} />
        </div>

      </div>
    </div>
  );
}
