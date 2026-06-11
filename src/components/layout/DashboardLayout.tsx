// Load the Inter and JetBrains Mono fonts safely in React land by adding to index.html 
// Actually, it's better to add Google Fonts link to index.html. I will edit index.html next.
import React, { useState } from 'react';
import { Sidebar, Topbar } from './AppLayout';
import { Outlet } from 'react-router-dom';

export function DashboardLayout() {
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background text-on-surface overflow-hidden">
      <Sidebar isMobileOpen={isMobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Topbar setMobileOpen={setMobileOpen} />
        {/* Ambient glow for the entire app area */}
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0"></div>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
