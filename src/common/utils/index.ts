import * as React from "react";

export const setRef = <T = any>(ref: React.MutableRefObject<T>, val: T) => {
  ref.current = val;
};

export const getKeys = <T extends object, K extends keyof T>(obj: T): Array<K> => {
  return Object.keys(obj) as Array<K>;
};

export const createAnimation = (fn: (elapse: number) => void, onEnd?: Function, duration: number = 1) => {
  let initialTimestamp: number | undefined,
    elapse: number | undefined,
    id: number | undefined,
    _duration: number = duration;
  return {
    start: function startAnimation(timestamp: number) {
      initialTimestamp = initialTimestamp === undefined ? timestamp : initialTimestamp;
      elapse = (timestamp - initialTimestamp) / 1000;
      fn(elapse);
      if (elapse < _duration) {
        id = window.requestAnimationFrame(startAnimation);
      } else {
        if (typeof onEnd == "function") {
          onEnd();
        }
      }
    },
    pause: function pauseAnimation() {
      if (id === undefined) return;
      _duration = duration - (elapse as number);
      initialTimestamp = undefined;
      elapse = undefined;
      window.cancelAnimationFrame(id);
      id = undefined;
    },
    reset: function resetAnimation() {
      _duration = duration;
      initialTimestamp = undefined;
      elapse = undefined;
      if (id !== undefined) window.cancelAnimationFrame(id);
      id = undefined;
    },
  };
};

export function minMax(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}
