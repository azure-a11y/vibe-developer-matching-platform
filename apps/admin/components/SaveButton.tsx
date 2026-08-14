'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

/**
 * `useFormStatus` only reports pending state, so "저장됨" is inferred from the
 * pending→idle edge rather than a server response — good enough for a form
 * with no client-visible failure mode (the action throws, which Next surfaces
 * via its own error boundary, not through this button).
 */
export function SaveButton({ children = '저장' }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus();
  const [justSaved, setJustSaved] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      setJustSaved(true);
      const timer = setTimeout(() => setJustSaved(false), 1800);
      return () => clearTimeout(timer);
    }
    wasPending.current = pending;
  }, [pending]);

  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? '저장 중…' : justSaved ? '저장됨 ✓' : children}
    </button>
  );
}
