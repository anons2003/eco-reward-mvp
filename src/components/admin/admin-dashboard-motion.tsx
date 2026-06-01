"use client";

import { useEffect } from "react";

export function AdminDashboardMotion() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    async function loadMotion() {
      const { default: gsap } = await import("gsap");
      if (cancelled) return;

      const context = gsap.context(() => {
        const revealItems = gsap.utils.toArray<HTMLElement>("[data-admin-reveal]");
        const bars = gsap.utils.toArray<HTMLElement>("[data-admin-bar]");

        gsap.fromTo(
          revealItems,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out", stagger: 0.05 },
        );

        if (bars.length > 0) {
          gsap.fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 0.75, ease: "power3.out", stagger: 0.035, transformOrigin: "bottom" });
        }
      });

      cleanup = () => context.revert();
    }

    void loadMotion();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
