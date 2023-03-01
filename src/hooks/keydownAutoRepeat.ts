import { useEffect } from "react";

const useKeydownAutoRepeat = (autoRepeat: Array<string>, callback: (evt: KeyboardEvent) => any) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (autoRepeat.indexOf(e.key) > -1) {
        callback(e);
      } else {
        if (!e.repeat) callback(e);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [autoRepeat, callback]);
};

export default useKeydownAutoRepeat;
