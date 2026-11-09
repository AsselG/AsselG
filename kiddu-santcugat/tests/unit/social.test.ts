import { beforeAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cleanName, cleanText, goingCount, matchesAge, parseAges, planExpired, validStart, type Member, type Plan } from '../../lib/social-logic';

const plan = (start: string): Plan => ({ id: 'x', organiserToken: 't', organiserName: 'Ana', title: 'T', start, note: '', createdAt: start, cancelled: false, rsvps: [] });
const member = (kidAges: number[]): Member => ({ id: 'm', secret: 's', firstName: 'Ana', kidAges, joinedAt: '2026-11-01T10:00' });

describe('names and ages', () => {
  it('accepts first names in any language, rejects the rest', () => {
    for (const ok of ['Ana', 'Marc', 'Mª Àngels', "D'Arcy", 'Jean-Luc', 'Ольга', '  Lia  ']) expect(cleanName(ok), ok).toBeTruthy();
    for (const bad of ['', '   ', 'a@b.com', '600123456', '<script>', 'x'.repeat(31), 'Ana1', 12 as unknown as string]) expect(cleanName(bad), String(bad)).toBeNull();
    expect(cleanName('  Lia  ')).toBe('Lia');
  });
  it('parses children ages safely', () => {
    expect(parseAges('4, 6')).toEqual([4, 6]);
    expect(parseAges('6;4 4')).toEqual([4, 6]);
    expect(parseAges('abc, 99, -1, 17, 100, 3.5')).toEqual([17]);
    expect(parseAges('1 2 3 4 5 6 7 8')).toHaveLength(6);
    expect(parseAges(undefined)).toEqual([]);
  });
  it('matches families within one year; families without ages never match', () => {
    expect(matchesAge(member([5]), 4)).toBe(true);
    expect(matchesAge(member([6]), 4)).toBe(false);
    expect(matchesAge(member([]), 4)).toBe(false);
    expect(matchesAge(member([9, 4]), 4)).toBe(true);
  });
  it('cleans free text', () => {
    expect(cleanText('  hola\n\tmón\u0007  ', 20)).toBe('hola món');
    expect(cleanText('x'.repeat(200), 140)).toHaveLength(140);
  });
});

describe('plan rules', () => {
  it('lives until N days after the plan date', () => {
    const p = plan('2026-11-14T11:00');
    expect(planExpired(p, '2026-11-14T09:00', 7)).toBe(false);
    expect(planExpired(p, '2026-11-21T23:00', 7)).toBe(false);
    expect(planExpired(p, '2026-11-22T00:00', 7)).toBe(true);
  });
  it('validates date and time, within 60 days and not in the past', () => {
    const now = '2026-11-11T10:00';
    expect(validStart('2026-11-14', '11:00', now)).toBe('2026-11-14T11:00');
    expect(validStart('2026-11-10', '11:00', now)).toBeNull();
    expect(validStart('2027-03-01', '11:00', now)).toBeNull();
    expect(validStart('2026-11-14', '25:00', now)).toBeNull();
    expect(validStart('nope', '11:00', now)).toBeNull();
  });
  it('counts only families that are going', () => {
    const p = plan('2026-11-14T11:00');
    p.rsvps = [{ id: '1', firstName: 'A', status: 'going', at: '' }, { id: '2', firstName: 'B', status: 'maybe', at: '' }, { id: '3', firstName: 'C', status: 'no', at: '' }];
    expect(goingCount(p)).toBe(1);
  });
});

describe('storage (file store)', () => {
  beforeAll(() => { process.env.KIDDU_STORE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'kiddu-')); });
  it('leaving a group removes the family from its plans', async () => {
    const s = await import('../../lib/social');
    const now = '2026-11-11T10:00';
    const g = await s.createGroup('P4 - Class A', now);
    const ana = await s.joinGroup(g, 'Ana', [4], now);
    const marc = await s.joinGroup(g, 'Marc', [5], now);
    const p = await s.createPlan({ title: 'Park', groupId: g.id, start: '2026-11-14T11:00', note: '', organiserName: 'Marc', organiserMemberId: marc.id }, now);
    await s.addRsvp(p, 'Ana', 'going', ana.id, now);
    await s.addRsvp(p, 'Ana', 'maybe', ana.id, now); // same family answers again: replaced, not duplicated
    expect((await s.getPlan(p.id, now))!.rsvps.map((r) => r.firstName + ':' + r.status)).toEqual(['Marc:going', 'Ana:maybe']);
    await s.leaveGroup((await s.groupById(g.id))!, ana.id);
    expect((await s.groupById(g.id))!.members.map((m) => m.firstName)).toEqual(['Marc']);
    expect((await s.getPlan(p.id, now))!.rsvps.map((r) => r.firstName)).toEqual(['Marc']);
    await s.leaveGroup((await s.groupById(g.id))!, marc.id);
    const after = (await s.getPlan(p.id, now))!;
    expect(after.organiserName).toBe('');
    expect(after.rsvps).toEqual([]);
  });
  it('deletes a plan on first access after the retention period', async () => {
    const s = await import('../../lib/social');
    const p = await s.createPlan({ title: 'Park', start: '2026-11-14T11:00', note: '', organiserName: 'Ana' }, '2026-11-11T10:00');
    expect(await s.getPlan(p.id, '2026-11-21T12:00')).not.toBeNull();
    expect(await s.getPlan(p.id, '2026-11-22T12:00')).toBeNull();
    expect(await s.getPlan(p.id, '2026-11-12T12:00')).toBeNull(); // gone for good
  });
  it('rejects malformed plan ids', async () => {
    const s = await import('../../lib/social');
    expect(await s.getPlan('../../etc/passwd', '2026-11-11T10:00')).toBeNull();
  });
});
