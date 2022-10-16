import React from "react";
import { POLYOMINO_TYPE, getRandomPolyominoBag } from "../common/polyomino";
import { setRef } from "../common/utils";

const useNextPolyominoBag = function (polyominoBag: Array<POLYOMINO_TYPE>) {
  const nextPolyominoBagStore = React.useRef<Array<POLYOMINO_TYPE>>([]);
  const [nextPolyominoBag, setNextPolyominoBag] = React.useState(polyominoBag);

  const popNextPolyominoType = React.useCallback(() => {
    const nextPolyominoType = nextPolyominoBag[0];
    if (nextPolyominoBagStore.current.length === 0) {
      setRef(nextPolyominoBagStore, getRandomPolyominoBag());
    }
    setNextPolyominoBag((prevNextPolyomino) =>
      prevNextPolyomino.reduce((acc, _, index) => {
        if (index === prevNextPolyomino.length - 1) {
          const fromStorePolyominoType = nextPolyominoBagStore.current.pop() as POLYOMINO_TYPE;
          return [...acc, fromStorePolyominoType];
        } else {
          return [...acc, prevNextPolyomino[index + 1]];
        }
      }, [] as Array<POLYOMINO_TYPE>)
    );
    return nextPolyominoType;
  }, [nextPolyominoBagStore, nextPolyominoBag]);

  return {
    nextPolyominoBag,
    popNextPolyominoType,
  };
};

export default useNextPolyominoBag;
