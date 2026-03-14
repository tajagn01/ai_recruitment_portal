import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/email-settings — load current settings (secrets masked)
export async function GET() {
  try {
    const settings = await prisma.emailSettings.findFirst();

    if (!settings) {
      return NextResponse.json({ connected: false, settings: null });
    }

    return NextResponse.json({
      connected: settings.isConnected,
      settings: {
        gmailClientId: settings.gmailClientId,
        // Mask secrets — return only last 4 chars so UI can show "configured"
        gmailClientSecret: '••••••••' + settings.gmailClientSecret.slice(-4),
        gmailRefreshToken: '••••••••' + settings.gmailRefreshToken.slice(-4),
        lastSyncAt: settings.lastSyncAt,
        lastSyncStatus: settings.lastSyncStatus,
        lastSyncMessage: settings.lastSyncMessage,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/email-settings — save Gmail credentials
export async function POST(request) {
  try {
    const body = await request.json();
    const { gmailClientId, gmailClientSecret, gmailRefreshToken } = body;

    if (!gmailClientId || !gmailClientSecret || !gmailRefreshToken) {
      return NextResponse.json(
        { error: 'All three Gmail OAuth2 fields are required.' },
        { status: 400 }
      );
    }

    // Upsert — only one settings row for now
    const existing = await prisma.emailSettings.findFirst();

    let settings;
    if (existing) {
      settings = await prisma.emailSettings.update({
        where: { id: existing.id },
        data: {
          gmailClientId: gmailClientId.trim(),
          // Only update secret/token if not masked placeholder
          ...(gmailClientSecret.startsWith('••') ? {} : { gmailClientSecret: gmailClientSecret.trim() }),
          ...(gmailRefreshToken.startsWith('••') ? {} : { gmailRefreshToken: gmailRefreshToken.trim() }),
          isConnected: true,
          updatedAt: new Date(),
        },
      });
    } else {
      settings = await prisma.emailSettings.create({
        data: {
          gmailClientId: gmailClientId.trim(),
          gmailClientSecret: gmailClientSecret.trim(),
          gmailRefreshToken: gmailRefreshToken.trim(),
          isConnected: true,
        },
      });
    }

    return NextResponse.json({ success: true, id: settings.id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/email-settings — disconnect Gmail
export async function DELETE() {
  try {
    const existing = await prisma.emailSettings.findFirst();
    if (existing) {
      await prisma.emailSettings.delete({ where: { id: existing.id } });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
