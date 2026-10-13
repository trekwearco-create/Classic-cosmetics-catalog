export const CATALOG_SYNC_CHANNEL = "classic-cosmetics-catalog";
export const CATALOG_SYNC_STORAGE_KEY = "classic-cosmetics-catalog-updated";

export function notifyCatalogChanged(): void {
  if (typeof window === "undefined") return;
  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(CATALOG_SYNC_CHANNEL);
    channel.postMessage("changed");
    channel.close();
  }
  try {
    window.localStorage.setItem(CATALOG_SYNC_STORAGE_KEY, String(Date.now()));
  } catch {
    // BroadcastChannel remains available where storage is disabled.
  }
}
