import { beforeAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { canViewPlan, cleanName, cleanText, goingCount, matchesAge, parseAges, pickAllowed, planExpired, planRole, validStart, type Group, type Plan, type Profile } from '../../lib/social-logic';

const plan = (over: Partial<Plan> = {}): Plan => ({ id: 'x', organiserToken: 't', organiserName: 'Marc', organiserProfileId: 'marc', title: 'T', audience: 'friends', invited: ['ana'], start: '2026-11-14T11:00', note: '', createdAt: '2026-11-11T10:00', cancelled: false, rsvps: [], ...over });
const prof = (id: string, over: Partial<Profile> = {}): Profile => ({ id, secret: 's', firstName: id, kidAges: [], interests: [], languages: [], inviteToken: 'i' + id, recoveryToken: 'r' + id, groupIds: [], friendIds: [], requestIds: [], casals: [], shareCasals: false, createdAt: '', ...over });

describe('names, ages, lists', () => {
  it('accepts first names in any language, rejects the rest', () => {
    for (const ok of ['Ana', 'Marc', 'Mª Àngels', "D'Arcy", 'Jean-Luc', 'Ольга', '  Lia  ']) expect(cleanName(ok), ok).toBeTruthy();
    for (const bad of ['', '   ', 'a@b.com', '600123456', '<script>', 'x'.repeat(31), 'Ana1', 12 as unknown as string]) expect(cleanName(bad), String(bad)).toBeNull();
  });
  it('parses children ages safely', () => {
    expect(parseAges('4, 6')).toEqual([4, 6]);
    expect(parseAges('abc, 99, -1, 17, 100, 3.5')).toEqual([17]);
    expect(parseAges('1 2 3 4 5 6 7 8')).toHaveLength(6);
  });
  it('keeps only allowed values, in the allowed order', () => {
    expect(pickAllowed(['nature', 'sport', 'hacking', 7], ['sport', 'art', 'nature'])).toEqual(['sport', 'nature']);
  });
  it('matches families within one year; families without ages never match', () => {
    expect(matchesAge({ kidAges: [5] }, 4)).toBe(true);
    expect(matchesAge({ kidAges: [6] }, 4)).toBe(false);
    expect(matchesAge({ kidAges: [] }, 4)).toBe(false);
  });
  it('cleans free text', () => {
    expect(cleanText('  hola\n\tmón\u0007  ', 20)).toBe('hola món');
    expect(cleanText('x'.repeat(200), 140)).toHaveLength(140);
  });
});

describe('plan rules', () => {
  it('lives until N days after the plan date', () => {
    expect(planExpired(plan(), '2026-11-21T23:00', 7)).toBe(false);
    expect(planExpired(plan(), '2026-11-22T00:00', 7)).toBe(true);
  });
  it('validates date and time, within 60 days and not in the past', () => {
    const now = '2026-11-11T10:00';
    expect(validStart('2026-11-14', '11:00', now)).toBe('2026-11-14T11:00');
    expect(validStart('2026-11-10', '11:00', now)).toBeNull();
    expect(validStart('2027-03-01', '11:00', now)).toBeNull();
    expect(validStart('2026-11-14', '25:00', now)).toBeNull();
  });
  it('counts only families that are going', () => {
    const p = plan({ rsvps: [{ id: '1', firstName: 'A', status: 'going', at: '' }, { id: '2', firstName: 'B', status: 'maybe', at: '' }] });
    expect(goingCount(p)).toBe(1);
  });
});

describe('who can see a plan', () => {
  const group: Group = { id: 'g', name: 'P4', inviteToken: 'x', createdAt: '', members: [{ id: 'ana', joinedAt: '' }, { id: 'marc', joinedAt: '' }] };
  const ana = prof('ana', { friendIds: ['marc'] });
  it('link plans: anyone with the link', () => {
    expect(canViewPlan(plan({ audience: 'link' }), null, null, false)).toBe(true);
  });
  it('friends plans: only the organiser and invited, still-connected families', () => {
    const p = plan();
    expect(canViewPlan(p, null, null, false)).toBe(false);
    expect(canViewPlan(p, ana, null, false)).toBe(true);
    expect(canViewPlan(p, prof('lia', { friendIds: ['marc'] }), null, false)).toBe(false);           // friend, not invited
    expect(canViewPlan(p, prof('ana', { friendIds: [] }), null, false)).toBe(false);                  // invited, connection removed
    expect(canViewPlan(p, prof('marc'), null, false)).toBe(true);                                      // organiser
    expect(canViewPlan(p, null, null, true)).toBe(true);                                               // organiser link
  });
  it('class plans: only members of the class', () => {
    const p = plan({ audience: 'group', groupId: 'g', invited: [] });
    expect(canViewPlan(p, ana, group, false)).toBe(true);
    expect(canViewPlan(p, prof('lia'), group, false)).toBe(false);
    expect(canViewPlan(p, null, group, false)).toBe(false);
  });
  it('roles', () => {
    expect(planRole(plan(), prof('marc'))).toBe('organiser');
    expect(planRole(plan(), ana)).toBe('invited');
    expect(planRole(plan({ audience: 'group' }), ana)).toBe('class');
  });
});

describe('storage (file store)', () => {
  beforeAll(() => { process.env.KIDDU_STORE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'kiddu-')); });
  const NOW = '2026-11-11T10:00';
  const fam = async (name: string, ages: number[] = []) => (await import('../../lib/social')).createProfile({ firstName: name, kidAges: ages, interests: [], languages: [] }, NOW);

  it('connections are mutual, removable, and never reach friends of friends', async () => {
    const s = await import('../../lib/social');
    const [a, b, c] = [await fam('Ana'), await fam('Marc'), await fam('Lia')];
    expect(await s.connectFamilies(a, b)).toBe('ok');
    expect(await s.connectFamilies(b, c)).toBe('ok');
    expect((await s.profileById(a.id))!.friendIds).toEqual([b.id]);
    expect((await s.profileById(b.id))!.friendIds.sort()).toEqual([a.id, c.id].sort());
    await s.disconnectFamilies(a, b);
    expect((await s.profileById(a.id))!.friendIds).toEqual([]);
    expect((await s.profileById(b.id))!.friendIds).toEqual([c.id]);
    expect(await s.connectFamilies(a, a)).toBe('self');
  });
  it('a request needs a shared class', async () => {
    const s = await import('../../lib/social');
    const [a, b] = [await fam('Ana'), await fam('Marc')];
    expect(await s.requestConnection(a, b)).toBe(false);
    const g = await s.createGroup('P4', NOW);
    await s.joinGroup(g, a, NOW); await s.joinGroup(g, b, NOW);
    expect(await s.requestConnection(a, b)).toBe(true);
    expect((await s.profileById(b.id))!.requestIds).toEqual([a.id]);
    await s.connectFamilies(b, (await s.profileById(a.id))!);
    expect((await s.profileById(b.id))!.requestIds).toEqual([]);
  });
  it('leaving a class removes the family from its plans but keeps the profile', async () => {
    const s = await import('../../lib/social');
    const g = await s.createGroup('P4', NOW);
    const [ana, marc] = [await fam('Ana'), await fam('Marc')];
    await s.joinGroup(g, ana, NOW); await s.joinGroup(g, marc, NOW);
    const p = await s.createPlan({ title: 'Park', groupId: g.id, audience: 'group', invited: [], start: '2026-11-14T11:00', note: '', organiserName: 'Marc', organiserProfileId: marc.id }, NOW);
    await s.addRsvp(p, 'Ana', 'going', ana.id, NOW);
    await s.addRsvp(p, 'Ana', 'maybe', ana.id, NOW);
    expect((await s.getPlan(p.id, NOW))!.rsvps.map((r) => r.firstName + ':' + r.status)).toEqual(['Marc:going', 'Ana:maybe']);
    await s.leaveGroup((await s.groupById(g.id))!, (await s.profileById(ana.id))!);
    expect((await s.groupById(g.id))!.members.map((m) => m.id)).toEqual([marc.id]);
    expect((await s.getPlan(p.id, NOW))!.rsvps.map((r) => r.firstName)).toEqual(['Marc']);
    expect(await s.profileById(ana.id)).not.toBeNull();
  });
  it('deleting a family erases it everywhere', async () => {
    const s = await import('../../lib/social');
    const g = await s.createGroup('P4', NOW);
    const [ana, marc] = [await fam('Ana'), await fam('Marc')];
    await s.joinGroup(g, ana, NOW); await s.joinGroup(g, marc, NOW);
    await s.connectFamilies(ana, marc);
    const mine = await s.createPlan({ title: 'Mine', audience: 'friends', invited: [marc.id], start: '2026-11-14T11:00', note: '', organiserName: 'Ana', organiserProfileId: ana.id }, NOW);
    const theirs = await s.createPlan({ title: 'Theirs', groupId: g.id, audience: 'group', invited: [], start: '2026-11-14T11:00', note: '', organiserName: 'Marc', organiserProfileId: marc.id }, NOW);
    await s.addRsvp(theirs, 'Ana', 'going', ana.id, NOW);
    await s.deleteFamily((await s.profileById(ana.id))!);
    expect(await s.profileById(ana.id)).toBeNull();
    expect(await s.profileByInvite(ana.inviteToken)).toBeNull();
    expect(await s.profileByRecovery(ana.recoveryToken)).toBeNull();
    expect((await s.profileById(marc.id))!.friendIds).toEqual([]);
    expect((await s.groupById(g.id))!.members.map((m) => m.id)).toEqual([marc.id]);
    expect(await s.getPlan(mine.id, NOW)).toBeNull();
    expect((await s.getPlan(theirs.id, NOW))!.rsvps.map((r) => r.firstName)).toEqual(['Marc']);
  });
  it('plans are deleted on first access after the retention period; bad ids are rejected', async () => {
    const s = await import('../../lib/social');
    const p = await s.createPlan({ title: 'Park', audience: 'link', invited: [], start: '2026-11-14T11:00', note: '', organiserName: 'Ana' }, NOW);
    expect(await s.getPlan(p.id, '2026-11-21T12:00')).not.toBeNull();
    expect(await s.getPlan(p.id, '2026-11-22T12:00')).toBeNull();
    expect(await s.getPlan(p.id, '2026-11-12T12:00')).toBeNull();
    expect(await s.getPlan('../../etc/passwd', NOW)).toBeNull();
  });
  it('casal choices: add once, mark registered, remove', async () => {
    const s = await import('../../lib/social');
    const a = await fam('Ana');
    await s.addCasal(a, 'c-forest', '2027-06-28', NOW); await s.addCasal(a, 'c-forest', '2027-06-28', NOW);
    expect(a.casals).toHaveLength(1);
    await s.setCasalStatus(a, 'c-forest', '2027-06-28', 'registered');
    expect((await s.profileById(a.id))!.casals[0].status).toBe('registered');
    await s.removeCasal(a, 'c-forest', '2027-06-28');
    expect((await s.profileById(a.id))!.casals).toEqual([]);
  });
});
