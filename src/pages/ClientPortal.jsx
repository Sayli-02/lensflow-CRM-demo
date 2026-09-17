import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Circle, Calendar, MapPin, IndianRupee, Camera, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

const MILESTONE_CONFIG = [
  { key: 'milestone_booking_confirmed', label: 'Booking Confirmed', description: 'Your booking has been confirmed with us!' },
  { key: 'milestone_shoot_completed', label: 'Shoot Completed', description: 'Your photoshoot was a success!' },
  { key: 'milestone_editing', label: 'Editing & Color Grading', description: 'Our team is working on your photos.' },
  { key: 'milestone_album', label: 'Album Design & Print', description: 'Your album is being designed.' },
  { key: 'milestone_final_delivery', label: 'Final Delivery', description: 'All files have been delivered to you!' },
];

const formatDate = (d) => {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatCurrency = (n) =>
  n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '–';

export default function ClientPortal() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setProject(data);
      }
      setLoading(false);
    }
    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 flex items-center justify-center">
        <div className="text-white text-sm animate-pulse">Loading your project...</div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg font-semibold">Project not found</p>
          <p className="text-sm text-slate-400 mt-1">This link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const milestones = MILESTONE_CONFIG.map((m) => ({
    ...m,
    completed: !!project[m.key],
  }));
  const completedCount = milestones.filter((m) => m.completed).length;
  const progress = Math.round((completedCount / milestones.length) * 100);
  const lastCompleted = [...milestones].reverse().find((m) => m.completed);
  const balance = (project.total || 0) - (project.paid || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Studio Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-slate-900 font-black text-lg">LF</span>
          </div>
          <h1 className="text-white font-bold text-xl">LensFlow Studio</h1>
          <p className="text-slate-400 text-sm mt-0.5">Photography & Videography</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-1">Project Status</p>
            <h2 className="text-white text-xl font-bold">{project.name}</h2>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Camera className="w-3 h-3" />{project.event}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(project.event_date)}</span>
              {project.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{project.location}</span>}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-600">Overall Progress</span>
                <span className="text-xs font-bold text-amber-600">{progress}% Complete</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {lastCompleted && (
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Latest: {lastCompleted.label}
                </p>
              )}
            </div>

            {/* Milestone Steps */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Milestones</p>
              <ol className="space-y-3">
                {milestones.map((m, i) => (
                  <li key={m.key} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {m.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-200" />
                      )}
                    </div>
                    <div className={m.completed ? 'text-slate-800' : 'text-slate-400'}>
                      <p className={`text-sm font-semibold ${m.completed ? 'text-slate-800' : 'text-slate-400'}`}>
                        {m.label}
                      </p>
                      {m.completed && (
                        <p className="text-xs text-emerald-600 mt-0.5">{m.description}</p>
                      )}
                    </div>
                    {i < milestones.length - 1 && (
                      <div className={`absolute ml-2.5 mt-5 h-3 w-px ${m.completed ? 'bg-emerald-200' : 'bg-slate-100'}`} />
                    )}
                  </li>
                ))}
              </ol>
            </div>

            {/* Payment Summary */}
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <IndianRupee className="w-3 h-3" /> Payment Summary
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Amount</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(project.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Advance Paid</span>
                  <span className="font-semibold text-emerald-600">{formatCurrency(project.paid)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-1">
                  <span className="text-slate-500 font-medium">Balance Due</span>
                  <span className={`font-bold ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {balance > 0 ? formatCurrency(balance) : 'Fully Paid ✓'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="text-center pt-1">
              <p className="text-xs text-slate-400">
                Questions? Contact us at{' '}
                <a href="mailto:studio@lensflow.in" className="text-amber-600 font-medium hover:underline">
                  studio@lensflow.in
                </a>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">Powered by LensFlow CRM</p>
      </div>
    </div>
  );
}
