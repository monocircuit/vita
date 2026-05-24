"use client";

import { CSSProperties, ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
};

const Reveal = ({ children, delay = 0, y = 24, className, style }: RevealProps) => {
  const [ref, visible] = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 700ms ease ${delay}ms, transform 700ms ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Reveal;
