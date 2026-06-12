"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { heroImage } from "../lib/animationAssets";
import { introConfig } from "../data/introConfig";

type Gender = "male" | "female";
type IntroPhase = "zoom" | "selection" | "done";

export function IntroClient() {
  const router = useRouter();
  const [phase, setPhase] = useState<IntroPhase>("zoom");
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("selection");
    }, introConfig.zoomDuration);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectGender = useCallback(
    (gender: Gender) => {
      setSelectedGender(gender);
      setPhase("done");
      setTimeout(() => {
        router.push(`/quiz?gender=${gender}`);
      }, introConfig.selectionDelay);
    },
    [router]
  );

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Background image with zoom */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: introConfig.zoomScale.start }}
        animate={{ scale: introConfig.zoomScale.end }}
        transition={{ duration: introConfig.zoomDuration / 1000, ease: "easeInOut" }}
      >
        <img
          src={heroImage}
          alt="A child walking toward the light"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </motion.div>

      {/* Tagline during zoom */}
      <AnimatePresence>
        {phase === "zoom" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 text-center z-10"
          >
            <p className="text-white/90 text-lg sm:text-2xl font-light tracking-wide drop-shadow-lg">
              Your childhood shaped you.
            </p>
            <p className="text-primary text-xl sm:text-3xl font-semibold mt-2 drop-shadow-lg">
              It doesn't have to define you.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gender selection overlay */}
      <AnimatePresence>
        {phase === "selection" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative z-10 text-center w-full max-w-sm">
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-2xl sm:text-3xl font-bold text-white mb-2"
              >
                To personalize your experience
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-white/70 text-sm sm:text-base mb-8"
              >
                Which child do you identify with?
              </motion.p>

              <div className="grid grid-cols-2 gap-4">
                {(["male", "female"] as Gender[]).map((gender, i) => (
                  <motion.button
                    key={gender}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.1, duration: 0.4 }}
                    onClick={() => handleSelectGender(gender)}
                    className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-200 active:scale-95 ${
                      selectedGender === gender
                        ? "border-primary shadow-xl shadow-primary/40"
                        : "border-white/20 hover:border-white/50"
                    }`}
                  >
                    <div className="bg-white/10 backdrop-blur-sm p-6 sm:p-8 flex flex-col items-center gap-3">
                      <span className="text-5xl sm:text-6xl">
                        {gender === "male" ? "👦" : "👧"}
                      </span>
                      <span className="text-white font-semibold text-base sm:text-lg capitalize">
                        {gender === "male" ? "A boy" : "A girl"}
                      </span>
                    </div>
                    {selectedGender === gender && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default IntroClient;
