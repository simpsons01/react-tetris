export interface IFontSize {
  fontSize: number;
}

export interface ISize {
  width: number;
  height: number;
}

export interface IPosition {
  left: number;
  top: number;
}

export interface AnyObject<T = any> {
  [key: string]: T;
}

export type AnyFunction<T = any, K = any | undefined | void | unknown> = (...args: Array<T>) => K;

export const setRef = <T = any>(ref: React.MutableRefObject<T>, val: T) => {
  ref.current = val;
};

export const getKeys = <T extends object, K extends keyof T>(obj: T): Array<K> => {
  return Object.keys(obj) as Array<K>;
};

export function minMax(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}
