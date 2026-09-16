import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MessageSquare, Mail, Edit } from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';
import { STATUS_COLORS } from '../data/mockData';

export default function LeadDetails() {
  const { id } = useParams();
  const leads = useCrmStore((state) => state.leads);
  const lead = leads.find((l) => l.id === id) || leads[0];

  if (!lead) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 text-sm">Lead not found.</p>
        <Link to="/leads" className="text-amber-600 text-sm mt-2 inline-block">Back to Leads</Link>
      </div>
    );
  }

  const statusClass = STATUS_COLORS[lead.status] || 'bg-slate-100 text-slate-700';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/leads"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Leads</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold text-lg ring-2 ring-slate-100">
              {lead.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">{lead.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                  {lead.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {lead.source} Lead &bull; Added on {lead.createdAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Call
            </button>
            <button className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-medium rounded-lg transition flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
            </button>
            <button className="px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-medium rounded-lg transition flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </button>
          </div>
        </div>
      </div>

      {/* Placeholder State Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center max-w-lg mx-auto">
        <h2 className="text-base font-semibold text-slate-800">Lead Details Screen Ready</h2>
        <p className="text-xs text-slate-500 mt-1">
          Detailed tabs (Overview, Activity, Quotations, Payments, Files) will be rendered in the dedicated stage.
        </p>
      </div>
    </div>
  );
}
