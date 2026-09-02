import Image from "next/image";

export function LogoHeader() {
  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border-soft">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center gap-3">
        <Image
          src="/tiara-edu-logo.png"
          alt="Tiara Edu"
          width={1051}
          height={880}
          className="h-9 w-auto"
          priority
        />
        <span className="h-6 w-px bg-border-soft" aria-hidden="true" />
        <Image
          src="/gein-logo.png"
          alt="Gein Group"
          width={4094}
          height={2242}
          className="h-6 w-auto"
          priority
        />
      </div>
    </header>
  );
}
