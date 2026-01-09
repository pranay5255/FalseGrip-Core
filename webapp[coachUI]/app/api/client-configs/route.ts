import { NextRequest, NextResponse } from 'next/server';

import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query(
      'select client_id, config, updated_at from client_configs order by updated_at desc'
    );
    return NextResponse.json({ items: result.rows });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const clientId = typeof body.clientId === 'string' ? body.clientId : '';
    const config = body.config ?? {};

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const pool = getPool();
    const result = await pool.query(
      `insert into client_configs (client_id, config)
       values ($1, $2)
       on conflict (client_id)
       do update set config = excluded.config, updated_at = now()
       returning client_id, config, updated_at`,
      [clientId, config]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 }
    );
  }
}
