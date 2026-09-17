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
  ChevronDown,
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

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ── Notification logic ─────────────────────────────────────────────────────
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
    <>
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
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
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
                    isActive ? 'text-amber-600' : 'text-slate-400'
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-100">
        {/* CSV Export Button */}
        <button
          onClick={() => exportLeadsToCSV(leads)}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg border border-slate-100 transition mb-2"
        >
          <Download className="w-3.5 h-3.5" />
          Export Leads CSV
        </button>
        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
          <div className="text-[11px] font-medium text-slate-500">LensFlow v1.0 Demo</div>
          <div className="text-[10px] text-slate-400">Supabase-Powered CRM</div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F9FB] font-sans antialiased text-slate-800">

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Left Sidebar ── */}
      <aside
        className={`
          fixed md:relative z-50 md:z-auto
          w-[220px] flex-shrink-0 bg-white border-r border-slate-100 flex flex-col justify-between
          h-full transition-transform duration-300 ease-in-out select-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile close button */}
        <button
          className="md:hidden absolute top-4 right-3 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar Header */}
        <header className="h-16 bg-white border-b border-slate-100 px-4 md:px-6 flex items-center justify-between flex-shrink-0 z-10">
          {/* Left: Hamburger (mobile) + Search */}
          <div className="flex items-center gap-3 flex-1">
            {/* Hamburger for mobile */}
            <button
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="relative flex-1 max-w-xs md:max-w-md">
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

          {/* Right: Notifications + Profile */}
          <div className="flex items-center gap-3 md:gap-4">

            {/* ── Notification Bell ── */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800">Follow-up Alerts</p>
                    <span className="text-xs bg-rose-50 text-rose-600 font-semibold px-2 py-0.5 rounded-full">
                      {notifications.length} due
                    </span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-xs text-slate-400">🎉 All caught up! No pending follow-ups.</p>
                    </div>
                  ) : (
                    <ul className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {notifications.map((n) => (
                        <li key={n.id}>
                          <button
                            onClick={() => {
                              setNotifOpen(false);
                              navigate(`/leads/${n.id}`);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-semibold text-slate-800">{n.name}</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">{n.event}</p>
                              </div>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                n.isOverdue
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {n.isOverdue ? 'Overdue' : 'Today'}
                              </span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="px-4 py-2.5 border-t border-slate-100">
                    <button
                      onClick={() => { setNotifOpen(false); navigate('/follow-ups'); }}
                      className="text-xs text-amber-600 font-semibold hover:underline"
                    >
                      View all follow-ups →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Admin Avatar & Dropdown ── */}
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
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <span>AD</span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700">Admin</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 text-sm">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-800">Admin Photographer</p>
                    <p className="text-[11px] text-slate-400 truncate">admin@lensflow.studio</p>
                  </div>
                  <button
                    onClick={() => { setProfileDropdownOpen(false); navigate('/settings'); }}
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#F8F9FB]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
