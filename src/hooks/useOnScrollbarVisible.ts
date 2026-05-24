import { useEffect } from "react";

const useOnScrollbarVisible = (f: () => void, dependencies: []) =>
  useEffect(() => {
    // console.log(window.scrollbars.visible);
    if (document.body.clientHeight > window.innerHeight) f();
  }, [dependencies, f]);

export default useOnScrollbarVisible;
