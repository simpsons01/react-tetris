import { useState, useCallback } from "react";
import { TETRIMINO_TYPE, getRandomTetriminoBag } from "../common/tetrimino";
import useCustomRef from "./customRef";

const useNextTetriminoBag = (createAtInitial: boolean = true) => {
  const [nextTetriminoBagStoreRef, setNextTetriminoBagStoreRef] = useCustomRef<Array<TETRIMINO_TYPE>>(
    getRandomTetriminoBag()
  );
  const [nextTetriminoBag, setNextTetriminoBag] = useState<Array<TETRIMINO_TYPE>>(
    createAtInitial ? getRandomTetriminoBag() : []
  );

  const popNextTetriminoType = useCallback(() => {
    const nextTetriminoType = nextTetriminoBag[0];
    if (nextTetriminoBagStoreRef.current.length === 0) {
      setNextTetriminoBagStoreRef(getRandomTetriminoBag());
    }
    const fromStoreTetriminoType = nextTetriminoBagStoreRef.current.pop() as TETRIMINO_TYPE;
    setNextTetriminoBag((prevNextTetriminoBag) =>
      prevNextTetriminoBag.reduce((acc, _, index) => {
        if (index === prevNextTetriminoBag.length - 1) {
          return [...acc, fromStoreTetriminoType];
        } else {
          return [...acc, prevNextTetriminoBag[index + 1]];
        }
      }, [] as Array<TETRIMINO_TYPE>)
    );
    return nextTetriminoType;
  }, [nextTetriminoBag, nextTetriminoBagStoreRef, setNextTetriminoBagStoreRef]);

  const initialNextTetriminoBag = useCallback(() => {
    setNextTetriminoBag(getRandomTetriminoBag());
  }, []);

  return {
    nextTetriminoBag,
    setNextTetriminoBag,
    popNextTetriminoType,
    initialNextTetriminoBag,
  };
};

export default useNextTetriminoBag;
