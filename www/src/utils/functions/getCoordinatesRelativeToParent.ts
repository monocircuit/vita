const getCoordinatesRelativeToParent = (child: HTMLDivElement, parent: HTMLDivElement) => {
    const childRect = child.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    return {
        x: childRect.left - parentRect.left,
        y: childRect.top - parentRect.top,
    };
};

export default getCoordinatesRelativeToParent;
