import React from "react";
import { IntervalTimer } from "../common/utils";

const useCountdown = function (sec: number) {
  const intervalTimer = React.useRef<IntervalTimer | undefined>();
  const [leftsec, setLeftsec] = React.useState<number>(sec);

  const stopCountDown = React.useCallback(() => {
    if (intervalTimer.current !== undefined) {
      intervalTimer.current.clear();
      intervalTimer.current = undefined;
    }
  }, []);

  const continueCountdown = React.useCallback(() => {
    if (intervalTimer.current === undefined && leftsec !== 0) {
      intervalTimer.current = new IntervalTimer(1);
      intervalTimer.current.start(() => {
        setLeftsec(leftsec - 1);
        (intervalTimer.current as IntervalTimer).clear();
        intervalTimer.current = undefined;
      });
    }
  }, [leftsec]);

  React.useEffect(() => {
    if (leftsec !== 0) {
      intervalTimer.current = new IntervalTimer(1);
      intervalTimer.current.start(() => {
        setLeftsec(leftsec - 1);
      });
    }
    return () => {
      if (intervalTimer.current !== undefined) {
        intervalTimer.current.clear();
      }
    };
  }, [leftsec]);

  return {
    leftsec,
    stopCountDown,
    continueCountdown,
  };
};

export default useCountdown;
