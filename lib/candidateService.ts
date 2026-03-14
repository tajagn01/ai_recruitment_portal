import prisma from './db';
import type { ParsedCandidate } from './resumeParser';

export interface CandidateInput extends ParsedCandidate {
  resumePath: string;
  resumeText: string;
  source?: string;
}

export interface UpsertResult {
  action: 'created' | 'updated';
  candidateId: string;
  email: string;
}

/**
 * Upsert a candidate record.
 * - If a candidate with the same email exists, update their record.
 * - Otherwise create a new record.
 * - Requires a non-null email; returns null if email is missing.
 */
export async function upsertCandidate(
  input: CandidateInput
): Promise<UpsertResult | null> {
  if (!input.email) {
    console.warn('[WARN] Skipping candidate with no email address');
    return null;
  }

  const skillsCsv = input.skills.join(', ');
  const source = input.source ?? 'Email';

  // Parse years of experience to an integer where possible
  let experienceYears = 0;
  if (input.years_of_experience) {
    const match = input.years_of_experience.match(/\d+/);
    if (match) experienceYears = parseInt(match[0], 10);
  }

  const existing = await prisma.candidate.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existing) {
    await prisma.candidate.update({
      where: { email: input.email },
      data: {
        name: input.name ?? undefined,
        phone: input.phone ?? undefined,
        skills: skillsCsv,
        experienceYears,
        location: input.location ?? undefined,
        education: input.education ?? undefined,
        resumeFileUrl: input.resumePath,
        resumeText: input.resumeText,
        pipelineStatus: 'Applied',
        updatedAt: new Date(),
      },
    });

    return { action: 'updated', candidateId: existing.id, email: input.email };
  }

  const created = await prisma.candidate.create({
    data: {
      name: input.name ?? 'Unknown',
      email: input.email,
      phone: input.phone ?? undefined,
      skills: skillsCsv,
      experienceYears,
      location: input.location ?? undefined,
      education: input.education ?? undefined,
      resumeFileUrl: input.resumePath,
      resumeText: input.resumeText,
      source,
      pipelineStatus: 'Applied',
      candidateScore: 0,
      availability: 'Available',
    },
  });

  return { action: 'created', candidateId: created.id, email: input.email };
}
