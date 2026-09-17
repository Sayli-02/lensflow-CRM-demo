import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Phone,
  MessageSquare,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  FilterX,
  X,
  Sparkles,
} from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';
import {
  STATUSES,
  SOURCES,
  EVENT_TYPES,
  STATUS_COLORS,
} from '../data/mockData';

export default function Leads() {
  const navigate = useNavigate();
  const { leads, addLead, deleteLead, searchQuery, setSearchQuery } = useCrmStore();

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Local filter states
  const [selectedSource, setSelectedSource] = useState('All Sources');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedEventType, setSelectedEventType] = useState('All Event Types');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add Lead Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Instagram',
    event: 'Wedding',
    eventDate: '',
    location: '',
    budget: '',
    status: 'New',
  });

  // Comprehensive Status Filter List
  const allFilterStatuses = ['All Status', ...STATUSES, 'Follow-up', 'Lost'];

  // Format date helper: "24 Dec 2026"
  const formatEventDate = (dateStr) => {
    if (!dateStr) return '–';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Follow-up display helper
  const getFollowUpDisplay = (followUpDate) => {
    if (!followUpDate) return { text: '–', isToday: false };
    const today = new Date().toISOString().split('T')[0];
    if (followUpDate === today) {
      return { text: 'Today', isToday: true };
    }
    return { text: formatEventDate(followUpDate), isToday: false };
  };

  // Avatar colors cycle
  const avatarColors = [
    'bg-amber-100 text-amber-700',
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-emerald-100 text-emerald-700',
    'bg-rose-100 text-rose-700',
    'bg-sky-100 text-sky-700',
  ];

  // Combined AND live filtering
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search query (name, email, or phone)
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        lead.name.toLowerCase().includes(q) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.phone && lead.phone.toLowerCase().includes(q));

      // Source Filter
      const matchesSource =
        selectedSource === 'All Sources' || lead.source === selectedSource;

      // Status Filter
      const matchesStatus =
        selectedStatus === 'All Status' || lead.status === selectedStatus;

      // Event Type Filter
      const matchesEvent =
        selectedEventType === 'All Event Types' || lead.event === selectedEventType;

      return matchesSearch && matchesSource && matchesStatus && matchesEvent;
    });
  }, [leads, searchQuery, selectedSource, selectedStatus, selectedEventType]);

  // Reset to page 1 if filtered results change
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  // Paginated slice
  const paginatedLeads = useMemo(() => {
    const startIndex = (activePage - 1) * itemsPerPage;
    return filteredLeads.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLeads, activePage, itemsPerPage]);

  const startLeadIndex = filteredLeads.length === 0 ? 0 : (activePage - 1) * itemsPerPage + 1;
  const endLeadIndex = Math.min(activePage * itemsPerPage, filteredLeads.length);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSource('All Sources');
    setSelectedStatus('All Status');
    setSelectedEventType('All Event Types');
    setCurrentPage(1);
  };

  // Handle Add Lead Form Submission
  const handleAddLeadSubmit = (e) => {
    e.preventDefault();
    if (!newLeadForm.name.trim()) return;

    addLead({
      name: newLeadForm.name,
      phone: newLeadForm.phone,
      email: newLeadForm.email,
      source: newLeadForm.source,
      event: newLeadForm.event,
      eventDate: newLeadForm.eventDate || new Date().toISOString().split('T')[0],
      location: newLeadForm.location || 'Studio',
      budget: Number(newLeadForm.budget) || 50000,
      status: newLeadForm.status,
      nextFollowUp: new Date().toISOString().split('T')[0],
    });

    setIsAddModalOpen(false);
    setNewLeadForm({
      name: '',
      phone: '',
      email: '',
      source: 'Instagram',
      event: 'Wedding',
      eventDate: '',
      location: '',
      budget: '',
      status: 'New',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leads</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and track all your enquiries from different platforms.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-medium rounded-xl shadow-sm transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Lead</span>
        </button>
      </div>

      {/* Search & Filters Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition shadow-sm"
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

        {/* 3 Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Source Filter */}
          <select
            value={selectedSource}
            onChange={(e) => {
              setSelectedSource(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition cursor-pointer"
          >
            <option value="All Sources">All Sources</option>
            {SOURCES.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition cursor-pointer"
          >
            {allFilterStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* Event Type Filter */}
          <select
            value={selectedEventType}
            onChange={(e) => {
              setSelectedEventType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition cursor-pointer"
          >
            <option value="All Event Types">All Event Types</option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Reset Filters button if any filter active */}
          {(searchQuery ||
            selectedSource !== 'All Sources' ||
            selectedStatus !== 'All Status' ||
            selectedEventType !== 'All Event Types') && (
            <button
              onClick={handleClearFilters}
              className="p-2 text-xs font-medium text-slate-500 hover:text-rose-600 bg-white border border-slate-200/80 rounded-xl shadow-sm transition"
              title="Clear all filters"
            >
              <FilterX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100/80 overflow-hidden">
        {filteredLeads.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No leads match your filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search keywords or clearing active dropdown filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 px-3.5 py-1.5 bg-[#FDF3E7] hover:bg-[#faebd7] text-amber-800 text-xs font-medium rounded-lg transition"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* Leads Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-5">Client</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Event Type</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Next Follow-up</th>
                  <th className="py-3.5 px-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {paginatedLeads.map((lead, idx) => {
                  const initials = lead.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2);
                  const colorClass = avatarColors[idx % avatarColors.length];
                  const statusPillClass = STATUS_COLORS[lead.status] || 'bg-slate-100 text-slate-700';
                  const followUp = getFollowUpDisplay(lead.nextFollowUp);

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
                            <span className="font-semibold text-slate-900 group-hover:text-amber-600 transition block leading-tight">
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

                      {/* Source (Plain text per reference) */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {lead.source}
                      </td>

                      {/* Event Type */}
                      <td className="py-3 px-4 text-slate-600">
                        {lead.event}
                      </td>

                      {/* Event Date */}
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatEventDate(lead.eventDate)}
                      </td>

                      {/* Status Pill */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium leading-normal ${statusPillClass}`}
                        >
                          {lead.status}
                        </span>
                      </td>

                      {/* Next Follow-up */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {followUp.isToday ? (
                          <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                            Today
                          </span>
                        ) : (
                          <span className="text-slate-500 font-normal">
                            {followUp.text}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 text-slate-400">
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="Call client"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/${(lead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${lead.name}, this is from LensFlow Studio regarding your ${lead.event} enquiry!`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(lead)}
                            className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete lead"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
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

        {/* Pagination Row */}
        {filteredLeads.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">{startLeadIndex}</span>–
              <span className="font-semibold text-slate-700">{endLeadIndex}</span> of{' '}
              <span className="font-semibold text-slate-700">{filteredLeads.length}</span> leads
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={activePage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition ${
                    activePage === pageNum
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={activePage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Lead Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Lead</h3>
                <p className="text-xs text-slate-500">Capture a new client enquiry.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddLeadSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    placeholder="e.g. Rohan Verma"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    placeholder="+91 98200 00000"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    placeholder="client@email.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Source</label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition"
                  >
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Event Type</label>
                  <select
                    value={newLeadForm.event}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, event: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition"
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={newLeadForm.eventDate}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, eventDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Estimated Budget (₹)</label>
                  <input
                    type="number"
                    value={newLeadForm.budget}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, budget: e.target.value })}
                    placeholder="e.g. 100000"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={newLeadForm.status}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Delete Lead?</h2>
                <p className="text-sm text-slate-500 mt-1">
                  This will permanently delete <strong>{deleteTarget.name}</strong> and all their activity. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteLead(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
