import { AnyFunction } from "../common/utils";
import { useCallback } from "react";
import useCustomRef from "./customRef";

const useTimeout = ({ autoClear }: { autoClear: boolean } = { autoClear: false }) => {
  const [timeoutRef, setTimeoutRef] = useCustomRef<number | null>(null);

  const isPending = useCallback(() => {
    return timeoutRef.current !== null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(
    (fn: AnyFunction, leftsec: number) => {
      if (autoClear) clear();
      setTimeoutRef(
        window.setTimeout(() => {
          fn();
          setTimeoutRef(null);
        }, leftsec)
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      setTimeoutRef(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isPending,
    start,
    clear,
  };
};

export default useTimeout;
