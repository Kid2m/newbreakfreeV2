"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { boyFrames, girlFrames, chapterMessages } from "../lib/animationAssets";

interface AnimatedBreakScreenProps {
  chapter: string;
  gender: "male" | "female" | null;
  onComplete: () => void;
}

export default function AnimatedBreakScreen({ chapter, gender, onComplete }: AnimatedBreakScreenProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);

  const frames = gender === "female" ? (girlFrames[chapter] ?? boyFrames[chapter] ?? []) : (boyFrames[chapter] ?? []);
  const message = chapterMessages[chapter];

  useEffect(() => {
    if (frames.length === 0) {
      setTimeout(onComplete, 800);
      return;
    }

    const frameInterval = setInterval(() => {
      setFrameIndex((prev) => {
        if (prev >= frames.length - 1) {
          clearInterval(frameInterval);
          setShowMessage(true);
          return prev;
        }
        return prev + 1;
      });
    }, 900);

    return () => clearInterval(frameInterval);
  }, [frames, onComplete]);

  useEffect(() => {
    if (!showMessage) return;
    const timer = setTimeout(onComplete, 2200);
    return () => clearTimeout(timer);
  }, [showMessage, onComplete]);

  if (frames.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={frameIndex}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={frames[frameIndex]}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showMessage && message && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 text-center px-8 mt-auto mb-16"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 drop-shadow-lg">
              {message.title}
            </h2>
            <p className="text-base sm:text-lg text-white/80 drop-shadow-md max-w-sm mx-auto">
              {message.subtitle}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
