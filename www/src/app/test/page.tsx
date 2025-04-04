"use client";

import React, { useState } from "react";
import { DndContext, useDraggable } from "@dnd-kit/core";

import { Droppable } from "./Droppable";
import { CSS } from "@dnd-kit/utilities";

const Draggable = () => {
    const draggable = useDraggable({ id: "draggable" });

    return (
        <button
            ref={draggable.setNodeRef}
            style={{ transform: CSS.Transform.toString(draggable.transform) }}
            {...draggable.listeners}
            {...draggable.attributes}
        >
            {"drag me"}
        </button>
    );
};

function App() {
    const containers = ["A", "B", "C"];
    const [parent, setParent] = useState(null);

    return (
        <DndContext>
            <Draggable />
        </DndContext>
    );
}

export default App;
