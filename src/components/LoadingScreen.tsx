"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MagneticWrapper from "./ui/MagneticWrapper";
import TextType from "./ui/TextType";
import { audioController } from "@/lib/audioController";

interface LoadingScreenProps {
  progress: number;
  isComplete: boolean;
  onEnter: () => void;
}

function generateLoadingScreenParticles() {
  return Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    width: Math.random() * 3 + 1,
    height: Math.random() * 3 + 1,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    background: `rgba(0, ${Math.floor(120 + Math.random() * 80)}, 255, ${
      Math.random() * 0.4 + 0.1
    })`,
    boxShadow: `0 0 ${Math.random() * 6 + 2}px rgba(0, 163, 255, 0.3)`,
    targetY: -30 - Math.random() * 40,
    targetX: (Math.random() - 0.5) * 30,
    duration: 4 + Math.random() * 4,
    delay: Math.random() * 3,
  }));
}

export default function LoadingScreen({
  progress,
  isComplete,
  onEnter,
}: LoadingScreenProps) {
  const [showEnter, setShowEnter] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [particles, setParticles] = useState<{
    id: number;
    width: number;
    height: number;
    left: string;
    top: string;
    background: string;
    boxShadow: string;
    targetY: number;
    targetX: number;
    duration: number;
    delay: number;
  }[]>([]);

  useEffect(() => {
    audioController.init();
    const timer = setTimeout(() => {
      setParticles(generateLoadingScreenParticles());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => setShowEnter(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  const handleEnter = () => {
    audioController.play();
    setIsExiting(true);
    setTimeout(onEnter, 800);
  };

  const percentage = Math.round(progress * 100);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-transparent overflow-hidden"
        >
          {/* Volumetric fog background */}
          <div className="absolute inset-0">
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px]"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(0,40,120,0.3) 0%, rgba(0,20,80,0.1) 40%, transparent 70%)",
              }}
            />
            <motion.div
              animate={{
                opacity: [0.2, 0.4, 0.2],
                x: [-30, 30, -30],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[400px]"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(0,60,180,0.15) 0%, transparent 60%)",
              }}
            />
            <motion.div
              animate={{
                opacity: [0.15, 0.35, 0.15],
                x: [30, -30, 30],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[400px]"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(0,50,160,0.15) 0%, transparent 60%)",
              }}
            />
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  width: p.width,
                  height: p.height,
                  left: p.left,
                  top: p.top,
                  background: p.background,
                  boxShadow: p.boxShadow,
                }}
                animate={{
                  y: [0, p.targetY, 0],
                  x: [0, p.targetX, 0],
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: p.delay,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-center mb-4"
            >
              <TextType
                as="h1"
                text={["SYSTEM INITIALIZING...", "AWAKENING...", "CODEZILLA"]}
                typingSpeed={70}
                deletingSpeed={30}
                pauseDuration={1000}
                loop={false}
                showCursor={true}
                cursorCharacter="|"
                cursorClassName="text-[#00A8FF]"
                className="text-[20px] md:text-2xl font-bold tracking-[0.3em] uppercase text-white/80"
                style={{ fontFamily: "var(--font-heading)" }}
              />
            </motion.div>

            {/* Loading bar or Enter button */}
            <AnimatePresence mode="wait">
              {!showEnter ? (
                <motion.div
                  key="loading"
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center gap-4"
                >
                  {/* Progress bar */}
                  <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        width: `${percentage}%`,
                        background:
                          "linear-gradient(90deg, rgba(0,102,255,0.8), rgba(0,163,255,1))",
                        boxShadow: "0 0 10px rgba(0,163,255,0.5)",
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>
                  <motion.span
                    className="text-xs tracking-[0.2em] text-white/40 uppercase"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {percentage}%
                  </motion.span>
                </motion.div>
              ) : (
                <motion.div
                  key="enter"
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <MagneticWrapper strength={0.4}>
                    <div className="relative group">
                      <button
                        onClick={handleEnter}
                        className="relative inline-flex items-center justify-center p-[2px] font-semibold text-white bg-white/20 shadow-2xl cursor-pointer rounded-xl shadow-[var(--electric-blue)]/20 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95 overflow-hidden"
                      >
                        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--electric-blue)] via-blue-500 to-purple-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <span className="relative z-10 flex px-12 py-5 rounded-[10px] bg-[#020617] border border-white/5 w-full h-full items-center justify-center">
                          <div className="flex items-center gap-3">
                            <span
                              className="text-[14px] font-bold uppercase transition-all duration-500 group-hover:translate-x-1 tracking-[0.3em] whitespace-nowrap"
                              style={{ fontFamily: "var(--font-heading)" }}
                            >
                              ENTER PROTOCOL
                            </span>
                            <svg
                              className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1 text-[var(--electric-blue)] shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                clipRule="evenodd"
                                fillRule="evenodd"
                                d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                              />
                            </svg>
                          </div>
                        </span>
                      </button>
                    </div>
                  </MagneticWrapper>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
