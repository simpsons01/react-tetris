import { useEffect, useRef } from "react";
import { Key } from "ts-key-enum";
import { AnyFunction } from "../common/utils";

const useKeydownAutoRepeat = function (autoRepeat: Array<Key>, callback: AnyFunction<[KeyboardEvent]>) {
  useEffect(() => {
    const onKeyDown = function (e: KeyboardEvent) {
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
