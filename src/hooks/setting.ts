import { useCallback } from "react";
import useCustomRef from "./customRef";

export interface ISetting {
  gameplay: {
    single: {
      startLevel: number;
    };
  };
}

export const createDefaultSetting = (): ISetting => ({
  gameplay: {
    single: {
      startLevel: 1,
    },
  },
});

const SETTING_KEY = "setting";

const setting = (() => {
  const defaultSetting = createDefaultSetting();
  try {
    const settingFromLocalStorage = localStorage.getItem(SETTING_KEY);
    return settingFromLocalStorage ? JSON.parse(settingFromLocalStorage) : defaultSetting;
  } catch {
    return defaultSetting;
  }
})();

const useSetting = () => {
  const [settingRef] = useCustomRef<ISetting>(setting);

  const saveSetting = useCallback((setting: ISetting) => {
    localStorage.setItem(SETTING_KEY, JSON.stringify(setting));
  }, []);

  return {
    settingRef,
    saveSetting,
  };
};

export default useSetting;
