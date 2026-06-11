import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes (Mocks for Dashboard) ---

  // Dashboard KPI Summary
  app.get('/api/dashboard/summary', (req, res) => {
    res.json({
      patientsToday: { value: 1248, trend: '+12%', isPositive: true },
      avgWaitTime: { value: 14, trend: '-2m', isPositive: true },
      dischargeRate: { value: 94.2, trend: 'Target: 95%', isPositive: false },
      revenueMtd: { value: '$4.2M', trend: '+8.5%', isPositive: true },
      topDept: { name: 'Cardiology', value: '+12% vs yesterday' }
    });
  });

  // Doctor Workload
  app.get('/api/doctors/workload', (req, res) => {
    res.json([
      { id: '1', name: 'Dr. E. Chen', specialty: 'Cardiology', apptsWeek: 42, avgTime: 18, capacity: 94, risk: 'high' },
      { id: '2', name: 'Dr. M. Rossi', specialty: 'Neurology', apptsWeek: 28, avgTime: 35, capacity: 72, risk: 'optimal' },
      { id: '3', name: 'Dr. J. Smith', specialty: 'Pediatrics', apptsWeek: 35, avgTime: 20, capacity: 65, risk: 'optimal' },
      { id: '4', name: 'Dr. A. Lee', specialty: 'Orthopedics', apptsWeek: 12, avgTime: 45, capacity: 30, risk: 'low' },
    ]);
  });

  // Patients / Visits
  app.get('/api/patients/visits', (req, res) => {
    res.json({
      data: [
        { id: 'PT-8842', name: 'Sarah Jenkins', age: 42, dept: 'Emergency', doctor: 'Dr. R. Chen', date: 'Oct 24, 09:15', wait: '45m', status: 'Waiting' },
        { id: 'PT-9105', name: 'Marcus Thorne', age: 28, dept: 'Cardiology', doctor: 'Dr. E. Vance', date: 'Oct 24, 08:30', wait: '12m', status: 'In Treatment' },
        { id: 'PT-7721', name: 'Elena Rodriguez', age: 65, dept: 'Neurology', doctor: 'Dr. S. Patel', date: 'Oct 24, 07:45', wait: '-', status: 'Discharged' },
        { id: 'PT-8933', name: 'James Holden', age: 34, dept: 'Orthopedics', doctor: 'Dr. K. Miller', date: 'Oct 24, 10:05', wait: '30m', status: 'Waiting' },
      ],
      total: 4,
      page: 1,
      limit: 20
    });
  });

  // Revenue By Dept
  app.get('/api/revenue/departments', (req, res) => {
    res.json([
      { name: 'Cardiology', value: 1200000 },
      { name: 'Neurology', value: 850000 },
      { name: 'Orthopedics', value: 620000 },
      { name: 'Pediatrics', value: 410000 },
    ]);
  });

  // Dummy Auth
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (email && password) {
      res.json({ token: 'mock-jwt-token-123', user: { id: 1, name: 'Dr. E. Vance', role: 'Chief of Surgery', email } });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });

  app.get('/api/auth/me', (req, res) => {
    res.json({ id: 1, name: 'Dr. E. Vance', role: 'Chief of Surgery', email: 'doctor@medimetrics.net' });
  });

  // --- Vite Middleware for Development ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
