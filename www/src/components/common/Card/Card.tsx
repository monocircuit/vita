import React, { ReactNode, useState, useRef, useEffect } from "react";

interface CardProps {
  className?: string;
  title: string;
  children?: ReactNode;
  defaultOpen?: boolean;
}

const Card: React.FC<CardProps> = ({
  className = "",
  title,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({ top: rect.top, left: rect.left });
    }
    setIsOpen(prev => !prev);
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-none ${className}`}
    >
      {/* Ghost element to reserve space */}
      <div
        aria-hidden="true"
        className="invisible flex items-center gap-3 rounded-full border border-transparent px-4 py-2 font-semibold"
      >
        <span className="truncate whitespace-nowrap">{title}</span>
        <span className="text-sm leading-none">+</span>
      </div>

      {/* Actual Card */}
      <div
        style={
          isOpen && coords
            ? {
                position: "fixed",
                top: coords.top,
                left: coords.left,
              }
            : {
                position: "absolute",
                top: 0,
                left: 0,
              }
        }
        className={`flex flex-col border border-secondary bg-primary ${
          isOpen
            ? "z-[9999] w-[90vw] max-w-xl rounded-3xl px-4 py-3 shadow-xl"
            : "z-0 w-full rounded-full px-4 py-2"
        }`}
      >
        <button
          type="button"
          className="flex w-full items-center gap-3 text-left font-semibold transition-colors hover:text-secondary focus:outline-none"
          onClick={handleToggle}
          aria-expanded={isOpen}
        >
          <span className="min-w-0 flex-1 truncate whitespace-nowrap">
            {title}
          </span>
          <span className="text-sm leading-none">{isOpen ? "−" : "+"}</span>
        </button>

        <div
          className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen
              ? "mt-2 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
          aria-hidden={!isOpen}
        >
          <div className="min-h-0 text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Card;
