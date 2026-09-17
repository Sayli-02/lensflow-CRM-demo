import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';

const formatDate = (d) => {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatCurrency = (n) =>
  n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '–';

export default function QuotationView() {
  const { id } = useParams();
  const leads = useCrmStore((s) => s.leads);
  const lead = leads.find((l) => l.id === id);

  if (!lead) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 text-sm">Lead not found.</p>
        <Link to="/leads" className="text-amber-600 text-sm mt-2 inline-block">← Back to Leads</Link>
      </div>
    );
  }

  const quotedAmount = lead.quotation || lead.budget || 0;
  const advancePaid = lead.advance || 0;
  const balance = quotedAmount - advancePaid;

  // Package pricing breakdown
  const packagePrices = {
    Photography: 40000,
    Videography: 35000,
    'Cinematic Film': 30000,
    Album: 15000,
    Reels: 10000,
    Drone: 12000,
  };
  const lineItems = (lead.requirements || []).map((req) => ({
    name: req,
    amount: packagePrices[req] || 0,
  }));
  const subtotal = lineItems.reduce((sum, i) => sum + i.amount, 0);

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .print-page { box-shadow: none; border: none; margin: 0; padding: 0; }
        }
      `}</style>

      {/* Controls (hidden on print) */}
      <div className="no-print flex items-center justify-between mb-6">
        <Link
          to={`/leads/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Lead
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Quotation Document */}
      <div className="print-page bg-white max-w-2xl mx-auto rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center">
                  <span className="text-slate-900 font-black text-xs">LF</span>
                </div>
                <span className="font-bold text-lg tracking-tight">LensFlow Studio</span>
              </div>
              <p className="text-slate-400 text-xs mt-1">Photography & Videography</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Quotation</p>
              <p className="text-amber-400 font-bold text-xl mt-0.5">
                #{String(Math.floor(Math.random() * 9000) + 1000)}
              </p>
              <p className="text-slate-400 text-xs mt-1">Date: {formatDate(new Date().toISOString().split('T')[0])}</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Client & Event Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2">Prepared For</p>
              <p className="font-bold text-slate-900 text-base">{lead.name}</p>
              {lead.phone && <p className="text-xs text-slate-500 mt-0.5">{lead.phone}</p>}
              {lead.email && <p className="text-xs text-slate-500">{lead.email}</p>}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2">Event Details</p>
              <p className="font-semibold text-slate-800">{lead.event}</p>
              <p className="text-xs text-slate-500 mt-0.5">{formatDate(lead.eventDate)}</p>
              <p className="text-xs text-slate-500">{lead.location} · {lead.guests} guests</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-3">Package Breakdown</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="text-left py-2 text-xs font-semibold text-slate-600">Service</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-2.5 text-slate-700">{item.name}</td>
                    <td className="py-2.5 text-right text-slate-700">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Package Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2 mt-1">
              <span>Total Quoted</span>
              <span className="text-amber-600">{formatCurrency(quotedAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-emerald-700">
              <span>Advance Received</span>
              <span>– {formatCurrency(advancePaid)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-rose-600 border-t border-slate-200 pt-2">
              <span>Balance Due</span>
              <span>{formatCurrency(balance)}</span>
            </div>
          </div>

          {/* Terms */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2">Terms & Notes</p>
            <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
              <li>50% advance required to confirm the booking.</li>
              <li>Remaining balance due on or before the event date.</li>
              <li>All deliverables within 45 days of the event.</li>
              <li>This quotation is valid for 15 days from the date above.</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <p className="text-xs font-semibold text-amber-800">Thank you for choosing LensFlow Studio!</p>
            <p className="text-xs text-amber-700 mt-0.5">We look forward to capturing your beautiful moments.</p>
          </div>
        </div>
      </div>
    </>
  );
}
