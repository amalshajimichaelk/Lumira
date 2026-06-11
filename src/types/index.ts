export interface User {
  id: number;
  name: string;
  role: string;
  email: string;
}

export interface KpiSummary {
  patientsToday: { value: number; trend: string; isPositive: boolean };
  avgWaitTime: { value: number; trend: string; isPositive: boolean };
  dischargeRate: { value: number; trend: string; isPositive: boolean };
  revenueMtd: { value: string; trend: string; isPositive: boolean };
  topDept: { name: string; value: string };
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  apptsWeek: number;
  avgTime: number;
  capacity: number;
  risk: 'optimal' | 'moderate' | 'high' | 'low';
}

export interface PatientVisit {
  id: string;
  name: string;
  age: number;
  dept: string;
  doctor: string;
  date: string;
  wait: string;
  status: 'Waiting' | 'In Treatment' | 'Discharged' | 'In Prep' | 'Admitted';
}
