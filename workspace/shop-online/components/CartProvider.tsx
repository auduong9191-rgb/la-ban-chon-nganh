"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { BuyerInfo, CartItem } from "@/lib/types";

const STORAGE_KEY = "shop-online:cart";
const BUYER_STORAGE_KEY = "shop-online:buyer";

type PendingAdd = { item: Omit<CartItem, "qty">; qty: number };

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  totalCount: number;
  totalAmount: number;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  buyerInfo: BuyerInfo | null;
  isBuyerModalOpen: boolean;
  confirmBuyerInfo: (info: BuyerInfo) => void;
  closeBuyerModal: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo | null>(null);
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<PendingAdd | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
      const rawBuyer = localStorage.getItem(BUYER_STORAGE_KEY);
      if (rawBuyer) setBuyerInfo(JSON.parse(rawBuyer));
    } catch {
      // localStorage không khả dụng hoặc dữ liệu hỏng — bỏ qua, giỏ hàng bắt đầu trống.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const insertItem = useCallback((item: Omit<CartItem, "qty">, qty: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...item, qty }];
    });
    setIsOpen(true);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "qty">, qty = 1) => {
      if (!buyerInfo) {
        setPendingAdd({ item, qty });
        setIsBuyerModalOpen(true);
        return;
      }
      insertItem(item, qty);
    },
    [buyerInfo, insertItem]
  );

  const confirmBuyerInfo = useCallback(
    (info: BuyerInfo) => {
      setBuyerInfo(info);
      try {
        localStorage.setItem(BUYER_STORAGE_KEY, JSON.stringify(info));
      } catch {
        // localStorage không khả dụng — thông tin vẫn dùng được trong session hiện tại.
      }
      setIsBuyerModalOpen(false);
      if (pendingAdd) {
        insertItem(pendingAdd.item, pendingAdd.qty);
        setPendingAdd(null);
      }
    },
    [pendingAdd, insertItem]
  );

  const closeBuyerModal = useCallback(() => {
    setIsBuyerModalOpen(false);
    setPendingAdd(null);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) => (i.productId === productId ? { ...i, qty } : i));
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const totalCount = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);
  const totalAmount = useMemo(
    () => items.reduce((n, i) => n + i.qty * i.price, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      isOpen,
      totalCount,
      totalAmount,
      addItem,
      removeItem,
      updateQty,
      clear,
      open,
      close,
      buyerInfo,
      isBuyerModalOpen,
      confirmBuyerInfo,
      closeBuyerModal,
    }),
    [
      items,
      isOpen,
      totalCount,
      totalAmount,
      addItem,
      removeItem,
      updateQty,
      clear,
      open,
      close,
      buyerInfo,
      isBuyerModalOpen,
      confirmBuyerInfo,
      closeBuyerModal,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
