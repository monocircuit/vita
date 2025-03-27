import React, { ReactNode } from "react";
import { UniqueIdentifier, useDraggable } from "@dnd-kit/core";

interface props {
    className?: string;
    title?: string;
    children?: ReactNode;
    onClick?: () => void;
    id: string;
}

const Card: ({ className, title, children, onClick, id }: props) => ReactNode = ({
    className,
    title,
    children,
    onClick,
    id,
}: props) => {
    //need function to deactivate dragability
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
    });

    const style = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            className={`max-w-sm rounded-md overflow-hidden shadow-lg ${className}`}
            style={style}
            {...listeners}
            {...attributes}
        >
            <div className="px-6 py-4">
                <div className="font-bold text-md mb-2">{title}</div>
                <div>{children}</div>
            </div>
        </div>
    );
};

export default Card;
