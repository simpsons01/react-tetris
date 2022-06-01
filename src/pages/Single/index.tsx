import React from "react";
import Tetris from "../../components/Tetris";
import useTetris from "../../hooks/tetris";
import { setting } from "../../common/config";

const {
  tetris: { row, col, backgroundColor, blockDistance },
} = setting;

const Single: React.FC = function () {
  const { polyominoData, tetrisData, createPolyomino } = useTetris(col, row);

  React.useEffect(() => {
    createPolyomino();
  }, [createPolyomino]);
  return (
    <Tetris
      backgroundColor={backgroundColor}
      blockDistance={blockDistance}
      row={row}
      col={col}
      polyomino={polyominoData}
      data={tetrisData}
    />
  );
};

export default Single;
