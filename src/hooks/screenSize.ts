import React from "react";
import { setRef } from "../common/utils";

export interface IScreenSize {
  width: number;
  height: number;
}

export const ScreenSizeContext = React.createContext<IScreenSize>({ width: 0, height: 0 });

const useScreenSize = function () {
  const isInit = React.useRef(false);

  const [width, setWidth] = React.useState(0);

  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const handleResize = () => {
      if (height !== screenHeight) {
        setHeight(screenHeight);
      }
      if (width !== screenWidth) {
        setWidth(screenWidth);
      }
    };
    if (!isInit.current) {
      handleResize();
      setRef(isInit, true);
    }
  }, [height, width]);

  return {
    width,
    height,
  };
};

export default useScreenSize;
