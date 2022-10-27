import { useState, useCallback, useRef } from "react";
import { TETRIMINO_TYPE } from "../common/tetrimino";
import { setRef } from "../common/utils";

const useHoldTetrimino = function () {
  const isHoldable = useRef(true);

  const [holdTetrimino, setHoldTetrimino] = useState<null | TETRIMINO_TYPE>(null);

  const changeHoldTetrimino = useCallback(
    (tetriminoType: TETRIMINO_TYPE) => {
      const prevHoldTetrimino = holdTetrimino;
      setHoldTetrimino(tetriminoType);
      setRef(isHoldable, false);
      return prevHoldTetrimino;
    },
    [holdTetrimino]
  );

  const setToHoldable = useCallback(() => {
    setRef(isHoldable, true);
  }, []);

  return {
    isHoldable,
    holdTetrimino,
    changeHoldTetrimino,
    setToHoldable,
  };
};

export default useHoldTetrimino;
