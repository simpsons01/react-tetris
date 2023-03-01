import * as KEYCODE from "keycode-js";
import { parse } from "bowser";
import { hasKey } from "./common";

const {
  os: { name: osName },
} = parse(window.navigator.userAgent);

export const convertKeyboardEvtKeyToDisplayText = (key: string) => {
  const _ = {
    [KEYCODE.VALUE_SPACE]: "Space",
    [KEYCODE.VALUE_META]: osName === "windows" ? "Windows" : "Cmd",
    [KEYCODE.VALUE_A]: "A",
    [KEYCODE.VALUE_B]: "B",
    [KEYCODE.VALUE_C]: "C",
    [KEYCODE.VALUE_D]: "D",
    [KEYCODE.VALUE_E]: "E",
    [KEYCODE.VALUE_F]: "F",
    [KEYCODE.VALUE_G]: "G",
    [KEYCODE.VALUE_H]: "H",
    [KEYCODE.VALUE_I]: "I",
    [KEYCODE.VALUE_J]: "J",
    [KEYCODE.VALUE_K]: "K",
    [KEYCODE.VALUE_L]: "L",
    [KEYCODE.VALUE_M]: "M",
    [KEYCODE.VALUE_N]: "N",
    [KEYCODE.VALUE_O]: "O",
    [KEYCODE.VALUE_P]: "P",
    [KEYCODE.VALUE_Q]: "Q",
    [KEYCODE.VALUE_R]: "R",
    [KEYCODE.VALUE_S]: "S",
    [KEYCODE.VALUE_T]: "T",
    [KEYCODE.VALUE_U]: "U",
    [KEYCODE.VALUE_V]: "V",
    [KEYCODE.VALUE_W]: "W",
    [KEYCODE.VALUE_X]: "X",
    [KEYCODE.VALUE_Y]: "Y",
    [KEYCODE.VALUE_Z]: "Z",
  };
  return hasKey(_, key) ? _[key] : key;
};
