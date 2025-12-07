import { SourceSans3 } from "@monolithium/next/fonts";
import React from "react";

interface CardTextProps {
  text: string;
  title?: string;
}

const CardText = ({ text, title }: CardTextProps) => {
  return (
    <div className={`flex flex-col gap-0.5 ${SourceSans3.className}`}>
      {title && (
        <span className="text-xs font-bold uppercase tracking-wider text-secondary/50">
          {title}
        </span>
      )}
      <div>{text}</div>
    </div>
  );
};

export default CardText;
