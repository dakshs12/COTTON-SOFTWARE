"use client";
import { useEffect, useRef, useState } from 'react';
import posthog from 'posthog-js';

// Safari can silently block repeated window.print() calls, so a dialog that does not open within this time counts as blocked.
const PRINT_START_TIMEOUT_MS = 2000;

export const PRINT_BLOCKED_MESSAGE = "The print dialog did not open. Press Ctrl+P (Cmd+P on Mac) to print.";

export function usePrint(eventPrefix: string) {
  const [isPrinting, setIsPrinting] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanupRef.current?.(), []);

  const print = (onBlocked: () => void, properties: Record<string, unknown> = {}) => {
    cleanupRef.current?.();

    const onBeforePrint = () => {
      window.clearTimeout(timer);
      setIsPrinting(false);
    };
    const onAfterPrint = () => {
      posthog.capture(`${eventPrefix}_printed`, properties);
      cleanup();
    };
    const timer = window.setTimeout(() => {
      posthog.capture(`${eventPrefix}_print_blocked`, properties);
      onBlocked();
      cleanup();
    }, PRINT_START_TIMEOUT_MS);

    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
      cleanupRef.current = null;
      setIsPrinting(false);
    }

    cleanupRef.current = cleanup;
    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    setIsPrinting(true);
    window.print();
  };

  return { isPrinting, print };
}
