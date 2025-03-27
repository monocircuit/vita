import React from "react";
import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";

interface props {
    className?: string;
    children: React.ReactNode;
    key: UniqueIdentifier;
}

const Droppable: ({ children, className, key }: props) => React.ReactNode = ({
    children,
    className,
    key,
}) => {
    const { isOver, setNodeRef } = useDroppable({
        id: key,
    });
    const style = {
        color: isOver ? "green" : undefined,
    };

    return (
        <div className={className} ref={setNodeRef} style={style}>
            {children}
        </div>
    );
};

export default Droppable;
