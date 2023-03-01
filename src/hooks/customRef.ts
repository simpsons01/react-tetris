import type { MutableRefObject } from "react";
import { useRef, useCallback } from "react";

const useCustomRef = <T>(refVal: T): [MutableRefObject<T>, (val: T) => void] => {
  const ref = useRef<T>(refVal);

  const setRef = useCallback((val: T) => (ref.current = val), []);

  return [ref, setRef];
};

export default useCustomRef;
