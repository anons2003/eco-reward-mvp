export function avatarUrlFromMetadata(metadata: Record<string, unknown> | undefined) {
  const avatarUrl = metadata?.avatar_url;
  if (typeof avatarUrl === "string" && avatarUrl.trim()) {
    return avatarUrl;
  }

  const picture = metadata?.picture;
  if (typeof picture === "string" && picture.trim()) {
    return picture;
  }

  return null;
}
