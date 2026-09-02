"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { CartIcon, LeafIcon } from "@/components/icons";

export function Header() {
  const { totalCount, open } = useCart();

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-border-soft bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            {/* Logo ảnh sẽ thay vào đây khi có file thật — hiện dùng chữ tạm. */}
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
              <LeafIcon />
            </span>
            <span className="leading-tight">
              <span className="block font-heading text-base font-semibold tracking-wide text-foreground sm:text-lg">
                THẢO MỘC NHÀ THUỶ
              </span>
              <span className="hidden text-xs text-primary-light sm:block">
                Thảo mộc lành – chăm sức khoẻ cả gia đình
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={open}
            aria-label={`Giỏ hàng, ${totalCount} sản phẩm`}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl text-foreground transition-colors duration-200 hover:bg-background cursor-pointer"
          >
            <CartIcon />
            {totalCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-white">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
