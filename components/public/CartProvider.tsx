"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import CartThumbnail from "@/components/public/CartThumbnail";

export type CartShade = {
  id: string;
  code: string | null;
  name: string;
  imageUrl: string | null;
};

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  shade: CartShade | null;
  quantity: number;
  photoUrl: string | null;
};

type CartProduct = Omit<CartItem, "quantity">;
type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  ready: boolean;
  storageError: string | null;
  bumpKey: number;
  addItem: (product: CartProduct, inStock: boolean, available: boolean) => boolean;
  replaceItems: (items: CartItem[]) => void;
  setQuantity: (id: string, shadeId: string | null, quantity: number) => void;
  removeItem: (id: string, shadeId: string | null) => void;
};

const STORAGE_KEY = "classic-cosmetics-cart-v1";
const MAX_QUANTITY = 99;
const CartContext = createContext<CartContextValue | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validText(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

function parseCart(value: unknown): { items: CartItem[]; dropped: boolean } {
  if (!Array.isArray(value)) return { items: [], dropped: true };

  let dropped = false;
  const items: CartItem[] = [];
  for (const entry of value) {
    if (
      !isRecord(entry) ||
      !validText(entry.id, 100) ||
      !validText(entry.slug, 160) ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug) ||
      !validText(entry.name, 160) ||
      !Number.isInteger(entry.quantity) ||
      (entry.quantity as number) < 1 ||
      (entry.quantity as number) > MAX_QUANTITY
    ) {
      dropped = true;
      continue;
    }

    let shade: CartShade | null = null;
    if (entry.shade !== null && entry.shade !== undefined) {
      if (
        !isRecord(entry.shade) ||
        !validText(entry.shade.id, 100) ||
        !validText(entry.shade.name, 160) ||
        !(entry.shade.code === null || entry.shade.code === undefined || validText(entry.shade.code, 80))
      ) {
        dropped = true;
        continue;
      }
      shade = {
        id: entry.shade.id,
        code: typeof entry.shade.code === "string" ? entry.shade.code : null,
        name: entry.shade.name,
        imageUrl:
          typeof entry.shade.imageUrl === "string" &&
          entry.shade.imageUrl.length <= 2048
            ? entry.shade.imageUrl
            : null,
      };
    }
    const photoUrl =
      typeof entry.photoUrl === "string" && entry.photoUrl.length <= 2048
        ? entry.photoUrl
        : null;
    const item: CartItem = {
      id: entry.id,
      slug: entry.slug,
      name: entry.name,
      shade,
      quantity: entry.quantity as number,
      photoUrl,
    };
    const key = lineKey(item.id, item.shade?.id ?? null);
    const duplicate = items.findIndex(
      (existing) => lineKey(existing.id, existing.shade?.id ?? null) === key,
    );
    const existing = items[duplicate];
    if (existing) {
      items[duplicate] = {
        ...existing,
        quantity: Math.min(existing.quantity + item.quantity, MAX_QUANTITY),
      };
      dropped = true;
    } else {
      items.push(item);
    }
  }
  return { items, dropped };
}

function lineKey(id: string, shadeId: string | null) {
  return `${id}:${shadeId ?? ""}`;
}

export function CartProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [invalidData, setInvalidData] = useState(false);
  const [toast, setToast] = useState<{ item: CartItem; closing: boolean } | null>(
    null,
  );
  const [bumpKey, setBumpKey] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = parseCart(JSON.parse(raw) as unknown);
          if (active) {
            setItems(parsed.items);
            setInvalidData(parsed.dropped);
          }
        }
      } catch {
        if (active) {
          setStorageError("Your saved cart could not be read. It will not be restored.");
        }
      } finally {
        if (active) setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      queueMicrotask(() => {
        setStorageError("Your cart could not be saved on this device.");
      });
    }
  }, [items, ready]);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = null;
    setToast((current) => (current ? { ...current, closing: true } : null));
    if (toastCloseTimer.current) clearTimeout(toastCloseTimer.current);
    toastCloseTimer.current = setTimeout(() => setToast(null), 280);
  }, []);

  const pauseToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = null;
  }, []);

  const resumeToast = useCallback(() => {
    pauseToast();
    toastTimer.current = setTimeout(dismissToast, 10_000);
  }, [dismissToast, pauseToast]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (toastCloseTimer.current) clearTimeout(toastCloseTimer.current);
    },
    [],
  );

  const addItem = useCallback((product: CartProduct, inStock: boolean, available: boolean) => {
    if (!inStock || !available) return false;
    setStorageError(null);
    setInvalidData(false);
    setItems((current) => {
      const key = lineKey(product.id, product.shade?.id ?? null);
      const existing = current.find(
        (item) => lineKey(item.id, item.shade?.id ?? null) === key,
      );
      if (existing) {
        return current.map((item) =>
          lineKey(item.id, item.shade?.id ?? null) === key
            ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
            : item,
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setBumpKey((current) => current + 1);
    pauseToast();
    if (toastCloseTimer.current) clearTimeout(toastCloseTimer.current);
    setToast({ item: { ...product, quantity: 1 }, closing: false });
    toastTimer.current = setTimeout(dismissToast, 10_000);
    return true;
  }, [dismissToast, pauseToast]);

  const replaceItems = useCallback((nextItems: CartItem[]) => {
    setStorageError(null);
    setInvalidData(false);
    setItems(nextItems);
  }, []);

  const setQuantity = useCallback(
    (id: string, shadeId: string | null, quantity: number) => {
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return;
      setStorageError(null);
      setInvalidData(false);
      const key = lineKey(id, shadeId);
      setItems((current) =>
        current.map((item) =>
          lineKey(item.id, item.shade?.id ?? null) === key
            ? { ...item, quantity }
            : item,
        ),
      );
    },
    [],
  );

  const removeItem = useCallback((id: string, shadeId: string | null) => {
    setStorageError(null);
    setInvalidData(false);
    const key = lineKey(id, shadeId);
    setItems((current) =>
      current.filter((item) => lineKey(item.id, item.shade?.id ?? null) !== key),
    );
  }, []);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
      ready,
      bumpKey,
      storageError: invalidData
        ? "Some invalid saved cart items were removed."
        : storageError,
      addItem,
      replaceItems,
      setQuantity,
      removeItem,
    }),
    [
      items,
      ready,
      bumpKey,
      storageError,
      invalidData,
      addItem,
      replaceItems,
      setQuantity,
      removeItem,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast ? (
        <section
          className={`cart-toast${toast.closing ? " is-closing" : ""}`}
          role="status"
          aria-live="polite"
          tabIndex={0}
          onClick={(event) => {
            if (
              event.target instanceof Element &&
              event.target.closest("a, button")
            ) {
              return;
            }
            router.push("/cart");
          }}
          onKeyDown={(event) => {
            if (
              event.target === event.currentTarget &&
              (event.key === "Enter" || event.key === " ")
            ) {
              event.preventDefault();
              router.push("/cart");
            }
          }}
          onPointerEnter={pauseToast}
          onPointerLeave={resumeToast}
          onTouchStart={pauseToast}
          onTouchEnd={resumeToast}
          onTouchCancel={resumeToast}
        >
          <CartThumbnail
            photoUrl={toast.item.shade?.imageUrl ?? toast.item.photoUrl}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">Added to cart</p>
              <button
                type="button"
                className="cart-toast-close"
                aria-label="Close"
                onClick={(event) => {
                  event.stopPropagation();
                  dismissToast();
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <p className="truncate font-semibold">{toast.item.name}</p>
            {toast.item.shade ? (
              <p className="truncate text-sm">
                Shade: {toast.item.shade.code ? `${toast.item.shade.code} ` : ""}
                {toast.item.shade.name}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Link
                href="/cart"
                className="btn-primary min-h-11 px-4"
                onClick={(event) => {
                  event.stopPropagation();
                  dismissToast();
                }}
              >
                Checkout
              </Link>
              <button
                type="button"
                className="min-h-11 px-2 text-sm font-semibold underline underline-offset-4"
                onClick={(event) => {
                  event.stopPropagation();
                  dismissToast();
                }}
              >
                Continue shopping
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
