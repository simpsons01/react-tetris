import { AnyFunction } from "./utils";

export const createCountDownTimer = ({ autoClear }: { autoClear: boolean } = { autoClear: false }) => {
  let timer: number | null = null;
  const _ = {
    start(cb: AnyFunction, leftsec: number) {
      if (autoClear) _.clear();
      timer = window.setTimeout(() => {
        cb();
        timer = null;
      }, leftsec);
    },
    clear() {
      if (timer) window.clearTimeout(timer);
    },
  };
  return _;
};
