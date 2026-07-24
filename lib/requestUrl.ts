export function getRequestBaseUrl(request: Request) {
  const requestUrl = new URL(request.url);
  const host =
    getFirstForwardedValue(request.headers.get("x-forwarded-host")) ||
    request.headers.get("host") ||
    requestUrl.host;
  const protocol =
    getFirstForwardedValue(request.headers.get("x-forwarded-proto")) ||
    requestUrl.protocol.replace(":", "") ||
    "http";

  return `${protocol}://${host}`;
}

function getFirstForwardedValue(value: string | null) {
  return value?.split(",")[0]?.trim() ?? "";
}
