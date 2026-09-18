import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  LogOut,
  Camera,
  Menu,
  X,
  Download,
} from 'lucide-react';
import { useCrmStore } from '../../store/useCrmStore';

// ── CSV Export helper ──────────────────────────────────────────────────────────
function exportLeadsToCSV(leads) {
  const headers = [
    'Name', 'Phone', 'Email', 'Source', 'Event Type', 'Event Date',
    'Location', 'Guests', 'Budget', 'Quotation', 'Advance', 'Status', 'Next Follow-up',
  ];
  const rows = leads.map((l) => [
    l.name, l.phone, l.email, l.source, l.event,
    l.eventDate, l.location, l.guests,
    l.budget, l.quotation ?? '', l.advance, l.status, l.nextFollowUp ?? '',
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lensflow-leads-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, leads, searchQuery, setSearchQuery, fetchData } = useCrmStore();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setProfileDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  // ── Notification logic ──────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const notifications = useMemo(() => {
    return leads
      .filter((l) => l.nextFollowUp && l.status !== 'Booked' && l.status !== 'Lost')
      .filter((l) => l.nextFollowUp <= today)
      .map((l) => ({
        id: l.id,
        name: l.name,
        event: l.event,
        followUp: l.nextFollowUp,
        isOverdue: l.nextFollowUp < today,
      }))
      .sort((a, b) => a.followUp.localeCompare(b.followUp));
  }, [leads, today]);

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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 h-14 flex items-center gap-2.5 border-b border-slate-100 flex-shrink-0">
        <Camera className="w-4 h-4 text-amber-500 flex-shrink-0" strokeWidth={2} />
        <span className="font-semibold text-sm tracking-tight text-slate-900">LensFlow</span>
        <span className="text-[11px] text-slate-400 font-normal">CRM</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-100 ${
                isActive
                  ? 'bg-slate-100 text-slate-900 font-medium'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-normal'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-500' : 'text-slate-400'}`}
                strokeWidth={isActive ? 2 : 1.8}
              />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="px-3 py-3 border-t border-slate-100 flex-shrink-0">
        <button
          onClick={() => exportLeadsToCSV(leads)}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-md transition"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F8FA] font-sans antialiased text-slate-800">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Left Sidebar ── */}
      <aside
        className={`
          fixed md:relative z-50 md:z-auto
          w-[210px] flex-shrink-0 bg-white border-r border-slate-100
          h-full transition-transform duration-300 ease-in-out select-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <button
          className="md:hidden absolute top-3.5 right-3 p-1 text-slate-400 hover:text-slate-700 rounded"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-slate-100 px-4 md:px-5 flex items-center justify-between flex-shrink-0 z-10">
          {/* Left: hamburger + search */}
          <div className="flex items-center gap-3 flex-1">
            <button
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-md transition"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-transparent focus:bg-white focus:border-slate-200 rounded-md outline-none transition text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Right: notifications + avatar */}
          <div className="flex items-center gap-1">

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-md transition"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-700">Follow-up Alerts</p>
                    {notifications.length > 0 && (
                      <span className="text-[10px] bg-rose-50 text-rose-600 font-medium px-1.5 py-0.5 rounded">
                        {notifications.length} due
                      </span>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-xs text-slate-400">All caught up ✓</p>
                    </div>
                  ) : (
                    <ul className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                      {notifications.map((n) => (
                        <li key={n.id}>
                          <button
                            onClick={() => { setNotifOpen(false); navigate(`/leads/${n.id}`); }}
                            className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-xs font-medium text-slate-800">{n.name}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{n.event}</p>
                              </div>
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${
                                n.isOverdue ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {n.isOverdue ? 'Overdue' : 'Today'}
                              </span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="px-3.5 py-2 border-t border-slate-100">
                    <button
                      onClick={() => { setNotifOpen(false); navigate('/follow-ups'); }}
                      className="text-[11px] text-amber-600 font-medium hover:underline"
                    >
                      View all follow-ups →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar + Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-semibold overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Admin"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <span>AD</span>
                </div>
                <span className="hidden sm:block text-xs font-medium text-slate-600">Admin</span>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-medium text-slate-800">Admin Photographer</p>
                    <p className="text-[10px] text-slate-400 truncate">admin@lensflow.studio</p>
                  </div>
                  <button
                    onClick={() => { setProfileDropdownOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 text-left transition"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-50 text-left transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Canvas */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-8 bg-[#F7F8FA]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
