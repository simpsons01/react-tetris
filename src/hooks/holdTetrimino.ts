import useCustomRef from "./customRef";
import { useState, useCallback } from "react";
import { TETRIMINO_TYPE } from "../utils/tetrimino";

const useHoldTetrimino = () => {
  const [isHoldableRef, setIsHoldableRef] = useCustomRef(true);

  const [holdTetrimino, setHoldTetrimino] = useState<null | TETRIMINO_TYPE>(null);

  const changeHoldTetrimino = useCallback(
    (tetriminoType: TETRIMINO_TYPE) => {
      const prevHoldTetrimino = holdTetrimino;
      setHoldTetrimino(tetriminoType);
      setIsHoldableRef(false);
      return prevHoldTetrimino;
    },
    [holdTetrimino, setIsHoldableRef]
  );
  return {
    isHoldableRef,
    holdTetrimino,
    changeHoldTetrimino,
    setIsHoldableRef,
    setHoldTetrimino,
  };
};

export default useHoldTetrimino;
