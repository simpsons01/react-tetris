import { AnyFunction } from "./utils";

export const createCountDownTimer = ({ autoClear }: { autoClear: boolean } = { autoClear: false }) => {
  let timer: number | null = null;
  const _ = {
    isPending: () => timer != null,
    start(cb: AnyFunction, leftsec: number) {
      if (autoClear) _.clear();
      timer = window.setTimeout(() => {
        cb();
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
