"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartShade = {
  id: string;
  code: string | null;
  name: string;
};

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  shade: CartShade | null;
  quantity: number;
};

type CartProduct = Omit<CartItem, "quantity">;
type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  ready: boolean;
  storageError: string | null;
  addItem: (product: CartProduct) => void;
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
      };
    }
    const item: CartItem = {
      id: entry.id,
      slug: entry.slug,
      name: entry.name,
      shade,
      quantity: entry.quantity as number,
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
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [invalidData, setInvalidData] = useState(false);

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

  const addItem = useCallback((product: CartProduct) => {
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
      storageError: invalidData
        ? "Some invalid saved cart items were removed."
        : storageError,
      addItem,
      setQuantity,
      removeItem,
    }),
    [items, ready, storageError, invalidData, addItem, setQuantity, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
