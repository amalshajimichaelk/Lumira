import prisma from '../../config/database';
import { paginate, totalPages } from '../../utils/pagination.utils';
import { Prisma, AppointmentStatus, PaymentType, PaymentStatus } from '@prisma/client';
import type {
  AppointmentQuery,
  CreateAppointmentInput,
  UpdateStatusInput,
} from './appointments.schema';

const appointmentInclude = {
  patient: { select: { id: true, patientCode: true, name: true } },
  doctor: { select: { id: true, name: true, specialization: true } },
  department: { select: { id: true, name: true } },
} satisfies Prisma.AppointmentInclude;

function buildAppointmentWhere(query: Partial<AppointmentQuery>): Prisma.AppointmentWhereInput {
  const where: Prisma.AppointmentWhereInput = {};

  if (query.dateFrom && query.dateTo) {
    where.scheduledAt = { gte: new Date(query.dateFrom), lte: new Date(query.dateTo) };
  } else if (query.dateFrom) {
    where.scheduledAt = { gte: new Date(query.dateFrom) };
  } else if (query.dateTo) {
    where.scheduledAt = { lte: new Date(query.dateTo) };
  }

  if (query.status) where.status = query.status;
  if (query.doctorId) where.doctorId = query.doctorId;
  if (query.departmentId) where.departmentId = query.departmentId;

  return where;
}

export async function getAppointments(query: AppointmentQuery) {
  const { skip, take, page, limit } = paginate({ page: query.page, limit: query.limit });
  const where = buildAppointmentWhere(query);

  const [data, total] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      include: appointmentInclude,
      orderBy: { scheduledAt: 'desc' },
      skip,
      take,
    }),
    prisma.appointment.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: totalPages(total, limit) };
}

export async function getAppointmentCalendar(month: string) {
  // month = "YYYY-MM"
  const [year, mon] = month.split('-').map(Number);
  const start = new Date(Date.UTC(year, mon - 1, 1));
  const end = new Date(Date.UTC(year, mon, 0, 23, 59, 59, 999)); // last day of month

  const results = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
    SELECT
      TO_CHAR("scheduledAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
      COUNT(*)::bigint AS count
    FROM "Appointment"
    WHERE "scheduledAt" >= ${start}
      AND "scheduledAt" <= ${end}
      AND status != 'CANCELLED'
    GROUP BY date
    ORDER BY date ASC
  `;

  const calendar: Record<string, number> = {};
  for (const row of results) {
    calendar[row.date] = Number(row.count);
  }
  return calendar;
}

export async function createAppointment(input: CreateAppointmentInput) {
  const scheduledAt = new Date(input.scheduledAt);
  const scheduledEnd = new Date(scheduledAt.getTime() + input.durationMins * 60 * 1000);

  // Clash detection: check if doctor has an overlapping appointment
  const oneHourBefore = new Date(scheduledAt.getTime() - 60 * 60 * 1000);
  const clash = await prisma.appointment.findFirst({
    where: {
      doctorId: input.doctorId,
      status: { notIn: ['CANCELLED'] },
      scheduledAt: { gte: oneHourBefore, lt: scheduledEnd },
    },
  });

  // More precise overlap check
  if (clash) {
    const clashEnd = new Date(
      clash.scheduledAt.getTime() + clash.durationMins * 60 * 1000
    );
    if (scheduledAt < clashEnd && scheduledEnd > clash.scheduledAt) {
      throw new Error('DOCTOR_SCHEDULE_CLASH');
    }
  }

  return prisma.appointment.create({
    data: {
      patientId: input.patientId,
      doctorId: input.doctorId,
      departmentId: input.departmentId,
      scheduledAt,
      durationMins: input.durationMins,
      notes: input.notes,
      status: 'BOOKED',
    },
    include: appointmentInclude,
  });
}

// Department base rates (₹) for revenue generation
const DEPT_REVENUE_RANGES: Record<string, [number, number]> = {
  Cardiology: [8000, 25000],
  Neurology: [10000, 30000],
  Orthopedics: [5000, 20000],
  Pediatrics: [800, 3000],
  Emergency: [3000, 15000],
  Oncology: [15000, 50000],
};

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function updateAppointmentStatus(id: string, input: UpdateStatusInput) {
  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id },
    include: { department: true },
  });

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: input.status },
    include: appointmentInclude,
  });

  // Auto-create Visit + RevenueRecord when marking COMPLETED
  if (input.status === AppointmentStatus.COMPLETED) {
    const existingVisit = await prisma.visit.findUnique({ where: { appointmentId: id } });
    if (!existingVisit) {
      const deptName = appointment.department.name;
      const [minRate, maxRate] = DEPT_REVENUE_RANGES[deptName] ?? [1000, 5000];
      const amount = randomInRange(minRate, maxRate);

      const paymentTypes: PaymentType[] = ['CASH', 'UPI', 'CARD', 'INSURANCE'];
      const paymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];

      const waitTimeMin = Math.floor(Math.random() * 30) + 5;
      const durationMin = appointment.durationMins;

      const visit = await prisma.visit.create({
        data: {
          appointmentId: id,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          departmentId: appointment.departmentId,
          visitDate: new Date(),
          waitTimeMin,
          durationMin,
          outcome: 'Consultation completed',
        },
      });

      await prisma.revenueRecord.create({
        data: {
          visitId: visit.id,
          patientId: appointment.patientId,
          departmentId: appointment.departmentId,
          amount,
          paymentType,
          paymentStatus: PaymentStatus.PENDING,
        },
      });
    }
  }

  return updated;
}
