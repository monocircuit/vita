import React, { ReactNode } from "react";

interface props {
  className?: string;
  title?: string;
  children?: ReactNode;
}

const Card: ({ className, title, children }: props) => ReactNode = ({
  className,
  title,
  children,
}: props) => {
  return (
    <div
      className={`max-w-sm overflow-hidden monolithium-border m-1 ${className}`}
    >
      <div className="p-2">
        <div className="font-bold text-md mb-2 rounded-20 bg-gray-300 text-center">
          {title}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Card;
