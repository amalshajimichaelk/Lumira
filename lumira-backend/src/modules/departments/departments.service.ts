import prisma from '../../config/database';
import { Decimal } from '@prisma/client/runtime/library';

function getDefaultDateRange() {
  const dateTo = new Date();
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - 30);
  return { dateFrom, dateTo };
}

export async function getDepartmentPerformance(dateFrom?: string, dateTo?: string) {
  const range = {
    dateFrom: dateFrom ? new Date(dateFrom) : getDefaultDateRange().dateFrom,
    dateTo: dateTo ? new Date(dateTo) : getDefaultDateRange().dateTo,
  };

  const departments = await prisma.department.findMany({
    include: {
      _count: { select: { doctors: true } },
    },
    orderBy: { name: 'asc' },
  });

  // Revenue and visit stats per department in date range
  const [visitStats, revenueStats] = await Promise.all([
    prisma.visit.groupBy({
      by: ['departmentId'],
      where: { visitDate: { gte: range.dateFrom, lte: range.dateTo } },
      _count: { _all: true },
      _avg: { waitTimeMin: true },
    }),
    prisma.revenueRecord.groupBy({
      by: ['departmentId'],
      where: { createdAt: { gte: range.dateFrom, lte: range.dateTo } },
      _sum: { amount: true },
    }),
  ]);

  const visitMap = new Map(visitStats.map((v) => [v.departmentId, v]));
  const revenueMap = new Map(revenueStats.map((r) => [r.departmentId, r._sum.amount]));

  // Total revenue across all departments (for share calculation)
  const totalRevenue = revenueStats.reduce(
    (sum, r) => sum + Number(r._sum.amount ?? 0),
    0
  );

  return departments.map((dept) => {
    const vs = visitMap.get(dept.id);
    const deptRevenue = Number(revenueMap.get(dept.id) ?? 0);
    const revenueShare =
      totalRevenue > 0
        ? parseFloat(((deptRevenue / totalRevenue) * 100).toFixed(2))
        : 0;

    return {
      id: dept.id,
      name: dept.name,
      description: dept.description,
      capacity: dept.capacity,
      patientCount: vs?._count._all ?? 0,
      doctorCount: dept._count.doctors,
      avgWaitTimeMin: Math.round(vs?._avg.waitTimeMin ?? 0),
      totalRevenue: deptRevenue,
      revenueShare,
    };
  });
}
