import type { AnyFunction } from "./common";

export const createCountDownTimer = ({ autoClear }: { autoClear: boolean } = { autoClear: false }) => {
  let timer: number | null = null;
  const _ = {
    isPending: () => timer != null,
    start(fn: AnyFunction, leftsec: number) {
      if (autoClear) _.clear();
      timer = window.setTimeout(() => {
        fn();
        timer = null;
      }, leftsec);
    },
    clear() {
      if (timer) {
        window.clearTimeout(timer);
        timer = null;
      }
    },
  };
  return _;
};
