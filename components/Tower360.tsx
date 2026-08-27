"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCw } from "lucide-react";

// public/gallery/360 holds one render per 15° of a single horizontal orbit, so
// stepping through them in order reads as walking around the tower.
const FRAME_COUNT = 24;
const framePath = (index: number) =>
  `/gallery/360/360.${String(index).padStart(4, "0")}.webp`;

// One drag across the full width turns the building all the way round; the floor
// keeps the gesture workable on a narrow phone.
const FRAMES_PER_WIDTH = FRAME_COUNT;
const MIN_PX_PER_FRAME = 16;

// Frames are fetched and decoded once per session and held in module scope:
// swapping <img src> between warm frames is what makes the drag feel like one
// continuous rotation rather than a slideshow.
let preloadPromise: Promise<void> | null = null;
const warmFrames: HTMLImageElement[] = [];

/**
 * Starts fetching the orbit. Safe to call repeatedly — the work happens once.
 * The intro screens call this so the frames are warm by the time the visitor
 * reaches the tower.
 */
export function preload360(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  if (!preloadPromise) {
    preloadPromise = Promise.all(
      Array.from({ length: FRAME_COUNT }, (_, index) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          // Resolve either way: a missing frame shouldn't hold the orbit back.
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = framePath(index);
          warmFrames.push(img);
        });
      }),
    ).then(() => undefined);
  }

  return preloadPromise;
}

const framesAreWarm = () =>
  warmFrames.length === FRAME_COUNT &&
  warmFrames.every((img) => img.complete);

export default function Tower360({ className = "" }: { className?: string }) {
  const [frame, setFrame] = useState(0);
  const [isWarm, setIsWarm] = useState(framesAreWarm);
  // The hint is only there until the visitor discovers the drag for themselves.
  const [hasTakenOver, setHasTakenOver] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; frame: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    preload360().then(() => {
      if (!cancelled) setIsWarm(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const pxPerFrame = () => {
    const width = containerRef.current?.clientWidth ?? 1200;
    return Math.max(MIN_PX_PER_FRAME, width / FRAMES_PER_WIDTH);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, frame };
    setHasTakenOver(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    // Dragging follows the view: pull left and the far side comes round towards
    // you, the way spinning a physical model by its near face does.
    const steps = Math.round((event.clientX - drag.x) / pxPerFrame());
    const next = (((drag.frame + steps) % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT;
    setFrame(next);
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={`relative h-full w-full cursor-grab touch-none select-none overflow-hidden bg-black active:cursor-grabbing ${className}`}
    >
      {/* Pinned to the top edge so the tower's crown is never what a wide
          viewport crops. */}
      <img
        src={framePath(frame)}
        alt="Hiranandani Bayview, seen from around the tower"
        draggable={false}
        decoding="sync"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-top"
      />

      {isWarm && !hasTakenOver && (
        <div className="pointer-events-none absolute bottom-20 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/70 px-3 h-8 text-[12px] font-medium text-white/90 shadow-lg backdrop-blur-md phone-landscape:bottom-10 phone-landscape:h-6 phone-landscape:gap-1.5 phone-landscape:px-2.5 phone-landscape:text-[9px]">
          <RotateCw
            size={14}
            className="shrink-0 animate-pulse phone-landscape:h-3 phone-landscape:w-3"
          />
          <span>Drag to rotate</span>
        </div>
      )}
    </div>
  );
}
