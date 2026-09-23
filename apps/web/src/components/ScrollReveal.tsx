"use client";

import { useEffect, useRef } from "react";

/**
 * ScrollReveal — lightweight scroll animation with IntersectionObserver.
 * No external library. ~0.5KB. Adds class "revealed" when element enters viewport.
 * Uses pure CSS transitions defined in globals.css.
 */
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  direction?: "up" | "left" | "right" | "none";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add("sr-revealed");
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const dirClass = {
    up: "sr-from-up",
    left: "sr-from-left",
    right: "sr-from-right",
    none: "sr-from-none",
  }[direction];

  return (
    <div ref={ref} className={`sr-base ${dirClass} ${className}`}>
      {children}
    </div>
  );
}
