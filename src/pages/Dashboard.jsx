import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Clock,
  CheckCircle2,
  Phone,
  ArrowUpRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useCrmStore } from '../store/useCrmStore';
import {
  STATUSES,
  SOURCES,
  SOURCE_HEX_COLORS,
  STATUS_BAR_COLORS,
} from '../data/mockData';

export default function Dashboard() {
  const { leads } = useCrmStore();

  const totalLeads = leads.length;
  const newLeadsCount = useMemo(() => leads.filter((l) => l.status === 'New').length, [leads]);
  const pendingFollowUpsCount = useMemo(
    () => leads.filter((l) => l.nextFollowUp && l.status !== 'Booked').length,
    [leads]
  );
  const bookingsCount = useMemo(() => leads.filter((l) => l.status === 'Booked').length, [leads]);

  const sourceChartData = useMemo(() => {
    return SOURCES.map((source) => {
      const count = leads.filter((l) => l.source === source).length;
      return { name: source, value: count, color: SOURCE_HEX_COLORS[source] || '#CBD5E1' };
    }).filter((item) => item.value > 0);
  }, [leads]);

  const pipelineCounts = useMemo(() => {
    return STATUSES.map((status) => {
      const count = leads.filter((l) => l.status === status).length;
      return { status, count, color: STATUS_BAR_COLORS[status] || '#94A3B8' };
    });
  }, [leads]);

  const maxPipelineCount = useMemo(() => Math.max(...pipelineCounts.map((p) => p.count), 1), [pipelineCounts]);

  const followUpLeads = useMemo(() => leads.filter((l) => l.nextFollowUp && l.status !== 'Booked').slice(0, 4), [leads]);
  const recentBookings = useMemo(() => leads.filter((l) => l.status === 'Booked').slice(0, 4), [leads]);

  const formattedDate = useMemo(() =>
    new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }), []);

  const avatarColors = [
    'bg-amber-100 text-amber-700',
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-emerald-100 text-emerald-700',
    'bg-rose-100 text-rose-700',
  ];

  const statCards = [
    { label: 'Total Leads', value: totalLeads, icon: Users, color: 'text-amber-500' },
    { label: 'New Leads', value: newLeadsCount, icon: UserPlus, color: 'text-blue-500' },
    { label: 'Follow-ups Pending', value: pendingFollowUpsCount, icon: Clock, color: 'text-rose-400' },
    { label: 'Bookings', value: bookingsCount, icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Good morning, Admin</h1>
          <p className="text-sm text-slate-400 mt-0.5">Here's your business at a glance.</p>
        </div>
        <span className="text-xs text-slate-400">{formattedDate}</span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-lg p-4 flex items-center gap-3.5">
            <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} strokeWidth={1.8} />
            <div>
              <div className="text-2xl font-semibold text-slate-900 leading-none">{value}</div>
              <div className="text-[11px] text-slate-400 mt-1">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Leads by Source */}
        <div className="bg-white border border-slate-100 rounded-lg p-5">
          <h2 className="text-sm font-medium text-slate-700 mb-4">Leads by Source</h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {sourceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} leads`, name]}
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '11px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-semibold text-slate-900 leading-none">{totalLeads}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">leads</span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-2">
              {SOURCES.map((source) => {
                const count = leads.filter((l) => l.source === source).length;
                const dotColor = SOURCE_HEX_COLORS[source] || '#94A3B8';
                return (
                  <div key={source} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
                      <span className="text-slate-500">{source}</span>
                    </div>
                    <span className="font-medium text-slate-700">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sales Pipeline */}
        <div className="bg-white border border-slate-100 rounded-lg p-5">
          <h2 className="text-sm font-medium text-slate-700 mb-4">Sales Pipeline</h2>
          <div className="flex flex-col justify-center space-y-3">
            {pipelineCounts.map((stage) => {
              const widthPct = Math.max(Math.round((stage.count / maxPipelineCount) * 100), 4);
              return (
                <div key={stage.status} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-24 flex-shrink-0">{stage.status}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stage.count === 0 ? 0 : widthPct}%`,
                        backgroundColor: stage.color,
                        opacity: stage.count === 0 ? 0 : 0.8,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600 w-5 text-right flex-shrink-0">{stage.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Today's Follow-ups */}
        <div className="bg-white border border-slate-100 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-700">Today's Follow-ups</h2>
            <Link to="/follow-ups" className="text-xs text-slate-400 hover:text-amber-500 transition flex items-center gap-0.5">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1">
            {followUpLeads.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No pending follow-ups.</p>
            ) : (
              followUpLeads.map((lead, idx) => {
                const initials = lead.name.split(' ').map((n) => n[0]).join('').substring(0, 2);
                return (
                  <div key={lead.id} className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-slate-50 transition">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-medium text-[10px] ${avatarColors[idx % avatarColors.length]}`}>
                        {initials}
                      </div>
                      <div>
                        <Link to={`/leads/${lead.id}`} className="text-xs font-medium text-slate-800 hover:text-amber-600 transition block">
                          {lead.name}
                        </Link>
                        <span className="text-[11px] text-slate-400">{lead.event}</span>
                      </div>
                    </div>
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] text-amber-600 border border-amber-200 rounded-md hover:bg-amber-50 transition"
                    >
                      <Phone className="w-3 h-3" />
                      Call
                    </a>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white border border-slate-100 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-700">Recent Bookings</h2>
            <Link to="/projects" className="text-xs text-slate-400 hover:text-amber-500 transition flex items-center gap-0.5">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1">
            {recentBookings.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No bookings recorded yet.</p>
            ) : (
              recentBookings.map((lead, idx) => {
                const initials = lead.name.split(' ').map((n) => n[0]).join('').substring(0, 2);
                return (
                  <div key={lead.id} className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-slate-50 transition">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-medium text-[10px] ${avatarColors[(idx + 2) % avatarColors.length]}`}>
                        {initials}
                      </div>
                      <div>
                        <Link to={`/leads/${lead.id}`} className="text-xs font-medium text-slate-800 hover:text-amber-600 transition block">
                          {lead.name}
                        </Link>
                        <span className="text-[11px] text-slate-400">{lead.event}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">{lead.bookedAt || 'Recently'}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
