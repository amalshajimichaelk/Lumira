import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserRoundCog, Building2, Wallet, Calendar, FileBarChart, Settings, LogOut, Search, Bell, Moon, Sun, User as UserIcon, Menu } from 'lucide-react';
import { useAuthStore, useThemeStore } from '../../store';
import { cn } from '../../utils';

export function Sidebar({ isMobileOpen, setMobileOpen }: { isMobileOpen: boolean, setMobileOpen: (v: boolean) => void }) {
  const { theme } = useThemeStore();
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/doctors', label: 'Doctors', icon: UserRoundCog },
    { to: '/departments', label: 'Departments', icon: Building2 },
    { to: '/revenue', label: 'Revenue', icon: Wallet },
    { to: '/appointments', label: 'Appointments', icon: Calendar },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed inset-y-0 left-0 bg-[#0d1b2a] border-r border-white/10 flex flex-col z-50 w-64 transition-transform duration-300 md:translate-x-0 md:static shrink-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#00d4aa] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,212,170,0.4)]">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Lumira</span>
        </div>

        <ul className="flex flex-col w-full px-4 gap-2 flex-1 mt-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                  isActive 
                    ? "bg-white/10 text-white border border-white/10" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", item.label === 'Dashboard' && "text-[#00d4aa]", item.label === 'Patients' && "group-hover:text-[#7c3aed]", item.label === 'Departments' && "group-hover:text-[#38bdf8]", item.label === 'Revenue' && "group-hover:text-[#ff6b6b]")} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="px-4 mt-auto mb-4">
          <NavLink
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-slate-400 hover:text-white hover:bg-white/5",
              isActive ? "bg-white/10 text-white border border-white/10" : "border border-transparent"
            )}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}

export function Topbar({ setMobileOpen }: { setMobileOpen: (v: boolean) => void }) {
  const { toggleTheme, theme } = useThemeStore();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  
  const [showNotifs, setShowNotifs] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [notifs, setNotifs] = React.useState([
    { id: 1, title: 'New Appointment', message: 'Dr. Arjun has a new booking.', time: '5m ago', read: false },
    { id: 2, title: 'Revenue Update', message: 'Daily target reached.', time: '1h ago', read: false },
    { id: 3, title: 'System Alert', message: 'Server maintenance tonight.', time: '2h ago', read: true },
  ]);

  const searchMockData = [
    { type: 'Patient', name: 'Arun Menon', id: 'PAT-0001' },
    { type: 'Patient', name: 'Priya Nair', id: 'PAT-0002' },
    { type: 'Doctor', name: 'Dr. Priya Nair', desc: 'Cardiology' },
    { type: 'Doctor', name: 'Dr. Suresh Varma', desc: 'Neurology' },
    { type: 'Department', name: 'Emergency', desc: '80 capacity' },
    { type: 'Department', name: 'Oncology', desc: '40 capacity' },
  ];

  const filteredSearch = searchQuery 
    ? searchMockData.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.type.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const unreadCount = notifs.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const location = useLocation();
  const pathSegment = location.pathname.split('/')[1];
  const pageName = pathSegment ? pathSegment.charAt(0).toUpperCase() + pathSegment.slice(1) : 'Dashboard';

  return (
    <header className="w-full sticky top-0 z-30 border-b border-white/10 bg-[#0a0f1e]/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 py-3 shrink-0 h-16">
      <div className="flex items-center gap-4 md:hidden">
        <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
        <span className="text-xl font-bold tracking-tight text-white">Lumira</span>
      </div>

      <div className="hidden md:block">
        <nav className="text-xs text-slate-400 flex gap-2">
          <span>Application</span>
          <span>/</span>
          <span className="text-slate-200 font-medium">{pageName}</span>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:block relative">
          <Search className="absolute left-4 top-2 text-slate-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search Analytics..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm w-64 focus:outline-none focus:border-[#00d4aa]/50 transition-colors placeholder:text-slate-500 text-white"
          />
          {searchQuery && (
            <div className="absolute top-full mt-2 w-full bg-[#0a0f1e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              {filteredSearch.length > 0 ? (
                filteredSearch.map((r, i) => (
                  <div key={i} onClick={() => setSearchQuery('')} className="p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors flex justify-between items-center">
                     <div>
                       <p className="text-sm text-white font-medium">{r.name}</p>
                       <p className="text-xs text-slate-400">{r.desc || r.id}</p>
                     </div>
                     <span className="text-[10px] uppercase tracking-wider bg-white/10 px-2 py-1 rounded text-slate-300">{r.type}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-slate-400">No results found</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 transition-all relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff6b6b] rounded-full ring-2 ring-[#0a0f1e]"></span>}
            </button>
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0a0f1e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                   <h3 className="text-white font-bold">Notifications</h3>
                   {unreadCount > 0 && (
                     <button onClick={() => setNotifs(notifs.map(n => ({...n, read: true})))} className="text-xs text-[#00d4aa] hover:underline">Mark all read</button>
                   )}
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                   {notifs.map(n => (
                     <div key={n.id} onClick={() => setNotifs(notifs.map(notif => notif.id === n.id ? {...notif, read: true} : notif))} className={"p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors " + (!n.read ? "bg-white/5" : "")}>
                        <div className="flex justify-between items-start mb-1">
                          <p className={"text-sm font-medium " + (!n.read ? "text-white" : "text-slate-400")}>{n.title}</p>
                          {!n.read && <span className="w-2 h-2 bg-[#00d4aa] rounded-full mt-1"></span>}
                        </div>
                        <p className="text-xs text-slate-400">{n.message}</p>
                        <p className="text-[10px] text-slate-500 mt-2">{n.time}</p>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-white leading-none">Admin</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">System User</p>
             </div>
             <button aria-label="logout" onClick={handleLogout} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#38bdf8] p-[1px] hover:scale-105 transition-transform">
               <div className="w-full h-full rounded-full bg-[#0d1b2a] flex items-center justify-center font-bold text-sm text-white">
                 <LogOut className="w-4 h-4" />
               </div>
             </button>
          </div>
        </div>
      </div>
    </header>
  );
}
