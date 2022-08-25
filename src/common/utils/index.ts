import React from "react";
import ReactDOM from "react-dom/client";
import Modal from "../../components/Modal";

export type ClientToServerCallback<Data extends object = {}> = (payload: {
  data: Data;
  metadata: {
    isSuccess: boolean;
    isError: boolean;
    message?: string;
  };
}) => void;

export interface IFontSize {
  fontSize: number;
}

export interface AnyObject<T = any> {
  [key: string]: T;
}

export type AnyFunction<T = any, K = any | undefined | void | unknown> = (...args: Array<T>) => K;

export interface ISize {
  width: number;
  height: number;
}

export interface IPosition {
  left: number;
  top: number;
}

export interface IAnimation {
  start: (timestamp: number) => void;
  pause: () => void;
  reset: () => void;
  isStart: () => boolean;
}

export const setRef = <T = any>(ref: React.MutableRefObject<T>, val: T) => {
  ref.current = val;
};

export const getKeys = <T extends object, K extends keyof T>(obj: T): Array<K> => {
  return Object.keys(obj) as Array<K>;
};

const ms = 1000;
export const createAnimation = (
  fn: (elapse: number) => void,
  onEnd?: Function,
  duration: number = 1
): IAnimation => {
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
      console.log("elapse is " + elapse + "s");
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

  abstract start(cb?: Function): void;

  abstract clear(): void;

  abstract pause(): void;

  abstract continue(): void;
}

export class IntervalTimer extends Timer {
  create() {
    if (this.timer == null) {
      this.timer = window.setInterval(() => {
        if (this.action !== null) this.action();
      }, this.sec * ms);
    }
  }

  clear() {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  start(cb?: Function) {
    if (this.autoClear) {
      this.clear();
    }
    if (cb !== undefined) {
      this.action = cb;
    }
    this.create();
  }

  pause() {
    this.clear();
  }

  continue() {
    this.create();
  }
}

export class CountDownTimer extends Timer {
  leftsec: number = 0;

  constructor(sec: number, autoClear?: boolean) {
    super(sec * ms, autoClear);
  }

  create() {
    if (this.timer == null) {
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

  clear() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  start(cb?: Function) {
    if (this.autoClear) {
      this.clear();
    }
    if (cb !== undefined) {
      this.action = cb;
    }
    this.leftsec = this.sec;
    this.create();
  }

  pause() {
    this.clear();
  }

  continue() {
    this.create();
  }
}

let modalId = 0;
export const createAlertModal = (
  title: string,
  confirm?: {
    text: string;
    onClick: (e: React.MouseEvent) => void;
  }
): AnyFunction => {
  modalId += 1;
  let modalApp: ReactDOM.Root | null = null;
  let modalContainer: HTMLElement | null = document.createElement("div");
  (modalContainer as HTMLElement).id = `modal-${modalId}`;

  const clear = () => {
    document.body.removeChild(modalContainer as HTMLElement);
    (modalApp as ReactDOM.Root).unmount();
    modalApp = null;
    modalContainer = null;
  };

  document.body.appendChild(modalContainer);
  modalApp = ReactDOM.createRoot(modalContainer);
  modalApp.render(
    React.createElement(Modal, {
      portal: false,
      isOpen: true,
      title,
      confirm: {
        text: confirm ? confirm.text : "confirm",
        onClick: (e) => {
          clear();
          if (confirm) confirm.onClick(e);
        },
      },
    })
  );
  return clear;
};
