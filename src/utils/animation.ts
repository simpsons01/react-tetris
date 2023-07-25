import { minMax, AnyFunction } from "./common";

const ms = 1000;

export const createAnimation = (
  fn: (elapse: number) => void,
  onEnd: AnyFunction,
  duration: number = 1
): {
  start: (timestamp: number) => void;
  pause: () => void;
  reset: () => void;
  isStart: () => boolean;
} => {
  let initialTimestamp: number | undefined,
    elapse: number | undefined,
    id: number | undefined,
    _duration: number = duration,
    _passed = 0;
  return {
    start: function startAnimation(timestamp: number) {
      initialTimestamp = initialTimestamp === undefined ? timestamp : initialTimestamp;
      elapse = minMax((timestamp - initialTimestamp) / ms + _passed, 0, _duration);
      fn(elapse);
      // console.log("elapse is " + elapse + "s");
      if (elapse !== _duration) {
        id = window.requestAnimationFrame(startAnimation);
      } else {
        if (typeof onEnd == "function") {
          onEnd();
        }
      }
    },
    pause: function pauseAnimation() {
      if (id === undefined) return;
      _passed = elapse as number;
      initialTimestamp = undefined;
      window.cancelAnimationFrame(id);
      id = undefined;
    },
    reset: function resetAnimation() {
      _duration = duration;
      initialTimestamp = undefined;
      elapse = undefined;
      _passed = 0;
      if (id !== undefined) window.cancelAnimationFrame(id as number);
      id = undefined;
    },
    isStart: function isAnimationStart() {
      return id !== undefined;
    },
  };
};
