import type { AxiosResponse } from "axios";
import { useCallback } from "react";
import axios from "axios";
import useRequest from "./request";
import { createAlertModal } from "../common/alert";
import { PromiseFn, PromiseData } from "../common/utils";
import { ApiError } from "../common/http";

const { isAxiosError } = axios;

const useAutoHandleErrorRequest = <RequestFn extends PromiseFn>(
  fn: RequestFn,
  config?: {
    customErrorFns: Array<{
      status: number;
      fn: <T = unknown, D = any>(error: AxiosResponse<T, D>) => void;
    }>;
    defaultErrorMessage?: string;
  }
): ReturnType<typeof useRequest<RequestFn>> => {
  const [isProcessing, requestFn] = useRequest(fn);
  const request = useCallback(
    async (...args: Parameters<RequestFn>): Promise<{ isStale: boolean; data: PromiseData<RequestFn> }> => {
      try {
        const { isStale, data } = await requestFn(...args);
        return {
          isStale,
          data,
        };
      } catch (error) {
        const customError = error as { isStale: boolean; error: unknown };
        if (!customError.isStale) {
          const defaultErrorMessage = config?.defaultErrorMessage || "OOPS! SOMETHING WENT WRONG!";
          const customErrorFns = config?.customErrorFns || [];
          if (isAxiosError(customError.error) && customError.error.response) {
            const errorResponse = customError.error.response as AxiosResponse<ApiError>;
            const customErrorFn = customErrorFns.find(({ status }) => status === errorResponse.status);
            if (customErrorFn) {
              customErrorFn.fn(errorResponse);
            } else {
              createAlertModal(errorResponse.data.message ?? defaultErrorMessage);
            }
          }
        }
        return Promise.reject(customError);
      }
    },
    [requestFn, config]
  );
  return [isProcessing, request];
};

export default useAutoHandleErrorRequest;
