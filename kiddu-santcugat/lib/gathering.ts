import { createHash } from 'node:crypto';
import { store } from './store';
import { dateOf } from './time';
import type { Item, Lang } from './types';

/** What the AI found, after our own checks. Same shape as a public Item, but the location may still be unknown. */
export type DraftItem = Omit<Item, 'lat' | 'lng'> & { lat: number | null; lng: number | null };
export interface SourceRef { sourceId: string; url: string; excerpt: string; fetchedAt: string }
export interface Evidence { title: string | null; date: string | null; price: string | null; age: string | null; place: string | null }

export interface Draft {
  id: string; key: string;
  status: 'pending' | 'published' | 'rejected';
  item: DraftItem; evidence: Evidence; issues: string[]; confidence: number;
  model: string; sources: SourceRef[]; runId: string;
  createdAt: string; updatedAt: string; edited?: boolean;
  rejectReason?: string; origin?: 'auto' | 'editor';
}

export interface SourceResult {
  id: string; name: string; url: string;
  status: 'ok' | 'unchanged' | 'blocked-robots' | 'blocklisted' | 'error' | 'invalid-output' | 'skipped-budget' | 'disabled';
  error?: string; extracted: number; queued: number; published: number; rejected: number;
}
export interface RunReport {
  runId: string; area: string; startedAt: string; finishedAt: string; budgetReached: boolean;
  aiCalls: Record<string, number> & { total: number };
  tokens: { input: number; output: number }; costEur: number;
  totals: { fetched: number; changed: number; extracted: number; published: number; queued: number; rejected: number; unchanged: number; skipped: number; escalated: number; invalid: number; freshnessChecked: number };
  sources: SourceResult[];
}

const nrm = (s: string | null | undefined) => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Same title, same start, same place (or town) = the same event, whichever site it came from. */
export function dedupeKey(i: { title: string; start: string | null; placeName: string | null; town: string }): string {
  return [nrm(i.title), i.start ?? '', nrm(i.placeName) || nrm(i.town)].join('|');
}
export const draftIdOf = (key: string) => createHash('sha1').update(key).digest('hex').slice(0, 16);
export const itemIdOf = (draftId: string) => `s-${draftId}`;
export const firstText = (l: Partial<Record<Lang, string>> | undefined) => (l ? Object.values(l)[0] ?? '' : '');

const k = { draft: (id: string) => `draft:${id}`, item: (id: string) => `item:${id}`, run: (id: string) => `run:${id}`, page: (url: string) => `page:${createHash('sha1').update(url).digest('hex')}` };

export const getDraft = (id: string) => store().get<Draft>(k.draft(id));
export const saveDraft = (d: Draft) => store().set(k.draft(d.id), d);
export async function listDrafts(status?: Draft['status']): Promise<Draft[]> {
  const all = await Promise.all((await store().list('draft:')).map((x) => store().get<Draft>(x)));
  return all.filter((d): d is Draft => !!d && (!status || d.status === status));
}
export const getItem = (id: string) => store().get<Item>(k.item(id));
export async function listItems(): Promise<Item[]> {
  return (await Promise.all((await store().list('item:')).map((x) => store().get<Item>(x)))).filter((i): i is Item => !!i);
}
export const saveItem = (i: Item) => store().set(k.item(i.id), i);
export const deleteItem = (id: string) => store().del(k.item(id));
export const saveRun = (r: RunReport) => store().set(k.run(r.runId), r);
export async function listRuns(): Promise<RunReport[]> {
  const all = (await Promise.all((await store().list('run:')).map((x) => store().get<RunReport>(x)))).filter((r): r is RunReport => !!r);
  return all.sort((a, b) => b.startedAt.localeCompare(a.startedAt) || b.runId.localeCompare(a.runId));
}
export interface PageCache { url: string; hash: string; fetchedAt: string }
export const getPageCache = (url: string) => store().get<PageCache>(k.page(url));
export const savePageCache = (p: PageCache) => store().set(k.page(p.url), p);

/** AI spend in the calendar month of `now` (euros). */
export async function monthSpend(now: string): Promise<number> {
  const month = now.slice(0, 7);
  return (await listRuns()).filter((r) => r.startedAt.slice(0, 7) === month).reduce((s, r) => s + r.costEur, 0);
}

export class PublishError extends Error {}

/** Turns a draft into a public item. A location is required: families find things on the map. */
export async function publishDraft(d: Draft, origin: 'auto' | 'editor', now: string): Promise<Item> {
  if (d.item.lat == null || d.item.lng == null) throw new PublishError('needs a location');
  const item: Item = { ...d.item, lat: d.item.lat, lng: d.item.lng, id: itemIdOf(d.id), status: 'published', origin, sources: d.sources.map((s) => s.url), lastChecked: dateOf(now) };
  await saveItem(item);
  d.status = 'published'; d.origin = origin; d.updatedAt = now;
  await saveDraft(d);
  return item;
}

/** Takes an item off the public site; the draft goes back to the queue. */
export async function unpublish(itemId: string, now: string) {
  await deleteItem(itemId);
  const d = await getDraft(itemId.replace(/^s-/, ''));
  if (d) { d.status = 'pending'; d.origin = undefined; d.updatedAt = now; await saveDraft(d); }
}
