import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  X,
  CheckCircle2,
  Circle,
  Calendar,
  IndianRupee,
  ArrowRight,
  ExternalLink,
  Kanban,
  Check,
} from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';

// Milestone definitions in sequential order
const MILESTONE_CONFIG = [
  { key: 'bookingConfirmed', label: 'Booking Confirmed' },
  { key: 'shootCompleted', label: 'Shoot Completed' },
  { key: 'editing', label: 'Editing & Color Grading' },
  { key: 'album', label: 'Album Design & Print' },
  { key: 'finalDelivery', label: 'Final Delivery' },
];

// Helper: Format Date ("24 Dec 2026")
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

// Compute current status badge & color from milestones
function getProjectStatus(milestones = {}) {
  if (milestones.finalDelivery) {
    return { label: 'Completed', colorClass: 'bg-emerald-100 text-emerald-700' };
  }
  if (milestones.album) {
    return { label: 'Delivery', colorClass: 'bg-cyan-100 text-cyan-700' };
  }
  if (milestones.editing) {
    return { label: 'Album', colorClass: 'bg-purple-100 text-purple-700' };
  }
  if (milestones.shootCompleted) {
    return { label: 'Editing', colorClass: 'bg-amber-100 text-amber-700' };
  }
  if (milestones.bookingConfirmed) {
    return { label: 'Shoot Scheduled', colorClass: 'bg-blue-100 text-blue-700' };
  }
  return { label: 'Not Started', colorClass: 'bg-slate-100 text-slate-700' };
}

// Compute progress percentage (0 - 100%)
function getProjectProgress(milestones = {}) {
  const completedCount = MILESTONE_CONFIG.filter(
    (m) => milestones[m.key] === true
  ).length;
  const percentage = Math.round((completedCount / MILESTONE_CONFIG.length) * 100);
  return { completedCount, total: MILESTONE_CONFIG.length, percentage };
}

export default function Projects() {
  const navigate = useNavigate();
  const { projects, updateProjectMilestone } = useCrmStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedProject, setSelectedProject] = useState(null);

  // Avatar palette
  const avatarColors = [
    'bg-amber-100 text-amber-700',
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-emerald-100 text-emerald-700',
    'bg-rose-100 text-rose-700',
  ];

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        proj.name.toLowerCase().includes(q) ||
        proj.event.toLowerCase().includes(q) ||
        (proj.location && proj.location.toLowerCase().includes(q));

      const statusObj = getProjectStatus(proj.milestones);
      const matchesStatus =
        statusFilter === 'All Status' || statusObj.label === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  // Handle milestone toggle inside View modal
  const handleToggleMilestone = (projectId, milestoneKey, currentVal) => {
    updateProjectMilestone(projectId, milestoneKey, !currentVal);
    // Update local modal state
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject((prev) => ({
        ...prev,
        milestones: {
          ...prev.milestones,
          [milestoneKey]: !currentVal,
        },
      }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your booked projects from shoot to delivery.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/pipeline')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-medium rounded-xl shadow-sm transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Project</span>
        </button>
      </div>

      {/* Search & Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
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

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition cursor-pointer"
          >
            <option value="All Status">All Status</option>
            <option value="Shoot Scheduled">Shoot Scheduled</option>
            <option value="Editing">Editing</option>
            <option value="Album">Album</option>
            <option value="Delivery">Delivery</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100/80 overflow-hidden">
        {filteredProjects.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Kanban className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              {projects.length === 0
                ? 'No projects yet — book a lead from the Pipeline to create one'
                : 'No projects match your filter'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Projects are automatically generated whenever a lead is moved to the "Booked" status in the Sales Pipeline.
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
          /* Projects Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-5">Client</th>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Event Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Progress</th>
                  <th className="py-3.5 px-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredProjects.map((project, idx) => {
                  const initials = project.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2);
                  const colorClass = avatarColors[idx % avatarColors.length];
                  const statusObj = getProjectStatus(project.milestones);
                  const progress = getProjectProgress(project.milestones);

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-slate-50/70 transition-colors"
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
                            <span className="font-semibold text-slate-900 block leading-tight">
                              {project.name}
                            </span>
                            {project.location && (
                              <span className="text-[11px] text-slate-400 font-normal">
                                {project.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Event */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {project.event}
                      </td>

                      {/* Event Date */}
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatEventDate(project.eventDate)}
                      </td>

                      {/* Status Pill */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium leading-normal ${statusObj.colorClass}`}
                        >
                          {statusObj.label}
                        </span>
                      </td>

                      {/* Progress Bar */}
                      <td className="py-3 px-4">
                        <div className="w-36">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 font-medium">
                            <span>{progress.percentage}%</span>
                            <span className="text-[10px] text-slate-400">
                              {progress.completedCount}/{progress.total}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                progress.percentage === 100
                                  ? 'bg-emerald-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* View Action */}
                      <td className="py-3 px-4 text-right pr-6">
                        <button
                          type="button"
                          onClick={() => setSelectedProject(project)}
                          className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 hover:text-amber-700 border border-slate-200/80 rounded-lg text-xs font-medium transition shadow-2xs cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Project Details / Milestone Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{selectedProject.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      getProjectStatus(selectedProject.milestones).colorClass
                    }`}
                  >
                    {getProjectStatus(selectedProject.milestones).label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedProject.event} &bull; {formatEventDate(selectedProject.eventDate)} ({selectedProject.location || 'Studio'})
                </p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Milestone Checklist */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                  Project Milestones
                </h4>
                <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  {MILESTONE_CONFIG.map((milestone, idx) => {
                    const isDone = selectedProject.milestones?.[milestone.key] === true;

                    return (
                      <div
                        key={milestone.key}
                        onClick={() =>
                          handleToggleMilestone(
                            selectedProject.id,
                            milestone.key,
                            isDone
                          )
                        }
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:border-amber-300 transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                              isDone
                                ? 'bg-emerald-500 text-white'
                                : 'border border-slate-300 group-hover:border-amber-400'
                            }`}
                          >
                            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span
                            className={`text-xs font-medium ${
                              isDone ? 'text-slate-800 line-through opacity-70' : 'text-slate-800'
                            }`}
                          >
                            {idx + 1}. {milestone.label}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {isDone ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Commercial & Payment Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                  Payment Summary
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Price</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      ₹{(selectedProject.total || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-emerald-600 uppercase font-semibold">Paid Advance</span>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">
                      ₹{(selectedProject.paid || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                    <span className="text-[10px] text-amber-700 uppercase font-semibold">Remaining</span>
                    <p className="text-xs font-bold text-amber-800 mt-0.5">
                      ₹{Math.max(0, (selectedProject.total || 0) - (selectedProject.paid || 0)).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              {selectedProject.leadId ? (
                <Link
                  to={`/leads/${selectedProject.leadId}`}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  <span>View Original Lead</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
