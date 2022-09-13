import React from "react";
import { getRandomPolyominoType, POLYOMINO_TYPE } from "../common/polyomino";
import Tetris from "../components/Tetris";
import Game from "../components/Game";
import Next from "../components/Next";
import Score from "../components/Score";
import useTetris from "../hooks/tetris";

const Single = (): JSX.Element => {
  const {
    polyominoCoordinate,
    setPolyominoToTetrisData,
    tetrisData,
    createPolyomino,
    movePolyomino,
    changePolyominoShape,
    clearRowFilledWithCube,
    getRowFilledWithCube,
    getEmptyRow,
    fillEmptyRow,
    getPolyominoIsCollideWithNearbyCube,
    getCoordinateIsCollideWithTetris,
    previewPolyomino,
    pauseClearRowAnimation,
    continueClearRowAnimation,
    pauseFillRowAnimation,
    continueFillRowAnimation,
  } = useTetris();

  const [nextPolyominoType, setNextPolyominoType] = React.useState<POLYOMINO_TYPE>(getRandomPolyominoType());

  const [score, setScore] = React.useState<number>(0);

  return (
    <Game.Double
      self={{
        score: (fontSize) => <Score fontSize={fontSize} score={score} />,
        next: (cubeDistance) => <Next cubeDistance={cubeDistance} polyominoType={nextPolyominoType} />,
        tetris: (cubeDistance) => (
          <Tetris
            cubeDistance={cubeDistance}
            tetris={tetrisData}
            polyomino={polyominoCoordinate}
            previewPolyomino={previewPolyomino}
          />
        ),
      }}
      opponent={{
        score: (fontSize) => <Score fontSize={fontSize} score={score} />,
        next: (cubeDistance) => <Next cubeDistance={cubeDistance} polyominoType={nextPolyominoType} />,
        tetris: (cubeDistance) => (
          <Tetris
            cubeDistance={cubeDistance}
            tetris={tetrisData}
            polyomino={polyominoCoordinate}
            previewPolyomino={previewPolyomino}
          />
        ),
      }}
      countdown={() => <div>60</div>}
    />
  );
};

export default Single;
