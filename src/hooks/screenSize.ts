import { ISize } from "../common/utils/index";
import React from "react";

export interface IScreenSize extends ISize {}

export const ScreenSizeContext = React.createContext<IScreenSize>({
  width: 0,
  height: 0,
});

const useScreenSize = function () {
  const [width, setWidth] = React.useState(0);

  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    const screenWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    const screenHeight =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;
    const handleResize = () => {
      setHeight(screenHeight);
      setWidth(screenWidth);
    };
    handleResize();
  }, []);

  return {
    width,
    height,
  };
};

export default useScreenSize;
