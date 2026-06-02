"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

type GlobalLoadingContextValue = {
  setGlobalLoading: (label?: string) => void;
  clearGlobalLoading: () => void;
};

type PendingSubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: string;
  children: ReactNode;
};

type LoadingButtonContentProps = {
  loading: boolean;
  loadingLabel: string;
  children: ReactNode;
};

const GlobalLoadingContext = createContext<GlobalLoadingContextValue | null>(null);
const fallbackDuration = 2500;
const displayDelay = 180;

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function isInternalNavigation(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  if (url.pathname === window.location.pathname && url.search === window.location.search) return false;

  return true;
}

export function LoadingSpinner({ className = "" }: { className?: string }) {
  return <Loader2 aria-hidden="true" className={`animate-spin ${className}`} size={18} />;
}

export function LoadingButtonContent({ loading, loadingLabel, children }: LoadingButtonContentProps) {
  if (!loading) return children;

  return (
    <>
      <LoadingSpinner className="shrink-0" />
      <span>{loadingLabel}</span>
    </>
  );
}

export function PendingSubmitButton({ children, disabled, pendingLabel = "Đang xử lý...", ...props }: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button {...props} disabled={disabled || pending} type={props.type ?? "submit"}>
      <LoadingButtonContent loading={pending} loadingLabel={pendingLabel}>
        {children}
      </LoadingButtonContent>
    </button>
  );
}

export function useGlobalLoading() {
  const context = useContext(GlobalLoadingContext);
  if (!context) {
    throw new Error("useGlobalLoading must be used inside GlobalLoadingProvider.");
  }
  return context;
}

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const timeoutRef = useRef<number | null>(null);
  const delayRef = useRef<number | null>(null);
  const [label, setLabel] = useState("Đang xử lý...");
  const [active, setActive] = useState(false);

  const clearGlobalLoading = useCallback(() => {
    if (delayRef.current !== null) {
      window.clearTimeout(delayRef.current);
      delayRef.current = null;
    }
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActive(false);
  }, []);

  const setGlobalLoading = useCallback(
    (nextLabel = "Đang xử lý...") => {
      if (delayRef.current !== null) {
        window.clearTimeout(delayRef.current);
      }
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setLabel(nextLabel);
      delayRef.current = window.setTimeout(() => {
        delayRef.current = null;
        setActive(true);
        timeoutRef.current = window.setTimeout(clearGlobalLoading, fallbackDuration);
      }, displayDelay);
    },
    [clearGlobalLoading],
  );

  useEffect(() => {
    const timeout = window.setTimeout(clearGlobalLoading, 0);
    return () => window.clearTimeout(timeout);
  }, [pathname, clearGlobalLoading]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || isModifiedClick(event)) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalNavigation(anchor)) return;

      setGlobalLoading("Đang chuyển trang...");
    }

    function handleSubmit(event: SubmitEvent) {
      if (event.defaultPrevented) return;
      const target = event.target;
      if (!(target instanceof HTMLFormElement)) return;
      if (!target.checkValidity()) return;
      setGlobalLoading("Đang xử lý...");
    }

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, [setGlobalLoading]);

  const value = useMemo(() => ({ setGlobalLoading, clearGlobalLoading }), [setGlobalLoading, clearGlobalLoading]);

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
      <div aria-hidden={!active} className={`pointer-events-none fixed inset-x-0 top-0 z-[120] transition-opacity duration-200 ${active ? "opacity-100" : "opacity-0"}`}>
        <div className="h-1 overflow-hidden bg-[#d8f5df]">
          <div className="h-full w-1/3 animate-[loading-progress_1.1s_ease-in-out_infinite] rounded-full bg-[#007a3d]" />
        </div>
      </div>
      <div className={`pointer-events-none fixed left-1/2 top-5 z-[121] -translate-x-1/2 transition-all duration-200 ${active ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`} role="status" aria-live="polite" aria-atomic="true">
        <div className="flex min-h-11 items-center gap-2 rounded-full border border-[#bdcabe]/70 bg-white/92 px-4 text-sm font-black text-[#071b12] shadow-[0_18px_45px_rgba(21,29,24,0.16)] backdrop-blur">
          <LoadingSpinner className="text-[#007a3d]" />
          <span>{label}</span>
        </div>
      </div>
    </GlobalLoadingContext.Provider>
  );
}
