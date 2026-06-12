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
import BreakScreenComponent from "./components/BreakScreen";
import AnimatedBreakScreen from "./components/AnimatedBreakScreen";
import TraumaPatterns from "./components/TraumaPatterns";
import BenefitsPage from "./components/BenefitsPage";
import SevenDaysPage from "./components/SevenDaysPage";
import PlanHelpPage from "./components/PlanHelpPage";
import TrustPage from "./components/TrustPage";
import TestimonialsPage from "./components/TestimonialsPage";
import TrialTimeline from "./components/TrialTimeline";
import FAQPage from "./components/FAQPage";

type QuizState =
  | "quiz"
  | "quote-break"
  | "chapter-animation"
  | "contact"
  | "loading"
  | "donation"
  | "checkout"
  | "results"
  | "patterns"
  | "benefits"
  | "seven-days"
  | "plan-help"
  | "trust"
  | "testimonials"
  | "timeline"
  | "faq";

type QuizAnswers = Record<string, string[]>;

const VALID_STATES: QuizState[] = [
  "quiz", "quote-break", "contact", "loading", "donation",
  "checkout", "results", "patterns", "benefits", "seven-days",
  "plan-help", "trust", "testimonials", "timeline", "faq",
];

const PAGE_NAMES: Partial<Record<QuizState, string>> = {
  quiz: "Step 01 - Quiz Start",
  contact: "Step 02 - Contact Form",
  loading: "Step 03 - Loading Analysis",
  patterns: "Step 04 - Trauma Patterns",
  donation: "Step 05 - Donation",
  results: "Step 06 - Results",
  benefits: "Step 07 - Benefits",
  "seven-days": "Step 08 - Seven Days Preview",
  "plan-help": "Step 09 - Plan Help",
  trust: "Step 10 - Trust & Stats",
  testimonials: "Step 11 - Testimonials",
  timeline: "Step 12 - Trial Timeline",
  faq: "Step 13 - FAQ",
  checkout: "Step 14 - Subscription Checkout",
};

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
  const [, setUserEmail] = useState(() =>
    typeof window !== "undefined" ? (localStorage.getItem("userEmail") ?? "") : ""
  );
  const [currentQuoteBreakIndex, setCurrentQuoteBreakIndex] = useState(0);
  const [pendingChapter, setPendingChapter] = useState<string | null>(null);
  const [animationIndex, setAnimationIndex] = useState(0);
  // Save gender from URL to localStorage for AnimatedBreakScreen
  useEffect(() => {
    const g = searchParams.get("gender");
    if (g === "boy" || g === "girl") localStorage.setItem("gender", g);
    // also accept male/female from v1 compat
    else if (g === "male") localStorage.setItem("gender", "boy");
    else if (g === "female") localStorage.setItem("gender", "girl");
  }, [searchParams]);
  const [_hasPaid] = useState(() => {
    if (typeof window === "undefined") return false;
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    const stored = localStorage.getItem("hasPaid") === "true";
    if (sessionId || stored) { localStorage.setItem("hasPaid", "true"); return true; }
    return false;
  });

  const currentQuestion = questions[currentQuestionIndex];
  const currentChapter = chapters.find((c) => c.id === currentQuestion?.chapter);

  useEffect(() => {
    localStorage.setItem("quizAnswers", JSON.stringify(answers));
  }, [answers]);

  // Track ViewContent once per state
  const trackedStates = useRef(new Set<string>());
  useEffect(() => {
    if (trackedStates.current.has(state)) return;
    trackedStates.current.add(state);
    const contentName = PAGE_NAMES[state];
    if (contentName) {
      void trackAndSend("ViewContent", { content_type: contentName });
    }
  }, [state]);

  const handleAnswer = useCallback((questionId: string, answer: string[]) => {
    setAnswers((prev: QuizAnswers) => ({ ...prev, [questionId]: answer }));
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const nextQuestion = questions[nextIndex];
      const nextChapter = chapters.find((c) => c.id === nextQuestion?.chapter);

      // Chapter transition → show animated break then quote break
      if (nextChapter && nextChapter.id !== currentChapter?.id) {
        const chapterOrder = ["past", "patterns", "healing", "future"];
        const idx = chapterOrder.indexOf(nextChapter.id);
        setAnimationIndex(idx >= 0 ? idx : 0);
        setCurrentQuestionIndex(nextIndex);
        setPendingChapter(nextChapter.id);
        setState("chapter-animation");
        return;
      }

      setCurrentQuestionIndex(nextIndex);
    } else {
      setState("contact");
    }
  }, [currentQuestionIndex, currentChapter]);

  const handleContactSubmit = useCallback(
    ({ name, email }: { name: string; email: string }) => {
      setUserName(name);
      setUserEmail(email);
      localStorage.setItem("userName", name);
      localStorage.setItem("userEmail", email);
      void trackAndSend("CompleteRegistration", { email });
      setState("loading");
    },
    []
  );

  switch (state) {
    case "quiz":
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
            onNext={handleNextQuestion}
            canGoBack={currentQuestionIndex > 0}
            isLastQuestion={currentQuestionIndex === questions.length - 1}
            onPrevious={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
          />
        </div>
      ) : null;

    case "chapter-animation":
      return (
        <AnimatedBreakScreen
          animationIndex={animationIndex}
          onComplete={() => {
            const breakScreen = breakScreens.find((b) => b.chapter === pendingChapter);
            if (breakScreen) {
              setCurrentQuoteBreakIndex(breakScreens.indexOf(breakScreen));
              setState("quote-break");
            } else {
              setState("quiz");
            }
            setPendingChapter(null);
          }}
        />
      );

    case "quote-break":
      return (
        <BreakScreenComponent
          breakScreen={breakScreens[currentQuoteBreakIndex]}
          onContinue={() => setState("quiz")}
        />
      );

    case "contact":
      return <ContactForm onSubmit={handleContactSubmit} />;

    case "loading":
      return (
        <LoadingPage
          onComplete={() => setState("patterns")}
        />
      );

    case "patterns":
      return <TraumaPatterns onContinue={() => setState("donation")} />;

    case "donation":
      return (
        <DonationPage
          userName={userName}
          onContinue={() => setState("results")}
        />
      );

    case "results":
      return (
        <ResultsPage
          userName={userName}
          answers={answers}
          onContinue={() => setState("benefits")}
        />
      );

    case "benefits":
      return <BenefitsPage onContinue={() => setState("seven-days")} />;

    case "seven-days":
      return <SevenDaysPage onContinue={() => setState("plan-help")} />;

    case "plan-help":
      return <PlanHelpPage onContinue={() => setState("trust")} />;

    case "trust":
      return <TrustPage onContinue={() => setState("testimonials")} />;

    case "testimonials":
      return <TestimonialsPage onContinue={() => setState("timeline")} />;

    case "timeline":
      return (
        <TrialTimeline
          onStartTrial={() => {
            void trackAndSend("InitiateCheckout", { currency: "EUR", value: 1 });
            setState("faq");
          }}
        />
      );

    case "faq":
      return (
        <FAQPage
          onContinue={() => {
            setState("checkout");
          }}
        />
      );

    case "checkout":
      return (
        <div className="bg-background flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Checkout — coming soon</p>
        </div>
      );

    default:
      return null;
  }
}
