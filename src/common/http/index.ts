import http from "./_internal";
export * from "./player";
export * from "./room";
export * from "./check";

export type ApiError = {
  code?: string;
  message?: string;
};

export default http;
