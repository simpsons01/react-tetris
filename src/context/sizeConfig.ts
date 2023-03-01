import type { ISizeConfig } from "../utils/sizeConfig";
import { useContext, createContext } from "react";

export const SizeConfigContext = createContext<ISizeConfig>({} as ISizeConfig);

export const useSizeConfigContext = () => useContext(SizeConfigContext);
