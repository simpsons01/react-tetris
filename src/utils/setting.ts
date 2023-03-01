export interface ISetting {
  gameplay: {
    single: {
      startLevel: number;
    };
  };
  control: {
    moveLeft: string;
    moveRight: string;
    softDrop: string;
    hardDrop: string;
    hold: string;
    clockwiseRotation: string;
    counterclockwiseRotation: string;
  };
}
