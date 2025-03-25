import React, { ReactNode } from "react";

interface props {
    className?: string;
    title?: string;
    children?: ReactNode;
    onClick?: () => void;
}

const Card: ({ className, title, children }: props) => ReactNode = ({
    className,
    title,
    children,
    onClick,
}: props) => {
    return (
        <div className={`max-w-sm rounded-md overflow-hidden shadow-lg ${className}`}>
            <button onClick={onClick}>
                <div className="px-6 py-4">
                    <div className="font-bold text-md mb-2">{title}</div>
                    <div>{children}</div>
                </div>
            </button>
        </div>
    );
};

export default Card;
