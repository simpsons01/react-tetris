import type { AnyFunction } from "../utils/common";
import { useCallback, useLayoutEffect } from "react";
import useCustomRef from "./customRef";

const useGetter = <T extends AnyFunction>(fn: T) => {
  const [fnRef, setFnRef] = useCustomRef(fn);

  useLayoutEffect(() => {
    setFnRef(fn);
  });

  return useCallback(
    (...args: Parameters<T>) => {
      return fnRef.current(...args);
    },
    [fnRef]
  );
};

export default useGetter;
