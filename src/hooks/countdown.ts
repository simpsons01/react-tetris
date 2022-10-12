import React from "react";
import { createCountDownTimer } from "../common/timer";

const useCountdown = function (sec: number) {
  const { current: countDownTimer } = React.useRef<ReturnType<typeof createCountDownTimer>>(
    createCountDownTimer()
  );
  const [leftsec, setLeftsec] = React.useState<number>(sec);
  const [isStartCountDown, setIsStartCountDown] = React.useState<boolean>(false);

  const startCountdown = React.useCallback(() => {
    if (!isStartCountDown) {
      countDownTimer.clear();
      setIsStartCountDown(true);
    }
  }, [countDownTimer, isStartCountDown]);

  const stopCountDown = React.useCallback(() => {
    if (isStartCountDown) {
      countDownTimer.clear();
      setIsStartCountDown(false);
    }
  }, [countDownTimer, isStartCountDown]);

  const resetCountDown = React.useCallback(() => {
    countDownTimer.clear();
    setLeftsec(sec);
    setIsStartCountDown(false);
  }, [countDownTimer, sec]);

  React.useEffect(() => {
    if (leftsec !== 0 && isStartCountDown) {
      countDownTimer.start(() => {
        setLeftsec(leftsec - 1);
      }, 1000);
    }
    return () => {
      if (leftsec !== 0 && isStartCountDown) {
        countDownTimer.clear();
      }
    };
  }, [leftsec, isStartCountDown, countDownTimer]);

  return {
    leftsec,
    resetCountDown,
    stopCountDown,
    startCountdown,
  };
};

export default useCountdown;
