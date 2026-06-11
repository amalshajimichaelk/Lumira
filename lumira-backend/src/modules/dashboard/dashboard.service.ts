import prisma from '../../config/database';
import cache from '../../config/cache';
import { Decimal } from '@prisma/client/runtime/library';

function getUtcDayRange(date = new Date()) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

export async function getDashboardSummary() {
  const today = new Date();
  const cacheKey = `dashboard:summary:${today.toISOString().split('T')[0]}`;

  const cached = cache.get<object>(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const { start, end } = getUtcDayRange(today);

  // Run all aggregations in parallel
  const [
    visitCount,
    waitTimeAgg,
    revenueToday,
    appointmentsToday,
    noShowCount,
    departmentCounts,
    sparklineData,
  ] = await Promise.all([
    // Total visits today
    prisma.visit.count({
      where: { visitDate: { gte: start, lte: end } },
    }),

    // Average wait time today
    prisma.visit.aggregate({
      where: { visitDate: { gte: start, lte: end } },
      _avg: { waitTimeMin: true },
    }),

    // Revenue today (PAID only)
    prisma.revenueRecord.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        paymentStatus: 'PAID',
      },
      _sum: { amount: true },
    }),

    // Total appointments today
    prisma.appointment.count({
      where: { scheduledAt: { gte: start, lte: end } },
    }),

    // No-shows today
    prisma.appointment.count({
      where: {
        scheduledAt: { gte: start, lte: end },
        status: 'NO_SHOW',
      },
    }),

    // Visits by department today
    prisma.visit.groupBy({
      by: ['departmentId'],
      where: { visitDate: { gte: start, lte: end } },
      _count: { _all: true },
      orderBy: { _count: { departmentId: 'desc' } },
      take: 1,
    }),

    // Last 7 days sparkline data
    (async () => {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
      });

      const results = await Promise.all(
        days.map(async (day) => {
          const { start: s, end: e } = getUtcDayRange(day);
          const [patients, revenue] = await Promise.all([
            prisma.visit.count({ where: { visitDate: { gte: s, lte: e } } }),
            prisma.revenueRecord.aggregate({
              where: { createdAt: { gte: s, lte: e }, paymentStatus: 'PAID' },
              _sum: { amount: true },
            }),
          ]);
          return {
            patients,
            revenue: Number(revenue._sum.amount ?? 0),
          };
        })
      );
      return results;
    })(),
  ]);

  // Resolve top department name
  let topDepartment = { name: 'N/A', count: 0 };
  if (departmentCounts.length > 0) {
    const dept = await prisma.department.findUnique({
      where: { id: departmentCounts[0].departmentId },
      select: { name: true },
    });
    topDepartment = {
      name: dept?.name ?? 'Unknown',
      count: departmentCounts[0]._count._all,
    };
  }

  const noShowRate =
    appointmentsToday > 0
      ? parseFloat((noShowCount / appointmentsToday).toFixed(4))
      : 0;

  const summary = {
    patientsToday: visitCount,
    topDepartment,
    avgWaitTimeMin: Math.round(waitTimeAgg._avg.waitTimeMin ?? 0),
    revenueToday: Number(revenueToday._sum.amount ?? new Decimal(0)),
    appointmentsToday,
    noShowRate,
    sparklines: {
      patients: sparklineData.map((d) => d.patients),
      revenue: sparklineData.map((d) => d.revenue),
    },
  };

  cache.set(cacheKey, summary, 60);
  return summary;
}
