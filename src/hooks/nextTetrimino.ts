import { useRef, useState, useCallback } from "react";
import { TETRIMINO_TYPE, getRandomTetriminoBag } from "../common/tetrimino";
import { setRef } from "../common/utils";

const useNextTetriminoBag = function (TetriminoBag: Array<TETRIMINO_TYPE>) {
  const nextTetriminoBagStore = useRef<Array<TETRIMINO_TYPE>>([]);
  const [nextTetriminoBag, setNextTetriminoBag] = useState(TetriminoBag);

  const popNextTetriminoType = useCallback(() => {
    const nextTetriminoType = nextTetriminoBag[0];
    if (nextTetriminoBagStore.current.length === 0) {
      setRef(nextTetriminoBagStore, getRandomTetriminoBag());
    }
    setNextTetriminoBag((prevNextTetrimino) =>
      prevNextTetrimino.reduce((acc, _, index) => {
        if (index === prevNextTetrimino.length - 1) {
          const fromStoreTetriminoType = nextTetriminoBagStore.current.pop() as TETRIMINO_TYPE;
          return [...acc, fromStoreTetriminoType];
        } else {
          return [...acc, prevNextTetrimino[index + 1]];
        }
      }, [] as Array<TETRIMINO_TYPE>)
    );
    return nextTetriminoType;
  }, [nextTetriminoBagStore, nextTetriminoBag]);

  return {
    nextTetriminoBag,
    popNextTetriminoType,
  };
};

export default useNextTetriminoBag;
