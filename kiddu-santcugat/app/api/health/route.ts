import { NextResponse } from 'next/server';
import { store, storeKind } from '@/lib/store';

export const dynamic = 'force-dynamic';

/** Writes, reads and deletes one test value so the owner can confirm storage works when hosted. */
export async function GET() {
  const key = `health:${Date.now()}`;
  try {
    await store().set(key, { ok: true });
    const back = await store().get<{ ok: boolean }>(key);
    await store().del(key);
    return NextResponse.json({ store: storeKind(), ok: back?.ok === true });
  } catch (e) {
    return NextResponse.json({ store: storeKind(), ok: false, error: String(e) }, { status: 500 });
  }
}
