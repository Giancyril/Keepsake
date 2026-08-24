import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getMemoriesForUser } from "@/lib/memories/engine";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const capsules = await getMemoriesForUser(session.user.id);
    return NextResponse.json({ memories: capsules });
  } catch (err: any) {
    console.error("[GET /api/memories] Error:", err);
    return NextResponse.json(
      { error: "Failed to load memories" },
      { status: 500 }
    );
  }
}
