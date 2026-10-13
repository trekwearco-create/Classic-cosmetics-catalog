"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  CATALOG_SYNC_CHANNEL,
  CATALOG_SYNC_STORAGE_KEY,
} from "@/lib/catalog-sync";

export default function CatalogSync() {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => router.refresh();
    const channel =
      "BroadcastChannel" in window
        ? new BroadcastChannel(CATALOG_SYNC_CHANNEL)
        : null;
    if (channel) channel.onmessage = refresh;
    const onStorage = (event: StorageEvent) => {
      if (event.key === CATALOG_SYNC_STORAGE_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      channel?.close();
      window.removeEventListener("storage", onStorage);
    };
  }, [router]);

  return null;
}
