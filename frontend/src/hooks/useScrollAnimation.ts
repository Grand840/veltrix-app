/**
 * Hook useScrollAnimation — détecte quand un élément entre dans le viewport.
 * Utilise l'Intersection Observer API natif (zéro dépendance).
 *
 * Usage :
 *   const ref = useScrollAnimation();
 *   <div ref={ref} className="scroll-hidden">...</div>
 *   -> La div reçoit la classe "scroll-visible" quand elle entre dans le viewport
 */
"use client";

import { useEffect, useRef } from "react";

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const {
    threshold = 0.15,
    rootMargin = "0px 0px -50px 0px",
    once = true,
  } = options;

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("scroll-hidden");
            entry.target.classList.add("scroll-visible");
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove("scroll-visible");
            entry.target.classList.add("scroll-hidden");
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}

/**
 * Hook pour animer plusieurs enfants en cascade.
 * Chaque enfant avec la classe "stagger-child" reçoit un délai progressif.
 */
export function useStaggerAnimation(delayStep = 100) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const children = container.querySelectorAll(".stagger-child");

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          children.forEach((child, i) => {
            const el = child as HTMLElement;
            el.style.animationDelay = `${i * delayStep}ms`;
            el.classList.remove("scroll-hidden");
            el.classList.add("scroll-visible");
          });
          observer.unobserve(container);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [delayStep]);

  return ref;
}
