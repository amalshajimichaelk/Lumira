import prisma from '../../config/database';

export async function getAllDoctors() {
  const today = new Date();
  const todayStart = new Date(today);
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setUTCHours(23, 59, 59, 999);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const doctors = await prisma.doctor.findMany({
    include: {
      department: { select: { id: true, name: true } },
      _count: {
        select: {
          appointments: {
            where: { scheduledAt: { gte: todayStart, lte: todayEnd } },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  // Get avg consultation time per doctor (last 30 days)
  const avgDurations = await prisma.visit.groupBy({
    by: ['doctorId'],
    where: {
      visitDate: { gte: thirtyDaysAgo },
    },
    _avg: { durationMin: true },
  });

  const durationMap = new Map(avgDurations.map((d) => [d.doctorId, d._avg.durationMin]));

  return doctors.map((doc) => ({
    id: doc.id,
    name: doc.name,
    specialization: doc.specialization,
    department: doc.department,
    appointmentsToday: doc._count.appointments,
    avgConsultationMinLast30Days: Math.round(durationMap.get(doc.id) ?? 0),
  }));
}

export async function getDoctorWorkload(date?: string) {
  const targetDate = date ? new Date(date) : new Date();
  const start = new Date(targetDate);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(targetDate);
  end.setUTCHours(23, 59, 59, 999);

  const MAX_DAILY_CAPACITY = 20; // appointments per day per doctor

  const doctors = await prisma.doctor.findMany({
    include: {
      department: { select: { name: true } },
    },
    orderBy: { name: 'asc' },
  });

  const appointmentCounts = await prisma.appointment.groupBy({
    by: ['doctorId'],
    where: {
      scheduledAt: { gte: start, lte: end },
      status: { notIn: ['CANCELLED'] },
    },
    _count: { _all: true },
  });

  const avgDurations = await prisma.visit.groupBy({
    by: ['doctorId'],
    where: {
      visitDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    _avg: { durationMin: true },
  });

  const countMap = new Map(appointmentCounts.map((a) => [a.doctorId, a._count._all]));
  const durationMap = new Map(avgDurations.map((d) => [d.doctorId, d._avg.durationMin]));

  const workload = doctors.map((doc) => {
    const appointmentCount = countMap.get(doc.id) ?? 0;
    const workloadPercent = parseFloat(
      ((appointmentCount / MAX_DAILY_CAPACITY) * 100).toFixed(1)
    );
    return {
      doctorId: doc.id,
      name: doc.name,
      department: doc.department.name,
      appointmentCount,
      maxCapacity: MAX_DAILY_CAPACITY,
      workloadPercent,
      avgDurationMin: Math.round(durationMap.get(doc.id) ?? 30),
    };
  });

  return workload.sort((a, b) => b.workloadPercent - a.workloadPercent);
}
