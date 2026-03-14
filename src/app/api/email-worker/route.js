import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

const PID_FILE = path.resolve(process.cwd(), '.email-worker.pid');

function getWorkerPid() {
  if (!existsSync(PID_FILE)) return null;
  const pid = parseInt(readFileSync(PID_FILE, 'utf8').trim(), 10);
  if (isNaN(pid)) return null;
  // Check if the process is still alive
  try {
    process.kill(pid, 0);
    return pid;
  } catch {
    // Process is dead — clean up stale PID file
    unlinkSync(PID_FILE);
    return null;
  }
}

// GET /api/email-worker — check if worker is running
export async function GET() {
  const pid = getWorkerPid();
  return NextResponse.json({ running: pid !== null, pid });
}

// POST /api/email-worker — start watch-mode worker
export async function POST() {
  const existingPid = getWorkerPid();
  if (existingPid) {
    return NextResponse.json({ running: true, pid: existingPid, message: 'Worker already running' });
  }

  const settings = await prisma.emailSettings.findFirst();
  if (!settings || !settings.isConnected) {
    return NextResponse.json(
      { error: 'Gmail is not connected. Save your credentials first.' },
      { status: 400 }
    );
  }

  const workerPath = path.resolve(process.cwd(), 'scripts/email-worker.ts');

  const child = spawn('npx', ['tsx', workerPath, '--watch'], {
    env: {
      ...process.env,
      GMAIL_CLIENT_ID: settings.gmailClientId,
      GMAIL_CLIENT_SECRET: settings.gmailClientSecret,
      GMAIL_REFRESH_TOKEN: settings.gmailRefreshToken,
    },
    cwd: process.cwd(),
    detached: true,
    stdio: 'ignore',
  });

  child.unref();

  writeFileSync(PID_FILE, String(child.pid));

  return NextResponse.json({ running: true, pid: child.pid, message: 'Worker started in background' });
}

// DELETE /api/email-worker — stop watch-mode worker
export async function DELETE() {
  const pid = getWorkerPid();
  if (!pid) {
    return NextResponse.json({ running: false, message: 'Worker is not running' });
  }

  try {
    process.kill(pid, 'SIGTERM');
    unlinkSync(PID_FILE);
    return NextResponse.json({ running: false, message: 'Worker stopped' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
