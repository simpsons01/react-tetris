import React from "react";
import GRID from "../common/grid";
import { IScreenSize } from "../context/screen";
import { ISizeConfig } from "../context/sizeConfig";

const allSizeConfig = {
  twoExtraLarge: {
    mode: {
      single: {
        playable: true,
        playField: {
          cube: 36,
          width: 36 * 10 + 4 * 2, // 368
          height: 36 * 20 + 4 * 2, // 728
        },
        widget: {
          displayNumber: {
            width: 36 * 4 + 5 * 2 + 4 * 2, // 162,
            height: 36 * 4 + 5 * 2 + 4 * 2, // 162,
          },
          nextPolyomino: {
            cube: 36,
            width: 36 * 4 + 5 * 2 + 4 * 2, // 162,
            height: 36 * 4 + 5 * 2 + 4 * 2, // 162,
          },
        },
        distanceBetweenPlayFieldAndWidget: 30,
        distanceBetweenWidgetAndWidget: 30,
      },
      double: {
        playable: true,
        playField: {
          cube: 36,
          width: 36 * 10 + 4 * 2, // 368
          height: 36 * 20 + 4 * 2, // 728
        },
        widget: {
          displayNumber: {
            width: 24 * 4 + 5 * 2 + 4 * 2, // 114,
            height: 24 * 4 + 5 * 2 + 4 * 2, // 114,
          },
          nextPolyomino: {
            cube: 24,
            width: 24 * 4 + 5 * 2 + 4 * 2, // 114,
            height: 24 * 4 + 5 * 2 + 4 * 2, // 114,
          },
        },
        distanceBetweenPlayFieldAndWidget: 24,
        distanceBetweenWidgetAndWidget: 24,
      },
    },
    font: {
      level: {
        one: 40,
        two: 36,
        three: 32,
        four: 28,
        five: 24,
        six: 20,
      },
      lineHeight: 1.5,
    },
  },
  extraLarge: {
    mode: {
      single: {
        playable: true,
        playField: {
          cube: 32,
          width: 32 * 10 + 4 * 2, // 328
          height: 32 * 20 + 4 * 2, // 648
        },
        widget: {
          displayNumber: {
            width: 32 * 4 + 5 * 2 + 4 * 2, // 146,
            height: 32 * 4 + 5 * 2 + 4 * 2, // 146,
          },
          nextPolyomino: {
            cube: 32,
            width: 32 * 4 + 5 * 2 + 4 * 2, // 146,
            height: 32 * 4 + 5 * 2 + 4 * 2, // 146,
          },
        },
        distanceBetweenPlayFieldAndWidget: 28,
        distanceBetweenWidgetAndWidget: 28,
      },
      double: {
        playable: true,
        cube: 32,
        playField: {
          cube: 32,
          width: 32 * 10 + 4 * 2, // 328
          height: 32 * 20 + 4 * 2, // 648
        },
        widget: {
          displayNumber: {
            width: 20 * 4 + 5 * 2 + 4 * 2, // 98,
            height: 20 * 4 + 5 * 2 + 4 * 2, // 98,
          },
          nextPolyomino: {
            cube: 20,
            width: 20 * 4 + 5 * 2 + 4 * 2, // 98,
            height: 20 * 4 + 5 * 2 + 4 * 2, // 98,
          },
        },
        distanceBetweenPlayFieldAndWidget: 20,
        distanceBetweenWidgetAndWidget: 20,
      },
    },
    font: {
      level: {
        one: 36,
        two: 32,
        three: 28,
        four: 24,
        five: 20,
        six: 16,
      },
      lineHeight: 1.5,
    },
  },
  large: {
    mode: {
      single: {
        playable: true,
        playField: {
          cube: 28,
          width: 28 * 10 + 4 * 2, // 288
          height: 28 * 20 + 4 * 2, // 568
        },
        widget: {
          displayNumber: {
            width: 28 * 4 + 5 * 2 + 4 * 2, // 130,
            height: 28 * 4 + 5 * 2 + 4 * 2, // 130,
          },
          nextPolyomino: {
            cube: 28,
            width: 28 * 4 + 5 * 2 + 4 * 2, // 130,
            height: 28 * 4 + 5 * 2 + 4 * 2, // 130,
          },
        },
        distanceBetweenPlayFieldAndWidget: 28,
        distanceBetweenWidgetAndWidget: 28,
      },
      double: {
        playable: true,
        playField: {
          cube: 28,
          width: 28 * 10 + 4 * 2, // 288
          height: 28 * 20 + 4 * 2, // 568
        },
        widget: {
          displayNumber: {
            width: 16 * 4 + 5 * 2 + 4 * 2, // 82,
            height: 16 * 4 + 5 * 2 + 4 * 2, // 82,,
          },
          nextPolyomino: {
            cube: 16,
            width: 16 * 4 + 5 * 2 + 4 * 2, // 82,
            height: 16 * 4 + 5 * 2 + 4 * 2, // 82,
          },
        },
        distanceBetweenPlayFieldAndWidget: 12,
        distanceBetweenWidgetAndWidget: 12,
      },
    },
    font: {
      level: {
        one: 36,
        two: 28,
        three: 24,
        four: 20,
        five: 16,
        six: 12,
      },
      lineHeight: 1.5,
    },
  },
  medium: {
    mode: {
      single: {
        playable: true,
        playField: {
          cube: 32,
          width: 32 * 10 + 4 * 2, // 328
          height: 32 * 20 + 4 * 2, // 648
        },
        widget: {
          displayNumber: {
            width: 32 * 4 + 5 * 2 + 4 * 2, // 146,
            height: 32 * 4 + 5 * 2 + 4 * 2, // 146,
          },
          nextPolyomino: {
            cube: 32,
            width: 32 * 4 + 5 * 2 + 4 * 2, // 146,
            height: 32 * 4 + 5 * 2 + 4 * 2, // 146,
          },
        },
        distanceBetweenPlayFieldAndWidget: 24,
        distanceBetweenWidgetAndWidget: 24,
      },
      double: {
        playable: false,
        playField: {
          cube: 0,
          width: 0,
          height: 0,
        },
        widget: {
          displayNumber: {
            width: 0,
            height: 0,
          },
          nextPolyomino: {
            cube: 0,
            width: 0,
            height: 0,
          },
        },
        distanceBetweenPlayFieldAndWidget: 0,
        distanceBetweenWidgetAndWidget: 0,
      },
    },
    font: {
      level: {
        one: 36,
        two: 28,
        three: 24,
        four: 20,
        five: 16,
        six: 12,
      },
      lineHeight: 1.5,
    },
  },
  belowMedium: {
    mode: {
      single: {
        playable: false,
        playField: {
          cube: 0,
          width: 0,
          height: 0,
        },
        widget: {
          displayNumber: {
            width: 0,
            height: 0,
          },
          nextPolyomino: {
            cube: 0,
            width: 0,
            height: 0,
          },
        },
        distanceBetweenPlayFieldAndWidget: 0,
        distanceBetweenWidgetAndWidget: 0,
      },
      double: {
        playable: false,
        playField: {
          cube: 0,
          width: 0,
          height: 0,
        },
        widget: {
          displayNumber: {
            width: 0,
            height: 0,
          },
          nextPolyomino: {
            cube: 0,
            width: 0,
            height: 0,
          },
        },
        distanceBetweenPlayFieldAndWidget: 0,
        distanceBetweenWidgetAndWidget: 0,
      },
    },
    font: {
      level: {
        one: 36,
        two: 28,
        three: 24,
        four: 20,
        five: 16,
        six: 12,
      },
      lineHeight: 1.5,
    },
  },
};

const getSizeConfigByWindowWidth = () => {
  let config = null;
  if (window.innerWidth > GRID.TWO_EXTRA_LARGE) {
    config = allSizeConfig.twoExtraLarge;
  } else if (window.innerWidth > GRID.EXTRA_LARGE) {
    config = allSizeConfig.extraLarge;
  } else if (window.innerWidth > GRID.LARGE) {
    config = allSizeConfig.large;
  } else if (window.innerWidth > GRID.MEDIUM) {
    config = allSizeConfig.medium;
  } else {
    config = allSizeConfig.belowMedium;
  }
  return config;
};

const getScreenSize = () => {
  const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  const screenHeight =
    window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

  return {
    width: screenWidth,
    height: screenHeight,
  };
};

const useSizeConfig = function () {
  const [sizeConfig, setSizeConfig] = React.useState<ISizeConfig>(getSizeConfigByWindowWidth());
  const [screenSize, setScreenSize] = React.useState<IScreenSize>(getScreenSize());

  React.useEffect(() => {
    const resizeHandler = () => {
      setSizeConfig(getSizeConfigByWindowWidth());
      setScreenSize(getScreenSize());
    };
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return {
    sizeConfig,
    screenSize,
  };
};

export default useSizeConfig;
