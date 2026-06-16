"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { trackAndSend } from "@/lib/meta-client";
import { questions, chapters, breakScreens } from "./data/quiz-data";
import ProgressBar from "./components/ProgressBar";
import QuestionCard from "./components/QuestionCard";
import ContactForm from "./components/ContactForm";
import LoadingPage from "./components/LoadingPage";
import DonationPage from "./components/DonationPage";
import ResultsPage from "./components/ResultsPage";
import AnimatedBreakScreen from "./components/AnimatedBreakScreen";
import BreakScreenComponent from "./components/BreakScreen";
import TraumaPatterns from "./components/TraumaPatterns";
import BenefitsPage from "./components/BenefitsPage";
import SevenDaysPage from "./components/SevenDaysPage";
import PlanHelpPage from "./components/PlanHelpPage";
import TrustPage from "./components/TrustPage";
import TestimonialsPage from "./components/TestimonialsPage";
import TrialTimeline from "./components/TrialTimeline";
import FAQPage from "./components/FAQPage";
import UpsellPage from "./components/UpsellPage";
import MasterclassBundlePage from "./components/MasterclassBundlePage";
import HealingJournalPage from "./components/HealingJournalPage";
import EmbeddedCheckoutPage, { type EmbeddedCheckoutProductType } from "./components/EmbeddedCheckoutPage";

type QuizState =
  | "quiz" | "animation" | "quote-break"
  | "contact" | "loading"
  | "trust" | "benefits" | "donation" | "results" | "timeline"
  | "patterns" | "testimonials" | "plan-help"
  | "seven-days"
  | "upsell" | "masterclass" | "journal"
  | "faq" | "checkout" | "subscription-checkout";

type QuizAnswers = Record<string, string[]>;

// Animation triggers at question indices 2, 6, 9 (last q of each chapter)
// mapping questionIndex → animationIndex (0-3)
const ANIMATION_TRIGGERS: Record<number, number> = { 2: 0, 6: 1, 9: 2, 11: 3 };

const VALID_STATES = [
  "quiz", "animation", "quote-break", "contact", "loading",
  "trust", "benefits", "donation", "results", "timeline",
  "patterns", "testimonials", "plan-help", "seven-days",
  "upsell", "masterclass", "journal", "faq", "checkout",
] as const;

export function QuizClient() {
  const searchParams = useSearchParams();

  const initialState = (
    VALID_STATES.includes(searchParams.get("state") as QuizState)
      ? searchParams.get("state")
      : "quiz"
  ) as QuizState;

  const initialQuestion = (() => {
    const q = parseInt(searchParams.get("question") ?? "0", 10);
    return !isNaN(q) && q >= 0 && q < questions.length ? q : 0;
  })();

  const [state, setState] = useState<QuizState>(initialState);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialQuestion);
  const [answers, setAnswers] = useState<QuizAnswers>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("quizAnswers") ?? "{}"); }
    catch { return {}; }
  });
  const [userName, setUserName] = useState(() =>
    typeof window !== "undefined" ? (localStorage.getItem("userName") ?? "") : ""
  );
  const [userEmail, setUserEmail] = useState(() =>
    typeof window !== "undefined" ? (localStorage.getItem("userEmail") ?? "") : ""
  );
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
  const [currentQuoteBreakIndex, setCurrentQuoteBreakIndex] = useState(0);
  const [checkoutAmount, setCheckoutAmount] = useState(14.99);
  const [checkoutType, setCheckoutType] = useState<EmbeddedCheckoutProductType>('upsell');
  const [checkoutProductName, setCheckoutProductName] = useState('Mental Well-Being Guides');
  const [checkoutReturnUrl, setCheckoutReturnUrl] = useState('');

  // Save gender from URL to localStorage
  useEffect(() => {
    const g = searchParams.get("gender");
    if (g === "boy" || g === "girl") localStorage.setItem("gender", g);
    else if (g === "male") localStorage.setItem("gender", "boy");
    else if (g === "female") localStorage.setItem("gender", "girl");
  }, [searchParams]);

  // Clean up session_id from URL after Stripe return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("session_id")) {
      params.delete("session_id");
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  // Scroll to top on state/question change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [state, currentQuestionIndex]);

  const trackedStates = useRef(new Set<string>());
  useEffect(() => {
    if (trackedStates.current.has(state)) return;
    trackedStates.current.add(state);
    void trackAndSend("ViewContent", { content_type: `Quiz - ${state}` });
  }, [state]);

  useEffect(() => {
    localStorage.setItem("quizAnswers", JSON.stringify(answers));
  }, [answers]);

  const handleAnswer = useCallback((questionId: string, answer: string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  const handleNext = useCallback(() => {
    const animIdx = ANIMATION_TRIGGERS[currentQuestionIndex];
    if (animIdx !== undefined) {
      // Chapter transition: animation → quote-break → next question (or seven-days if last)
      setCurrentAnimationIndex(animIdx);
      setCurrentQuoteBreakIndex(animIdx);
      setState("animation");
    } else if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      setState("contact");
    }
  }, [currentQuestionIndex]);

  const handleAnimationComplete = useCallback(() => {
    setState("quote-break");
  }, []);

  const handleQuoteBreakContinue = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setState("quiz");
    } else {
      // After last question animation → seven-days before contact
      setState("seven-days");
    }
  }, [currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];
  const currentChapter = chapters.find((c) => c.id === currentQuestion?.chapter);

  // ── STATES ──────────────────────────────────────────────────────────────
  if (state === "animation") {
    return (
      <AnimatedBreakScreen
        animationIndex={currentAnimationIndex}
        onComplete={handleAnimationComplete}
      />
    );
  }

  if (state === "quote-break") {
    const breakScreen = breakScreens[currentQuoteBreakIndex];
    if (!breakScreen) { handleQuoteBreakContinue(); return null; }
    return (
      <BreakScreenComponent
        breakScreen={breakScreen}
        onContinue={handleQuoteBreakContinue}
      />
    );
  }

  if (state === "seven-days") {
    return (
      <>
        <ProgressBar currentChapter="future" currentQuestionIndex={questions.length - 1} totalQuestions={questions.length} />
        <SevenDaysPage onContinue={() => setState("contact")} />
      </>
    );
  }

  if (state === "contact") {
    return (
      <ContactForm
        onSubmit={({ name, email }: { name: string; email: string }) => {
          setUserName(name);
          setUserEmail(email);
          localStorage.setItem("userName", name);
          localStorage.setItem("userEmail", email);
          void trackAndSend("CompleteRegistration", { email });
          setState("loading");
        }}
      />
    );
  }

  if (state === "loading") {
    return <LoadingPage onComplete={() => setState("trust")} />;
  }

  if (state === "trust") {
    return (
      <>
        <ProgressBar currentChapter="future" currentQuestionIndex={questions.length - 1} totalQuestions={questions.length} />
        <TrustPage onContinue={() => setState("benefits")} />
      </>
    );
  }

  if (state === "benefits") {
    return (
      <>
        <ProgressBar currentChapter="future" currentQuestionIndex={questions.length - 1} totalQuestions={questions.length} />
        <BenefitsPage onContinue={() => setState("donation")} />
      </>
    );
  }

  if (state === "donation") {
    return (
      <>
        <ProgressBar currentChapter="future" currentQuestionIndex={questions.length - 1} totalQuestions={questions.length} />
        <DonationPage userName={userName} onContinue={() => setState("results")} />
      </>
    );
  }

  if (state === "results") {
    return (
      <>
        <ProgressBar currentChapter="future" currentQuestionIndex={questions.length - 1} totalQuestions={questions.length} />
        <ResultsPage userName={userName} answers={answers} onContinue={() => setState("timeline")} />
      </>
    );
  }

  if (state === "timeline") {
    return (
      <>
        <ProgressBar currentChapter="future" currentQuestionIndex={questions.length - 1} totalQuestions={questions.length} />
        <TrialTimeline onStartTrial={() => {
          void trackAndSend("InitiateCheckout", { currency: "EUR", value: 1 });
          setState("patterns");
        }} />
      </>
    );
  }

  if (state === "patterns") {
    return (
      <>
        <ProgressBar currentChapter="future" currentQuestionIndex={questions.length - 1} totalQuestions={questions.length} />
        <TraumaPatterns onContinue={() => setState("testimonials")} />
      </>
    );
  }

  if (state === "testimonials") {
    return (
      <>
        <ProgressBar currentChapter="future" currentQuestionIndex={questions.length - 1} totalQuestions={questions.length} />
        <TestimonialsPage onContinue={() => setState("plan-help")} />
      </>
    );
  }

  if (state === "plan-help") {
    return (
      <>
        <ProgressBar currentChapter="future" currentQuestionIndex={questions.length - 1} totalQuestions={questions.length} />
        <PlanHelpPage onContinue={() => setState("upsell")} />
      </>
    );
  }

  if (state === "upsell") {
    return (
      <UpsellPage
        onAccept={() => {
          setCheckoutAmount(14.99);
          setCheckoutType('upsell');
          setCheckoutProductName('Mental Well-Being Guides');
          setCheckoutReturnUrl(`${typeof window !== 'undefined' ? window.location.origin : ''}/quiz?state=masterclass&payment_success=true`);
          setState("checkout");
        }}
        onSkip={() => setState("masterclass")}
      />
    );
  }

  if (state === "masterclass") {
    return (
      <MasterclassBundlePage
        onAccept={() => {
          setCheckoutAmount(69);
          setCheckoutType('masterclass');
          setCheckoutProductName('Masterclass Bundle');
          setCheckoutReturnUrl(`${typeof window !== 'undefined' ? window.location.origin : ''}/quiz?state=journal&payment_success=true`);
          setState("checkout");
        }}
        onDecline={() => setState("journal")}
      />
    );
  }

  if (state === "journal") {
    return (
      <HealingJournalPage
        onAccept={() => {
          setCheckoutAmount(14.99);
          setCheckoutType('journal');
          setCheckoutProductName('Healing Journal');
          setCheckoutReturnUrl(`${typeof window !== 'undefined' ? window.location.origin : ''}/quiz?state=faq&payment_success=true`);
          setState("checkout");
        }}
        onSkip={() => setState("faq")}
      />
    );
  }

  if (state === "faq") {
    return (
      <>
        <ProgressBar currentChapter="future" currentQuestionIndex={questions.length - 1} totalQuestions={questions.length} />
        <FAQPage onContinue={() => {
          setCheckoutAmount(1);
          setCheckoutType('subscription');
          setCheckoutProductName('7-Day BreakFree Trial');
          setCheckoutReturnUrl(`${typeof window !== 'undefined' ? window.location.origin : ''}/quiz?state=testimonials&payment_success=true`);
          setState("subscription-checkout");
        }} />
      </>
    );
  }

  if (state === "checkout" || state === "subscription-checkout") {
    const onBack = () => {
      if (checkoutType === 'upsell') setState("upsell");
      else if (checkoutType === 'masterclass') setState("masterclass");
      else if (checkoutType === 'journal') setState("journal");
      else setState("faq");
    };
    return (
      <EmbeddedCheckoutPage
        amount={checkoutAmount}
        productType={checkoutType}
        productName={checkoutProductName}
        email={userEmail}
        name={userName}
        onBack={onBack}
        returnUrl={checkoutReturnUrl}
      />
    );
  }

  // Default: quiz state
  return currentQuestion ? (
    <div className="bg-background min-h-screen">
      <ProgressBar
        currentChapter={currentChapter?.id ?? ""}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
      />
      <QuestionCard
        question={currentQuestion}
        chapterTitle={currentChapter?.title ?? ""}
        savedAnswer={answers[currentQuestion.id] ?? []}
        onAnswer={(ans: string[]) => handleAnswer(currentQuestion.id, ans)}
        onNext={handleNext}
        canGoBack={currentQuestionIndex > 0}
        isLastQuestion={currentQuestionIndex === questions.length - 1}
        onPrevious={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
      />
    </div>
  ) : null;
}
