export function safeNextPath(value: string | null, fallback = "/dashboard") {
  const next = value ?? "";
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export function requestOrigin(request: Request) {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  if (process.env.NODE_ENV === "development" || !forwardedHost) {
    return url.origin;
  }

  return `${forwardedProto}://${forwardedHost}`;
}
