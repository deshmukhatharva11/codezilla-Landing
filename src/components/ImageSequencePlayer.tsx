"use client";

import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";

const TOTAL_FRAMES = 212;
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
    const canvasRef    = useRef<HTMLCanvasElement>(null);
    const ctxRef       = useRef<CanvasRenderingContext2D | null>(null);
    const imagesRef    = useRef<FrameImage[]>([]);
    const pendingFrame = useRef(0);
    const drawnFrame   = useRef(-1);
    const isLoadedRef  = useRef(false);
    const loadedCount  = useRef(0);
    const rafLoopId    = useRef(0);
    const precropRef   = useRef(false);
    const [isMobile, setIsMobile] = useState(false);

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
        // Mobile: bitmaps are already pre-cropped to canvas size → 1:1 blit
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        // Desktop: source-crop from full-resolution image at draw time
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

    // ── RAF loop ─────────────────────────────────────────────────────────────
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

    // ── Resize ───────────────────────────────────────────────────────────────
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const mobile = window.matchMedia("(max-width: 768px)").matches;

      const resize = () => {
        // Cap DPR at 2 on mobile. At DPR 3 the canvas is ~1290×2790 but the
        // 4K source only has 2160px height → forced upscale → blur.
        // At DPR 2 the canvas is ~860×1860, which the 2160px source can
        // downscale into cleanly → sharp.
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
    // WHY MOBILE IMAGES WERE BLURRY:
    // 212 frames × 3840×2160 = 212 × 33 MB = ~7 GB of decoded pixels.
    // Mobile browsers cap at ~1-2 GB. When exceeded, the browser silently
    // evicts decoded image data and serves a low-res placeholder → blur.
    //
    // FIX (mobile only):
    //   1. Load each frame as new Image() at full 4K (proven, reliable).
    //   2. Paint the center crop onto a temporary canvas at canvas dimensions
    //      using the standard 9-arg drawImage (works in ALL browsers).
    //   3. Convert the temp canvas to a GPU-pinned ImageBitmap using the
    //      basic createImageBitmap(canvas) form (no options, universal support).
    //   4. Release the full-res Image (~33 MB) and temp canvas (~6 MB).
    //   5. Only the compact ~6 MB ImageBitmap is kept in memory.
    //   Result: 212 × 6 MB = ~1.3 GB total. Fits in mobile memory. Sharp.
    //
    // Desktop: loads full 4K Images directly (desktops have 16+ GB RAM).
    //
    useEffect(() => {
      const images: FrameImage[] = new Array(TOTAL_FRAMES);
      imagesRef.current = images;

      const mobile = window.matchMedia("(max-width: 768px)").matches;
      const hasBitmap = typeof createImageBitmap !== "undefined";
      const usePrecrop = mobile && hasBitmap;
      precropRef.current = usePrecrop;

      // Calculate canvas pixel dimensions (must match resize logic)
      const dpr = mobile
        ? Math.min(window.devicePixelRatio || 1, 2)
        : (window.devicePixelRatio || 1);
      const cW = Math.round(window.innerWidth  * dpr);
      const cH = Math.round(window.innerHeight * dpr);

      // Pre-calculate source crop rectangle from 4K frames for mobile
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

      // Lower concurrency on mobile to limit peak transient memory
      // (each in-flight frame briefly holds ~33 MB full-res + ~6 MB bitmap)
      const CONCURRENCY = mobile ? 2 : 6;
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

      // ── Mobile loader: Image → canvas crop → ImageBitmap ──────────────
      const loadMobile = (i: number) => {
        const img = new Image();
        img.src = getFramePath(i);
        img.decode()
          .then(async () => {
            try {
              // Paint just the needed center-crop at exact canvas resolution
              const tmp = document.createElement("canvas");
              tmp.width = cW;
              tmp.height = cH;
              const tmpCtx = tmp.getContext("2d", { alpha: false })!;
              tmpCtx.imageSmoothingEnabled = true;
              tmpCtx.imageSmoothingQuality = "high";
              tmpCtx.drawImage(
                img,
                cropX, cropY, cropW, cropH, // source crop from 4K
                0, 0, cW, cH               // destination = full canvas
              );

              // Create a GPU-pinned bitmap from the pre-rendered canvas.
              // Uses the basic createImageBitmap(canvas) — no options needed,
              // so it works on Chrome, Firefox, Safari, Brave, etc.
              const bitmap = await createImageBitmap(tmp);

              // Release the 33 MB full-res image and 6 MB temp canvas.
              // Only the 6 MB ImageBitmap survives — GPU-pinned, never evicted.
              img.src = "";
              tmp.width = 0;
              tmp.height = 0;

              images[i] = bitmap;
              finish(i);
            } catch {
              // Fallback: keep the full-res Image if bitmap creation fails
              images[i] = img;
              finish(i);
            }
          })
          .catch(() => {
            // If decode fails, try onload as last resort
            const fallback = new Image();
            fallback.onload = () => { images[i] = fallback; finish(i); };
            fallback.onerror = () => finish(i);
            fallback.src = getFramePath(i);
          });
      };

      // ── Desktop loader: full-res Image directly ───────────────────────
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
