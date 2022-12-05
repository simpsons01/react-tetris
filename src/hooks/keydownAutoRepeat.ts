import { useEffect } from "react";
import { Key } from "ts-key-enum";

const useKeydownAutoRepeat = (autoRepeat: Array<Key>, callback: (evt: KeyboardEvent) => any) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (autoRepeat.indexOf(e.key as Key) > -1) {
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
