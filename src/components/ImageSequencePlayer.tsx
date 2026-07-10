"use client";

import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";

const TOTAL_FRAMES = 212;

// Source frame dimensions (all frames are identical 4K resolution)
const SRC_W = 3840;
const SRC_H = 2160;

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

type FrameImage = HTMLImageElement | ImageBitmap;

const ImageSequencePlayer = forwardRef<ImageSequenceHandle, ImageSequencePlayerProps>(
  ({ onLoadProgress, onLoadComplete, className = "" }, ref) => {
    const canvasRef      = useRef<HTMLCanvasElement>(null);
    const ctxRef         = useRef<CanvasRenderingContext2D | null>(null);
    const imagesRef      = useRef<FrameImage[]>([]);
    const pendingFrame   = useRef(0);
    const drawnFrame     = useRef(-1);
    const isLoadedRef    = useRef(false);
    const loadedCount    = useRef(0);
    const rafLoopId      = useRef(0);
    const precropRef     = useRef(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile after mount — avoids SSR hydration mismatch
    useEffect(() => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    }, []);

    // ── Blit — draw frame to canvas ─────────────────────────────────────────
    const blit = useCallback((frameIndex: number) => {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;
      const img = imagesRef.current[frameIndex];
      if (!img) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (precropRef.current) {
        // Mobile: bitmaps are already pre-cropped and resized to canvas dimensions.
        // Perfect 1:1 pixel blit — no runtime scaling, no upscaling blur.
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        // Desktop: source-crop from full-res 4K image at draw time
        const imgW = (img as HTMLImageElement).naturalWidth || (img as ImageBitmap).width;
        const imgH = (img as HTMLImageElement).naturalHeight || (img as ImageBitmap).height;
        if (!imgW || !imgH) return;

        const cW = canvas.width;
        const cH = canvas.height;
        const canvasAspect = cW / cH;
        const imgAspect = imgW / imgH;

        let sx = 0, sy = 0, sw = imgW, sh = imgH;
        if (canvasAspect < imgAspect) {
          sh = imgH;
          sw = Math.round(sh * canvasAspect);
          sx = Math.round((imgW - sw) / 2);
        } else {
          sw = imgW;
          sh = Math.round(sw / canvasAspect);
          sy = Math.round((imgH - sh) / 2);
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cW, cH);
      }
    }, []);

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
        // Cap DPR at 2 on mobile so canvas never exceeds source image pixel count.
        // At DPR 3 a phone creates a ~1290×2790 canvas, but the 4K source only has
        // 2160px of height — the browser must upscale → blur. At DPR 2 the canvas
        // is ~860×1860, which the 2160px source can downscale into → sharp.
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
    }, [blit]);

    // ── Preloader ────────────────────────────────────────────────────────────
    // On mobile: fetch → blob → createImageBitmap (pre-cropped & resized to
    //   canvas dimensions). Each stored bitmap is ~6 MB instead of ~33 MB,
    //   keeping total decoded memory at ~1.3 GB instead of ~7 GB.
    //   This prevents the mobile browser from silently evicting / downgrading
    //   decoded images — which was the root cause of the blur.
    // On desktop: new Image() at full 4K resolution (desktops have plenty RAM).
    useEffect(() => {
      const images: FrameImage[] = new Array(TOTAL_FRAMES);
      imagesRef.current = images;

      const mobile = window.matchMedia("(max-width: 768px)").matches;
      const hasBitmap = typeof createImageBitmap !== "undefined";
      const usePrecrop = mobile && hasBitmap;
      precropRef.current = usePrecrop;

      // Calculate canvas pixel dimensions (must match resize logic above)
      const dpr = mobile
        ? Math.min(window.devicePixelRatio || 1, 2)
        : (window.devicePixelRatio || 1);
      const cW = Math.round(window.innerWidth  * dpr);
      const cH = Math.round(window.innerHeight * dpr);

      // Pre-calculate the source crop rectangle from the 4K frames
      const canvasAspect = cW / cH;
      const imgAspect    = SRC_W / SRC_H;
      let cropX = 0, cropY = 0, cropW = SRC_W, cropH = SRC_H;
      if (canvasAspect < imgAspect) {
        cropH = SRC_H;
        cropW = Math.round(cropH * canvasAspect);
        cropX = Math.round((SRC_W - cropW) / 2);
      } else {
        cropW = SRC_W;
        cropH = Math.round(cropW / canvasAspect);
        cropY = Math.round((SRC_H - cropH) / 2);
      }

      // Lower concurrency on mobile to reduce simultaneous memory spikes
      const CONCURRENCY = mobile ? 3 : 6;
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

      const loadMobile = (i: number) => {
        fetch(getFramePath(i))
          .then(r => r.blob())
          .then(blob =>
            // Crop the center strip from the 4K source and resize to exact
            // canvas pixel dimensions in one GPU-accelerated decode step.
            // The browser only stores the small canvas-sized bitmap (~6 MB),
            // not the full 4K bitmap (~33 MB).
            createImageBitmap(blob, cropX, cropY, cropW, cropH, {
              resizeWidth:   cW,
              resizeHeight:  cH,
              resizeQuality: "high",
            })
          )
          .then(bitmap => {
            images[i] = bitmap;
            finish(i);
          })
          .catch(() => {
            // Fallback: load as regular Image if createImageBitmap fails
            const img = new Image();
            img.src = getFramePath(i);
            img.onload = () => { images[i] = img; finish(i); };
            img.onerror = () => finish(i);
          });
      };

      const loadDesktop = (i: number) => {
        const img = new Image();
        img.src = getFramePath(i);
        img.decode()
          .then(() => { images[i] = img; finish(i); })
          .catch(() => { images[i] = img; finish(i); });
      };

      const next = () => {
        while (active < CONCURRENCY && idx < TOTAL_FRAMES) {
          const i = idx++;
          active++;
          if (usePrecrop) {
            loadMobile(i);
          } else {
            loadDesktop(i);
          }
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
