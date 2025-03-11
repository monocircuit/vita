const getElementCoordinates = (element: HTMLDivElement | null) => {
    if (element) {
        const RECT = element.getBoundingClientRect();

        return {
            x: RECT.x,
            y: RECT.y,
        };
    }

    return { x: 0, y: 0 };
};

export default getElementCoordinates;
