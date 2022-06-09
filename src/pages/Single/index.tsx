import React from "react";
import Tetris from "../../components/Tetris";
import useTetris from "../../hooks/tetris";
import { setting } from "../../common/config";
import { CUBE_STATE, DIRECTION } from "../../common/polyomino";
import { setRef } from "../../common/utils";
const {
  tetris: { row, col, backgroundColor, blockDistance },
} = setting;

const Single: React.FC = function () {
  const {
    getAnchorNearbyCube,
    polyomino,
    setPolyominoToTetrisData,
    polyominoData,
    tetrisData,
    createPolyomino,
    movePolyomino,
    changePolyominoShape,
    clearRowFilledWithCube,
    getRowFilledWithCube,
    getRowGapInfo,
    fillEmptyRow,
    isPending,
    setIsPending,
  } = useTetris(col, row);

  React.useEffect(() => {
    function keydownHandler(e: KeyboardEvent) {
      //console.log(e.keyCode);
      if (e.keyCode === 37) {
        movePolyomino(DIRECTION.LEFT);
      } else if (e.keyCode === 39) {
        movePolyomino(DIRECTION.RIGHT);
      } else if (e.keyCode === 40) {
        movePolyomino(DIRECTION.DOWN);
      } else if (e.keyCode === 38) {
        changePolyominoShape();
      } else if (e.keyCode === 32) {
        setPolyominoToTetrisData();
      }
    }
    window.addEventListener("keydown", keydownHandler);
    return () => window.removeEventListener("keydown", keydownHandler);
  });

  React.useEffect(() => {
    // console.log("--------- next render start! ---------------");
    // tetrisData.forEach((cube) => {
    //   if (cube.state === CUBE_STATE.FILLED) console.log(cube);
    // });
    // console.log(" ---------------next render end ---------------");
    //console.log(getRowGapInfo());
  });

  React.useEffect(() => {
    if (!isPending) {
      const filledRow = getRowFilledWithCube();
      // console.log("filledRow is ");
      // console.log(filledRow);
      if (filledRow.length > 0) {
        console.log("clear fill row!");
        setIsPending(true);
        clearRowFilledWithCube(filledRow).then(() => {
          setIsPending(false);
        });
      }
    }
  }, [tetrisData, clearRowFilledWithCube, getRowFilledWithCube, isPending, setIsPending]);

  React.useEffect(() => {
    if (!isPending) {
      const rowGapInfo = getRowGapInfo();
      // console.log("rowGapInfo is ");
      // console.log(rowGapInfo);
      const isGapNotExist = rowGapInfo.length === 0 || (rowGapInfo.length === 1 && rowGapInfo[0].empty.length === 0);
      if (!isGapNotExist) {
        console.log("fill empty row!");
        setIsPending(true);
        fillEmptyRow(rowGapInfo).then(() => {
          setIsPending(false);
        });
      }
    }
  }, [tetrisData, fillEmptyRow, isPending, getRowGapInfo, setIsPending]);

  React.useEffect(() => {
    if (!isPending && polyominoData == null) {
      console.log("create polyomino!");
      createPolyomino();
    }
  }, [isPending, polyominoData, createPolyomino]);

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
