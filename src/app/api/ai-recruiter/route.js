import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Simple AI-like responder that echoes intent and returns candidate matches.
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ reply: "I need a query to search.", candidates: [] }, { status: 200 });
  }

  const query = (body.query || "").trim();
  if (!query) {
    return NextResponse.json({ reply: "Please provide a search query.", candidates: [] }, { status: 200 });
  }

  try {
    const candidates = await prisma.candidate.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { skills: { contains: query, mode: "insensitive" } },
          { location: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    const reply = candidates.length
      ? `I found ${candidates.length} candidates relevant to "${query}".`
      : `I couldn’t find matches for "${query}". Try adjusting skills, location, or experience.`;

    return NextResponse.json({ reply, candidates });
  } catch (err) {
    console.error("/api/ai-recruiter error", err);
    return NextResponse.json({ reply: "I hit an issue fetching results. Try again soon.", candidates: [] }, { status: 200 });
  }
}
