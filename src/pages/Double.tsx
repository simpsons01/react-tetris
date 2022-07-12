import React from "react";
import { DIRECTION } from "../common/polyomino";
import useGame, { GAME_STATE } from "../hooks/game";
import Tetris from "../components/Tetris";
import Game from "../components/Game";
import Next from "../components/Next";
import Score from "../components/Score";

const Single = (): JSX.Element => {
  const {
    tetris,
    polyomino,
    nextPolyominoType,
    previewPolyomino,
    score,
    gameState,
    filledRow,
    emptyRowGap,
    setGameState,
    setScore,
    checkIsPolyominoCollideWithTetris,
    movePolyomino,
    changePolyominoShape,
    handlePolyominoCreate,
    handlePolyominoFalling,
    handleGameOver,
    handleClearFilledRow,
    handleNextPolyominoTypeCreate,
    handleFillEmptyRow,
    startCountdown,
    setPrevGameState,
  } = useGame();

  return (
    <Game.Double
      self={{
        score: (fontSize) => <Score fontSize={fontSize} score={score} />,
        next: (cubeDistance) => <Next cubeDistance={cubeDistance} polyominoType={nextPolyominoType} />,
        tetris: (cubeDistance) => (
          <Tetris
            cubeDistance={cubeDistance}
            tetris={tetris}
            polyomino={polyomino}
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
            tetris={tetris}
            polyomino={polyomino}
            previewPolyomino={previewPolyomino}
          />
        ),
      }}
      countdown={() => <div>60</div>}
    />
  );
};

export default Single;
