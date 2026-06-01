import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser, getSupabaseServerClient } from "@/infrastructure/auth/session";

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

async function getRewardId(context: RouteContext) {
  const params = await context.params;
  return params.id;
}

function redeemError(message: string) {
  if (message.includes("insufficient_points")) {
    return NextResponse.json({ error: "Không đủ điểm để đổi phần thưởng này." }, { status: 400 });
  }

  if (message.includes("reward_out_of_stock")) {
    return NextResponse.json({ error: "Phần thưởng đã hết hàng." }, { status: 400 });
  }

  if (message.includes("reward_not_found")) {
    return NextResponse.json({ error: "Không tìm thấy phần thưởng." }, { status: 404 });
  }

  return NextResponse.json({ error: "Không thể đổi phần thưởng lúc này." }, { status: 500 });
}

export async function POST(_request: NextRequest | Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const id = await getRewardId(context);
  const supabase = await getSupabaseServerClient();
  const redeemReward = supabase.rpc.bind(supabase) as unknown as (fn: "redeem_reward", args: { reward_id: string }) => ReturnType<typeof supabase.rpc>;
  const { data, error } = await redeemReward("redeem_reward", { reward_id: id });

  const redemption = Array.isArray(data) ? data[0] : data;

  if (error || !redemption) {
    return redeemError(error?.message ?? "Unable to redeem reward");
  }

  return NextResponse.json({ redemption });
}
