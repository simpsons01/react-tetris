import React from "react";

export interface ISizeConfig {
  mode: {
    single: {
      playable: boolean;
      playField: {
        cube: number;
        width: number;
        height: number;
      };
      widget: {
        displayNumber: {
          width: number;
          height: number;
        };
        nextPolyomino: {
          cube: number;
          width: number;
          height: number;
        };
      };
      distanceBetweenPlayFieldAndWidget: number;
      distanceBetweenWidgetAndWidget: number;
    };
    double: {
      playable: boolean;
      playField: {
        cube: number;
        width: number;
        height: number;
      };
      widget: {
        displayNumber: {
          width: number;
          height: number;
        };
        nextPolyomino: {
          cube: number;
          width: number;
          height: number;
        };
      };
      distanceBetweenPlayFieldAndWidget: number;
      distanceBetweenWidgetAndWidget: number;
    };
  };
  font: {
    level: {
      one: number;
      two: number;
      three: number;
      four: number;
      five: number;
      six: number;
    };
    lineHeight: number;
  };
}

export const SizeConfigContext = React.createContext<ISizeConfig>({} as ISizeConfig);

export const useSizeConfigContext = function () {
  return React.useContext(SizeConfigContext);
};
