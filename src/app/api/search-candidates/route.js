import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Basic search by query string against name, email, skills, and location.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("query") || "").trim();

  try {
    const where = query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { skills: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
          ],
        }
      : {};

    const candidates = await prisma.candidate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(candidates);
  } catch (err) {
    console.error("/api/search-candidates error", err);
    return NextResponse.json({ candidates: [] }, { status: 200 });
  }
}
