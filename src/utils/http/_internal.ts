import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getToken } from "../token";

const http = axios.create({
  baseURL: process.env.REACT_APP_AJAX_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const withTokenRequest = <
  Data = any,
  ConfigData = any,
  Config extends AxiosRequestConfig<ConfigData> = AxiosRequestConfig<ConfigData>
>(
  config: Config
) => {
  const token = getToken();
  return http.request<Data, AxiosResponse<Data>, ConfigData>({
    ...config,
    headers: {
      ...(config.headers ? config.headers : {}),
      ...(token ? { Authorization: `Bearer ${token as string}` } : {}),
    },
  });
};

export default http;
