import React from "react";
import { CountDownTimer } from "../common/utils";

const useCountdown = function (sec: number) {
  const { current: countDownTimer } = React.useRef<CountDownTimer>(new CountDownTimer(1));
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
      countDownTimer.pause();
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
      });
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
