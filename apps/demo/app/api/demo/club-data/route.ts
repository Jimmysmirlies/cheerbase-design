import { NextResponse } from "next/server";

import { getClubData } from "@/lib/club-data";

export async function GET() {
  const data = await getClubData();
  return NextResponse.json(data);
}
