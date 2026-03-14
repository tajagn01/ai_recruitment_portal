import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/resume/[id] — serve candidate PDF
export async function GET(request, { params }) {
  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    select: { resumePdfData: true, name: true },
  });

  if (!candidate || !candidate.resumePdfData) {
    return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
  }

  const buffer = Buffer.from(candidate.resumePdfData, 'base64');
  const filename = `${(candidate.name || 'resume').replace(/\s+/g, '_')}_resume.pdf`;

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  });
}
