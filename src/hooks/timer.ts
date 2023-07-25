import { AnyFunction } from "../common/utils";
import { useCallback } from "react";
import useCustomRef from "./customRef";

const useTimer = ({ autoClear }: { autoClear: boolean } = { autoClear: false }) => {
  const [timerRef, setTimerRef] = useCustomRef<number | null>(null);

  const isPending = useCallback(() => {
    return timerRef.current !== null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(
    (fn: AnyFunction, leftsec: number) => {
      if (autoClear) clear();
      setTimerRef(
        window.setTimeout(() => {
          fn();
          setTimerRef(null);
        }, leftsec)
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const clear = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      setTimerRef(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isPending,
    start,
    clear,
  };
};

export default useTimer;
