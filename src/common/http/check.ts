import http from "./_internal";

export const checkConnectService = async () =>
  await http({
    url: "/connect/health-check",
    method: "get",
  });

export const checkApiService = async () =>
  await http({
    url: "/health-check",
    method: "get",
  });
