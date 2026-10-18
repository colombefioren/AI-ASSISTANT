"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Animates any element marked with `data-reveal` ("fade", "slide-up" or
 * "stagger" for children) as it enters the viewport. Elements start hidden
 * only when the inline script in the root layout added `js-reveal`, which it
 * skips for reduced-motion users, so content is never stuck invisible.
 */
export function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("js-reveal")) return;
    gsap.registerPlugin(ScrollTrigger);

    const trigger = { start: "top 85%", toggleActions: "play none none none" };
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
        gsap.to(el, { opacity: 1, duration: 0.9, ease: "power2.out", scrollTrigger: { trigger: el, ...trigger } });
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal="slide-up"]').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 32 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, ...trigger } }
        );
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal="stagger"]').forEach((parent) => {
        gsap.to(parent.children, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: parent, ...trigger },
        });
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  return null;
}
