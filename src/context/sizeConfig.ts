import type { ISizeConfig } from "../utils/size";
import { useContext, createContext } from "react";

export const SizeConfigContext = createContext<ISizeConfig>({} as ISizeConfig);

export const useSizeConfigContext = () => useContext(SizeConfigContext);
