import { useSyncExternalStore } from "react";

import type { ToastProps } from "./Toast";

export type ToasterToast = ToastProps & {
  id: string;
  title?: string;
  description?: string;
};

type ToastInput = Omit<ToasterToast, "id">;

const TOAST_DURATION_MS = 5000;

let toasts: ToasterToast[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function toast(input: ToastInput): { id: string; dismiss: () => void } {
  const id = crypto.randomUUID();
  toasts = [...toasts, { ...input, id }];
  emit();
  setTimeout(() => dismiss(id), TOAST_DURATION_MS);
  return { id, dismiss: () => dismiss(id) };
}

toast.success = (description: string, title = "Success") =>
  toast({ title, description, variant: "success" });
toast.error = (description: string, title = "Something went wrong") =>
  toast({ title, description, variant: "destructive" });
toast.warning = (description: string, title = "Heads up") =>
  toast({ title, description, variant: "warning" });

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return toasts;
}

export function useToast() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { toasts: items, dismiss };
}
