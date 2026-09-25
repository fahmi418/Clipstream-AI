"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.75,
  direction = "up",
  distance = 32,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms or seconds
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "scale" | "none";
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Convert delay to seconds if provided in ms
    const delaySec = delay > 10 ? delay / 1000 : delay;

    let x = 0;
    let y = 0;
    let scale = 1;

    if (direction === "up") y = distance;
    if (direction === "down") y = -distance;
    if (direction === "left") x = distance;
    if (direction === "right") x = -distance;
    if (direction === "scale") scale = 0.94;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        {
          opacity: 0,
          x,
          y,
          scale,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration,
          delay: delaySec,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [delay, duration, direction, distance]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform, opacity" }}>
      {children}
    </div>
  );
}
