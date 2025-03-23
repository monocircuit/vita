const isTouchDevice = () => {
    return window.matchMedia("(pointer: coarse)").matches;
};

export default isTouchDevice;
