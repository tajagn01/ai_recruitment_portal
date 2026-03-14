/**
 * Email ingestion worker for the AI recruitment platform.
 *
 * Usage:
 *   Manual (run once):  npx tsx scripts/email-worker.ts
 *   Watch mode:         npx tsx scripts/email-worker.ts --watch
 */

import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import {
  getUnreadEmailsWithAttachments,
  downloadAttachment,
  markEmailAsRead,
  type EmailMessage,
} from '../lib/gmail';
import { extractTextFromFile, parseResumeWithAI } from '../lib/resumeParser';
import { upsertCandidate } from '../lib/candidateService';
import prisma from '../lib/db';

const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER ?? 'uploads/resumes';
const POLL_INTERVAL_MS = 60_000;
const LOOKBACK_DAYS = parseInt(process.env.EMAIL_LOOKBACK_DAYS ?? '1', 10);
const UPLOAD_DIR = path.resolve(process.cwd(), UPLOAD_FOLDER);
const CONCURRENCY = 3; // process up to 3 emails in parallel

function log(level: 'INFO' | 'WARN' | 'ERROR', message: string): void {
  console.log(`[${level}] [${new Date().toISOString()}] ${message}`);
}

// ---------------------------------------------------------------------------
// Process a single email
// ---------------------------------------------------------------------------

async function processEmail(email: EmailMessage): Promise<void> {
  log('INFO', `Processing: "${email.subject}" from ${email.from}`);

  for (const attachment of email.attachments) {
    log('INFO', `Downloading: ${attachment.filename}`);

    let localPath: string;
    try {
      localPath = await downloadAttachment(attachment, UPLOAD_DIR);
    } catch (err) {
      log('ERROR', `Download failed "${attachment.filename}": ${(err as Error).message}`);
      continue;
    }

    let resumeText: string;
    try {
      resumeText = await extractTextFromFile(localPath);
      if (!resumeText.trim()) {
        log('WARN', `Empty text from ${attachment.filename} — skipping`);
        continue;
      }
    } catch (err) {
      log('ERROR', `Text extraction failed: ${(err as Error).message}`);
      continue;
    }

    let parsed;
    try {
      log('INFO', `Parsing with AI: ${attachment.filename}`);
      parsed = await parseResumeWithAI(resumeText);
      log('INFO', `AI parse done: ${attachment.filename}`);
    } catch (err) {
      log('ERROR', `AI parsing failed: ${(err as Error).message}`);
      continue;
    }

    let resumePdfData: string | undefined;
    try {
      resumePdfData = fs.readFileSync(localPath).toString('base64');
    } catch { /* non-fatal */ }

    try {
      const result = await upsertCandidate({
        ...parsed,
        resumePath: localPath,
        resumeText,
        resumePdfData,
        source: 'Email',
      });
      if (!result) {
        log('WARN', `No email in resume — skipped`);
      } else {
        log('INFO', `Saved [${result.action}]: ${result.email}`);
      }
    } catch (err) {
      log('ERROR', `DB save failed: ${(err as Error).message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Load / save processed email IDs from DB
// ---------------------------------------------------------------------------

async function getProcessedIds(): Promise<Set<string>> {
  const settings = await prisma.emailSettings.findFirst({ select: { processedEmailIds: true } });
  try {
    return new Set(JSON.parse(settings?.processedEmailIds ?? '[]'));
  } catch {
    return new Set();
  }
}

async function saveProcessedIds(ids: Set<string>): Promise<void> {
  const settings = await prisma.emailSettings.findFirst({ select: { id: true } });
  if (!settings) return;
  // Keep only last 500 IDs to avoid unbounded growth
  const arr = [...ids].slice(-500);
  await prisma.emailSettings.update({
    where: { id: settings.id },
    data: { processedEmailIds: JSON.stringify(arr) },
  });
}

// ---------------------------------------------------------------------------
// Main processing loop
// ---------------------------------------------------------------------------

async function processEmails(): Promise<void> {
  log('INFO', 'Checking Gmail inbox...');

  let emails: EmailMessage[];
  try {
    emails = await getUnreadEmailsWithAttachments(LOOKBACK_DAYS);
  } catch (err) {
    log('ERROR', `Gmail API error: ${(err as Error).message}`);
    return;
  }

  if (emails.length === 0) {
    log('INFO', 'No unread emails with resume attachments found');
    return;
  }

  // Filter out already-processed emails
  const processedIds = await getProcessedIds();
  const newEmails = emails.filter(e => !processedIds.has(e.id));

  if (newEmails.length === 0) {
    log('INFO', `All ${emails.length} email(s) already processed — nothing to do`);
    return;
  }

  log('INFO', `Found ${newEmails.length} new email(s) to process (${emails.length - newEmails.length} already done)`);

  // Process in parallel batches of CONCURRENCY
  for (let i = 0; i < newEmails.length; i += CONCURRENCY) {
    const batch = newEmails.slice(i, i + CONCURRENCY);
    await Promise.allSettled(
      batch.map(async (email) => {
        try {
          await processEmail(email);
          processedIds.add(email.id);
        } catch (err) {
          log('ERROR', `Failed email ${email.id}: ${(err as Error).message}`);
        }
        try { await markEmailAsRead(email.id); } catch { /* readonly scope */ }
      })
    );
    await saveProcessedIds(processedIds);
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const watchMode = process.argv.includes('--watch');

  if (watchMode) {
    log('INFO', `Watch mode — polling every ${POLL_INTERVAL_MS / 1000}s`);
    const run = async () => {
      try { await processEmails(); } catch (err) {
        log('ERROR', `Cycle failed: ${(err as Error).message}`);
      }
    };
    await run();
    setInterval(run, POLL_INTERVAL_MS);
    const shutdown = async () => { await prisma.$disconnect(); process.exit(0); };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } else {
    log('INFO', 'Single pass mode');
    try {
      await processEmails();
    } finally {
      await prisma.$disconnect();
    }
  }
}

main().catch((err) => {
  log('ERROR', `Fatal: ${(err as Error).message}`);
  process.exit(1);
});
