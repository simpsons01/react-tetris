import { useCallback } from "react";
import useCustomRef from "./customRef";
import useGetter from "./getter";

const useAnimationFrame = <RestParam extends Array<unknown> = Array<unknown>>(
  fn: (arg1: { time: number; isComplete: boolean }, ...args: RestParam) => void,
  config: { duration: number; interval?: number }
) => {
  const [requestAnimationIdRef, setRequestAnimationIdRef] = useCustomRef<null | number>(null);
  const [previousTimeRef, setPreviousTimeRef] = useCustomRef<null | number>(null);
  const [elapseTimeRef, setElapseTimeRef] = useCustomRef<number>(0);
  const [startAtRef, setStartAtRef] = useCustomRef<number>(0);
  const [restParamRef, setRestParamRef] = useCustomRef<undefined | RestParam>(undefined);
  const [isAnimatingRef, setIsAnimatingRef] = useCustomRef<boolean>(false);
  const freshFn = useGetter(fn);

  const animate = (time: number): void => {
    if (!isAnimatingRef.current) setIsAnimatingRef(true);
    if (previousTimeRef.current === null) {
      setPreviousTimeRef(time);
      return setRequestAnimationIdRef(requestAnimationFrame(animate));
    }
    setElapseTimeRef(elapseTimeRef.current + (time - previousTimeRef.current) / 1000);
    setPreviousTimeRef(time);
    const totalElapseTime = startAtRef.current + elapseTimeRef.current;
    const displayTime = config.interval
      ? ((totalElapseTime / config.interval) | 0) * config.interval
      : totalElapseTime;
    const isComplete = totalElapseTime >= config.duration;
    freshFn(
      { time: isComplete ? config.duration : displayTime, isComplete },
      ...(restParamRef.current as RestParam)
    );
    if (isComplete) {
      setStartAtRef(0);
      setElapseTimeRef(0);
      setPreviousTimeRef(null);
      setRequestAnimationIdRef(null);
      setIsAnimatingRef(false);
    } else {
      setRequestAnimationIdRef(requestAnimationFrame(animate));
    }
  };

  const startAnimate = useCallback((...args: RestParam) => {
    if (!requestAnimationIdRef.current) {
      setRestParamRef(args);
      requestAnimationFrame(animate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const continueAnimate = useCallback(() => {
    if (!requestAnimationIdRef.current && isAnimatingRef.current) {
      requestAnimationFrame(animate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAnimate = useCallback(() => {
    requestAnimationIdRef.current && cancelAnimationFrame(requestAnimationIdRef.current);
    setStartAtRef(elapseTimeRef.current);
    setElapseTimeRef(0);
    setPreviousTimeRef(null);
    setRequestAnimationIdRef(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetAnimate = useCallback(() => {
    requestAnimationIdRef.current && cancelAnimationFrame(requestAnimationIdRef.current);
    setStartAtRef(0);
    setElapseTimeRef(0);
    setPreviousTimeRef(null);
    setRequestAnimationIdRef(null);
    setIsAnimatingRef(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIsAnimating = useCallback(() => {
    return isAnimatingRef.current;
  }, []);

  return {
    startAnimate,
    stopAnimate,
    resetAnimate,
    continueAnimate,
    getIsAnimating,
  };
};

export default useAnimationFrame;
