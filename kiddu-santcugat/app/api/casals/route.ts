import type { NextRequest } from 'next/server';
import { loadCasals } from '@/lib/casals';
import { addCasal, removeCasal, saveProfile, setCasalStatus } from '@/lib/social';
import { readForm, see } from '@/lib/http';
import { currentProfile } from '@/lib/session';
import { now } from '@/lib/server-context';

/** Casal plan actions: add a week, mark registered, remove, switch sharing with friends. */
export async function POST(req: NextRequest) {
  const form = await readForm(req);
  const me = await currentProfile();
  if (!me) return see(req, `/${form.lang}/me?need=profile`);
  const plan = `/${form.lang}/casals/plan`;
  const action = form.get('action');

  if (action === 'share') {
    me.shareCasals = form.get('value') === 'on';
    await saveProfile(me);
    return see(req, plan);
  }
  const casal = loadCasals().casals.find((c) => c.id === form.get('casalId') && c.status === 'published');
  const turn = casal?.turns.find((t) => t.start === form.get('turn'));
  if (!casal || !turn) return see(req, plan);
  if (action === 'add') await addCasal(me, casal.id, turn.start, await now());
  if (action === 'registered') await setCasalStatus(me, casal.id, turn.start, 'registered');
  if (action === 'remove') await removeCasal(me, casal.id, turn.start);
  return see(req, plan);
}
