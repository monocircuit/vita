import React from "react";
import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";

interface props {
    className?: string;
    children: React.ReactNode;
    id: UniqueIdentifier;
}

const Droppable: ({ children, className, id }: props) => React.ReactNode = ({
    children,
    className,
    id,
}) => {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
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
