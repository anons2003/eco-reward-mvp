import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const update = vi.fn();
const eq = vi.fn();
const putAvatarObject = vi.fn();
const avatarPublicUrl = vi.fn();

vi.mock("@/infrastructure/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser },
    from: vi.fn(() => ({ update })),
  })),
}));

vi.mock("@/infrastructure/storage/s3", () => ({
  putAvatarObject,
  avatarPublicUrl,
}));

function requestWithAvatar(file?: File) {
  const formData = new FormData();
  if (file) {
    formData.set("avatar", file);
  }

  return new Request("https://eco.test/api/profile/avatar", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/profile/avatar", () => {
  beforeEach(() => {
    getUser.mockReset();
    update.mockReset();
    eq.mockReset();
    putAvatarObject.mockReset();
    avatarPublicUrl.mockReset();

    update.mockReturnValue({ eq });
    eq.mockResolvedValue({ error: null });
    avatarPublicUrl.mockReturnValue("https://cdn.example.com/avatars/user-1/avatar.jpg");
    vi.spyOn(crypto, "randomUUID").mockReturnValue("avatar-id");
  });

  it("redirects unauthenticated users to login", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } });
    const { POST } = await import("./route");

    const response = await POST(requestWithAvatar());

    expect(response.headers.get("location")).toBe("https://eco.test/login");
    expect(putAvatarObject).not.toHaveBeenCalled();
  });

  it("rejects invalid file types", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: "user-1" } } });
    const { POST } = await import("./route");

    const response = await POST(requestWithAvatar(new File(["hello"], "avatar.txt", { type: "text/plain" })));

    expect(response.headers.get("location")).toBe("https://eco.test/settings?avatar=invalid_type");
    expect(putAvatarObject).not.toHaveBeenCalled();
  });

  it("uploads the avatar to S3 and updates the profile", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: "user-1" } } });
    const { POST } = await import("./route");

    const response = await POST(requestWithAvatar(new File(["image"], "avatar.jpg", { type: "image/jpeg" })));

    expect(putAvatarObject).toHaveBeenCalledWith({
      key: "avatars/user-1/avatar-id.jpg",
      body: Buffer.from("image"),
      contentType: "image/jpeg",
    });
    expect(update).toHaveBeenCalledWith({
      avatar_url: "https://cdn.example.com/avatars/user-1/avatar.jpg",
      avatar_object_key: "avatars/user-1/avatar-id.jpg",
    });
    expect(eq).toHaveBeenCalledWith("id", "user-1");
    expect(response.headers.get("location")).toBe("https://eco.test/settings?avatar=success");
  });
});
