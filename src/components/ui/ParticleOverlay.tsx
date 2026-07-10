"use client";

import React, { useEffect, useRef } from "react";

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

function makeEmber(width: number, height: number, randomLife = false): Ember {
  return {
    x: Math.random() * width,
    y: randomLife ? Math.random() * height : height + 10,
    vx: (Math.random() - 0.5) * 0.35,
    vy: -Math.random() * 0.8 - 0.15,
    size: Math.random() * 1.8 + 0.4,
    alpha: 0,
    life: randomLife ? Math.floor(Math.random() * 120) : 0,
    maxLife: Math.floor(Math.random() * 260 + 140),
  };
}

export default function ParticleOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // alpha:false avoids premultiplied alpha compositing overhead
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Detect low-performance devices
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const COUNT = isMobile ? 20 : 35; // Reduced from 60

    let width  = 0;
    let height = 0;

    const resize = () => {
      // No DPR scaling for particles — they're blurry dots, no one can tell
      width  = window.innerWidth;
      height = window.innerHeight;
      canvas.width  = width;
      canvas.height = height;
      canvas.style.width  = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Spawn embers with staggered initial life so they don't all fade in at once
    const embers: Ember[] = Array.from({ length: COUNT }, () => makeEmber(width, height, true));

    let rafId = 0;
    let tick  = 0;

    // Pre-built gradient for glow — created once, reused (avoids createRadialGradient in loop)
    // We use a simple alpha + fill approach instead of shadowBlur.
    // shadowBlur triggers a full-screen blur pass — catastrophic for performance.

    const render = () => {
      rafId = requestAnimationFrame(render);
      tick++;

      // Throttle particle UPDATES to 30fps but still RAF-paint at 60fps
      // This halves the JS computation cost while keeping the canvas refresh seamless
      if (tick % 2 !== 0) return;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.x  += e.vx;
        e.y  += e.vy;
        e.vx += (Math.random() - 0.5) * 0.012;
        e.life++;

        // Smooth fade in/out — no shadowBlur needed
        if (e.life < 50) {
          e.alpha = (e.life / 50) * 0.55;
        } else if (e.life > e.maxLife - 50) {
          e.alpha = ((e.maxLife - e.life) / 50) * 0.55;
        } else {
          e.alpha = 0.55;
        }

        // Reset when out of bounds or expired
        if (e.life >= e.maxLife || e.y < -10 || e.x < -10 || e.x > width + 10) {
          embers[i] = makeEmber(width, height, false);
          continue;
        }

        // Draw core dot
        ctx.globalAlpha = e.alpha;
        ctx.fillStyle = "#00A8FF";
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw soft halo with a second, larger, very transparent arc
        // This replaces shadowBlur with a cheap alpha-blended circle
        ctx.globalAlpha = e.alpha * 0.12;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1; // Reset
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none mix-blend-screen opacity-80"
      style={{
        zIndex: 1,
        transform: "translate3d(0,0,0)",
        willChange: "transform",
      }}
    />
  );
}
