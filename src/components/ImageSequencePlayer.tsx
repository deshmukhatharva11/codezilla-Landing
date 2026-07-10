"use client";

import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";

const TOTAL_FRAMES = 212;

function getFramePath(index: number, mobile: boolean): string {
  const num = String(index + 1).padStart(3, "0");
  // Mobile: serve pre-resized 1080×608 WebP frames (avg 61 KB, 2.5 MB decoded each)
  // vs 4K JPEG frames (avg 144 KB, 33 MB decoded each → 7 GB total → browser blur)
  if (mobile) return `/frames-mobile/frame-${num}.webp`;
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
    const isMobileRef  = useRef(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const m = window.matchMedia("(max-width: 768px)").matches;
      setIsMobile(m);
      isMobileRef.current = m;
    }, []);

    // ── Draw one frame onto canvas ───────────────────────────────────────────
    const blit = useCallback((frameIndex: number) => {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;
      const img = imagesRef.current[frameIndex];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const cW = canvas.width;
      const cH = canvas.height;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, cW, cH);

      // Cover-fit: crop source to fill canvas exactly
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const canvasAspect = cW / cH;
      const imgAspect    = imgW / imgH;

      let sx = 0, sy = 0, sw = imgW, sh = imgH;
      if (canvasAspect < imgAspect) {
        sw = Math.round(imgH * canvasAspect);
        sx = Math.round((imgW - sw) / 2);
      } else {
        sh = Math.round(imgW / canvasAspect);
        sy = Math.round((imgH - sh) / 2);
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cW, cH);
    }, []);

    // ── RAF loop ─────────────────────────────────────────────────────────────
    const startRafLoop = useCallback(() => {
      const loop = () => {
        const f = pendingFrame.current;
        if (f !== drawnFrame.current && imagesRef.current[f]?.complete) {
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

    // ── Resize ───────────────────────────────────────────────────────────────
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const mobile = window.matchMedia("(max-width: 768px)").matches;

      const resize = () => {
        // Mobile WebP frames are 1080×608. At DPR 2 the canvas is 860×1860 —
        // the 1080px source downscales cleanly → sharp, no upscale blur.
        // At DPR 1 it's 430×930, also fine since we downscale from 1080px.
        const dpr = mobile
          ? Math.min(window.devicePixelRatio || 1, 2)
          : (window.devicePixelRatio || 1);
        canvas.width  = Math.round(window.innerWidth  * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
        canvas.style.width  = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctxRef.current = canvas.getContext("2d", { alpha: false });
        if (ctxRef.current) {
          ctxRef.current.imageSmoothingEnabled = true;
          ctxRef.current.imageSmoothingQuality = "high";
        }
        drawnFrame.current = -1;
        blit(pendingFrame.current);
      };

      resize();

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
    }, [blit]);

    // ── Preloader ────────────────────────────────────────────────────────────
    //
    // Mobile: loads 1080×608 WebP frames (avg 61 KB file, 2.5 MB decoded each)
    //   Total decoded: 212 × 2.5 MB = ~530 MB  ← fits in mobile browser
    //
    // Desktop: loads 4K JPEG frames (avg 144 KB file, 33 MB decoded each)
    //   Total decoded: 212 × 33 MB  = ~7 GB    ← fine on desktop with 16+ GB RAM
    //
    useEffect(() => {
      const mobile = window.matchMedia("(max-width: 768px)").matches;
      const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
      imagesRef.current = images;

      const CONCURRENCY = mobile ? 4 : 6;
      let idx = 0;
      let active = 0;

      const finish = (i: number) => {
        active--;
        loadedCount.current++;
        onLoadProgress?.(loadedCount.current / TOTAL_FRAMES);
        if (i === 0) blit(0);
        if (loadedCount.current === TOTAL_FRAMES) {
          isLoadedRef.current = true;
          onLoadComplete?.();
          startRafLoop();
        } else {
          next();
        }
      };

      const next = () => {
        while (active < CONCURRENCY && idx < TOTAL_FRAMES) {
          const i = idx++;
          active++;
          const img = new Image();
          img.src = getFramePath(i, mobile);
          img.decode()
            .then(() => { images[i] = img; finish(i); })
            .catch(() => { images[i] = img; finish(i); });
        }
      };

      next();

      return () => { cancelAnimationFrame(rafLoopId.current); };
    }, [blit, startRafLoop, onLoadComplete, onLoadProgress]);

    return (
      <canvas
        ref={canvasRef}
        className={`fixed top-0 left-0 ${className}`}
        style={{
          width:  "100%",
          height: "100%",
          zIndex: 0,
          transform:        "translateZ(0)",
          backfaceVisibility: "hidden",
          // DOM filter is safe on desktop; skip on mobile to prevent WebKit texture downsampling
          filter: isMobile ? "none" : "contrast(1.06) saturate(1.14) brightness(1.03)",
        }}
      />
    );
  }
);

ImageSequencePlayer.displayName = "ImageSequencePlayer";

export default ImageSequencePlayer;
export { TOTAL_FRAMES };
