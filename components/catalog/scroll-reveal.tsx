"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
} from "react";

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.classList.add("catalog-scroll-reveal-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("catalog-scroll-reveal-visible");
        observer.unobserve(entry.target);
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`catalog-scroll-reveal ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
