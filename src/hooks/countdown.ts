import { useRef, useState, useCallback, useEffect } from "react";
import { createCountDownTimer } from "../common/timer";

const useCountdown = function (sec: number) {
  const { current: countDownTimer } = useRef<ReturnType<typeof createCountDownTimer>>(createCountDownTimer());
  const [leftsec, setLeftsec] = useState<number>(sec);
  const [isStartCountDown, setIsStartCountDown] = useState<boolean>(false);

  const startCountdown = useCallback(() => {
    if (!isStartCountDown) {
      countDownTimer.clear();
      setIsStartCountDown(true);
    }
  }, [countDownTimer, isStartCountDown]);

  const stopCountDown = useCallback(() => {
    if (isStartCountDown) {
      countDownTimer.clear();
      setIsStartCountDown(false);
    }
  }, [countDownTimer, isStartCountDown]);

  const resetCountDown = useCallback(() => {
    countDownTimer.clear();
    setLeftsec(sec);
    setIsStartCountDown(false);
  }, [countDownTimer, sec]);

  useEffect(() => {
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
