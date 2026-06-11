import { PrismaClient, Gender, AppointmentStatus, PaymentType, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────
function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  // Weekday-weighted scheduling (Mon-Fri more likely)
  const day = d.getDay();
  if (day === 0) d.setDate(d.getDate() + 1); // Sunday → Monday
  if (day === 6) d.setDate(d.getDate() - 1); // Saturday → Friday
  // Clinic hours: 8am - 6pm
  const hour = randomBetween(8, 17);
  const minute = randomElement([0, 15, 30, 45]);
  d.setHours(hour, minute, 0, 0);
  return d;
}

// ─────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────
const DEPARTMENTS = [
  {
    name: 'Cardiology',
    description: 'Heart and cardiovascular system care',
    capacity: 60,
    baseRate: 15000,
    rateRange: [8000, 25000] as [number, number],
  },
  {
    name: 'Neurology',
    description: 'Brain, spinal cord and nervous system disorders',
    capacity: 45,
    baseRate: 18000,
    rateRange: [10000, 30000] as [number, number],
  },
  {
    name: 'Orthopedics',
    description: 'Bones, joints, muscles and connective tissues',
    capacity: 55,
    baseRate: 12000,
    rateRange: [5000, 20000] as [number, number],
  },
  {
    name: 'Pediatrics',
    description: 'Medical care for infants, children and adolescents',
    capacity: 70,
    baseRate: 1800,
    rateRange: [800, 3000] as [number, number],
  },
  {
    name: 'Emergency',
    description: '24/7 emergency medical services and trauma care',
    capacity: 80,
    baseRate: 8000,
    rateRange: [3000, 15000] as [number, number],
  },
  {
    name: 'Oncology',
    description: 'Cancer diagnosis, treatment and supportive care',
    capacity: 40,
    baseRate: 30000,
    rateRange: [15000, 50000] as [number, number],
  },
];

const DOCTORS_BY_DEPT: Record<string, Array<{ name: string; specialization: string }>> = {
  Cardiology: [
    { name: 'Dr. Arjun Menon', specialization: 'Interventional Cardiology' },
    { name: 'Dr. Priya Nair', specialization: 'Electrophysiology' },
    { name: 'Dr. Rajan Pillai', specialization: 'Heart Failure' },
    { name: 'Dr. Divya Krishnan', specialization: 'Preventive Cardiology' },
  ],
  Neurology: [
    { name: 'Dr. Suresh Varma', specialization: 'Stroke & Cerebrovascular' },
    { name: 'Dr. Anitha Thomas', specialization: 'Epilepsy & Seizure' },
    { name: 'Dr. Vishnu Kumar', specialization: 'Movement Disorders' },
  ],
  Orthopedics: [
    { name: 'Dr. Manoj Patel', specialization: 'Joint Replacement' },
    { name: 'Dr. Lekha Iyer', specialization: 'Sports Medicine' },
    { name: 'Dr. Binu George', specialization: 'Spine Surgery' },
    { name: 'Dr. Sanjay Nambiar', specialization: 'Trauma & Fractures' },
  ],
  Pediatrics: [
    { name: 'Dr. Rekha Gopalan', specialization: 'Neonatal Care' },
    { name: 'Dr. Ajith Kumar', specialization: 'Pediatric Pulmonology' },
    { name: 'Dr. Sreeja Balakrishnan', specialization: 'General Pediatrics' },
  ],
  Emergency: [
    { name: 'Dr. Nikhil Raj', specialization: 'Emergency Medicine' },
    { name: 'Dr. Meena Unni', specialization: 'Critical Care' },
    { name: 'Dr. Praveen Mohan', specialization: 'Trauma Surgery' },
  ],
  Oncology: [
    { name: 'Dr. Chandran Nair', specialization: 'Medical Oncology' },
    { name: 'Dr. Deepa Warrier', specialization: 'Radiation Oncology' },
    { name: 'Dr. Arun Pillai', specialization: 'Surgical Oncology' },
  ],
};

// 100 Kerala-style patient names
const PATIENT_FIRST_NAMES = [
  'Arun', 'Anjali', 'Priya', 'Rahul', 'Divya', 'Suresh', 'Meera', 'Vijay',
  'Lakshmi', 'Rajan', 'Sreeja', 'Unnikrishnan', 'Nisha', 'Biju', 'Sujatha',
  'Manoj', 'Rekha', 'Gopalan', 'Sindhu', 'Anoop', 'Kavya', 'Santhosh',
  'Resmi', 'Jithin', 'Parvathy', 'Krishnan', 'Asha', 'Deepu', 'Chinnu',
  'Babu', 'Shyam', 'Geetha', 'Rajesh', 'Anu', 'Vishnu', 'Manju', 'Sajeev',
  'Bindu', 'Athira', 'Pramod', 'Lekha', 'Shibu', 'Remya', 'Bineesh',
  'Swathy', 'Abhilash', 'Neethu', 'Sudheesh', 'Ambili', 'Sreekumar',
];

const PATIENT_LAST_NAMES = [
  'Menon', 'Nair', 'Pillai', 'Krishnan', 'Varma', 'Thomas', 'George',
  'Kumar', 'Iyer', 'Raj', 'Unni', 'Warrier', 'Chandran', 'Mohan',
  'Balakrishnan', 'Gopalan', 'Ramachandran', 'Subramaniam', 'Kartha',
  'Madhavan', 'Venugopal', 'Namboothiri', 'Panikkar', 'Kurup', 'Shenoy',
];

const ADDRESSES = [
  'MG Road, Kochi', 'Statue Road, Thiruvananthapuram', 'Round North, Thrissur',
  'Palayam, Kozhikode', 'Town Square, Kollam', 'NH Bypass, Kottayam',
  'Civil Station Road, Malappuram', 'Beach Road, Kannur',
];

async function main() {
  console.log('🌱 Starting Lumira seed...');

  // ─────────────────────────────────────────────────────
  // CHECK EXISTING DATA
  // ─────────────────────────────────────────────────────
  console.log('🔍 Checking existing data...');
  const existingAdmin = await prisma.user.findFirst({ where: { email: 'admin@lumira.com' } });
  if (existingAdmin) {
    console.log('✅ Database already seeded. Skipping.');
    return;
  }

  // ─────────────────────────────────────────────────────
  // CLEAN EXISTING DATA (in correct order)
  // ─────────────────────────────────────────────────────
  console.log('🗑️  Cleaning existing data...');
  await prisma.revenueRecord.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.department.deleteMany();

  // ─────────────────────────────────────────────────────
  // DEPARTMENTS
  // ─────────────────────────────────────────────────────
  console.log('🏥 Creating departments...');
  const deptMap = new Map<string, string>(); // name → id

  for (const dept of DEPARTMENTS) {
    const created = await prisma.department.create({
      data: {
        name: dept.name,
        description: dept.description,
        capacity: dept.capacity,
        baseRate: dept.baseRate,
      },
    });
    deptMap.set(dept.name, created.id);
  }

  // ─────────────────────────────────────────────────────
  // DOCTORS
  // ─────────────────────────────────────────────────────
  console.log('👨‍⚕️  Creating 20 doctors...');
  const doctorIds: string[] = [];
  const doctorDeptMap = new Map<string, string>(); // doctorId → deptId

  for (const [deptName, doctors] of Object.entries(DOCTORS_BY_DEPT)) {
    const deptId = deptMap.get(deptName)!;
    for (const doc of doctors) {
      const created = await prisma.doctor.create({
        data: {
          name: doc.name,
          specialization: doc.specialization,
          departmentId: deptId,
        },
      });
      doctorIds.push(created.id);
      doctorDeptMap.set(created.id, deptId);
    }
  }

  // ─────────────────────────────────────────────────────
  // ADMIN USER
  // ─────────────────────────────────────────────────────
  console.log('👤 Creating admin user...');
  const passwordHash = await bcrypt.hash('Admin@1234', 12);
  await prisma.user.create({
    data: {
      email: 'admin@lumira.com',
      passwordHash,
      name: 'System Administrator',
      role: 'ADMIN',
    },
  });

  // ─────────────────────────────────────────────────────
  // PATIENTS (100)
  // ─────────────────────────────────────────────────────
  console.log('🧑‍🤝‍🧑 Creating 100 patients...');
  const patientIds: string[] = [];
  const genders: Gender[] = ['MALE', 'FEMALE', 'OTHER'];

  for (let i = 1; i <= 100; i++) {
    const firstName = randomElement(PATIENT_FIRST_NAMES);
    const lastName = randomElement(PATIENT_LAST_NAMES);
    const gender = i % 3 === 0 ? 'OTHER' : i % 2 === 0 ? 'FEMALE' : 'MALE';

    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - randomBetween(18, 80));
    dob.setMonth(randomBetween(0, 11));
    dob.setDate(randomBetween(1, 28));

    const p = await prisma.patient.create({
      data: {
        patientCode: `PAT-${String(i).padStart(4, '0')}`,
        name: `${firstName} ${lastName}`,
        dateOfBirth: dob,
        gender: gender as Gender,
        phone: `+91 ${randomBetween(7000000000, 9999999999)}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        address: randomElement(ADDRESSES),
      },
    });
    patientIds.push(p.id);
  }

  // ─────────────────────────────────────────────────────
  // APPOINTMENTS (500) — spread across last 90 days
  // Statuses: ~50% COMPLETED, ~20% BOOKED, ~20% CANCELLED, ~10% NO_SHOW
  // ─────────────────────────────────────────────────────
  console.log('📅 Creating 500 appointments...');
  const statuses: AppointmentStatus[] = [
    'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED',
    'BOOKED', 'BOOKED',
    'CANCELLED', 'CANCELLED',
    'NO_SHOW',
  ];

  const paymentTypes: PaymentType[] = ['CASH', 'UPI', 'CARD', 'INSURANCE'];

  const createdAppointments: Array<{
    id: string;
    doctorId: string;
    patientId: string;
    departmentId: string;
    durationMins: number;
    status: AppointmentStatus;
    scheduledAt: Date;
  }> = [];

  for (let i = 0; i < 500; i++) {
    const patientId = randomElement(patientIds);
    const doctorId = randomElement(doctorIds);
    const departmentId = doctorDeptMap.get(doctorId)!;
    const scheduledAt = randomDate(90);
    const status = randomElement(statuses);
    const durationMins = randomElement([20, 30, 45, 60]);

    const appt = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        departmentId,
        scheduledAt,
        durationMins,
        status,
        notes: status === 'COMPLETED' ? 'Consultation completed successfully' : undefined,
      },
    });
    createdAppointments.push({ ...appt });
  }

  // ─────────────────────────────────────────────────────
  // VISITS + REVENUE (for COMPLETED appointments)
  // ─────────────────────────────────────────────────────
  console.log('🏨 Creating visits and revenue records for completed appointments...');
  const completedAppointments = createdAppointments.filter((a) => a.status === 'COMPLETED');

  for (const appt of completedAppointments) {
    // Find department name for rate range
    const dept = DEPARTMENTS.find(
      (d) => deptMap.get(d.name) === appt.departmentId
    );
    const [minRate, maxRate] = dept?.rateRange ?? [1000, 5000];
    const amount = randomBetween(minRate, maxRate);
    const paymentType = randomElement(paymentTypes);
    const isPaid = Math.random() > 0.25; // 75% paid
    const isOverdue = !isPaid && Math.random() > 0.5; // 50% of unpaid are overdue

    const paymentStatus: PaymentStatus = isPaid ? 'PAID' : isOverdue ? 'OVERDUE' : 'PENDING';
    const paidAt = isPaid ? appt.scheduledAt : null;

    const visit = await prisma.visit.create({
      data: {
        appointmentId: appt.id,
        patientId: appt.patientId,
        doctorId: appt.doctorId,
        departmentId: appt.departmentId,
        visitDate: appt.scheduledAt,
        waitTimeMin: randomBetween(3, 45),
        durationMin: appt.durationMins,
        outcome: randomElement([
          'Patient improving, follow-up in 2 weeks',
          'Medication prescribed, review in 1 month',
          'Tests ordered, results awaited',
          'Discharged in stable condition',
          'Referred to specialist',
          'Treatment plan updated',
        ]),
        notes: 'Routine consultation',
      },
    });

    await prisma.revenueRecord.create({
      data: {
        visitId: visit.id,
        patientId: appt.patientId,
        departmentId: appt.departmentId,
        amount,
        paymentType,
        paymentStatus,
        paidAt,
        createdAt: appt.scheduledAt,
      },
    });
  }

  console.log('\n✅ Seed completed successfully!');
  console.log(`   Departments:  ${DEPARTMENTS.length}`);
  console.log(`   Doctors:      ${doctorIds.length}`);
  console.log(`   Patients:     100`);
  console.log(`   Appointments: 500`);
  console.log(`   Visits:       ${completedAppointments.length}`);
  console.log(`   Revenue:      ${completedAppointments.length} records`);
  console.log('\n   Admin credentials:');
  console.log('   Email:    admin@lumira.com');
  console.log('   Password: Admin@1234');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
