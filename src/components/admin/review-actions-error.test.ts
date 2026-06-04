import { describe, expect, it } from "vitest";
import { readReviewActionError } from "./review-actions-error";

describe("readReviewActionError", () => {
  it("uses the API error message when the response has JSON", async () => {
    const response = Response.json({ error: "submissionId, decision và reason là bắt buộc." }, { status: 400 });

    await expect(readReviewActionError(response)).resolves.toBe("submissionId, decision và reason là bắt buộc.");
  });

  it("falls back to a server error message when the response body is not JSON", async () => {
    const response = new Response("Internal Server Error", { status: 500 });

    await expect(readReviewActionError(response)).resolves.toBe("Máy chủ đang lỗi khi kiểm duyệt. Quyết định chưa được lưu.");
  });
});
