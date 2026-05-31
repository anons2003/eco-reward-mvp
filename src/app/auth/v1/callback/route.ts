import type { NextRequest } from "next/server";
import { handleOAuthCallback } from "@/infrastructure/auth/oauth-callback";

export async function GET(request: NextRequest) {
  return handleOAuthCallback(request);
}
