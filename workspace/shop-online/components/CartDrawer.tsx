"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatVND } from "@/lib/format";
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon, ImagePlaceholderIcon } from "@/components/icons";

export function CartDrawer() {
  const { items, isOpen, close, totalAmount, removeItem, updateQty } = useCart();

  return (
    <>
      <div
        onClick={close}
        aria-hidden
        className={`fixed inset-0 z-[55] bg-black/40 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Giỏ hàng"
        className={`fixed right-0 top-0 z-[55] flex h-full w-full max-w-sm flex-col bg-surface shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border-soft px-5 py-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">Giỏ hàng</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Đóng giỏ hàng"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors duration-200 hover:bg-background cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-sm text-primary-light">
              Giỏ hàng đang trống.
            </p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-background">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary-light">
                        <ImagePlaceholderIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-primary-light">{formatVND(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        aria-label="Giảm số lượng"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border-soft text-foreground transition-colors duration-200 hover:bg-background cursor-pointer"
                      >
                        <MinusIcon />
                      </button>
                      <span className="w-6 text-center text-sm">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        aria-label="Tăng số lượng"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border-soft text-foreground transition-colors duration-200 hover:bg-background cursor-pointer"
                      >
                        <PlusIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        aria-label="Xóa sản phẩm"
                        className="ml-2 flex h-7 w-7 items-center justify-center rounded-md text-danger transition-colors duration-200 hover:bg-background cursor-pointer"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border-soft px-5 py-4">
            <div className="mb-3 flex items-center justify-between text-sm font-medium text-foreground">
              <span>Tổng cộng</span>
              <span className="font-heading text-lg">{formatVND(totalAmount)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={close}
              className="block w-full rounded-xl bg-accent px-4 py-3 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-dark cursor-pointer"
            >
              Thanh toán
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
