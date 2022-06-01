import React from "react";
import Tetris from "../../components/Tetris";
import useTetris from "../../hooks/tetris";
import { setting } from "../../common/config";
import { DIRECTION } from "../../common/polyomino";

const {
  tetris: { row, col, backgroundColor, blockDistance },
} = setting;

const Single: React.FC = function () {
  const { polyominoData, tetrisData, createPolyomino, movePolyomino } = useTetris(col, row);

  React.useEffect(() => {
    function keydownHandler(e: KeyboardEvent) {
      if (e.keyCode === 37) {
        movePolyomino(DIRECTION.LEFT);
      } else if (e.keyCode === 39) {
        movePolyomino(DIRECTION.RIGHT);
      } else if (e.keyCode === 40) {
        movePolyomino(DIRECTION.DOWN);
      } else if (e.keyCode === 38) {
        movePolyomino(DIRECTION.TOP);
      }
    }
    window.addEventListener("keydown", keydownHandler);
    return () => window.removeEventListener("keydown", keydownHandler);
  });

  React.useEffect(() => {
    if (polyominoData == null) {
      createPolyomino();
    }
  }, [createPolyomino, polyominoData]);
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
