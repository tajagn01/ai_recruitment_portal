import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.doc'];

export interface EmailAttachment {
  filename: string;
  mimeType: string;
  attachmentId: string;
  messageId: string;
  size: number;
}

export interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  attachments: EmailAttachment[];
}

function getGmailClient() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing Gmail OAuth2 credentials. Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN in .env'
    );
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });

  return google.gmail({ version: 'v1', auth });
}

function isResumeAttachment(filename: string, mimeType: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return (
    SUPPORTED_EXTENSIONS.includes(ext) ||
    SUPPORTED_MIME_TYPES.includes(mimeType)
  );
}

/**
 * Build a Gmail search query that limits results to emails received
 * within the last `days` days (default: 1).
 * Uses Gmail's `newer_than` operator so only recent mail is scanned,
 * not the entire inbox history.
 */
function buildSearchQuery(days = 1): string {
  return `is:unread has:attachment newer_than:${days}d`;
}

export async function getUnreadEmailsWithAttachments(days = 1): Promise<EmailMessage[]> {
  const gmail = getGmailClient();

  const listResponse = await gmail.users.messages.list({
    userId: 'me',
    q: buildSearchQuery(days),
    maxResults: 50,
  });

  const messages = listResponse.data.messages ?? [];
  if (messages.length === 0) return [];

  const emailMessages: EmailMessage[] = [];

  for (const msg of messages) {
    if (!msg.id) continue;

    try {
      const fullMsg = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full',
      });

      const headers = fullMsg.data.payload?.headers ?? [];
      const subject = headers.find((h) => h.name === 'Subject')?.value ?? '(no subject)';
      const from = headers.find((h) => h.name === 'From')?.value ?? 'unknown';

      const attachments: EmailAttachment[] = [];
      const parts = fullMsg.data.payload?.parts ?? [];

      for (const part of parts) {
        const filename = part.filename ?? '';
        const mimeType = part.mimeType ?? '';
        const attachmentId = part.body?.attachmentId;

        if (filename && attachmentId && isResumeAttachment(filename, mimeType)) {
          attachments.push({
            filename,
            mimeType,
            attachmentId,
            messageId: msg.id,
            size: part.body?.size ?? 0,
          });
        }
      }

      if (attachments.length > 0) {
        emailMessages.push({ id: msg.id, subject, from, attachments });
      }
    } catch (err) {
      console.error(`[ERROR] Failed to fetch email ID ${msg.id}:`, err);
    }
  }

  return emailMessages;
}

export async function downloadAttachment(
  attachment: EmailAttachment,
  outputDir: string
): Promise<string> {
  const gmail = getGmailClient();

  const response = await gmail.users.messages.attachments.get({
    userId: 'me',
    messageId: attachment.messageId,
    id: attachment.attachmentId,
  });

  const data = response.data.data;
  if (!data) throw new Error(`No data returned for attachment ${attachment.filename}`);

  // Gmail API returns base64url-encoded data
  const buffer = Buffer.from(data, 'base64url');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Sanitize filename
  const safeFilename = attachment.filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();
  const timestamp = Date.now();
  const filename = `${timestamp}_${safeFilename}`;
  const filePath = path.join(outputDir, filename);

  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export async function markEmailAsRead(messageId: string): Promise<void> {
  const gmail = getGmailClient();

  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: {
      removeLabelIds: ['UNREAD'],
    },
  });
}
