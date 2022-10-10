import React from "react";
import GRID from "../common/grid";
import { IScreenSize } from "../context/screen";
import { ISizeConfig } from "../context/sizeConfig";

const allSizeConfig = {
  twoExtraLarge: {
    mode: {
      single: {
        playable: true,
        cube: 36,
        playField: {
          width: 36 * 10 + 4 * 2, // 368
          height: 36 * 20 + 4 * 2, // 728
        },
        widget: {
          displayNumber: {
            width: 36 * 4 + 5 * 2 + 4 * 2, // 162,
            height: 36 * 4 + 5 * 2 + 4 * 2, // 162,
          },
          nextPolyomino: {
            width: 36 * 4 + 5 * 2 + 4 * 2, // 162,
            height: 36 * 4 + 5 * 2 + 4 * 2, // 162,
          },
        },
        distanceBetweenPlayFieldAndWidget: 30,
        distanceBetweenWidgetAndWidget: 30,
      },
      double: {
        playable: true,
        cube: 36,
        playField: {
          width: 36 * 10 + 4 * 2, // 368
          height: 36 * 20 + 4 * 2, // 728
        },
        widget: {
          displayNumber: {
            width: 36 * 4 + 5 * 2 + 4 * 2, // 162,
            height: 36 * 4 + 5 * 2 + 4 * 2, // 162,
          },
          nextPolyomino: {
            width: 36 * 4 + 5 * 2 + 4 * 2, // 162,
            height: 36 * 4 + 5 * 2 + 4 * 2, // 162,
          },
        },
        distanceBetweenPlayFieldAndWidget: 32,
        distanceBetweenWidgetAndWidget: 32,
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
        cube: 32,
        playField: {
          width: 32 * 10 + 4 * 2, // 328
          height: 32 * 20 + 4 * 2, // 648
        },
        widget: {
          displayNumber: {
            width: 32 * 4 + 5 * 2 + 4 * 2, // 146,
            height: 32 * 4 + 5 * 2 + 4 * 2, // 146,
          },
          nextPolyomino: {
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
          width: 32 * 10 + 4 * 2, // 328
          height: 32 * 20 + 4 * 2, // 648
        },
        widget: {
          displayNumber: {
            width: 32 * 4 + 5 * 2 + 4 * 2, // 146,
            height: 32 * 4 + 5 * 2 + 4 * 2, // 146,
          },
          nextPolyomino: {
            width: 32 * 4 + 5 * 2 + 4 * 2, // 146,
            height: 32 * 4 + 5 * 2 + 4 * 2, // 146,
          },
        },
        distanceBetweenPlayFieldAndWidget: 28,
        distanceBetweenWidgetAndWidget: 28,
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
        cube: 28,
        playField: {
          width: 28 * 10 + 4 * 2, // 288
          height: 28 * 20 + 4 * 2, // 568
        },
        widget: {
          displayNumber: {
            width: 28 * 4 + 5 * 2 + 4 * 2, // 130,
            height: 28 * 4 + 5 * 2 + 4 * 2, // 130,
          },
          nextPolyomino: {
            width: 28 * 4 + 5 * 2 + 4 * 2, // 130,
            height: 28 * 4 + 5 * 2 + 4 * 2, // 130,
          },
        },
        distanceBetweenPlayFieldAndWidget: 28,
        distanceBetweenWidgetAndWidget: 28,
      },
      double: {
        playable: true,
        cube: 28,
        playField: {
          width: 28 * 10 + 4 * 2, // 288
          height: 28 * 20 + 4 * 2, // 568
        },
        widget: {
          displayNumber: {
            width: 28 * 4 + 5 * 2 + 4 * 2, // 130,
            height: 28 * 4 + 5 * 2 + 4 * 2, // 130,
          },
          nextPolyomino: {
            width: 28 * 4 + 5 * 2 + 4 * 2, // 130,
            height: 28 * 4 + 5 * 2 + 4 * 2, // 130,
          },
        },
        distanceBetweenPlayFieldAndWidget: 24,
        distanceBetweenWidgetAndWidget: 24,
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
        cube: 32,
        playField: {
          width: 32 * 10 + 4 * 2, // 328
          height: 32 * 20 + 4 * 2, // 648
        },
        widget: {
          displayNumber: {
            width: 32 * 4 + 5 * 2 + 4 * 2, // 146,
            height: 32 * 4 + 5 * 2 + 4 * 2, // 146,
          },
          nextPolyomino: {
            width: 32 * 4 + 5 * 2 + 4 * 2, // 146,
            height: 32 * 4 + 5 * 2 + 4 * 2, // 146,
          },
        },
        distanceBetweenPlayFieldAndWidget: 24,
        distanceBetweenWidgetAndWidget: 24,
      },
      double: {
        playable: false,
        cube: 0,
        playField: {
          width: 0,
          height: 0,
        },
        widget: {
          displayNumber: {
            width: 0,
            height: 0,
          },
          nextPolyomino: {
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
        cube: 0,
        playField: {
          width: 0,
          height: 0,
        },
        widget: {
          displayNumber: {
            width: 0,
            height: 0,
          },
          nextPolyomino: {
            width: 0,
            height: 0,
          },
        },
        distanceBetweenPlayFieldAndWidget: 0,
        distanceBetweenWidgetAndWidget: 0,
      },
      double: {
        playable: false,
        cube: 0,
        playField: {
          width: 0,
          height: 0,
        },
        widget: {
          displayNumber: {
            width: 0,
            height: 0,
          },
          nextPolyomino: {
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
