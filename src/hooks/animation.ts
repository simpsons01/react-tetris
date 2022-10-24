import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { AnyFunction, setRef, minMax } from "./../common/utils";

const ms = 1000;

const useAnimation = function ({
  onFrame,
  onComplete,
  duration = 1,
}: {
  onFrame: AnyFunction<[number, number, number]>;
  onComplete?: AnyFunction;
  duration?: number;
}) {
  const [isAnimateStart, setIsAnimateStart] = useState(false);
  const [isAnimatePause, setIsAnimatePause] = useState(false);
  const [elapse, setElapse] = useState(0);
  const initial = useRef(0);
  const passed = useRef(0);
  const raf = useRef<null | number>(null);

  const shouldAnimate = useMemo(() => !isAnimatePause && isAnimateStart, [isAnimatePause, isAnimateStart]);

  const clearAnimation = useCallback(() => {
    if (raf.current) {
      window.cancelAnimationFrame(raf.current);
      setRef(raf, null);
    }
  }, []);

  const start = useCallback(() => {
    setIsAnimatePause(false);
    setIsAnimateStart(true);
  }, []);

  const reset = useCallback(() => {
    setElapse(0);
    setRef(initial, 0);
    setRef(passed, 0);
    clearAnimation();
    setIsAnimateStart(false);
    setIsAnimatePause(false);
  }, [clearAnimation]);

  const pause = useCallback(() => {
    setRef(passed, elapse);
    setRef(initial, 0);
    clearAnimation();
    setIsAnimatePause(true);
  }, [clearAnimation, elapse]);

  useEffect(() => {
    if (shouldAnimate) {
      if (initial.current === 0) setRef(initial, performance.now());
      if (elapse === duration) {
        reset();
        if (onComplete) onComplete();
      } else {
        setRef(
          raf,
          window.requestAnimationFrame((timestamp) => {
            const nextElapse = minMax((timestamp - initial.current) / ms + passed.current, 0, duration);
            setElapse(nextElapse);
            onFrame(nextElapse, duration, timestamp);
          })
        );
      }
    }
    return () => {
      if (shouldAnimate) {
        clearAnimation();
      }
    };
  }, [onFrame, onComplete, reset, clearAnimation, shouldAnimate, elapse, duration]);

  return {
    isAnimateStart,
    isAnimatePause,
    shouldAnimate,
    start,
    reset,
    pause,
  };
};

export default useAnimation;
