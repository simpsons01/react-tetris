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

abstract class Timer {
  sec: number;
  timer: null | number = null;
  action: null | Function = null;
  autoClear: boolean = false;

  constructor(sec: number, autoClear?: boolean) {
    this.sec = sec;
    if (autoClear !== undefined) {
      this.autoClear = autoClear;
    }
  }

  abstract create(): void;

  abstract start(cb: Function): void;

  abstract continue(): void;

  abstract pause(): void;

  abstract clear(): void;
}

export class IntervalTimer extends Timer {
  create() {
    if (this.timer == null) {
      this.timer = window.setInterval(() => {
        if (this.action !== null) this.action();
      }, this.sec * 1000);
    }
  }

  start(cb: Function) {
    if (this.autoClear) {
      this.clear();
    }
    this.action = () => cb();
    this.create();
  }

  continue() {}

  pause() {}

  clear() {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }
}

const ms = 1000;
export class CountDownTimer extends Timer {
  leftsec: number = 0;

  constructor(sec: number, autoClear?: boolean) {
    super(sec * ms, autoClear);
  }

  create() {
    if (this.timer == null) {
      this.leftsec = this.sec;
      this.timer = window.setInterval(() => {
        this.leftsec -= ms * 0.1;
        //console.log("leftsec is left " + this.leftsec + " ms");
        if (this.leftsec === 0) {
          if (this.action !== null) this.action();
          this.leftsec = this.sec;
          this.clear();
        }
      }, ms * 0.1);
    }
  }

  start(cb: Function) {
    if (this.autoClear) {
      this.clear();
    }
    this.action = () => cb();
    this.create();
  }

  continue() {
    if (this.action !== null) {
      this.create();
    }
  }

  pause() {
    this.clear();
  }

  clear() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }
}
