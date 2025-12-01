import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getClubData } from "@/lib/club-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clubOwnerId = searchParams.get("clubOwnerId") ?? undefined;
  const data = await getClubData(clubOwnerId);
  return NextResponse.json(data);
}
