import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Filters by skills (comma-separated), experience (years), and location substring.
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ candidates: [] }, { status: 200 });
  }

  const skills = (body.skills || "").trim();
  const experience = parseInt(body.experience, 10);
  const location = (body.location || "").trim();
  const pipelineStatus = (body.pipelineStatus || "").trim();

  const skillTokens = skills
    ? skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  try {
    const where = {};

    if (skillTokens.length > 0) {
      where.AND = skillTokens.map((token) => ({ skills: { contains: token, mode: "insensitive" } }));
    }

    if (!Number.isNaN(experience)) {
      where.experienceYears = { gte: experience };
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (pipelineStatus) {
      where.pipelineStatus = pipelineStatus;
    }

    const candidates = await prisma.candidate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(candidates);
  } catch (err) {
    console.error("/api/filter-candidates error", err);
    return NextResponse.json({ candidates: [] }, { status: 200 });
  }
}
