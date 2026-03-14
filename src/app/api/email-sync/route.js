import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import prisma from '@/lib/prisma';

// POST /api/email-sync — trigger the email-worker in one-shot mode
export async function POST() {
  const settings = await prisma.emailSettings.findFirst();

  if (!settings || !settings.isConnected) {
    return NextResponse.json(
      { error: 'Gmail is not connected. Save your credentials first.' },
      { status: 400 }
    );
  }

  // Mark sync as running
  await prisma.emailSettings.update({
    where: { id: settings.id },
    data: { lastSyncStatus: 'running', lastSyncMessage: '' },
  });

  const workerPath = path.resolve(process.cwd(), 'scripts/email-worker.ts');

  const env = {
    ...process.env,
    GMAIL_CLIENT_ID: settings.gmailClientId,
    GMAIL_CLIENT_SECRET: settings.gmailClientSecret,
    GMAIL_REFRESH_TOKEN: settings.gmailRefreshToken,
  };

  // Run the worker; keep stdio piped so we can stream logs live
  const child = spawn('npx', ['tsx', workerPath], {
    env,
    cwd: process.cwd(),
    stdio: 'pipe',
  });

  let output = '';

  const updateLive = async (logs) => {
    await prisma.emailSettings.update({
      where: { id: settings.id },
      data: { lastSyncMessage: logs.slice(-2000) },
    }).catch(() => {});
  };

  child.stdout.on('data', (d) => {
    output += d.toString();
    updateLive(output);
  });
  child.stderr.on('data', (d) => { output += d.toString(); });

  child.on('close', async (code) => {
    await prisma.emailSettings.update({
      where: { id: settings.id },
      data: {
        lastSyncStatus: code === 0 ? 'success' : 'error',
        lastSyncAt: new Date(),
        lastSyncMessage: output.slice(-2000) || (code === 0 ? 'Completed successfully' : 'Worker exited with errors'),
      },
    });
  });

  return NextResponse.json({
    success: true,
    message: 'Email sync started in background.',
  });
}

// GET /api/email-sync — return current sync status
export async function GET() {
  try {
    const settings = await prisma.emailSettings.findFirst({
      select: { lastSyncAt: true, lastSyncStatus: true, lastSyncMessage: true },
    });

    return NextResponse.json(settings ?? { lastSyncStatus: null });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
