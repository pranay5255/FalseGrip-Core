import { NextRequest, NextResponse } from 'next/server';

import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{
    clientId: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { clientId } = await context.params;
    const pool = getPool();
    const result = await pool.query(
      'select client_id, config, updated_at from client_configs where client_id = $1',
      [clientId]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { clientId } = await context.params;
    const body = await request.json();
    const config = body.config ?? {};

    const pool = getPool();
    const result = await pool.query(
      `update client_configs
       set config = $2, updated_at = now()
       where client_id = $1
       returning client_id, config, updated_at`,
      [clientId, config]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { clientId } = await context.params;
    const pool = getPool();
    const result = await pool.query(
      'delete from client_configs where client_id = $1 returning client_id',
      [clientId]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 }
    );
  }
}
