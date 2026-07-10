"use client";

import React, { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { ImageSequenceHandle } from "./ImageSequencePlayer";

// The frame where the intro auto-play stops and scroll takes over
export const INTRO_END_FRAME = 80;

interface CinematicIntroProps {
  sequenceRef: React.RefObject<ImageSequenceHandle | null>;
  onComplete: () => void;
  isPlaying: boolean;
}

export default function CinematicIntro({
  sequenceRef,
  onComplete,
  isPlaying,
}: CinematicIntroProps) {
  const hasPlayed = useRef(false);

  const playSequence = useCallback(() => {
    if (hasPlayed.current) return;
    const seq = sequenceRef.current;
    if (!seq) return;
    hasPlayed.current = true;

    const obj = { frame: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        // Hold last frame for 300ms then signal ready for scroll
        setTimeout(onComplete, 300);
      },
    });

    // Cinematic dolly-out: frame 0 (eye closeup) → frame INTRO_END_FRAME
    // Faster duration for smoother 60fps-like playback instead of stuttering
    tl.to(obj, {
      frame: INTRO_END_FRAME,
      duration: 2.2, // 80 frames over 2.2s = ~36 fps
      ease: "power2.inOut",
      onUpdate: () => {
        const currentFrame = Math.round(obj.frame);
        seq.setFrame(currentFrame);
      },
    });
  }, [sequenceRef, onComplete]);

  useEffect(() => {
    if (isPlaying) {
      playSequence();
    }
  }, [isPlaying, playSequence]);

  return null; // This component drives the canvas, no DOM needed
}
