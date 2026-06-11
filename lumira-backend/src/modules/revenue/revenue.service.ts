import prisma from '../../config/database';
import { Prisma } from '@prisma/client';

type GroupBy = 'day' | 'month' | 'year';

interface RevenueQuery {
  group?: GroupBy;
  dateFrom?: string;
  dateTo?: string;
}

export async function getRevenue(query: RevenueQuery) {
  const group = query.group ?? 'month';
  const dateTo = query.dateTo ? new Date(query.dateTo) : new Date();
  const dateFrom = query.dateFrom
    ? new Date(query.dateFrom)
    : (() => {
        const d = new Date(dateTo);
        if (group === 'day') d.setDate(d.getDate() - 30);
        else if (group === 'month') d.setFullYear(d.getFullYear() - 1);
        else d.setFullYear(d.getFullYear() - 5);
        return d;
      })();

  const truncFormat =
    group === 'day' ? 'day' : group === 'month' ? 'month' : 'year';

  // Use $queryRaw for DATE_TRUNC grouping (PostgreSQL-specific)
  const grouped = await prisma.$queryRaw<
    Array<{ period: Date; total: string; count: bigint }>
  >`
    SELECT
      DATE_TRUNC(${truncFormat}, "createdAt") AS period,
      SUM(amount)::text AS total,
      COUNT(*)::bigint AS count
    FROM "RevenueRecord"
    WHERE "createdAt" >= ${dateFrom}
      AND "createdAt" <= ${dateTo}
    GROUP BY period
    ORDER BY period ASC
  `;

  const [totals, outstanding] = await Promise.all([
    prisma.revenueRecord.aggregate({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      _sum: { amount: true },
    }),
    prisma.revenueRecord.aggregate({
      where: {
        createdAt: { gte: dateFrom, lte: dateTo },
        paymentStatus: { in: ['PENDING', 'OVERDUE'] },
      },
      _sum: { amount: true },
    }),
  ]);

  const totalRevenue = Number(totals._sum.amount ?? 0);
  const totalVisits = grouped.reduce((sum, r) => sum + Number(r.count), 0);

  return {
    data: grouped.map((r) => ({
      period: r.period.toISOString(),
      total: parseFloat(r.total),
      count: Number(r.count),
    })),
    totalRevenue,
    avgPerPatient: totalVisits > 0 ? parseFloat((totalRevenue / totalVisits).toFixed(2)) : 0,
    outstandingAmount: Number(outstanding._sum.amount ?? 0),
  };
}

export async function getRevenueBreakdown() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [byDepartment, byPaymentType] = await Promise.all([
    prisma.revenueRecord.groupBy({
      by: ['departmentId'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    }),
    prisma.revenueRecord.groupBy({
      by: ['paymentType'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
  ]);

  // Resolve department names
  const deptIds = byDepartment.map((d) => d.departmentId);
  const departments = await prisma.department.findMany({
    where: { id: { in: deptIds } },
    select: { id: true, name: true },
  });
  const deptNameMap = new Map(departments.map((d) => [d.id, d.name]));

  return {
    byDepartment: byDepartment.map((d) => ({
      department: deptNameMap.get(d.departmentId) ?? d.departmentId,
      total: Number(d._sum.amount ?? 0),
    })),
    byPaymentType: byPaymentType.map((p) => ({
      type: p.paymentType,
      total: Number(p._sum.amount ?? 0),
      count: p._count._all,
    })),
  };
}
