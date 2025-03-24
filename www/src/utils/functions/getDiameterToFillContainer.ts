const getDiameterToFillParent = (parent: HTMLDivElement): number => {
    const parentRect = parent.getBoundingClientRect();
    const parentWidth = parentRect.width;
    const parentHeight = parentRect.height;

    // Maximum distance from the center of the circle to any corner of the parent
    const maxDiagonal = Math.sqrt(Math.pow(parentWidth, 2) + Math.pow(parentHeight, 2));

    return maxDiagonal * 2.5; // Diameter to cover the rectangle from any position
};

export default getDiameterToFillParent;
