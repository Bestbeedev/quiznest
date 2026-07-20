"use client";

import { useSyncExternalStore } from "react";

const stores = new Map<string, Array<() => void>>();

function subscribe(storageKey: string, callback: () => void) {
  if (!stores.has(storageKey)) stores.set(storageKey, []);
  const listeners = stores.get(storageKey)!;
  listeners.push(callback);
  return () => {
    const arr = stores.get(storageKey);
    if (arr) stores.set(storageKey, arr.filter((l) => l !== callback));
  };
}

function getSnapshot(storageKey: string) {
  const stored = localStorage.getItem(storageKey);
  return stored === null ? true : stored === "true";
}

function getServerSnapshot() {
  return true;
}

function setCollapsed(storageKey: string, value: boolean) {
  localStorage.setItem(storageKey, String(value));
  stores.get(storageKey)?.forEach((l) => l());
}

export function useSidebarCollapsed(storageKey: string) {
  const collapsed = useSyncExternalStore(
    (cb) => subscribe(storageKey, cb),
    () => getSnapshot(storageKey),
    getServerSnapshot,
  );

  const toggle = () => setCollapsed(storageKey, !collapsed);

  return { collapsed, toggle } as const;
}
