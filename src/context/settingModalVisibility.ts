import { createContext, useContext } from "react";

export interface ISettingModalVisibilityContext {
  isOpen: () => boolean;
  open: () => void;
  close: () => void;
}

export const SettingModalVisibilityContext = createContext<ISettingModalVisibilityContext>(
  {} as ISettingModalVisibilityContext
);

export const useSettingModalVisibilityContext = () => useContext(SettingModalVisibilityContext);
