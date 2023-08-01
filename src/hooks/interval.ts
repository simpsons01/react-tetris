import { AnyFunction } from "../common/utils";
import { useCallback } from "react";
import useCustomRef from "./customRef";

const useInterval = ({ autoClear }: { autoClear: boolean } = { autoClear: false }) => {
  const [intervalRef, setIntervalRef] = useCustomRef<number | null>(null);

  const isInInterval = useCallback(() => {
    return intervalRef.current !== null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(
    (fn: AnyFunction, leftsec: number) => {
      if (autoClear) clear();
      setIntervalRef(
        window.setInterval(() => {
          fn();
        }, leftsec)
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const clear = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      setIntervalRef(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isInInterval,
    start,
    clear,
  };
};

export default useInterval;
