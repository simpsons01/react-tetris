import { useEffect, useRef, useCallback, useState } from "react";
import { AnyFunction, setRef, minMax } from "./../common/utils";

const ms = 1000;

const useAnimation = function ({
  onProgress,
  onComplete,
  duration = 1,
}: {
  onProgress: AnyFunction<[number, number, number]>;
  onComplete?: AnyFunction;
  duration?: number;
}) {
  const [isAnimateStart, setIsAnimateStart] = useState(false);
  const [elapse, setElapse] = useState(0);
  const initial = useRef(0);
  const passed = useRef(0);
  const animationId = useRef<null | number>(null);

  const clearAnimation = useCallback(() => {
    if (animationId.current) {
      window.cancelAnimationFrame(animationId.current);
      setRef(animationId, null);
    }
  }, []);

  const start = useCallback(() => setIsAnimateStart(true), []);

  const reset = useCallback(() => {
    setElapse(0);
    setRef(initial, 0);
    setRef(passed, 0);
    clearAnimation();
    setIsAnimateStart(false);
  }, [clearAnimation]);

  const pause = useCallback(() => {
    setRef(passed, elapse);
    setRef(initial, 0);
    clearAnimation();
    setIsAnimateStart(false);
  }, [clearAnimation, elapse]);

  useEffect(() => {
    if (isAnimateStart) {
      if (initial.current === 0) setRef(initial, performance.now());
      if (elapse === duration) {
        reset();
        if (onComplete) onComplete();
      } else {
        setRef(
          animationId,
          window.requestAnimationFrame((timestamp) => {
            const nextElapse = minMax((timestamp - initial.current) / ms + passed.current, 0, duration);
            setElapse(nextElapse);
            onProgress(nextElapse, duration, timestamp);
          })
        );
      }
    }
    return () => {
      if (isAnimateStart) {
        clearAnimation();
      }
    };
  }, [onProgress, onComplete, reset, clearAnimation, isAnimateStart, duration, elapse]);

  return {
    isAnimateStart,
    start,
    reset,
    pause,
  };
};

export default useAnimation;
