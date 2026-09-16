import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Phone,
  Mail,
  Calendar,
  MapPin,
  ExternalLink,
  Kanban,
  CheckCircle2,
  ArrowRight,
  X,
  UserCheck,
} from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';

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

export default function Clients() {
  const navigate = useNavigate();
  const { leads, projects } = useCrmStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Avatar colors
  const avatarColors = [
    'bg-amber-100 text-amber-700',
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-emerald-100 text-emerald-700',
    'bg-rose-100 text-rose-700',
    'bg-sky-100 text-sky-700',
  ];

  // Derive clients from leads with status === 'Booked'
  const bookedClients = useMemo(() => {
    return leads
      .filter((lead) => lead.status === 'Booked')
      .map((client) => {
        const matchingProject = projects.find((p) => p.leadId === client.id);
        const totalValue =
          matchingProject?.total || client.quotation || client.budget || 0;
        const paidAmount = matchingProject?.paid || client.advance || 0;

        return {
          ...client,
          matchingProject,
          totalValue,
          paidAmount,
        };
      });
  }, [leads, projects]);

  // Live filtered client list
  const filteredClients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return bookedClients;

    return bookedClients.filter(
      (client) =>
        client.name.toLowerCase().includes(q) ||
        (client.email && client.email.toLowerCase().includes(q)) ||
        (client.phone && client.phone.toLowerCase().includes(q)) ||
        (client.event && client.event.toLowerCase().includes(q)) ||
        (client.location && client.location.toLowerCase().includes(q))
    );
  }, [bookedClients, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clients</h1>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {bookedClients.length} Confirmed
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">View and manage your client directory.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients by name, email, or event..."
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
      </div>

      {/* Main Content Area */}
      {filteredClients.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            {bookedClients.length === 0
              ? 'No clients yet — clients appear here once a lead is booked'
              : 'No clients match your search'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Converting a lead to "Booked" in your Sales Pipeline automatically registers them as a client.
          </p>
          <button
            onClick={() => navigate('/pipeline')}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <span>Go to Sales Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Client Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client, idx) => {
            const initials = client.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2);
            const colorClass = avatarColors[idx % avatarColors.length];

            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/80 hover:border-amber-200/80 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top: Avatar, Name, and Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${colorClass}`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/leads/${client.id}`}
                          className="font-bold text-sm text-slate-900 hover:text-amber-700 transition block truncate"
                        >
                          {client.name}
                        </Link>
                        <span className="text-xs text-slate-500 font-medium truncate block">
                          {client.event} Photography
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/80 flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Booked</span>
                    </span>
                  </div>

                  {/* Event & Location details */}
                  <div className="mt-4 pt-3 border-t border-slate-50 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>Event Date: <strong className="text-slate-800">{formatEventDate(client.eventDate)}</strong></span>
                    </div>

                    {client.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-600">{client.location}</span>
                      </div>
                    )}

                    {/* Contact Links */}
                    <div className="flex flex-col gap-1 pt-1">
                      {client.phone && (
                        <a
                          href={`tel:${client.phone}`}
                          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{client.phone}</span>
                        </a>
                      )}
                      {client.email && (
                        <a
                          href={`mailto:${client.email}`}
                          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition truncate"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="mt-4 p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Total Project Value
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        ₹{client.totalValue.toLocaleString('en-IN')}
                      </p>
                    </div>
                    {client.paidAmount > 0 && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                          Advance Paid
                        </span>
                        <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                          ₹{client.paidAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Links */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <Link
                    to={`/leads/${client.id}`}
                    className="text-slate-500 hover:text-slate-900 transition"
                  >
                    View Lead Profile
                  </Link>

                  {client.matchingProject ? (
                    <Link
                      to="/projects"
                      className="text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 group"
                    >
                      <span>View Project</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ) : (
                    <span className="text-slate-400 text-[11px] font-normal">No Project Record</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
