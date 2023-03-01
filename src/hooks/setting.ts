import * as KEYCODE from "keycode-js";
import { useCallback, useState } from "react";

export interface ISetting {
  gameplay: {
    single: {
      startLevel: number;
    };
  };
  control: {
    moveLeft: string;
    moveRight: string;
    softDrop: string;
    hardDrop: string;
    hold: string;
    clockwiseRotation: string;
    counterclockwiseRotation: string;
  };
}

export const createDefaultSetting = (): ISetting => ({
  gameplay: {
    single: {
      startLevel: 1,
    },
  },
  control: {
    moveLeft: KEYCODE.VALUE_LEFT,
    moveRight: KEYCODE.VALUE_RIGHT,
    softDrop: KEYCODE.VALUE_DOWN,
    hardDrop: KEYCODE.VALUE_SPACE,
    hold: KEYCODE.VALUE_SHIFT,
    clockwiseRotation: KEYCODE.VALUE_UP,
    counterclockwiseRotation: KEYCODE.VALUE_Z,
  },
});

const SETTING_KEY = "setting";

const useSetting = () => {
  const [setting, setSetting] = useState<ISetting>(() => {
    const defaultSetting = createDefaultSetting();
    try {
      const settingFromLocalStorage = localStorage.getItem(SETTING_KEY);
      return settingFromLocalStorage ? JSON.parse(settingFromLocalStorage) : defaultSetting;
    } catch {
      return defaultSetting;
    }
  });

  const saveSetting = useCallback((setting: ISetting) => {
    localStorage.setItem(SETTING_KEY, JSON.stringify(setting));
  }, []);

  return {
    setting,
    setSetting,
    saveSetting,
  };
};

export default useSetting;
