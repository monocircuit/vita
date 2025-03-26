const getCenterOnRect = (rect: DOMRect) => {
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
    };
};

export default getCenterOnRect;
