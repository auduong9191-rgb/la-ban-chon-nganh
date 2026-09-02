"use client";

import { useState } from "react";
import type { VakadQuestion } from "@/lib/vakad-questions";

type Props = {
  question: VakadQuestion;
  index: number;
  total: number;
  onComplete: (ranks: Record<number, number>) => void;
};

export function RankQuestion({ question, index, total, onComplete }: Props) {
  const [order, setOrder] = useState<number[]>([]); // thứ tự index option đã click

  function handleClick(optionIdx: number) {
    if (order.includes(optionIdx)) return;

    const nextOrder = [...order, optionIdx];
    setOrder(nextOrder);

    if (nextOrder.length === question.options.length - 1) {
      // Ý còn lại tự động nhận hạng thấp nhất (1) — không cần click thêm.
      const remaining = question.options
        .map((_, i) => i)
        .find((i) => !nextOrder.includes(i))!;
      const finalOrder = [...nextOrder, remaining];

      const ranks: Record<number, number> = {};
      finalOrder.forEach((optIdx, clickPos) => {
        ranks[optIdx] = question.options.length - clickPos;
      });

      window.setTimeout(() => onComplete(ranks), 250);
    }
  }

  function handleReset() {
    setOrder([]);
  }

  const rankOf = (optionIdx: number): number | null => {
    const pos = order.indexOf(optionIdx);
    return pos === -1 ? null : question.options.length - pos;
  };

  return (
    <div className="rounded-2xl bg-surface border border-border-soft p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium tracking-wide uppercase text-ink-soft">
          Câu {index + 1} / {total}
        </span>
        {order.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-ink-soft underline underline-offset-2 hover:text-ink cursor-pointer"
          >
            Chọn lại
          </button>
        )}
      </div>

      <h3 className="font-heading text-xl sm:text-2xl font-semibold text-ink mb-2">
        {question.prompt}
      </h3>
      <p className="text-sm text-ink-soft mb-6">
        Bấm lần lượt từ ý <strong>giống con nhất</strong> đến ý{" "}
        <strong>ít giống con nhất</strong>.
      </p>

      <div className="space-y-3">
        {question.options.map((opt, optionIdx) => {
          const rank = rankOf(optionIdx);
          const ranked = rank !== null;
          return (
            <button
              key={optionIdx}
              type="button"
              onClick={() => handleClick(optionIdx)}
              disabled={ranked}
              className={`w-full text-left rounded-xl border px-4 py-3 sm:px-5 sm:py-4 transition-colors duration-150 flex items-start gap-3 cursor-pointer ${
                ranked
                  ? "border-accent bg-accent/10 cursor-default"
                  : "border-border-soft bg-background hover:border-accent"
              }`}
            >
              <span
                className={`shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  ranked
                    ? "bg-accent-dark text-white"
                    : "bg-white border border-border-soft text-ink-soft"
                }`}
              >
                {ranked ? rank : ""}
              </span>
              <span className="text-sm sm:text-base text-ink">{opt.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
