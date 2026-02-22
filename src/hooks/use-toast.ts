"use client";

import { useEffect, useState } from "react";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

type Listener = () => void;

let _state: ToastItem[] = [];
const _listeners = new Set<Listener>();

function notify() {
  _listeners.forEach((l) => l());
}

export function toast(opts: Omit<ToastItem, "id">) {
  const id = Math.random().toString(36).slice(2);
  _state = [{ id, ...opts }, ..._state].slice(0, 5);
  notify();
  setTimeout(() => dismiss(id), 5000);
}

export function dismiss(id: string) {
  _state = _state.filter((t) => t.id !== id);
  notify();
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>(_state);

  useEffect(() => {
    const listener = () => setToasts([..._state]);
    _listeners.add(listener);
    return () => {
      _listeners.delete(listener);
    };
  }, []);

  return { toasts, dismiss };
}
