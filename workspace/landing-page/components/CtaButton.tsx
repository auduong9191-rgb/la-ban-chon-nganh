"use client";

import { ArrowRightIcon } from "./icons";
import { useQuizHref } from "@/lib/use-quiz-href";

export function CtaButton({
  text,
  variant = "primary",
  className = "",
}: {
  text: string;
  variant?: "primary" | "outline";
  className?: string;
}) {
  const href = useQuizHref();
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-medium transition-colors duration-200 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  const styles =
    variant === "primary"
      ? "bg-accent-dark text-white hover:bg-primary-dark"
      : "border-2 border-primary text-primary-dark hover:bg-primary/10";

  return (
    <a href={href} className={`${base} ${styles} ${className}`}>
      {text}
      <ArrowRightIcon className="w-5 h-5" />
    </a>
  );
}
