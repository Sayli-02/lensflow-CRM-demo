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
  Archive,
  ArchiveRestore,
  CheckSquare,
  Square,
  Trash2,
  Tag,
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
  const { leads, addLead, deleteLead, archiveLead, restoreLead, bulkArchive, bulkRestore, bulkUpdateStatus, searchQuery, setSearchQuery } = useCrmStore();

  // View tab: 'active' | 'archived'
  const [activeTab, setActiveTab] = useState('active');

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkStatusValue, setBulkStatusValue] = useState('');

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

  // Combined AND live filtering — respects activeTab
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Archive tab filter
      if (activeTab === 'archived' && !lead.archived) return false;
      if (activeTab === 'active' && lead.archived) return false;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        lead.name.toLowerCase().includes(q) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.phone && lead.phone.toLowerCase().includes(q));

      const matchesSource =
        selectedSource === 'All Sources' || lead.source === selectedSource;
      const matchesStatus =
        selectedStatus === 'All Status' || lead.status === selectedStatus;
      const matchesEvent =
        selectedEventType === 'All Event Types' || lead.event === selectedEventType;

      return matchesSearch && matchesSource && matchesStatus && matchesEvent;
    });
  }, [leads, searchQuery, selectedSource, selectedStatus, selectedEventType, activeTab]);

  // Selection helpers
  const allPageSelected = paginatedLeads => paginatedLeads.length > 0 && paginatedLeads.every(l => selectedIds.has(l.id));
  const toggleOne = (id) => setSelectedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleAll = (pageLeads) => {
    if (allPageSelected(pageLeads)) {
      setSelectedIds(prev => { const n = new Set(prev); pageLeads.forEach(l => n.delete(l.id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); pageLeads.forEach(l => n.add(l.id)); return n; });
    }
  };
  const clearSelection = () => setSelectedIds(new Set());

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
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Leads</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage and track all your enquiries.</p>
        </div>
        {activeTab === 'active' && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-md transition self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Lead
          </button>
        )}
      </div>

      {/* Tabs: Active / Archived */}
      <div className="flex gap-0 border border-slate-200 rounded-md w-fit overflow-hidden">
        {['active', 'archived'].map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); clearSelection(); }}
            className={`px-4 py-1.5 text-xs font-medium capitalize transition ${
              activeTab === tab
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab === 'active' ? (
              <span className="flex items-center gap-1.5">Active <span className={`text-[10px] px-1.5 py-0.5 rounded ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{leads.filter(l => !l.archived).length}</span></span>
            ) : (
              <span className="flex items-center gap-1.5"><Archive className="w-3 h-3" /> Archived <span className={`text-[10px] px-1.5 py-0.5 rounded ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{leads.filter(l => l.archived).length}</span></span>
            )}
          </button>
        ))}
      </div>

      {/* Search & Filters Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search leads..."
            className="w-full pl-8 pr-8 py-2 bg-white border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSource}
            onChange={(e) => { setSelectedSource(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-md text-xs text-slate-600 outline-none focus:border-amber-400 transition cursor-pointer"
          >
            <option value="All Sources">All Sources</option>
            {SOURCES.map((source) => <option key={source} value={source}>{source}</option>)}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-md text-xs text-slate-600 outline-none focus:border-amber-400 transition cursor-pointer"
          >
            {allFilterStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>

          <select
            value={selectedEventType}
            onChange={(e) => { setSelectedEventType(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-md text-xs text-slate-600 outline-none focus:border-amber-400 transition cursor-pointer"
          >
            <option value="All Event Types">All Event Types</option>
            {EVENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>

          {(searchQuery || selectedSource !== 'All Sources' || selectedStatus !== 'All Status' || selectedEventType !== 'All Event Types') && (
            <button onClick={handleClearFilters} className="p-2 text-slate-400 hover:text-rose-500 border border-slate-200 rounded-md bg-white transition" title="Clear filters">
              <FilterX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {filteredLeads.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center">
            <div className="w-10 h-10 rounded-md bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
              {activeTab === 'archived' ? <Archive className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </div>
            <h3 className="text-sm font-medium text-slate-700">
              {activeTab === 'archived' ? 'No archived leads' : 'No leads match your filters'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {activeTab === 'archived'
                ? 'Archived leads can be restored at any time.'
                : 'Try adjusting your search or filters.'}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={handleClearFilters}
                className="mt-3 px-3 py-1.5 text-xs text-slate-500 border border-slate-200 rounded-md hover:bg-slate-50 transition"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          /* Leads Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                  <th className="py-3 pl-4 pr-2 w-8">
                    <button onClick={() => toggleAll(paginatedLeads)} className="text-slate-300 hover:text-slate-600 transition">
                      {allPageSelected(paginatedLeads) ? <CheckSquare className="w-3.5 h-3.5 text-amber-500" /> : <Square className="w-3.5 h-3.5" />}
                    </button>
                  </th>
                  <th className="py-3 px-3">Client</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Follow-up</th>
                  <th className="py-3 px-4 text-right pr-5">Actions</th>
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
                      className={`hover:bg-slate-50/70 transition-colors cursor-pointer group ${
                        selectedIds.has(lead.id) ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 pl-4 pr-2" onClick={(e) => { e.stopPropagation(); toggleOne(lead.id); }}>
                        <div className={`transition-opacity duration-150 ${selectedIds.has(lead.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          {selectedIds.has(lead.id)
                            ? <CheckSquare className="w-4 h-4 text-amber-500" />
                            : <Square className="w-4 h-4 text-slate-400 hover:text-slate-600 transition" />}
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 ${colorClass}`}>
                            {initials}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 group-hover:text-amber-600 transition block leading-tight">
                              {lead.name}
                            </span>
                            {lead.phone && (
                              <span className="text-[11px] text-slate-400 font-normal">{lead.phone}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-medium">{lead.source}</td>
                      <td className="py-3 px-4 text-slate-600">{lead.event}</td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{formatEventDate(lead.eventDate)}</td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium leading-normal ${statusPillClass}`}>
                          {lead.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {followUp.isToday ? (
                          <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Today</span>
                        ) : (
                          <span className="text-slate-500 font-normal">{followUp.text}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right pr-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 text-slate-300">
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-1.5 hover:text-slate-600 hover:bg-slate-100 rounded transition"
                            title="Call client"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/${(lead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${lead.name}, this is from LensFlow Studio regarding your ${lead.event} enquiry!`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          {lead.archived ? (
                            <button type="button" onClick={() => restoreLead(lead.id)} className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded transition" title="Restore lead">
                              <ArchiveRestore className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button type="button" onClick={() => archiveLead(lead.id)} className="p-1.5 hover:text-slate-600 hover:bg-slate-100 rounded transition" title="Archive lead">
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
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
          <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              {startLeadIndex}–{endLeadIndex} of {filteredLeads.length} leads
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={activePage === 1}
                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition ${
                    activePage === pageNum
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={activePage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Add New Lead</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddLeadSubmit} className="p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Client Name *</label>
                  <input type="text" required value={newLeadForm.name} onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })} placeholder="e.g. Rohan Verma" className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-amber-400 focus:outline-none transition" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Phone</label>
                  <input type="text" value={newLeadForm.phone} onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })} placeholder="+91 98200 00000" className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-amber-400 focus:outline-none transition" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Email</label>
                  <input type="email" value={newLeadForm.email} onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })} placeholder="client@email.com" className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-amber-400 focus:outline-none transition" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Source</label>
                  <select value={newLeadForm.source} onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })} className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-amber-400 focus:outline-none transition">
                    {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Event Type</label>
                  <select value={newLeadForm.event} onChange={(e) => setNewLeadForm({ ...newLeadForm, event: e.target.value })} className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-amber-400 focus:outline-none transition">
                    {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Event Date</label>
                  <input type="date" value={newLeadForm.eventDate} onChange={(e) => setNewLeadForm({ ...newLeadForm, eventDate: e.target.value })} className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-amber-400 focus:outline-none transition" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Budget (₹)</label>
                  <input type="number" value={newLeadForm.budget} onChange={(e) => setNewLeadForm({ ...newLeadForm, budget: e.target.value })} placeholder="e.g. 100000" className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-amber-400 focus:outline-none transition" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Initial Status</label>
                  <select value={newLeadForm.status} onChange={(e) => setNewLeadForm({ ...newLeadForm, status: e.target.value })} className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-amber-400 focus:outline-none transition">
                    {STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50 rounded-md transition">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-md transition">Create Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-sm p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Delete Lead?</h2>
            <p className="text-xs text-slate-500 mb-4">
              This will permanently delete <strong>{deleteTarget.name}</strong> and all their activity. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition">Cancel</button>
              <button
                onClick={async () => { await deleteLead(deleteTarget.id); setDeleteTarget(null); }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-md transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-wrap items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-slate-700">
          <span className="text-xs text-slate-300 pr-2 border-r border-slate-700">
            {selectedIds.size} selected
          </span>
          <Tag className="w-3 h-3 text-slate-500" />
          <select
            value={bulkStatusValue}
            onChange={async (e) => {
              const val = e.target.value;
              if (!val) return;
              await bulkUpdateStatus(Array.from(selectedIds), val);
              setBulkStatusValue('');
              clearSelection();
            }}
            className="bg-slate-800 text-xs text-slate-200 rounded-md px-2.5 py-1.5 border border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="" disabled>Move to status...</option>
            {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          {activeTab === 'active' ? (
            <button onClick={async () => { await bulkArchive(Array.from(selectedIds)); clearSelection(); }} className="flex items-center gap-1 text-xs px-2.5 py-1.5 text-amber-300 border border-slate-700 rounded-md hover:bg-slate-800 transition">
              <Archive className="w-3 h-3" /> Archive
            </button>
          ) : (
            <button onClick={async () => { await bulkRestore(Array.from(selectedIds)); clearSelection(); }} className="flex items-center gap-1 text-xs px-2.5 py-1.5 text-emerald-300 border border-slate-700 rounded-md hover:bg-slate-800 transition">
              <ArchiveRestore className="w-3 h-3" /> Restore
            </button>
          )}
          <button onClick={clearSelection} className="p-1.5 text-slate-500 hover:text-slate-300 transition">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

