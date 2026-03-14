import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const skill = searchParams.get("skill");
        const id = searchParams.get("id");

        if (id) {
            const candidate = await prisma.candidate.findUnique({ where: { id } });
            if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });
            return NextResponse.json(candidate, { status: 200 });
        }

        const whereClause = skill
            ? { skills: { contains: skill, mode: "insensitive" } }
            : {};

        const candidates = await prisma.candidate.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(candidates, { status: 200 });
    } catch (error) {
        console.error("Fetch Candidates Error:", error);
        return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const body = await req.json();
        const { id, pipelineStatus } = body;

        const updated = await prisma.candidate.update({
            where: { id },
            data: { pipelineStatus },
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update candidate status" }, { status: 500 });
    }
}
