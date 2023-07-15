import { useCallback } from "react";
import useAutoHandleErrorRequest from "./autoHandleErrorRequest";
import { useNavigate } from "react-router-dom";
import { usePlayerContext } from "../context/player";
import { createAlertModal } from "../common/alert";
import { PromiseFn, PromiseData } from "../common/utils";
import { PLAYER_REDUCER_ACTION } from "../reducer/player";

const useAutoHandleAuthErrorRequest = <AuthRequestFn extends PromiseFn>(
  ...args: Parameters<typeof useAutoHandleErrorRequest<AuthRequestFn>>
): ReturnType<typeof useAutoHandleErrorRequest<AuthRequestFn>> => {
  const [fn, config] = args;
  const { dispatch: playerDispatch } = usePlayerContext();
  const navigate = useNavigate();
  const [isProcessing, requestFn] = useAutoHandleErrorRequest(fn, {
    customErrorFns: [
      ...(config?.customErrorFns || []),
      {
        status: 401,
        fn: () => {
          createAlertModal("YOUR PLAYER NAME IS EXPIRED", {
            text: "CONFIRM",
            onClick: () => {
              playerDispatch({ type: PLAYER_REDUCER_ACTION.RESET });
              setTimeout(() => navigate("/"), 0);
            },
          });
        },
      },
    ],
    defaultErrorMessage: config?.defaultErrorMessage,
  });
  const request = useCallback(
    async (
      ...args: Parameters<AuthRequestFn>
    ): Promise<{ isStale: boolean; data: PromiseData<AuthRequestFn> }> => {
      const { isStale, data } = await requestFn(...args);
      return {
        isStale,
        data,
      };
    },
    [requestFn]
  );
  return [isProcessing, request];
};

export default useAutoHandleAuthErrorRequest;
