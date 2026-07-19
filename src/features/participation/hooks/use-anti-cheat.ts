"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_VIOLATIONS = 3;

const BLOCKED_KEYS = new Set([
  "F12",
  "PrintScreen",
  "Snapshot",
]);

interface BlockedCombo {
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  key: string;
}

const BLOCKED_COMBOS: BlockedCombo[] = [
  { ctrl: true, key: "c" },
  { ctrl: true, key: "v" },
  { ctrl: true, key: "x" },
  { ctrl: true, key: "u" },
  { ctrl: true, key: "s" },
  { ctrl: true, key: "p" },
  { ctrl: true, key: "a" },
  { ctrl: true, key: "i" },
  { ctrl: true, key: "j" },
  { ctrl: true, shift: true, key: "i" },
  { ctrl: true, shift: true, key: "j" },
  { ctrl: true, shift: true, key: "c" },
  { ctrl: true, shift: true, key: "u" },
  { meta: true, key: "c" },
  { meta: true, key: "v" },
  { meta: true, key: "x" },
  { meta: true, key: "u" },
  { meta: true, key: "s" },
  { meta: true, key: "p" },
  { meta: true, key: "i" },
  { alt: true, key: "Tab" },
  { alt: true, key: "F4" },
];

function matchesCombo(e: KeyboardEvent, combo: BlockedCombo) {
  if (combo.ctrl && !e.ctrlKey) return false;
  if (combo.meta && !e.metaKey) return false;
  if (combo.shift && !e.shiftKey) return false;
  if (combo.alt && !e.altKey) return false;
  if (e.key.toLowerCase() !== combo.key) return false;
  if (!combo.ctrl && !combo.meta && (e.ctrlKey || e.metaKey)) return false;
  return true;
}

interface FullscreenableElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

export function useAntiCheat({ enabled = true }: { enabled?: boolean } = {}) {
  const [violations, setViolations] = useState(0);
  const [violationMessage, setViolationMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const violationRef = useRef(0);
  const onSubmitRef = useRef<(() => void) | null>(null);

  const addViolation = useCallback((message: string) => {
    violationRef.current += 1;
    setViolations(violationRef.current);
    setViolationMessage(`${message} (${violationRef.current}/${MAX_VIOLATIONS})`);
    setTimeout(() => setViolationMessage(null), 3000);

    if (violationRef.current >= MAX_VIOLATIONS) {
      setTimeout(() => onSubmitRef.current?.(), 500);
    }
  }, []);

  const setOnSubmit = useCallback((cb: () => void) => {
    onSubmitRef.current = cb;
  }, []);

  const requestFullscreen = useCallback(async () => {
    try {
      const el = document.documentElement as FullscreenableElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch {
      // Fullscreen not supported or blocked
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      const doc = document as FullscreenDocument;
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (doc.webkitFullscreenElement) {
        await doc.webkitExitFullscreen?.();
      } else if (doc.msFullscreenElement) {
        await doc.msExitFullscreen?.();
      }
    } catch {
      // ignore
    }
    setIsFullscreen(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onVisibilityChange = () => {
      if (document.hidden) {
        addViolation("Changement d'onglet détecté");
      }
    };

    const onBlur = () => {
      addViolation("Perte de focus détectée");
    };

    const onContextMenu = (e: Event) => {
      e.preventDefault();
      addViolation("Clic droit détecté");
    };

    const onCopy = (e: Event) => {
      e.preventDefault();
      addViolation("Copie détectée");
    };

    const onPaste = (e: Event) => {
      e.preventDefault();
      addViolation("Collage détecté");
    };

    const onCut = (e: Event) => {
      e.preventDefault();
      addViolation("Couper détecté");
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (BLOCKED_KEYS.has(e.key)) {
        e.preventDefault();
        addViolation(`Touche ${e.key} bloquée`);
        return;
      }
      for (const combo of BLOCKED_COMBOS) {
        if (matchesCombo(e, combo)) {
          e.preventDefault();
          addViolation("Raccourci clavier bloqué");
          return;
        }
      }
    };

    const onDragStart = (e: Event) => {
      e.preventDefault();
    };

    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("cut", onCut);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [enabled, addViolation]);

  return {
    violations,
    violationMessage,
    isFullscreen,
    setOnSubmit,
    requestFullscreen,
    exitFullscreen,
    violationLimit: MAX_VIOLATIONS,
  };
}
