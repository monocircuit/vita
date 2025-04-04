import { DragEndEvent } from "@dnd-kit/core";
import { Coordinates, Transform } from "@dnd-kit/utilities";
import { useState } from "react";

const useDraggableDelta = () => {
    const [draggableDelta, setDraggableDelta] = useState<Coordinates>();

    const handleDragEnd = (event: DragEndEvent) => {
        const newDraggableDelta = { x: event.delta.x, y: event.delta.y };

        if (draggableDelta) {
            newDraggableDelta.x += draggableDelta.x;
            newDraggableDelta.y += draggableDelta.y;
        }

        setDraggableDelta(newDraggableDelta);
    };

    return { handleDragEnd, draggableDelta };
};

export default useDraggableDelta;

export const translateWithDraggableDelta = (
    transform: Transform | undefined | null,
    draggableDelta: Coordinates | undefined
) => {
    return `translate3d(${(transform?.x ?? 0) + (draggableDelta?.x ?? 0)}px, ${
        (transform?.y ?? 0) + (draggableDelta?.y ?? 0)
    }px, 0px)`;
};
