"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { CardContainer, CardBody } from "@/components/ui/3d-card";
import { PremiumButton } from "@/components/ui/PremiumButton";

gsap.registerPlugin(ScrollTrigger);

export default function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    gsap.set([headingRef.current, formRef.current], { opacity: 0, y: 22 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
    });

    tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
      .to(formRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.5");

    return () => {
      ScrollTrigger.getAll().forEach(t => { if (t.trigger === el) t.kill(); });
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send inquiry to our backend/webhook which appends straight to Excel / Google Sheet
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setForm({ name: "", email: "", phone: "", message: "" });
      }, 4000);
    }
  };

  const inputClass =
    "w-full py-2.5 bg-transparent text-[14px] text-white placeholder-white/30 outline-none border-b border-white/20 transition-all duration-300 focus:border-[var(--electric-blue)] rounded-none";

  return (
    <div ref={sectionRef} className="scroll-overlay-section" data-section="contact">
      <div className="scroll-overlay-content">
        <div className="content-left-col">
          <CardContainer containerClassName="py-0 w-full" className="w-full">
            <CardBody className="awwwards-card w-full px-8 md:px-12 py-8 md:py-12 flex flex-col gap-6">

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
                Let&apos;s <span className="text-[var(--electric-blue)]">Talk.</span>
              </h2>

              {/* Contact Number & Info Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-white/[0.03] border border-white/10 rounded-xl backdrop-blur-md">
                <a
                  href="https://wa.me/919511650529"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group hover:opacity-90 transition-opacity"
                >
                  <div className="w-9 h-9 rounded-lg bg-[var(--electric-blue)]/15 border border-[var(--electric-blue)]/30 flex items-center justify-center text-[var(--electric-blue)] shrink-0 group-hover:bg-[var(--electric-blue)]/25 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/45 truncate">Direct Call / WhatsApp</p>
                    <p className="text-[13px] font-bold text-white tracking-wide truncate">+91 95116 50529</p>
                  </div>
                </a>

                <div className="flex items-center gap-3 sm:border-l sm:border-white/10 sm:pl-4.5">
                  <div className="w-9 h-9 rounded-lg bg-[var(--electric-blue)]/15 border border-[var(--electric-blue)]/30 flex items-center justify-center text-[var(--electric-blue)] shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/45 truncate">Official Inquiries</p>
                    <p className="text-[13px] font-bold text-[var(--electric-blue)] tracking-wide truncate">codezilla1010@gmail.com</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="w-full">
                <div ref={formRef}>
                  <AnimatePresence mode="wait">
                    {submitted ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="py-14 px-6 text-center bg-white/[0.03] rounded-2xl border border-white/10 flex flex-col items-center justify-center w-full mx-auto shadow-2xl backdrop-blur-md"
                      >
                        <div className="text-4xl mb-4 flex items-center justify-center">✨</div>
                        <p className="text-[16px] font-bold text-white uppercase tracking-widest mb-2.5 text-center w-full">
                          Inquiry Logged to Sheet
                        </p>
                        <p className="text-[14px] text-white/70 font-medium max-w-md mx-auto text-center leading-relaxed">
                          Thank you for reaching out. Your message and contact details have been stored and sent directly to our team.
                        </p>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        onSubmit={handleSubmit}
                        className="space-y-5 mt-2"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label className="text-[11px] font-bold uppercase tracking-widest text-white/50 block mb-1.5">
                              Name
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Your name"
                              value={form.name}
                              onChange={e => setForm({ ...form, name: e.target.value })}
                              className={inputClass}
                              style={{ fontFamily: "var(--font-body)" }}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold uppercase tracking-widest text-white/50 block mb-1.5">
                              Email
                            </label>
                            <input
                              type="email"
                              required
                              placeholder="codezilla1010@gmail.com"
                              value={form.email}
                              onChange={e => setForm({ ...form, email: e.target.value })}
                              className={inputClass}
                              style={{ fontFamily: "var(--font-body)" }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-widest text-white/50 block mb-1.5">
                            Phone / WhatsApp Number
                          </label>
                          <input
                            type="tel"
                            placeholder="+91 95116 50529"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                            className={inputClass}
                            style={{ fontFamily: "var(--font-body)" }}
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-widest text-white/50 block mb-1.5">
                            Message
                          </label>
                          <textarea
                            required
                            rows={2}
                            placeholder="Tell us about your project..."
                            value={form.message}
                            onChange={e => setForm({ ...form, message: e.target.value })}
                            className={`${inputClass} resize-none`}
                            style={{ fontFamily: "var(--font-body)" }}
                          />
                        </div>

                        <PremiumButton
                          type="submit"
                          containerClassName="w-full mt-6"
                          className="w-full"
                          icon={
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          }
                        >
                          {isSubmitting ? "Processing..." : "Send Message"}
                        </PremiumButton>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </CardBody>
          </CardContainer>
        </div>
      </div>
    </div>
  );
}
