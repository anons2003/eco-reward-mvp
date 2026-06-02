type SupabaseCookie = {
  name: string;
  value: string;
};

const authTokenPattern = /^(sb-[^.]+-auth-token)(?:\.(\d+))?$/;
const base64Prefix = "base64-";

function isChunkLike(cookieName: string, storageKey: string) {
  return cookieName === storageKey || new RegExp(`^${storageKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.(0|[1-9][0-9]*)$`).test(cookieName);
}

function decodeStorageValue(value: string) {
  if (!value.startsWith(base64Prefix)) {
    return value;
  }

  const encoded = value.slice(base64Prefix.length);
  const padded = encoded.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(encoded.length / 4) * 4, "=");
  const binary = globalThis.atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function combineChunks(cookies: SupabaseCookie[], storageKey: string) {
  const base = cookies.find((cookie) => cookie.name === storageKey)?.value;
  if (base) return base;

  const chunks: string[] = [];
  for (let index = 0; ; index += 1) {
    const chunk = cookies.find((cookie) => cookie.name === `${storageKey}.${index}`)?.value;
    if (!chunk) break;
    chunks.push(chunk);
  }

  return chunks.length ? chunks.join("") : null;
}

function isValidAuthStorage(cookies: SupabaseCookie[], storageKey: string) {
  const value = combineChunks(cookies, storageKey);
  if (!value) return true;

  try {
    JSON.parse(decodeStorageValue(value));
    return true;
  } catch {
    return false;
  }
}

function candidateAuthStorageKeys(cookies: SupabaseCookie[], keyHints: string[] = []) {
  const keys = new Set<string>();

  keyHints.forEach((key) => {
    if (authTokenPattern.test(key)) {
      keys.add(key);
    }
  });

  cookies.forEach((cookie) => {
    const match = cookie.name.match(authTokenPattern);
    if (match?.[1]) {
      keys.add(match[1]);
    }
  });

  return keys;
}

export function sanitizeSupabaseAuthCookies<TCookie extends SupabaseCookie>(cookies: TCookie[], keyHints: string[] = []) {
  const staleCookieNames = new Set<string>();

  candidateAuthStorageKeys(cookies, keyHints).forEach((storageKey) => {
    if (isValidAuthStorage(cookies, storageKey)) return;

    cookies.forEach((cookie) => {
      if (isChunkLike(cookie.name, storageKey)) {
        staleCookieNames.add(cookie.name);
      }
    });
  });

  if (staleCookieNames.size === 0) {
    return { cookies, staleCookieNames };
  }

  return {
    cookies: cookies.filter((cookie) => !staleCookieNames.has(cookie.name)),
    staleCookieNames,
  };
}
