import * as React from "react";

export const setRef = <T = any>(ref: React.MutableRefObject<T>, val: T) => {
  ref.current = val;
};

export const getKeys = <T extends object, K extends keyof T>(obj: T): Array<K> => {
  return Object.keys(obj) as Array<K>;
};
