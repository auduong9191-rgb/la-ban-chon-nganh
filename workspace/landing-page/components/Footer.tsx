import { offer } from "@/lib/offer";

export function Footer() {
  return (
    <footer className="py-10 border-t border-border-soft">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-sm text-ink-soft">
        © 2026 {offer.brand}. All rights reserved.
      </div>
    </footer>
  );
}
