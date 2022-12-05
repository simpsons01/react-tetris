import { useNavigate } from "react-router-dom";
import { usePlayerContext } from "../context/player";
import { createAlertModal } from "../common/alert";
import axios, { AxiosResponse } from "axios";
import { useCallback, useState } from "react";
import useCustomRef from "./customRef";

type PromiseFn = (...args: Array<any>) => Promise<any>;

type PromiseData<Fn extends PromiseFn> = ReturnType<Fn> extends Promise<infer Data> ? Data : never;

const useRequest = <AsyncFn extends PromiseFn>(
  fn: AsyncFn
): [
  boolean,
  (...args: Parameters<AsyncFn>) => Promise<{
    isStale: boolean;
    data: PromiseData<AsyncFn>;
  }>
] => {
  const { setPlayerRef } = usePlayerContext();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [idRef, setIdRef] = useCustomRef(0);
  const request = useCallback(
    async (...args: Parameters<AsyncFn>): Promise<{ isStale: boolean; data: PromiseData<AsyncFn> }> => {
      setIsProcessing(true);
      setIdRef(idRef.current + 1);
      const id = idRef.current;
      try {
        const data = await fn(...args);
        const isStale = id !== idRef.current;
        if (!isStale) {
          setIsProcessing(false);
        }
        return {
          isStale,
          data,
        };
      } catch (error) {
        const isStale = id !== idRef.current;
        if (!isStale) {
          setIsProcessing(false);
          const defaultErrorMessage = "OOPS! SOMETHING WENT WRONG!";
          if (axios.isAxiosError(error) && error.response) {
            const errorResponse = error.response as AxiosResponse<{ message?: string; code?: string }>;
            if (errorResponse.status === 401) {
              createAlertModal("YOUR PLAYER NAME IS EXPIRED", {
                text: "CONFIRM",
                onClick: () => {
                  setPlayerRef({ name: "", id: "" });
                  navigate("/");
                },
              });
            } else {
              createAlertModal(errorResponse.data.message ?? defaultErrorMessage);
            }
          } else {
            createAlertModal(defaultErrorMessage);
          }
        }
        return Promise.reject({ isStale, error });
      }
    },
    [idRef, setPlayerRef, setIdRef, fn, navigate]
  );
  return [isProcessing, request];
};

export default useRequest;
