import { Client } from '@upstash/qstash';

// Initialize QStash client
// Requires QSTASH_TOKEN in .env.local
export const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN || '',
});

/**
 * Enqueue a new audit job
 */
export async function enqueueAuditJob(url: string, auditId: string) {
  if (!process.env.QSTASH_TOKEN) {
    console.warn('[QStash] Missing token. Falling back to synchronous processing (not recommended for production).');
    // Fallback logic here if needed, but usually we just throw or bypass
  }

  // The destination URL must be publicly accessible for QStash to hit it.
  // E.g., https://your-production-domain.com/api/queue/audit
  const destinationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/queue/audit`;

  console.log(`[QStash] Enqueuing audit job for ${url} (Audit ID: ${auditId})`);
  
  const res = await qstashClient.publishJSON({
    url: destinationUrl,
    body: {
      url,
      auditId
    },
    // Optional: add a delay, or max retries
    retries: 3
  });

  return res;
}
