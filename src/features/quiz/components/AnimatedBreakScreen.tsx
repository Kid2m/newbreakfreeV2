"use client";

import { useState, useEffect } from "react";
import { animations } from "../lib/animationAssets";

interface AnimatedBreakScreenProps {
  animationIndex: number;
  onComplete: () => void;
}

export default function AnimatedBreakScreen({ animationIndex, onComplete }: AnimatedBreakScreenProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const gender = (typeof window !== "undefined" ? localStorage.getItem("gender") : null) ?? "boy";
  const animationSequence = animations[gender as "boy" | "girl"]?.[animationIndex];

  useEffect(() => {
    if (!animationSequence) { onComplete(); return; }

    Promise.all(
      animationSequence.images.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = src;
          })
      )
    ).then(() => setImagesLoaded(true));
  }, [animationSequence, onComplete]);

  useEffect(() => {
    if (!animationSequence || !imagesLoaded) return;

    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    const timings = [400, 400, 400];
    const timers: ReturnType<typeof setTimeout>[] = [];
    let acc = 0;

    timings.forEach((ms, i) => {
      if (i > 0) {
        timers.push(setTimeout(() => setCurrentImageIndex(i), acc));
      }
      acc += ms;
    });

    timers.push(setTimeout(() => setIsVisible(false), acc));
    timers.push(setTimeout(() => onComplete(), acc + 100));

    return () => timers.forEach(clearTimeout);
  }, [animationSequence, imagesLoaded, onComplete]);

  if (!animationSequence) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden z-50">
      {!imagesLoaded ? (
        <div className="text-muted-foreground animate-pulse text-sm">Loading...</div>
      ) : (
        <div
          className={`relative w-[85vw] max-w-md transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ aspectRatio: "3/4" }}
          data-testid="animated-break-screen"
        >
          {animationSequence.images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover rounded-2xl transition-opacity duration-100 ${
                currentImageIndex === i ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
