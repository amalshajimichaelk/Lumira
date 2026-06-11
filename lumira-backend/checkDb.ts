import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const p = await prisma.patient.count();
  const v = await prisma.visit.count();
  const a = await prisma.appointment.count();
  const r = await prisma.revenueRecord.count();
  console.log({ patients: p, visits: v, appointments: a, revenue: r });
}

check().catch(console.error).finally(() => prisma.$disconnect());
