export interface IFontSize {
  fontSize: number;
}

export interface IPosition {
  left: number;
  top: number;
}

export interface AnyObject {
  [key: string]: any;
}

export type AnyFunction = (...args: Array<any>) => any;

export const getKeys = <T extends AnyObject, K extends keyof T>(obj: T): Array<K> => {
  return Object.keys(obj) as Array<K>;
};

export const hasKey = <T extends AnyObject>(obj: T, key: string | number | symbol): key is keyof T => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

export const getRandomMixMax = (min: number, max: number): number => {
  return Math.floor(min + (max - min + 1) * Math.random());
};

export const minMax = (val: number, min: number, max: number): number => {
  return Math.min(Math.max(val, min), max);
};
