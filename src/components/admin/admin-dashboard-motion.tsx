"use client";

import { useEffect } from "react";
import gsap from "gsap";

export function AdminDashboardMotion() {
  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-admin-reveal]",
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out", stagger: 0.05 },
      );
      gsap.fromTo("[data-admin-bar]", { scaleY: 0 }, { scaleY: 1, duration: 0.75, ease: "power3.out", stagger: 0.035, transformOrigin: "bottom" });
    });

    return () => context.revert();
  }, []);

  return null;
}
