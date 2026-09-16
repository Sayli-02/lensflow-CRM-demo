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

  // Computed Live Stats
  const totalLeads = leads.length;
  const newLeadsCount = useMemo(() => leads.filter((l) => l.status === 'New').length, [leads]);
  const pendingFollowUpsCount = useMemo(
    () => leads.filter((l) => l.nextFollowUp && l.status !== 'Booked').length,
    [leads]
  );
  const bookingsCount = useMemo(() => leads.filter((l) => l.status === 'Booked').length, [leads]);

  // Donut Chart Data: Leads by Source
  const sourceChartData = useMemo(() => {
    return SOURCES.map((source) => {
      const count = leads.filter((l) => l.source === source).length;
      return {
        name: source,
        value: count,
        color: SOURCE_HEX_COLORS[source] || '#CBD5E1',
      };
    }).filter((item) => item.value > 0);
  }, [leads]);

  // Sales Pipeline Counts
  const pipelineCounts = useMemo(() => {
    return STATUSES.map((status) => {
      const count = leads.filter((l) => l.status === status).length;
      return {
        status,
        count,
        color: STATUS_BAR_COLORS[status] || '#94A3B8',
      };
    });
  }, [leads]);

  const maxPipelineCount = useMemo(() => {
    return Math.max(...pipelineCounts.map((p) => p.count), 1);
  }, [pipelineCounts]);

  // Today's / Pending Follow-ups list
  const followUpLeads = useMemo(() => {
    return leads
      .filter((l) => l.nextFollowUp && l.status !== 'Booked')
      .slice(0, 4);
  }, [leads]);

  // Recent Bookings list
  const recentBookings = useMemo(() => {
    return leads
      .filter((l) => l.status === 'Booked')
      .slice(0, 4);
  }, [leads]);

  // Formatted date string for today
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  // Helper for avatar background colors
  const avatarColors = [
    'bg-amber-100 text-amber-700',
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-emerald-100 text-emerald-700',
    'bg-rose-100 text-rose-700',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Good morning, Admin 👋</h1>
          <p className="text-sm text-slate-500 mt-0.5">Here's what's happening with your photography business today.</p>
        </div>
        <div className="text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm self-start sm:self-auto">
          {formattedDate}
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">{totalLeads}</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Total Leads</div>
          </div>
        </div>

        {/* New Leads */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">{newLeadsCount}</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">New Leads</div>
          </div>
        </div>

        {/* Pending Follow-ups */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">{pendingFollowUpsCount}</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Pending Follow-ups</div>
          </div>
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">{bookingsCount}</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Bookings</div>
          </div>
        </div>
      </div>

      {/* Middle Row: Leads by Source & Sales Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Leads by Source Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100/80 flex flex-col">
          <h2 className="text-base font-bold text-slate-900 mb-4">Leads by Source</h2>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 flex-1">
            {/* Donut Chart with Center Total */}
            <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {sourceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} Leads`, name]}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900 leading-none">{totalLeads}</span>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5">Total Leads</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="flex-1 w-full space-y-2.5">
              {SOURCES.map((source) => {
                const count = leads.filter((l) => l.source === source).length;
                const dotColor = SOURCE_HEX_COLORS[source] || '#94A3B8';
                return (
                  <div key={source} className="flex items-center justify-between text-xs py-0.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: dotColor }}
                      />
                      <span className="text-slate-600 font-medium">{source}</span>
                    </div>
                    <span className="font-bold text-slate-800">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sales Pipeline Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100/80 flex flex-col">
          <h2 className="text-base font-bold text-slate-900 mb-4">Sales Pipeline</h2>
          <div className="flex-1 flex flex-col justify-center space-y-3.5">
            {pipelineCounts.map((stage) => {
              const widthPercentage = Math.max(
                Math.round((stage.count / (maxPipelineCount || 1)) * 100),
                8
              );
              return (
                <div key={stage.status} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-600 w-24 flex-shrink-0">
                    {stage.status}
                  </span>
                  <div className="flex-1 h-6 bg-slate-50 rounded-lg overflow-hidden flex items-center p-0.5">
                    <div
                      className="h-full rounded-md transition-all duration-500 ease-out"
                      style={{
                        width: `${stage.count === 0 ? 4 : widthPercentage}%`,
                        backgroundColor: stage.color,
                        opacity: stage.count === 0 ? 0.3 : 0.85,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-800 w-8 text-right flex-shrink-0">
                    {stage.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Today's Follow-ups & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Follow-ups Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100/80">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Today's Follow-ups</h2>
            <Link
              to="/follow-ups"
              className="text-xs font-medium text-slate-500 hover:text-amber-600 transition flex items-center gap-0.5"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {followUpLeads.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No pending follow-ups for today.</p>
            ) : (
              followUpLeads.map((lead, idx) => {
                const initials = lead.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2);
                const colorClass = avatarColors[idx % avatarColors.length];

                return (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50/80 transition border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs ${colorClass}`}
                      >
                        {initials}
                      </div>
                      <div>
                        <Link
                          to={`/leads/${lead.id}`}
                          className="text-sm font-semibold text-slate-800 hover:text-amber-600 transition leading-tight block"
                        >
                          {lead.name}
                        </Link>
                        <span className="text-xs text-slate-400">{lead.event}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-500">
                        {lead.followUpTime || '2:00 PM'}
                      </span>
                      <a
                        href={`tel:${lead.phone}`}
                        className="px-2.5 py-1 bg-[#FDF3E7] hover:bg-[#faebd7] text-amber-800 text-xs font-medium rounded-lg transition flex items-center gap-1.5 border border-amber-200/60"
                      >
                        <Phone className="w-3 h-3 text-amber-600" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Bookings Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100/80">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Recent Bookings</h2>
            <Link
              to="/projects"
              className="text-xs font-medium text-slate-500 hover:text-amber-600 transition flex items-center gap-0.5"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentBookings.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No bookings recorded yet.</p>
            ) : (
              recentBookings.map((lead, idx) => {
                const initials = lead.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2);
                const colorClass = avatarColors[(idx + 2) % avatarColors.length];

                return (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50/80 transition border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs ${colorClass}`}
                      >
                        {initials}
                      </div>
                      <div>
                        <Link
                          to={`/leads/${lead.id}`}
                          className="text-sm font-semibold text-slate-800 hover:text-amber-600 transition leading-tight block"
                        >
                          {lead.name}
                        </Link>
                        <span className="text-xs text-slate-400">{lead.event}</span>
                      </div>
                    </div>

                    <div className="text-xs font-medium text-slate-500">
                      {lead.bookedAt || 'Recently'}
                    </div>
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
