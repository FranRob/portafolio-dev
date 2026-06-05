import prisma from '../../lib/prisma.js';
import type { AnalyticsStatsResponse } from '../../dtos/index.js';

function parseReferrerSource(referrer: string | null | undefined): string {
  if (!referrer) return 'Directo';
  try {
    const url = new URL(referrer);
    const host = url.hostname.replace(/^www\./, '');
    const map: Record<string, string> = {
      'google.com': 'Google',
      'google.com.ar': 'Google',
      'linkedin.com': 'LinkedIn',
      'github.com': 'GitHub',
      't.co': 'Twitter/X',
      'twitter.com': 'Twitter/X',
      'x.com': 'Twitter/X',
      'instagram.com': 'Instagram',
    };
    return map[host] ?? host;
  } catch {
    return 'Otro';
  }
}

function getDeviceType(userAgent: string | null | undefined): string {
  if (!userAgent) return 'Desktop';
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'Tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(userAgent)) return 'Mobile';
  return 'Desktop';
}

function toStatsResponse(stats: {
  totalVisits: number;
  todayVisits: number;
  mostViewedSection: string;
  unreadMessages: number;
  sectionViews: Record<string, number>;
  dailyVisits: Array<{ date: string; count: number }>;
  referrerStats: Array<{ source: string; count: number }>;
  deviceStats: Array<{ type: string; count: number }>;
}): AnalyticsStatsResponse {
  return {
    totalVisits: stats.totalVisits,
    todayVisits: stats.todayVisits,
    mostViewedSection: stats.mostViewedSection,
    unreadMessages: stats.unreadMessages,
    sectionViews: stats.sectionViews,
    dailyVisits: stats.dailyVisits,
    referrerStats: stats.referrerStats,
    deviceStats: stats.deviceStats,
  };
}

export async function trackView(
  section: string,
  userAgent: string | undefined,
  ip: string | undefined,
  referrer: string | undefined,
  sessionId: string | undefined,
): Promise<void> {
  await prisma.pageView.create({
    data: {
      section,
      sessionId: sessionId ?? null,
      userAgent: userAgent ?? null,
      ip: ip ?? null,
      referrer: referrer ?? null,
    },
  });
}

export async function getStats(range: '7d' | '30d' | 'all' = 'all'): Promise<AnalyticsStatsResponse> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let rangeStart: Date | undefined;
  if (range === '7d') {
    rangeStart = new Date(todayStart);
    rangeStart.setDate(rangeStart.getDate() - 6);
  } else if (range === '30d') {
    rangeStart = new Date(todayStart);
    rangeStart.setDate(rangeStart.getDate() - 29);
  }
  // 'all' → rangeStart stays undefined (no filter)

  // Total visits: distinct sessions + legacy rows without sessionId
  const sessionRows = await prisma.pageView.findMany({
    where: {
      sessionId: { not: null },
      ...(rangeStart ? { createdAt: { gte: rangeStart } } : {}),
    },
    distinct: ['sessionId'],
    select: { sessionId: true },
  });
  const legacyCount = await prisma.pageView.count({
    where: {
      sessionId: null,
      ...(rangeStart ? { createdAt: { gte: rangeStart } } : {}),
    },
  });
  const totalVisits = sessionRows.length + legacyCount;

  // Today visits: distinct sessions today + legacy rows today (always today, no range filter)
  const todaySessionRows = await prisma.pageView.findMany({
    where: { sessionId: { not: null }, createdAt: { gte: todayStart } },
    distinct: ['sessionId'],
    select: { sessionId: true },
  });
  const todayLegacy = await prisma.pageView.count({
    where: { sessionId: null, createdAt: { gte: todayStart } },
  });
  const todayVisits = todaySessionRows.length + todayLegacy;

  // Views by section
  const sectionGroups = await prisma.pageView.groupBy({
    by: ['section'],
    _count: { section: true },
    orderBy: { _count: { section: 'desc' } },
    ...(rangeStart ? { where: { createdAt: { gte: rangeStart } } } : {}),
  });

  const sectionViews = Object.fromEntries(
    sectionGroups.map((g: typeof sectionGroups[number]) => [g.section, g._count.section]),
  );

  const mostViewedSection = sectionGroups[0]?.section ?? '';

  // Unread contact messages
  const unreadMessages = await prisma.contactMessage.count({
    where: { read: false },
  });

  // Daily visits chart — days depend on range
  const chartDays = range === '30d' ? 30 : range === '7d' ? 7 : 30; // 'all' shows last 30 days
  const chartStart = new Date(todayStart);
  chartStart.setDate(chartStart.getDate() - (chartDays - 1));

  const recentViews = await prisma.pageView.findMany({
    where: { createdAt: { gte: chartStart } },
    select: { createdAt: true, sessionId: true },
  });

  const daySessionMap = new Map<string, Set<string>>();
  const dayLegacyMap = new Map<string, number>();

  for (let i = 0; i < chartDays; i++) {
    const d = new Date(chartStart);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    daySessionMap.set(key, new Set());
    dayLegacyMap.set(key, 0);
  }

  for (const view of recentViews) {
    const key = view.createdAt.toISOString().slice(0, 10);
    if (view.sessionId) {
      daySessionMap.get(key)?.add(view.sessionId);
    } else if (dayLegacyMap.has(key)) {
      dayLegacyMap.set(key, (dayLegacyMap.get(key) ?? 0) + 1);
    }
  }

  const dailyVisits = Array.from(daySessionMap.entries()).map(([date, sessions]) => ({
    date,
    count: sessions.size + (dayLegacyMap.get(date) ?? 0),
  }));

  // Referrer stats: aggregate and label sources
  const allReferrers = await prisma.pageView.findMany({
    select: { referrer: true },
    ...(rangeStart ? { where: { createdAt: { gte: rangeStart } } } : {}),
  });
  const referrerMap = new Map<string, number>();
  for (const { referrer } of allReferrers) {
    const source = parseReferrerSource(referrer);
    referrerMap.set(source, (referrerMap.get(source) ?? 0) + 1);
  }
  const referrerStats = Array.from(referrerMap.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Device stats: parse userAgent into device types
  const allAgents = await prisma.pageView.findMany({
    select: { userAgent: true },
    ...(rangeStart ? { where: { createdAt: { gte: rangeStart } } } : {}),
  });
  const deviceMap = new Map<string, number>();
  for (const { userAgent } of allAgents) {
    const type = getDeviceType(userAgent);
    deviceMap.set(type, (deviceMap.get(type) ?? 0) + 1);
  }
  const deviceStats = Array.from(deviceMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  return toStatsResponse({
    totalVisits,
    todayVisits,
    mostViewedSection,
    unreadMessages,
    sectionViews,
    dailyVisits,
    referrerStats,
    deviceStats,
  });
}
