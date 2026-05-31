import { describe, expect, it } from "vitest";
import { updateSession } from "./proxy";

function nextRequest(url: string) {
  const nextUrl = new URL(url);
  return {
    url,
    headers: new Headers(),
    cookies: {
      getAll: () => [],
    },
    nextUrl: {
      ...nextUrl,
      clone: () => new URL(url),
      searchParams: nextUrl.searchParams,
      pathname: nextUrl.pathname,
    },
  };
}

describe("updateSession", () => {
  it("treats legacy root PKCE callbacks without a type as password recovery", async () => {
    const response = await updateSession(nextRequest("https://eco.test/?code=abc") as never);

    expect(response.headers.get("location")).toBe("https://eco.test/auth/callback?code=abc&type=recovery");
  });
});
