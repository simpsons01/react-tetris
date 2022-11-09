import { useRef, useState, useCallback } from "react";
import { TETRIMINO_TYPE, getRandomTetriminoBag } from "../common/tetrimino";
import { setRef } from "../common/utils";

const useNextTetriminoBag = () => {
  const nextTetriminoBagStore = useRef<Array<TETRIMINO_TYPE>>([]);
  const [nextTetriminoBag, setNextTetriminoBag] = useState(getRandomTetriminoBag());

  const popNextTetriminoType = useCallback(() => {
    const nextTetriminoType = nextTetriminoBag[0];
    if (nextTetriminoBagStore.current.length === 0) {
      setRef(nextTetriminoBagStore, getRandomTetriminoBag());
    }
    const fromStoreTetriminoType = nextTetriminoBagStore.current.pop() as TETRIMINO_TYPE;
    setNextTetriminoBag((prevNextTetrimino) =>
      prevNextTetrimino.reduce((acc, _, index) => {
        if (index === prevNextTetrimino.length - 1) {
          return [...acc, fromStoreTetriminoType];
        } else {
          return [...acc, prevNextTetrimino[index + 1]];
        }
      }, [] as Array<TETRIMINO_TYPE>)
    );
    return nextTetriminoType;
  }, [nextTetriminoBag]);

  return {
    nextTetriminoBag,
    popNextTetriminoType,
  };
};

export default useNextTetriminoBag;
