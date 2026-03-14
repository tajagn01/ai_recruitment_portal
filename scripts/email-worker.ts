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

// Load env variables before importing any module that needs them
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

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER ?? 'uploads/resumes';
const POLL_INTERVAL_MS = 60_000; // 60 seconds
// How many days back to look for emails on each run.
// Set to 1 for last 24 h, 7 for last week, etc.
const LOOKBACK_DAYS = parseInt(process.env.EMAIL_LOOKBACK_DAYS ?? '1', 10);
const UPLOAD_DIR = path.resolve(process.cwd(), UPLOAD_FOLDER);

// ---------------------------------------------------------------------------
// Logging helpers
// ---------------------------------------------------------------------------

function log(level: 'INFO' | 'WARN' | 'ERROR', message: string): void {
  const timestamp = new Date().toISOString();
  console.log(`[${level}] [${timestamp}] ${message}`);
}

// ---------------------------------------------------------------------------
// Core processing
// ---------------------------------------------------------------------------

async function processEmail(email: EmailMessage): Promise<void> {
  log('INFO', `New email detected: "${email.subject}" from ${email.from}`);

  if (email.attachments.length === 0) {
    log('WARN', `Email ID ${email.id} has no supported resume attachments — skipping`);
    return;
  }

  for (const attachment of email.attachments) {
    log('INFO', `Processing attachment: ${attachment.filename}`);

    let localPath: string;
    try {
      localPath = await downloadAttachment(attachment, UPLOAD_DIR);
      log('INFO', `Resume downloaded: ${localPath}`);
    } catch (err) {
      log('ERROR', `Failed to download attachment "${attachment.filename}" from email ${email.id}: ${(err as Error).message}`);
      continue;
    }

    let resumeText: string;
    try {
      log('INFO', 'Extracting resume text');
      resumeText = await extractTextFromFile(localPath);

      if (!resumeText.trim()) {
        log('WARN', `Empty text extracted from ${attachment.filename} — skipping`);
        continue;
      }
    } catch (err) {
      log('ERROR', `Resume parsing failed for email ID ${email.id}: ${(err as Error).message}`);
      continue;
    }

    let parsed;
    try {
      log('INFO', 'Sending resume to AI parser');
      parsed = await parseResumeWithAI(resumeText);
      log('INFO', 'Candidate parsed successfully');
    } catch (err) {
      log('ERROR', `AI parsing failed for email ID ${email.id}: ${(err as Error).message}`);
      continue;
    }

    let resumePdfData: string | undefined;
    try {
      resumePdfData = fs.readFileSync(localPath).toString('base64');
    } catch {
      log('WARN', `Could not read PDF for base64 encoding: ${localPath}`);
    }

    try {
      const result = await upsertCandidate({
        ...parsed,
        resumePath: localPath,
        resumeText,
        resumePdfData,
        source: 'Email',
      });

      if (!result) {
        log('WARN', `Skipped storing candidate from email ${email.id} — no email found in resume`);
      } else {
        log(
          'INFO',
          `Candidate stored in database [${result.action}]: ${result.email} (id: ${result.candidateId})`
        );
      }
    } catch (err) {
      log('ERROR', `Database storage failed for email ID ${email.id}: ${(err as Error).message}`);
    }
  }
}

async function processEmails(): Promise<void> {
  log('INFO', 'Checking Gmail inbox...');

  let emails;
  try {
    emails = await getUnreadEmailsWithAttachments(LOOKBACK_DAYS);
  } catch (err) {
    log('ERROR', `Gmail API error: ${(err as Error).message}`);
    return;
  }

  if (emails.length === 0) {
    log('INFO', 'No new unread emails with resume attachments found');
    return;
  }

  log('INFO', `Found ${emails.length} email(s) with resume attachments`);

  for (const email of emails) {
    try {
      await processEmail(email);
    } catch (err) {
      log('ERROR', `Unexpected error processing email ID ${email.id}: ${(err as Error).message}`);
    }
    // Mark as read — requires gmail.modify scope; skip silently if not granted
    try {
      await markEmailAsRead(email.id);
    } catch {
      log('WARN', `Could not mark email ${email.id} as read — token may only have gmail.readonly scope`);
    }
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const watchMode = process.argv.includes('--watch');

  if (watchMode) {
    log('INFO', `Watch mode active — polling every ${POLL_INTERVAL_MS / 1000}s`);

    const run = async () => {
      try {
        await processEmails();
      } catch (err) {
        log('ERROR', `Worker cycle failed: ${(err as Error).message}`);
      }
    };

    await run();
    setInterval(run, POLL_INTERVAL_MS);

    // Keep process alive; handle graceful shutdown
    process.on('SIGINT', async () => {
      log('INFO', 'Shutting down email worker...');
      await prisma.$disconnect();
      process.exit(0);
    });
    process.on('SIGTERM', async () => {
      log('INFO', 'Shutting down email worker...');
      await prisma.$disconnect();
      process.exit(0);
    });
  } else {
    log('INFO', 'Running in manual mode (single pass)');
    try {
      await processEmails();
    } finally {
      await prisma.$disconnect();
    }
  }
}

main().catch((err) => {
  log('ERROR', `Fatal error: ${(err as Error).message}`);
  process.exit(1);
});
