# 🏥 Lumira

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js & Express">
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/TailwindCSS-Styling-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
</p>

<p align="center">
  <i>A modern, elegant, and comprehensive healthcare analytics dashboard designed to help hospitals and clinics manage operations effortlessly.</i>
</p>

---

Welcome to **Lumira**, a full-stack healthcare analytics application designed to handle hospital administration, patient tracking, and revenue management. Built with a modern React frontend and a robust Node.js/Express backend, Lumira leverages PostgreSQL for scalable data storage and Prisma ORM for type-safe database interactions.

🌐 Live Website : https://lumira-frontend.onrender.com

---

## ✨ Key Features

* **Secure Authentication:** JWT-based login and authorization system to protect sensitive healthcare data.
* **Comprehensive Analytics:**
    * **Interactive Charts:** Powered by Recharts, visualizing patient throughput, department performance, and revenue trajectories dynamically.
    * **Timeframe Toggles:** Instantly switch between Weekly, Monthly, and Yearly aggregated metrics.
* **Hospital Management Modules:**
    * **Patient Records:** Securely manage patient demographics and visit history.
    * **Doctor Rosters:** Track medical staff, workloads, and specializations.
    * **Department Tracking:** Monitor individual department capacity and performance.
* **Dynamic Aesthetics:**
    * Elegant, responsive UI built with Tailwind CSS and Framer Motion.
    * Seamlessly toggle between fully optimized **Light Mode** and **Dark Mode** palettes.
* **Intelligent Search & Notifications:**
    * Live global search functionality filtering patients, doctors, and departments.
    * Real-time tracking of unread system alerts and notifications.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend Framework** | React (Vite) |
| **Backend Environment** | Node.js, Express & TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **State Management** | Zustand & React Query |
| **Styling & UI** | TailwindCSS, Framer Motion & Lucide Icons |
| **Data Visualization** | Recharts |

---

## 🏛️ Architecture

This project is structured as a **Decoupled Full-Stack Application**, meaning the frontend and backend live in the same repository but operate as independent services.

* **Frontend (`src/`):** A fast Single Page Application (SPA) built with React and Vite. It communicates with the backend via RESTful APIs and caches data efficiently using TanStack Query.
* **Backend (`lumira-backend/`):** A robust TypeScript Express server that exposes the API routes, handles JWT authentication, and contains the core business logic.
* **Database Layer:** Prisma ORM schemas define the strict relational structure of Users, Patients, Doctors, Departments, Appointments, and Revenue, ensuring absolute data integrity before persisting to PostgreSQL.

---

## 🗄️ Database Setup

Lumira uses **PostgreSQL**. You do not need to manually write SQL scripts to create tables; Prisma will automatically sync and generate the required tables when you push the schema.

1. Ensure you have a running PostgreSQL instance locally or in the cloud (e.g., Supabase, Render, Neon).
2. Create a `.env` file in the `lumira-backend/` directory and add your database connection string:
   ```env
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/medimetrics?schema=public"
   PORT=5000
   JWT_ACCESS_SECRET="your_secret_key"
   ```

---

## 🚀 How to Run

### Prerequisites

1. **Node.js:** Ensure you have Node.js installed.
2. **PostgreSQL:** A running PostgreSQL instance.

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-link>
   cd "Healthcare Analytics App"
   ```

2. **Setup the Backend:**
   ```bash
   cd lumira-backend
   npm install
   ```
   * Ensure your `.env` file is properly configured with your `DATABASE_URL`.
   * Push the database schema and seed the initial dummy data (including the `admin@lumira.com` account):
     ```bash
     npx prisma db push --force-reset
     npx ts-node prisma/seed.ts
     ```
   * Start the backend development server:
     ```bash
     npm run dev
     ```

3. **Setup the Frontend:**
   * Open a new terminal instance and navigate back to the root directory.
   ```bash
   npm install
   npm run dev
   ```
   * The app will now be running at `http://localhost:3000`. 
   * You can log in using the demo credentials: `admin@lumira.com` / `Admin@1234`.

---

## 📂 Project Structure

```
Healthcare Analytics App/
├── package.json          # Frontend dependencies & scripts
├── vite.config.ts        # Vite configuration
├── index.html            # Main HTML entry point
├── src/                  # Frontend Source Code
│   ├── components/       # Reusable React UI components and charts
│   ├── pages/            # Main application views (Dashboard, Revenue, etc.)
│   ├── store/            # Zustand state management stores
│   └── services/         # API client configurations (Axios)
│
└── lumira-backend/       # Backend Source Code
    ├── package.json      # Backend dependencies
    ├── prisma/           # Prisma schema and database seed scripts
    ├── src/              
    │   ├── modules/      # Domain-driven feature modules (Controllers/Services)
    │   ├── utils/        # JWT utilities, loggers, and error handlers
    │   └── server.ts     # Main backend Express entry point
    └── render.yaml       # Production deployment configuration
```
