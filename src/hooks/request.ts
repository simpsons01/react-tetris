import useCustomRef from "./customRef";
import { useCallback, useState } from "react";
import { PromiseFn, PromiseData } from "../common/utils";

const useRequest = <RequestFn extends PromiseFn>(
  fn: RequestFn
): [
  boolean,
  PromiseFn<Parameters<RequestFn>, Promise<{ isStale: boolean; data: PromiseData<RequestFn> }>>
] => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [idRef, setIdRef] = useCustomRef(0);
  const request = useCallback(
    async (...args: Parameters<RequestFn>): Promise<{ isStale: boolean; data: PromiseData<RequestFn> }> => {
      setIsProcessing(true);
      setIdRef(idRef.current + 1);
      const id = idRef.current;
      try {
        const data = await fn(...args);
        setIsProcessing(false);
        return {
          isStale: id !== idRef.current,
          data,
        };
      } catch (error) {
        setIsProcessing(false);
        const customError = { isStale: id !== idRef.current, error };
        return Promise.reject(customError);
      }
    },
    [idRef, setIdRef, fn]
  );
  return [isProcessing, request];
};

export default useRequest;
