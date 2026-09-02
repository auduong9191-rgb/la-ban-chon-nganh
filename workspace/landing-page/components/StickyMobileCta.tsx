"use client";

import { useEffect, useState } from "react";
import { offer } from "@/lib/offer";
import { useQuizHref } from "@/lib/use-quiz-href";

export function StickyMobileCta() {
  const [visible, setVisible] = useState(false);
  const quizHref = useQuizHref();

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-4 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <a
        href={quizHref}
        className="block w-full rounded-full bg-accent-dark hover:bg-primary-dark text-white text-center font-medium py-4 shadow-lg cursor-pointer transition-colors duration-200"
      >
        {offer.cta.secondary}
      </a>
    </div>
  );
}
