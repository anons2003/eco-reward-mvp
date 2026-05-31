"use client";

import { type ReactNode, useEffect, useRef } from "react";

export function LandingGsapAnimations({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    async function loadAnimations() {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      cleanup = () => mm.revert();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            ".landing-nav",
            ".landing-hero-copy > *",
            ".landing-hero-media",
            ".landing-hero-float",
            ".landing-section",
            ".landing-card",
            ".landing-reward-card",
            ".landing-testimonial",
            ".landing-scrub-word",
            ".landing-mobile-hero > *",
            ".landing-mobile-card",
          ],
          { clearProps: "all" },
        );
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = scope.current;
        const revealCards = root?.querySelectorAll(".landing-card, .landing-reward-card, .landing-mobile-card") || [];
        const hero = gsap.timeline({ defaults: { ease: "power3.out" } });

        gsap.set(revealCards, { autoAlpha: 0, y: 34, scale: 0.98 });

        hero
          .from(".landing-nav", { autoAlpha: 0, y: -18, duration: 0.5 })
          .from(".landing-hero-copy > *", { autoAlpha: 0, y: 28, duration: 0.7, stagger: 0.12 }, "-=0.15")
          .from(".landing-hero-media", { autoAlpha: 0, y: 36, scale: 0.96, duration: 0.85 }, "-=0.55")
          .from(".landing-hero-float", { autoAlpha: 0, y: 18, scale: 0.9, duration: 0.55, stagger: 0.12 }, "-=0.35")
          .from(".landing-mobile-hero > *", { autoAlpha: 0, y: 24, duration: 0.6, stagger: 0.1 }, 0.1);

        gsap.to(".landing-hero-media > div:first-child", {
          yPercent: -6,
          ease: "none",
          scrollTrigger: {
            trigger: ".landing-hero-media",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        });

        gsap.utils.toArray<HTMLElement>(root?.querySelectorAll(".landing-section") || []).forEach((section) => {
          const media = section.querySelectorAll(".landing-section-media");
          const copy = section.querySelectorAll(".landing-section-copy > *");

          gsap.from(media, {
            autoAlpha: 0,
            x: -36,
            duration: 0.75,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 78%",
              toggleActions: "play none none reverse",
            },
          });

          gsap.from(copy, {
            autoAlpha: 0,
            y: 26,
            duration: 0.65,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 76%",
              toggleActions: "play none none reverse",
            },
          });
        });

        gsap.utils.toArray<HTMLElement>(root?.querySelectorAll(".landing-scrub-text") || []).forEach((text) => {
          if (!text.dataset.scrubReady) {
            const words = text.textContent?.trim().split(/\s+/) || [];
            text.innerHTML = words.map((word) => `<span class="landing-scrub-word inline-block opacity-20">${word}</span>`).join(" ");
            text.dataset.scrubReady = "true";
          }

          gsap.to(text.querySelectorAll(".landing-scrub-word"), {
            opacity: 1,
            stagger: 0.08,
            ease: "none",
            scrollTrigger: {
              trigger: text,
              start: "top 78%",
              end: "bottom 46%",
              scrub: 0.8,
            },
          });
        });

        gsap.utils.toArray<HTMLElement>(root?.querySelectorAll("#desktop-steps .landing-card") || []).forEach((card, index) => {
          gsap.to(card, {
            y: -index * 10,
            scale: 1 - index * 0.015,
            ease: "none",
            scrollTrigger: {
              trigger: "#desktop-steps",
              start: "top 70%",
              end: "bottom 35%",
              scrub: 0.7,
            },
          });
        });

        ScrollTrigger.batch(revealCards, {
          interval: 0.08,
          batchMax: 6,
          start: "top 84%",
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { autoAlpha: 0, y: 34, scale: 0.98 },
              { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.08, ease: "power2.out", overwrite: true },
            );
          },
          onLeaveBack: (batch) => {
            gsap.set(batch, { autoAlpha: 0, y: 34, scale: 0.98, overwrite: true });
          },
        });

        gsap.utils.toArray<HTMLElement>(root?.querySelectorAll(".landing-stat") || []).forEach((stat) => {
          const value = Number(stat.dataset.count || "0");
          const suffix = stat.dataset.suffix || "";
          const decimals = Number(stat.dataset.decimals || "0");
          const counter = { value: 0 };

          gsap.to(counter, {
            value,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: stat,
              start: "top 86%",
              once: true,
            },
            onUpdate: () => {
              stat.textContent = `${counter.value.toLocaleString("en-US", {
                maximumFractionDigits: decimals,
                minimumFractionDigits: decimals,
              })}${suffix}`;
            },
          });
        });
      });
    }

    void loadAnimations();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return <div ref={scope}>{children}</div>;
}
