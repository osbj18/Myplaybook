import { useEffect, useState } from 'react';

type Listener = (msg: { text: string; key: number }) => void;
const listeners = new Set<Listener>();

/** Visar ett kort meddelande längst ner på skärmen. */
export function toast(text: string) {
  const msg = { text, key: Date.now() };
  listeners.forEach((l) => l(msg));
}

export function useToastMessage() {
  const [msg, setMsg] = useState<{ text: string; key: number } | null>(null);
  useEffect(() => {
    listeners.add(setMsg);
    return () => { listeners.delete(setMsg); };
  }, []);
  return msg;
}

export const errorText = (e: unknown) => (e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : 'Något gick fel');
