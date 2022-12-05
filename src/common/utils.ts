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

export interface AnyObject {
  [key: string]: any;
}

export type AnyFunction = (...args: Array<any>) => any;

export const getKeys = <T extends object, K extends keyof T>(obj: T): Array<K> => {
  return Object.keys(obj) as Array<K>;
};

export const getRandomMixMax = (min: number, max: number): number => {
  return Math.floor(min + (max - min + 1) * Math.random());
};

export const minMax = (val: number, min: number, max: number): number => {
  return Math.min(Math.max(val, min), max);
};
