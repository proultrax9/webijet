import { NextResponse } from "next/server";
import { getRecentPurchases } from "@/lib/store-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getRecentPurchases();
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
