import { Coordinates } from "@/utils/types/types";

class VirtualRect {
    private store;

    constructor(rect: DOMRect) {
        this.store = {
            x: rect.x,
            y: rect.y,
            height: rect.height,
            width: rect.width,
        };
    }

    get x() {
        return this.store.x;
    }

    get y() {
        return this.store.y;
    }

    get left() {
        return this.store.x;
    }

    get right() {
        return this.store.x + this.store.width;
    }

    get top() {
        return this.store.y;
    }

    get bottom() {
        return this.store.y + this.store.height;
    }

    get height() {
        return this.store.height;
    }

    get width() {
        return this.store.width;
    }

    set x(x: number) {
        this.store.x = x;
    }

    set y(y: number) {
        this.store.y = y;
    }

    set height(height: number) {
        this.store.height = height;
    }

    set width(width: number) {
        this.store.width = width;
    }

    set position(position: Coordinates) {
        this.store.x = position.x;
        this.store.y = position.y;
    }

    get position() {
        return {
            x: this.store.x,
            y: this.store.y,
        };
    }
}

export default VirtualRect;
