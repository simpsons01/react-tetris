export interface AnyObject {
  [key: string]: any;
}

export type AnyFunction<P extends Array<any> = Array<any>, R = any> = (...args: P) => R;

export type PromiseFn<P extends Array<any> = Array<any>, R extends Promise<any> = Promise<any>> = AnyFunction<
  P,
  R
>;

export type PromiseData<Fn extends PromiseFn> = ReturnType<Fn> extends Promise<infer Data> ? Data : never;

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

export const isDev = () => process.env.NODE_ENV === "development";
