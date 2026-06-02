import type { Metadata } from "next";
import { Suspense } from "react";
import { AppToast } from "@/components/shared/app-toast";
import { GlobalLoadingProvider } from "@/components/shared/loading-ui";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "SeaTech",
  description: "Tích điểm xanh khi phân loại rác đúng cách.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const blockedAttributes = new Set(["bis_skin_checked"]);
                const originalSetAttribute = Element.prototype.setAttribute;
                Element.prototype.setAttribute = function patchedSetAttribute(name, value) {
                  if (blockedAttributes.has(String(name))) return;
                  return originalSetAttribute.call(this, name, value);
                };

                const strip = () => {
                  document.querySelectorAll("[bis_skin_checked]").forEach((node) => {
                    node.removeAttribute("bis_skin_checked");
                  });
                };

                strip();
                queueMicrotask(strip);
                requestAnimationFrame(strip);
                document.addEventListener("DOMContentLoaded", strip, { once: true });

                const observer = new MutationObserver((mutations) => {
                  for (const mutation of mutations) {
                    if (mutation.type === "attributes" && mutation.attributeName === "bis_skin_checked") {
                      mutation.target.removeAttribute("bis_skin_checked");
                    }
                    mutation.addedNodes.forEach((node) => {
                      if (node.nodeType !== Node.ELEMENT_NODE) return;
                      node.removeAttribute?.("bis_skin_checked");
                      node.querySelectorAll?.("[bis_skin_checked]").forEach((child) => {
                        child.removeAttribute("bis_skin_checked");
                      });
                    });
                  }
                });

                observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
                window.addEventListener("load", () => {
                  strip();
                  window.setTimeout(strip, 0);
                  window.setTimeout(() => observer.disconnect(), 3000);
                });
              })();
            `,
          }}
          suppressHydrationWarning
        />
      </head>
      <body suppressHydrationWarning>
        <GlobalLoadingProvider>
          {children}
          <Suspense fallback={null}>
            <AppToast />
          </Suspense>
        </GlobalLoadingProvider>
      </body>
    </html>
  );
}
