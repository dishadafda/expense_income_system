import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Simple, lightweight query to verify DB connectivity.
    // Uses users table which always exists in this schema.
    const count = await prisma.users.count();

    return NextResponse.json({
      ok: true,
      usersCount: count,
    });
  } catch (error) {
    console.error("DB healthcheck failed:", error);
    return NextResponse.json(
      { ok: false, error: "Database connection failed" },
      { status: 500 },
    );
  }
}

