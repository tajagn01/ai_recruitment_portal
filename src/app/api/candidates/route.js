import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";
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

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Missing candidate id" }, { status: 400 });

        // Fetch first so we can delete the resume file from disk
        const candidate = await prisma.candidate.findUnique({
            where: { id },
            select: { resumeFileUrl: true },
        });

        if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

        // Delete resume file from local disk (ignore errors if file missing)
        if (candidate.resumeFileUrl) {
            const filePath = path.join(process.cwd(), "public", candidate.resumeFileUrl);
            await unlink(filePath).catch(() => {});
        }

        // Cascade deletes Resume + DeduplicationLog rows via Prisma schema relations
        await prisma.candidate.delete({ where: { id } });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Delete Candidate Error:", error);
        return NextResponse.json({ error: "Failed to delete candidate" }, { status: 500 });
    }
}
