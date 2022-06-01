import * as React from "react";

export const setRef = <T>(ref: React.MutableRefObject<T>, val: T) => {
  ref.current = val;
};
