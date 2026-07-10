"use client";

import React, { useRef, useEffect } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  pulseSpeed: number;
  pulseOffset: number;
}

interface ParticleFieldProps {
  count?: number;
  className?: string;
  color?: string;
  maxSize?: number;
  speed?: number;
  opacity?: number;
}

export default function ParticleField({
  count = 80,
  className = "",
  color = "0, 163, 255",
  maxSize = 3,
  speed = 0.3,
  opacity = 1,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 }); // Start offscreen so no force at load
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // DPR=1 for particles — they're soft dots, sharp pixels are wasted here
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const particleCount = isMobile ? Math.floor(count * 0.4) : count;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * maxSize + 0.5,
        speedX: (Math.random() - 0.5) * speed,
        speedY: (Math.random() - 0.5) * speed - 0.1,
        opacity: Math.random() * 0.5 + 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = particles;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const INFLUENCE_RADIUS_SQ = 150 * 150; // Compare squared distances — no Math.sqrt needed

    let time = 0;
    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.clearRect(0, 0, w, h);
      time++;

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        // Squared-distance mouse influence — avoids Math.sqrt entirely
        const dx = mx - p.x;
        const dy = my - p.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < INFLUENCE_RADIUS_SQ && distSq > 0) {
          const dist = Math.sqrt(distSq); // Only sqrt when actually within range
          const force = (150 - dist) / 150;
          p.x -= (dx / dist) * force * 0.4;
          p.y -= (dy / dist) * force * 0.4;
        }

        // Wrap
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.3 + 0.7;
        const alpha = p.opacity * pulse * opacity;

        // Just draw one circle per particle — no glow arc
        // The glow arcs (second beginPath/arc/fill) cost 40% of the draw budget
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${color})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [count, color, maxSize, speed, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2,
        transform: "translate3d(0,0,0)",
      }}
    />
  );
}
