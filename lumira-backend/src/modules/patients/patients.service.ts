import prisma from '../../config/database';
import { paginate, totalPages } from '../../utils/pagination.utils';
import type { VisitQuery } from './patients.schema';
import { Prisma } from '@prisma/client';

const visitInclude = {
  patient: { select: { id: true, patientCode: true, name: true, gender: true } },
  doctor: { select: { id: true, name: true, specialization: true } },
  department: { select: { id: true, name: true } },
  revenue: {
    select: { amount: true, paymentType: true, paymentStatus: true },
  },
} satisfies Prisma.VisitInclude;

function buildVisitWhere(query: Partial<VisitQuery>): Prisma.VisitWhereInput {
  const where: Prisma.VisitWhereInput = {};

  if (query.dateFrom && query.dateTo) {
    where.visitDate = { gte: new Date(query.dateFrom), lte: new Date(query.dateTo) };
  } else if (query.dateFrom) {
    where.visitDate = { gte: new Date(query.dateFrom) };
  } else if (query.dateTo) {
    where.visitDate = { lte: new Date(query.dateTo) };
  }

  if (query.department) {
    where.department = { name: { contains: query.department, mode: 'insensitive' } };
  }

  if (query.status) {
    where.appointment = { status: query.status };
  }

  return where;
}

export async function getVisits(query: VisitQuery) {
  const { skip, take, page, limit } = paginate({ page: query.page, limit: query.limit });
  const where = buildVisitWhere(query);

  const [data, total] = await prisma.$transaction([
    prisma.visit.findMany({
      where,
      include: visitInclude,
      orderBy: { visitDate: 'desc' },
      skip,
      take,
    }),
    prisma.visit.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: totalPages(total, limit) };
}

export async function getVisitsForExport(query: Omit<VisitQuery, 'page' | 'limit'>) {
  const where = buildVisitWhere(query);

  const visits = await prisma.visit.findMany({
    where,
    include: visitInclude,
    orderBy: { visitDate: 'desc' },
  });

  // Flatten for CSV
  return visits.map((v) => ({
    visitId: v.id,
    visitDate: v.visitDate.toISOString(),
    patientCode: v.patient.patientCode,
    patientName: v.patient.name,
    gender: v.patient.gender,
    doctor: v.doctor.name,
    specialization: v.doctor.specialization,
    department: v.department.name,
    waitTimeMin: v.waitTimeMin,
    durationMin: v.durationMin,
    outcome: v.outcome ?? '',
    amount: v.revenue?.amount?.toString() ?? '0',
    paymentType: v.revenue?.paymentType ?? '',
    paymentStatus: v.revenue?.paymentStatus ?? '',
  }));
}

export async function getPatientById(id: string) {
  const patient = await prisma.patient.findUniqueOrThrow({
    where: { id },
    include: {
      visits: {
        include: {
          doctor: { select: { name: true, specialization: true } },
          department: { select: { name: true } },
          revenue: { select: { amount: true, paymentStatus: true } },
        },
        orderBy: { visitDate: 'desc' },
        take: 10,
      },
      appointments: {
        include: {
          doctor: { select: { name: true } },
          department: { select: { name: true } },
        },
        orderBy: { scheduledAt: 'desc' },
      },
      revenues: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  return patient;
}
