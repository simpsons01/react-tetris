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
        hold: {
          cube: number;
          width: number;
          height: number;
        };
        nextTetrimino: {
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
        hold: {
          cube: number;
          width: number;
          height: number;
        };
        nextTetrimino: {
          cube: number;
          width: number;
          height: number;
        };
      };
      distanceBetweenPlayFieldAndWidget: number;
      distanceBetweenWidgetAndWidget: number;
    };
  };
}
