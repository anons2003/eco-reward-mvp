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

function normalizeOrigin(value: string | undefined) {
  if (!value) {
    return null;
  }

  const withProtocol = value.startsWith("http") ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, "");
}

export function appOrigin(request: Request) {
  const requestUrl = new URL(request.url);

  if (requestUrl.hostname === "localhost" || requestUrl.hostname === "127.0.0.1") {
    return requestUrl.origin;
  }

  return (
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeOrigin(process.env.APP_URL?.includes("localhost") ? undefined : process.env.APP_URL) ??
    normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeOrigin(process.env.NEXT_PUBLIC_VERCEL_URL) ??
    normalizeOrigin(process.env.VERCEL_URL) ??
    requestOrigin(request)
  );
}
