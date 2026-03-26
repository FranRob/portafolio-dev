import prisma from '../../lib/prisma.js';

export interface StatsResult {
  totalViews: number;
  viewsToday: number;
  sections: Array<{ section: string; count: number }>;
  timeline: Array<{ date: string; count: number }>;
}

export async function trackView(
  section: string,
  userAgent: string | undefined,
  ip: string | undefined,
  referrer: string | undefined,
): Promise<void> {
  await prisma.pageView.create({
    data: {
      section,
      userAgent: userAgent ?? null,
      ip: ip ?? null,
      referrer: referrer ?? null,
    },
  });
}

export async function getStats(): Promise<StatsResult> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Total views
  const totalViews = await prisma.pageView.count();

  // Views today
  const viewsToday = await prisma.pageView.count({
    where: { createdAt: { gte: todayStart } },
  });

  // Views by section
  const sectionGroups = await prisma.pageView.groupBy({
    by: ['section'],
    _count: { section: true },
    orderBy: { _count: { section: 'desc' } },
  });

  const sections = sectionGroups.map((g) => ({
    section: g.section,
    count: g._count.section,
  }));

  // Timeline: last 7 days
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const recentViews = await prisma.pageView.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
  });

  // Build a map of date → count
  const dayMap = new Map<string, number>();

  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, 0);
  }

  for (const view of recentViews) {
    const key = view.createdAt.toISOString().slice(0, 10);
    if (dayMap.has(key)) {
      dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
    }
  }

  const timeline = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }));

  return { totalViews, viewsToday, sections, timeline };
}
