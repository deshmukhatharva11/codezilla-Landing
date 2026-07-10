"use client";

import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";

const TOTAL_FRAMES = 212;

function getFramePath(index: number): string {
  const num = String(index + 1).padStart(3, "0");
  return `/frames/ezgif-frame-${num}.jpg`;
}

export interface ImageSequenceHandle {
  setFrame: (frame: number) => void;
  getCanvas: () => HTMLCanvasElement | null;
}

interface ImageSequencePlayerProps {
  onLoadProgress?: (progress: number) => void;
  onLoadComplete?: () => void;
  className?: string;
}

const ImageSequencePlayer = forwardRef<ImageSequenceHandle, ImageSequencePlayerProps>(
  ({ onLoadProgress, onLoadComplete, className = "" }, ref) => {
    const canvasRef    = useRef<HTMLCanvasElement>(null);
    const ctxRef       = useRef<CanvasRenderingContext2D | null>(null);
    const imagesRef    = useRef<HTMLImageElement[]>([]);
    const pendingFrame = useRef(0);
    const drawnFrame   = useRef(-1);
    const isLoadedRef  = useRef(false);
    const loadedCount  = useRef(0);
    const rafLoopId    = useRef(0);
    const geoRef = useRef({ sx: 0, sy: 0, sw: 0, sh: 0 });
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile after mount — avoids SSR hydration mismatch
    useEffect(() => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    }, []);

    // ── Recalculate cover-fit geometry — only runs on resize ─────────────────
    const updateGeo = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas || !imagesRef.current[0]) return;
      const img = imagesRef.current[0];
      const cW = canvas.width;
      const cH = canvas.height;
      if (!cW || !cH || !img.naturalWidth || !img.naturalHeight) return;

      const canvasAspect = cW / cH;
      const imgAspect = img.naturalWidth / img.naturalHeight;

      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

      if (canvasAspect < imgAspect) {
        // Canvas is narrower/taller than 16:9 image (mobile phone portrait screen)
        // Crop the left and right sides of the 4K source image cleanly
        sh = img.naturalHeight;
        sw = sh * canvasAspect;
        sx = (img.naturalWidth - sw) / 2;
        sy = 0;
      } else {
        // Canvas is wider than 16:9 image (ultra-wide desktop screen)
        // Crop the top and bottom of the 4K source image cleanly
        sw = img.naturalWidth;
        sh = sw / canvasAspect;
        sx = 0;
        sy = (img.naturalHeight - sh) / 2;
      }

      geoRef.current = {
        sx: Math.round(sx),
        sy: Math.round(sy),
        sw: Math.round(sw),
        sh: Math.round(sh),
      };
    }, []);

    // ── Pure blit — zero allocations, just copies pixels ─────────────────────
    const blit = useCallback((frameIndex: number) => {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;
      const img = imagesRef.current[frameIndex];
      if (!img) return;
      if (geoRef.current.sw === 0) {
        updateGeo();
      }
      const { sx, sy, sw, sh } = geoRef.current;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (sw > 0 && sh > 0) {
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      }
    }, [updateGeo]);

    // ── Dedicated RAF loop ───────────────────────────────────────────────────
    const startRafLoop = useCallback(() => {
      const loop = () => {
        const f = pendingFrame.current;
        if (f !== drawnFrame.current && imagesRef.current[f]) {
          drawnFrame.current = f;
          blit(f);
        }
        rafLoopId.current = requestAnimationFrame(loop);
      };
      rafLoopId.current = requestAnimationFrame(loop);
    }, [blit]);

    const setFrame = useCallback((frame: number) => {
      pendingFrame.current = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frame)));
    }, []);

    useImperativeHandle(ref, () => ({
      setFrame,
      getCanvas: () => canvasRef.current,
    }));

    // ── Resize — recache ctx after backing store changes ─────────────────────
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const mobile = window.matchMedia("(max-width: 768px)").matches;

      const resize = () => {
        // Use exact physical device pixel ratio without capping for 100% native clarity on mobile & desktop
        const dpr = window.devicePixelRatio || 1;
        canvas.width  = Math.round(window.innerWidth  * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
        canvas.style.width  = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctxRef.current = canvas.getContext("2d", { alpha: false });
        if (ctxRef.current) {
          ctxRef.current.imageSmoothingEnabled = true;
          ctxRef.current.imageSmoothingQuality = "high";
        }
        updateGeo();
        drawnFrame.current = -1;
        blit(pendingFrame.current);
      };

      resize();

      // On mobile, debounce resize to avoid address-bar jitter destroying the canvas buffer mid-scroll
      let resizeTimer: ReturnType<typeof setTimeout>;
      const onResize = () => {
        if (mobile) {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(resize, 250);
        } else {
          resize();
        }
      };

      window.addEventListener("resize", onResize, { passive: true });
      return () => {
        window.removeEventListener("resize", onResize);
        clearTimeout(resizeTimer);
      };
    }, [blit, updateGeo]);

    // ── Preloader — img.decode() forces async JPEG decompression ─────────────
    useEffect(() => {
      const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
      imagesRef.current = images;

      const CONCURRENCY = 6;
      let idx  = 0;
      let active = 0;

      const next = () => {
        while (active < CONCURRENCY && idx < TOTAL_FRAMES) {
          const i = idx++;
          active++;

          const img = new Image();
          img.src = getFramePath(i);

          const done = (ok: boolean) => {
            if (ok || !images[i]) images[i] = img;
            active--;
            loadedCount.current++;
            onLoadProgress?.(loadedCount.current / TOTAL_FRAMES);

            if (i === 0) { updateGeo(); blit(0); }

            if (loadedCount.current === TOTAL_FRAMES) {
              isLoadedRef.current = true;
              onLoadComplete?.();
              startRafLoop();
            } else {
              next();
            }
          };

          img.decode().then(() => done(true)).catch(() => done(false));
        }
      };

      next();

      return () => { cancelAnimationFrame(rafLoopId.current); };
    }, [blit, updateGeo, startRafLoop, onLoadComplete, onLoadProgress]);

    return (
      <canvas
        ref={canvasRef}
        className={`fixed top-0 left-0 ${className}`}
        style={{
          width: "100%",
          height: "100%",
          zIndex: 0,
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          filter: isMobile ? "none" : "contrast(1.06) saturate(1.14) brightness(1.03)",
        }}
      />
    );
  }
);

ImageSequencePlayer.displayName = "ImageSequencePlayer";

export default ImageSequencePlayer;
export { TOTAL_FRAMES };
