"use client";

import { useState } from "react";
import { PhoneIcon, CloseIcon } from "@/components/icons";

const HOTLINE = "0989860606";
const HOTLINE_TEL = "tel:0989860606";
const ZALO_URL = "https://zalo.me/0989860606";

export function FloatingHotline() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="w-60 rounded-2xl border border-border-soft bg-surface p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-heading text-sm font-semibold text-foreground">Liên hệ shop</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng"
              className="text-primary-light transition-colors duration-200 hover:text-foreground cursor-pointer"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            <a
              href={HOTLINE_TEL}
              className="flex items-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-dark"
            >
              <PhoneIcon className="h-4 w-4" />
              Gọi hotline {HOTLINE}
            </a>
            <a
              href={ZALO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-border-soft px-3 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-background"
            >
              Chat Zalo: {HOTLINE}
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Liên hệ hotline"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform duration-200 hover:scale-105 cursor-pointer"
      >
        <PhoneIcon className="h-6 w-6" />
      </button>
    </div>
  );
}
