import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  MessageSquare,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  X,
  Search,
  Check,
} from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';
import { STATUS_COLORS } from '../data/mockData';

// Helper: Format Date
function formatEventDate(dateStr) {
  if (!dateStr) return '–';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Calculate relative date badge
function getRelativeFollowUpBadge(dateStr) {
  if (!dateStr) return { label: '–', isOverdue: false, isToday: false, isTomorrow: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const days = Math.abs(diffDays);
    return {
      label: `${days} day${days > 1 ? 's' : ''} overdue`,
      colorClass: 'text-rose-600 bg-rose-50 font-semibold px-2 py-0.5 rounded-md',
      isOverdue: true,
    };
  }
  if (diffDays === 0) {
    return {
      label: 'Today',
      colorClass: 'text-amber-700 bg-amber-50 font-bold px-2 py-0.5 rounded-md',
      isToday: true,
    };
  }
  if (diffDays === 1) {
    return {
      label: 'Tomorrow',
      colorClass: 'text-sky-700 bg-sky-50 font-medium px-2 py-0.5 rounded-md',
      isTomorrow: true,
    };
  }
  return {
    label: `In ${diffDays} days`,
    colorClass: 'text-slate-500 font-normal',
  };
}

export default function FollowUps() {
  const navigate = useNavigate();
  const { leads, setNextFollowUp, addActivity } = useCrmStore();
  const [activeTab, setActiveTab] = useState('Today'); // 'Overdue' | 'Today' | 'Upcoming' | 'Completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [rescheduleLead, setRescheduleLead] = useState(null);
  const [newFollowUpDate, setNewFollowUpDate] = useState('');

  // Avatar palette
  const avatarColors = [
    'bg-amber-100 text-amber-700',
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-emerald-100 text-emerald-700',
    'bg-rose-100 text-rose-700',
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  // Group leads into tab categories
  const { overdueLeads, todayLeads, upcomingLeads, completedLeads } = useMemo(() => {
    const overdue = [];
    const today = [];
    const upcoming = [];
    const completed = [];

    leads.forEach((lead) => {
      if (lead.status === 'Booked') {
        completed.push(lead);
      } else if (!lead.nextFollowUp) {
        completed.push(lead);
      } else if (lead.nextFollowUp < todayStr) {
        overdue.push(lead);
      } else if (lead.nextFollowUp === todayStr) {
        today.push(lead);
      } else {
        upcoming.push(lead);
      }
    });

    return {
      overdueLeads: overdue,
      todayLeads: today,
      upcomingLeads: upcoming,
      completedLeads: completed,
    };
  }, [leads, todayStr]);

  // Active list based on tab
  const currentTabLeads = useMemo(() => {
    let list = [];
    if (activeTab === 'Overdue') list = overdueLeads;
    else if (activeTab === 'Today') list = todayLeads;
    else if (activeTab === 'Upcoming') list = upcomingLeads;
    else if (activeTab === 'Completed') list = completedLeads;

    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.phone && l.phone.toLowerCase().includes(q)) ||
        l.event.toLowerCase().includes(q)
    );
  }, [activeTab, overdueLeads, todayLeads, upcomingLeads, completedLeads, searchQuery]);

  // Mark Follow-up as completed
  const handleMarkAsDone = (lead) => {
    addActivity(lead.id, 'Completed scheduled follow-up call');
    setNextFollowUp(lead.id, null);
  };

  // Reschedule follow-up
  const handleSaveReschedule = (e) => {
    e.preventDefault();
    if (!rescheduleLead || !newFollowUpDate) return;
    setNextFollowUp(rescheduleLead.id, newFollowUpDate);
    addActivity(rescheduleLead.id, `Follow-up rescheduled to ${newFollowUpDate}`);
    setRescheduleLead(null);
    setNewFollowUpDate('');
  };

  const tabs = [
    { id: 'Overdue', label: 'Overdue', count: overdueLeads.length, countColor: 'bg-rose-500 text-white' },
    { id: 'Today', label: 'Today', count: todayLeads.length, countColor: 'bg-amber-500 text-white' },
    { id: 'Upcoming', label: 'Upcoming', count: upcomingLeads.length, countColor: 'bg-slate-200 text-slate-700' },
    { id: 'Completed', label: 'Completed', count: completedLeads.length, countColor: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Follow-ups</h1>
          <p className="text-sm text-slate-500 mt-0.5">Never miss an opportunity.</p>
        </div>
      </div>

      {/* Tabs Row + Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Tab Strip */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/80 rounded-2xl shadow-sm self-start">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FDF3E7] text-amber-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-amber-500 text-white' : tab.countColor
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search follow-ups..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden">
        {currentTabLeads.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              No {activeTab.toLowerCase()} follow-ups
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {activeTab === 'Today'
                ? "You are all caught up on today's follow-up calls!"
                : `No leads currently in the ${activeTab.toLowerCase()} queue.`}
            </p>
          </div>
        ) : (
          /* Follow-ups Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-5">Client</th>
                  <th className="py-3.5 px-4">Event Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Follow-up Date</th>
                  <th className="py-3.5 px-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {currentTabLeads.map((lead, idx) => {
                  const initials = lead.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2);
                  const colorClass = avatarColors[idx % avatarColors.length];
                  const statusPillClass = STATUS_COLORS[lead.status] || 'bg-slate-100 text-slate-700';
                  const relativeBadge = getRelativeFollowUpBadge(lead.nextFollowUp);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Client */}
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 ${colorClass}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 group-hover:text-amber-700 transition block leading-tight">
                              {lead.name}
                            </span>
                            {lead.phone && (
                              <span className="text-[11px] text-slate-400 font-normal">
                                {lead.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Event Type */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {lead.event}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium leading-normal ${statusPillClass}`}
                        >
                          {lead.status}
                        </span>
                      </td>

                      {/* Follow-up Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">
                            {formatEventDate(lead.nextFollowUp)}
                          </span>
                          {lead.nextFollowUp && (
                            <span className={`text-[11px] ${relativeBadge.colorClass}`}>
                              {relativeBadge.label}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right pr-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`tel:${lead.phone}`}
                            className="px-3 py-1 bg-[#FDF3E7] hover:bg-[#faebd7] text-amber-800 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 border border-amber-200/60"
                          >
                            <Phone className="w-3 h-3 text-amber-600" />
                            <span>Call</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleMarkAsDone(lead)}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Mark as Done"
                          >
                            <Check className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRescheduleLead(lead);
                              setNewFollowUpDate(lead.nextFollowUp || todayStr);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="Reschedule"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleLead && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Reschedule Follow-up</h3>
                <p className="text-xs text-slate-500">{rescheduleLead.name}</p>
              </div>
              <button
                onClick={() => setRescheduleLead(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReschedule} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select New Follow-up Date
                </label>
                <input
                  type="date"
                  required
                  value={newFollowUpDate}
                  onChange={(e) => setNewFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRescheduleLead(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                >
                  Save Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
