const DEFAULT_REVIEW_ERROR = "Chưa thể lưu quyết định kiểm duyệt. Vui lòng thử lại.";

export async function readReviewActionError(response: Response): Promise<string> {
  const fallback = response.status >= 500 ? "Máy chủ đang lỗi khi kiểm duyệt. Quyết định chưa được lưu." : DEFAULT_REVIEW_ERROR;

  try {
    const payload = (await response.json()) as { error?: unknown; message?: unknown };
    const message = typeof payload.error === "string" ? payload.error : typeof payload.message === "string" ? payload.message : "";
    return message.trim() || fallback;
  } catch {
    return fallback;
  }
}
