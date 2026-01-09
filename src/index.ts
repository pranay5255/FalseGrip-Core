import 'dotenv/config';

import http from 'node:http';
import { URL } from 'node:url';

import { Pool } from 'pg';

type JsonRecord = Record<string, unknown>;

const port = Number(process.env.PORT ?? 3001);
const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;

if (!pool) {
  console.warn('DATABASE_URL is not set. Backend is running without a database connection.');
}

const server = http.createServer(async (req, res) => {
  const method = req.method ?? 'GET';
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (method === 'GET' && url.pathname === '/health') {
    sendJson(res, 200, {
      status: 'ok',
      database: pool ? 'connected' : 'not_configured',
    });
    return;
  }

  if (method === 'POST' && url.pathname === '/api/chat') {
    const body = await readJson(req);
    if (!body) {
      sendJson(res, 400, { error: 'Invalid JSON body.' });
      return;
    }

    sendJson(res, 501, { error: 'Not implemented yet.' });
    return;
  }

  sendJson(res, 404, { error: 'Not found.' });
});

server.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

async function readJson(req: http.IncomingMessage): Promise<JsonRecord | null> {
  return new Promise((resolve) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body) as JsonRecord);
      } catch {
        resolve(null);
      }
    });
  });
}

function sendJson(res: http.ServerResponse, status: number, payload: JsonRecord): void {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body).toString(),
  });
  res.end(body);
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  console.log(`Received ${signal}. Shutting down...`);

  server.close();
  if (pool) {
    await pool.end();
  }
  process.exit(0);
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
