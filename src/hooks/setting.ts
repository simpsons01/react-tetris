import { useCallback, useState } from "react";

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

const LOCAL_STORAGE_KEY = "setting";

const useSetting = () => {
  const [setting, setSetting] = useState<ISetting>(() => {
    const defaultSetting = createDefaultSetting();
    try {
      const settingFromLocalStorage = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (settingFromLocalStorage) {
        return JSON.parse(settingFromLocalStorage);
      } else {
        return defaultSetting;
      }
    } catch {
      return defaultSetting;
    }
  });

  const updateSetting = useCallback((newSetting: ISetting) => {
    setSetting(newSetting);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSetting));
  }, []);

  return {
    setting,
    updateSetting,
  };
};

export default useSetting;
