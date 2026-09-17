import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GitPullRequest,
  Contact,
  Briefcase,
  Clock,
  Calendar,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Camera,
  User,
} from 'lucide-react';
import { useCrmStore } from '../../store/useCrmStore';

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, searchQuery, setSearchQuery, fetchData } = useCrmStore();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Leads', path: '/leads', icon: Users },
    { label: 'Pipeline', path: '/pipeline', icon: GitPullRequest },
    { label: 'Clients', path: '/clients', icon: Contact },
    { label: 'Projects', path: '/projects', icon: Briefcase },
    { label: 'Follow-ups', path: '/follow-ups', icon: Clock },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F9FB] font-sans antialiased text-slate-800">
      {/* Fixed Left Sidebar */}
      <aside className="w-[220px] flex-shrink-0 bg-white border-r border-slate-100 flex flex-col justify-between select-none">
        <div>
          {/* Logo & Brand */}
          <div className="p-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 shadow-sm flex-shrink-0">
              <Camera className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900 leading-tight">LensFlow</span>
              <span className="text-[11px] text-slate-400 font-normal leading-tight">Photography CRM</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#FDF3E7] text-amber-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-2.5 text-center">
            <div className="text-[11px] font-medium text-slate-500">LensFlow v1.0 Demo</div>
            <div className="text-[10px] text-slate-400">Frontend-Only CRM</div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar Header */}
        <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between flex-shrink-0 z-10">
          {/* Left search or breadcrumb area */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anything..."
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-amber-300 rounded-lg outline-none transition text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Right actions: notifications and admin profile */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Admin Avatar & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold overflow-hidden ring-1 ring-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Admin"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <span>AD</span>
                </div>
                <span className="text-sm font-medium text-slate-700">Admin</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 text-sm animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-800">Admin Photographer</p>
                    <p className="text-[11px] text-slate-400 truncate">admin@lensflow.studio</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-left transition"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 text-left transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Page Canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F8F9FB]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
