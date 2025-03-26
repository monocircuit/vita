const getRelativeRect = (rect: DOMRect, relativeTo: DOMRect): DOMRect => {
    // Create the relativeRect object
    const relativeRect = {
        top: rect.top - relativeTo.top,
        left: rect.left - relativeTo.left,
        bottom: rect.bottom - relativeTo.top,
        right: rect.right - relativeTo.left,
        width: rect.width,
        height: rect.height,
        x: rect.x - relativeTo.x,
        y: rect.y - relativeTo.y,

        // Define a toJSON method to control JSON serialization
        toJSON() {
            return {
                top: this.top,
                left: this.left,
                bottom: this.bottom,
                right: this.right,
                width: this.width,
                height: this.height,
                x: this.x,
                y: this.y,
            };
        },
    };

    return relativeRect;
};
export default getRelativeRect;
