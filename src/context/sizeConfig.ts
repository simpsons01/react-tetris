import type { ISizeConfig } from "../common/size";
import { useContext, createContext } from "react";

export const SizeConfigContext = createContext<ISizeConfig>({} as ISizeConfig);

export const useSizeConfigContext = () => useContext(SizeConfigContext);
