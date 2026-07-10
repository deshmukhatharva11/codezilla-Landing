/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { audioController } from "@/lib/audioController";


const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Expertise", href: "#expertise" },
  { label: "Solutions", href: "#solutions" },
  { label: "Contact", href: "#contact" },
];

interface NavigationProps {
  visible: boolean;
}

export default function Navigation({ visible }: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const hasRendered = useRef(false);

  useEffect(() => {
    hasRendered.current = true;
    const unsubscribe = audioController.subscribe((isMuted) => {
      setMuted(isMuted);
    });
    return () => unsubscribe();
  }, []);

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <>
      {/* ── Top bar ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-transparent"
      >
        <div className="flex items-center justify-between px-[5vw] h-20 max-w-[var(--content-max-width)] mx-auto w-full">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center p-1 rounded-xl bg-white/[0.04] border border-white/15 group-hover:border-[#00A8FF]/60 group-hover:shadow-[0_0_20px_rgba(0,168,255,0.3)] transition-all duration-300">
              <img src="/Logo/codezilla.jpg" alt="CodeZilla Logo" className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover" />
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[13px] sm:text-[14px] font-bold tracking-[0.35em] uppercase text-white group-hover:text-[#00A8FF] transition-colors duration-300"
                style={{ fontFamily: "var(--font-heading)", letterSpacing: "0.35em" }}
              >
                Codezilla
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A8FF] dot-pulse" />
            </div>
          </a>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Social Logos from public/Logo */}
            <a
              href="https://wa.me/919511650529"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-white/12 bg-white/[0.03] hover:border-[#25D366]/60 hover:bg-[#25D366]/15 hover:scale-105 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[#25D366]/25"
            >
              <img src="/Logo/whatsapp.png" alt="WhatsApp" className="w-4.5 h-4.5 sm:w-5 sm:h-5 object-contain" />
            </a>

            <a
              href="https://www.instagram.com/codezilla_.ts?igsh=emV6OGFxcG80Z2Jy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-white/12 bg-white/[0.03] hover:border-[#E1306C]/60 hover:bg-[#E1306C]/15 hover:scale-105 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[#E1306C]/25"
            >
              <img src="/Logo/instagram.svg" alt="Instagram" className="w-4.5 h-4.5 sm:w-5 sm:h-5 object-contain brightness-0 invert" />
            </a>

            {/* Audio toggle — scaled up */}
            <button
              onClick={() => audioController.toggleMute()}
              aria-label={muted ? "Unmute" : "Mute"}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
            >
              {muted ? (
                <svg className="w-4.5 h-4.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <div className="flex items-end gap-[2px] h-4 py-0.5">
                  <span className="w-[2.5px] bg-[#00A8FF] rounded-sm wave-bar h-full" />
                  <span className="w-[2.5px] bg-[#00A8FF] rounded-sm wave-bar h-[70%]" />
                  <span className="w-[2.5px] bg-[#00A8FF] rounded-sm wave-bar h-full" />
                </div>
              )}
            </button>

            {/* Let's Talk — pill — scaled up */}
            <button
              onClick={() => scrollTo("#contact")}
              className="hidden sm:flex items-center px-6 py-2.5 rounded-full border border-white/12 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05] text-btn-custom text-white/70 hover:text-white transition-all duration-300 cursor-pointer"
            >
              Let&apos;s Talk
            </button>

            {/* Menu toggle — pill — scaled up */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-white/12 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
            >
              <span className="text-btn-custom text-white/70 hover:text-white transition-colors">Menu</span>
              <div className="flex flex-col gap-[3px] w-3.5 h-3 justify-center">
                <span className={`h-[1.5px] bg-white/60 rounded transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[4.5px] w-full" : "w-full"}`} />
                <span className={`h-[1.5px] bg-white/60 rounded transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : "w-[70%]"}`} />
                <span className={`h-[1.5px] bg-white/60 rounded transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[4.5px] w-full" : "w-full"}`} />
              </div>
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Full-screen Menu Overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Dim backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide-in panel */}
            <motion.nav
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.55 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm flex flex-col justify-between pt-24 pb-10 px-10"
              style={{
                background: "rgba(2, 6, 23, 0.70)",
                backdropFilter: "blur(40px)",
                borderLeft: "1px solid rgba(0,163,255,0.07)",
              }}
            >
              {/* Ambient glow */}
              <div className="absolute top-1/4 right-0 w-48 h-48 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

              {/* Links */}
              <div className="flex flex-col gap-1">
                <p className="text-label mb-6">Navigation</p>
                {NAV_LINKS.map((link, i) => (
                  <motion.button
                    key={link.href}
                    onClick={() => scrollTo(link.href)}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    className="text-left py-3 text-2xl font-bold text-white/35 hover:text-[#00A8FF] transition-colors duration-300 cursor-pointer border-b border-white/[0.04] last:border-0 tracking-tight"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {link.label}
                  </motion.button>
                ))}
              </div>

              {/* Footer info */}
              <div>
                <p className="text-label mb-3">Est. 2026</p>
                <p className="text-body-custom leading-relaxed">
                  Websites, AI products, and brands built for digital depth and cinematic impact.
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
