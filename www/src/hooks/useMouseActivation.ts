import { useState } from "react";

interface UseMouseActivationConfig {
  global?: boolean;
}

const useMouseActivation = (config: UseMouseActivationConfig = {}) => {
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isPressing, setIsPressing] = useState<boolean>(false);

  const handleMouseEnter: React.MouseEventHandler<unknown> = () => {
    setIsHovering(true);
  };

  const handleMouseLeave: React.MouseEventHandler<unknown> = () => {
    setIsHovering(false);
  };

  const handleMouseDown: React.MouseEventHandler<unknown> = () => {
    setIsPressing(true);

    if (config.global) {
      document.addEventListener("mouseup", (event: any) => {
        handleMouseUp(event);
      });
    }
  };

  const handleMouseUp: React.MouseEventHandler<unknown> = () => {
    setIsPressing(false);
  };
};
