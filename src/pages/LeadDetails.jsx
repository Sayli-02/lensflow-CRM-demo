import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, MessageSquare, Mail, Edit2, Trash2, FileText,
  MapPin, Calendar, Users, IndianRupee, Camera, CheckCircle, Clock,
  Plus, X, Save, AlertTriangle,
} from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';
import { STATUS_COLORS, SOURCE_COLORS, STATUSES, SOURCES, EVENT_TYPES } from '../data/mockData';

const REQUIREMENTS_LIST = ['Photography', 'Videography', 'Cinematic Film', 'Album', 'Reels', 'Drone'];

const formatDate = (d) => {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatCurrency = (n) =>
  n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '–';

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, updateLead, deleteLead, addActivity } = useCrmStore();
  const lead = leads.find((l) => l.id === id);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [editForm, setEditForm] = useState({});

  if (!lead) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 text-sm">Lead not found.</p>
        <Link to="/leads" className="text-amber-600 text-sm mt-2 inline-block">
          ← Back to Leads
        </Link>
      </div>
    );
  }

  const statusClass = STATUS_COLORS[lead.status] || 'bg-slate-100 text-slate-700';
  const sourceClass = SOURCE_COLORS[lead.source] || 'bg-slate-100 text-slate-700';

  // WhatsApp link
  const rawPhone = (lead.phone || '').replace(/\D/g, '');
  const whatsappMsg = encodeURIComponent(
    `Hi ${lead.name}, this is from LensFlow Studio regarding your ${lead.event} photography enquiry. We'd love to connect!`
  );
  const whatsappUrl = `https://wa.me/${rawPhone}?text=${whatsappMsg}`;

  // Open edit modal
  const handleOpenEdit = () => {
    setEditForm({
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      source: lead.source || 'Instagram',
      handle: lead.handle || '',
      event: lead.event || 'Wedding',
      eventDate: lead.eventDate || '',
      location: lead.location || '',
      guests: lead.guests || 0,
      requirements: lead.requirements || [],
      budget: lead.budget || '',
      quotation: lead.quotation || '',
      advance: lead.advance || '',
      status: lead.status || 'New',
      nextFollowUp: lead.nextFollowUp || '',
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await updateLead(id, {
      ...editForm,
      guests: Number(editForm.guests),
      budget: Number(editForm.budget),
      quotation: editForm.quotation ? Number(editForm.quotation) : null,
      advance: Number(editForm.advance),
    });
    setIsEditOpen(false);
  };

  const handleDelete = async () => {
    await deleteLead(id);
    navigate('/leads');
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    await addActivity(id, newNote.trim());
    setNewNote('');
    setAddingNote(false);
  };

  const toggleRequirement = (req) => {
    setEditForm((prev) => ({
      ...prev,
      requirements: prev.requirements.includes(req)
        ? prev.requirements.filter((r) => r !== req)
        : [...prev.requirements, req],
    }));
  };

  const balance = (lead.quotation || lead.budget || 0) - (lead.advance || 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back */}
      <Link
        to="/leads"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Leads
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-lg ring-2 ring-slate-100 flex-shrink-0">
              {lead.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{lead.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClass}`}>
                  {lead.status}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${sourceClass}`}>
                  {lead.source}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-400">
                {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>}
                {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>}
                {lead.handle && <span className="text-slate-400">{lead.handle}</span>}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <a
              href={`tel:${lead.phone}`}
              className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> Call
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
            </a>
            <a
              href={`mailto:${lead.email}`}
              className="px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-100 transition flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </a>
            <Link
              to={`/leads/${id}/quotation`}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> Quotation
            </Link>
            <button
              onClick={handleOpenEdit}
              className="px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-100 transition flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold rounded-lg hover:bg-rose-100 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Event Details */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-500" /> Event Details
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 text-xs">Event Type</span>
              <span className="font-medium text-slate-800">{lead.event || '–'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Event Date</span>
              <span className="font-medium text-slate-800">{formatDate(lead.eventDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</span>
              <span className="font-medium text-slate-800">{lead.location || '–'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-xs flex items-center gap-1"><Users className="w-3 h-3" /> Guests</span>
              <span className="font-medium text-slate-800">{lead.guests ?? '–'}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2">Requirements</p>
            <div className="flex flex-wrap gap-1.5">
              {(lead.requirements || []).map((r) => (
                <span key={r} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-100">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-amber-500" /> Financials
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Client Budget', value: lead.budget, color: 'text-slate-800' },
              { label: 'Quoted Amount', value: lead.quotation, color: 'text-indigo-700' },
              { label: 'Advance Paid', value: lead.advance, color: 'text-emerald-700' },
              { label: 'Balance Due', value: balance, color: balance > 0 ? 'text-rose-600' : 'text-emerald-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-500">{label}</span>
                <span className={`text-sm font-semibold ${color}`}>{formatCurrency(value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up & Status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" /> Follow-up
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 text-xs">Next Follow-up</span>
              <span className="font-medium text-slate-800">{formatDate(lead.nextFollowUp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-xs">Added On</span>
              <span className="font-medium text-slate-800">{formatDate(lead.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-amber-500" /> Activity Timeline
          </h2>
          <button
            onClick={() => setAddingNote(!addingNote)}
            className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Note
          </button>
        </div>

        {/* Add note input */}
        {addingNote && (
          <div className="mb-4 flex gap-2">
            <input
              autoFocus
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              placeholder="Type a note and press Enter..."
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition"
            />
            <button onClick={handleAddNote} className="px-3 py-2 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition">
              <Save className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { setAddingNote(false); setNewNote(''); }} className="px-3 py-2 bg-slate-100 text-slate-600 text-xs rounded-lg hover:bg-slate-200 transition">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Timeline items */}
        {(lead.activity || []).length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No activity recorded yet.</p>
        ) : (
          <ol className="relative border-l border-slate-100 ml-2 space-y-4">
            {[...(lead.activity || [])].reverse().map((act, i) => (
              <li key={i} className="ml-4">
                <span className="absolute -left-1.5 w-3 h-3 bg-amber-400 border-2 border-white rounded-full mt-1" />
                <p className="text-xs text-slate-500">{formatDate(act.date)}</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5">{act.note}</p>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Edit Lead</h2>
              <button onClick={() => setIsEditOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                  <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                  <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition" />
                </div>
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                  <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Social Handle</label>
                  <input placeholder="@handle" value={editForm.handle} onChange={(e) => setEditForm({ ...editForm, handle: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition" />
                </div>
              </div>
              {/* Row 3 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Source</label>
                  <select value={editForm.source} onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400 transition bg-white">
                    {SOURCES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400 transition bg-white">
                    {[...STATUSES, 'Follow-up', 'Lost'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Event Type</label>
                  <select value={editForm.event} onChange={(e) => setEditForm({ ...editForm, event: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400 transition bg-white">
                    {EVENT_TYPES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {/* Row 4 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
                  <input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Event Date</label>
                  <input type="date" value={editForm.eventDate} onChange={(e) => setEditForm({ ...editForm, eventDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition" />
                </div>
              </div>
              {/* Row 5 — Financials */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Budget (₹)', key: 'budget' },
                  { label: 'Quotation (₹)', key: 'quotation' },
                  { label: 'Advance (₹)', key: 'advance' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                    <input type="number" value={editForm[key]} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition" />
                  </div>
                ))}
              </div>
              {/* Requirements */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Requirements</label>
                <div className="flex flex-wrap gap-2">
                  {REQUIREMENTS_LIST.map((req) => (
                    <button type="button" key={req} onClick={() => toggleRequirement(req)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${editForm.requirements?.includes(req) ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400'}`}>
                      {req}
                    </button>
                  ))}
                </div>
              </div>
              {/* Next follow-up */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Next Follow-up Date</label>
                <input type="date" value={editForm.nextFollowUp || ''} onChange={(e) => setEditForm({ ...editForm, nextFollowUp: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition" />
              </div>
              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Delete Lead?</h2>
                <p className="text-sm text-slate-500 mt-1">
                  This will permanently delete <strong>{lead.name}</strong> and all their activity. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
