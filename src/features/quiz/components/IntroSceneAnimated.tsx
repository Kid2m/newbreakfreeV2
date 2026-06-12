"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { heroImage, heroImageMobile } from "../lib/animationAssets";

type Gender = "boy" | "girl";
type IntroPhase = "zoom" | "selection" | "zooming-in";

const introConfig = {
  initialZoom: { scale: 1.3, duration: 2.5 },
  questionDelay: 2.5,
  mindPlungeDuration: 2.5,   // total zoom duration
  // Desktop focal points (boy left, girl right in the image)
  boy:       { zoom: 4.0, x:  700, y: -120 },
  girl:      { zoom: 4.0, x: -700, y: -120 },
  // Mobile focal points
  boyMobile: { zoom: 3.5, x:  360, y: -100 },
  girlMobile:{ zoom: 3.5, x: -360, y: -100 },
};

export function IntroClient() {
  const router = useRouter();
  const [phase, setPhase] = useState<IntroPhase>("zoom");
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const h = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) { setPhase("selection"); return; }
    const t = setTimeout(() => setPhase("selection"), introConfig.questionDelay * 1000);
    return () => clearTimeout(t);
  }, [prefersReducedMotion]);

  const handleSelectGender = useCallback((gender: Gender) => {
    setSelectedGender(gender);
    localStorage.setItem("gender", gender);
    // Small delay so the checkmark shows before zoom starts
    setTimeout(() => {
      setPhase("zooming-in");
      // Navigate after the full zoom
      setTimeout(() => router.push(`/quiz?gender=${gender}`), introConfig.mindPlungeDuration * 1000);
    }, 200);
  }, [router]);

  const getMindPlungeAnim = (gender: Gender | null) => {
    if (!gender) return {};
    const cfg = isMobile
      ? (gender === "boy" ? introConfig.boyMobile : introConfig.girlMobile)
      : (gender === "boy" ? introConfig.boy : introConfig.girl);
    return { scale: cfg.zoom, x: cfg.x, y: cfg.y };
  };

  return (
    <motion.div
      className="relative w-full h-screen overflow-hidden bg-[#0d0d16]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Background image with zoom animation */}
      {!prefersReducedMotion ? (
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.img
            src={isMobile ? heroImageMobile : heroImage}
            alt="Children walking"
            loading="eager"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover brightness-90"
            initial={{ scale: 1 }}
            animate={
              phase === "zooming-in"
                ? getMindPlungeAnim(selectedGender)
                : { scale: introConfig.initialZoom.scale }
            }
            transition={
              phase === "zooming-in"
                ? {
                    scale: { duration: introConfig.mindPlungeDuration, ease: [0.25, 0.1, 0.25, 1] },
                    x:     { duration: introConfig.mindPlungeDuration, ease: [0.25, 0.1, 0.25, 1] },
                    y:     { duration: introConfig.mindPlungeDuration, ease: [0.25, 0.1, 0.25, 1] },
                  }
                : { scale: { duration: introConfig.initialZoom.duration, ease: "easeInOut" } }
            }
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[#54d3bb]/10 via-transparent to-[#0d0d16]/30"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d16] via-[#1a1a2e] to-[#0d0d16]" />
      )}

      {/* Bottom gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Gender selection — disappears when zoom starts */}
      <AnimatePresence>
        {phase === "selection" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            <div className="relative z-10 text-center w-full max-w-sm mx-auto">
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-white/60 text-xs uppercase tracking-widest mb-2 font-medium"
              >
                Personalize your experience
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-2xl sm:text-3xl font-bold text-white mb-8"
              >
                Which child do you identify with?
              </motion.h2>

              <div className="grid grid-cols-2 gap-4">
                {(["boy", "girl"] as Gender[]).map((gender, i) => (
                  <motion.button
                    key={gender}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.1 }}
                    onClick={() => handleSelectGender(gender)}
                    className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-200 active:scale-95 ${
                      selectedGender === gender
                        ? "border-[#54d3bb] shadow-xl shadow-[#54d3bb]/40"
                        : "border-white/20 hover:border-white/50"
                    }`}
                  >
                    <div className="bg-white/10 backdrop-blur-sm p-6 sm:p-8 flex flex-col items-center gap-3">
                      <span className="text-5xl sm:text-6xl">{gender === "boy" ? "👦" : "👧"}</span>
                      <span className="text-white font-semibold text-base sm:text-lg capitalize">
                        {gender === "boy" ? "A boy" : "A girl"}
                      </span>
                    </div>
                    {selectedGender === gender && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-7 h-7 bg-[#54d3bb] rounded-full flex items-center justify-center"
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

      {/* Black fade at END of zoom (not beginning) */}
      <AnimatePresence>
        {phase === "zooming-in" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.6,
              // Start fading to black only at 70% of the zoom duration
              delay: introConfig.mindPlungeDuration * 0.7,
            }}
            className="absolute inset-0 bg-black z-30"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default IntroClient;
