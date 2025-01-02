const getMouseCoordinates = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    element: React.RefObject<HTMLElement | null>
) => {
    const elementBounding = element?.current?.getBoundingClientRect();

    if (elementBounding) {
        return {
            /**
             * Calculates the position of the cursor relative to the left
             * border of the element.
             */
            x: event.clientX - elementBounding.left,
            /**
             * Calculates the position of the cursor relative to the top
             * border of the element.
             */
            y: event.clientY - elementBounding.top,
        };
    } else return null;
};

export default getMouseCoordinates;
