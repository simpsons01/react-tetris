/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";

const useCountdown = function (sec: number) {
  const timer = React.useRef<undefined | number>();
  const [leftsec, setLeftsec] = React.useState<number>(sec);
  const [isStartCountDown, setStartCountDown] = React.useState<boolean>(false);

  const { current: cleanTimer } = React.useRef(() => {
    if (timer.current !== undefined) {
      window.clearInterval(timer.current);
      timer.current = undefined;
    }
  });

  const startCountdown = React.useCallback(() => {
    if (!isStartCountDown) {
      cleanTimer();
      setStartCountDown(true);
    }
  }, [isStartCountDown]);

  const stopCountDown = React.useCallback(() => {
    if (isStartCountDown) {
      cleanTimer();
      setStartCountDown(false);
    }
  }, [isStartCountDown]);

  const resetCountDown = React.useCallback(() => {
    cleanTimer();
    setLeftsec(sec);
    setStartCountDown(false);
  }, [sec]);

  React.useEffect(() => {
    if (leftsec !== 0 && isStartCountDown) {
      timer.current = window.setInterval(() => {
        setLeftsec(leftsec - 1);
      }, 1000);
    }
    return cleanTimer;
  }, [leftsec, isStartCountDown]);

  return {
    leftsec,
    resetCountDown,
    stopCountDown,
    startCountdown,
  };
};

export default useCountdown;
