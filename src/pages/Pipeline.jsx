import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  LayoutGrid,
  List,
  Plus,
  Calendar,
  IndianRupee,
  GripVertical,
} from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';
import { STATUSES, STATUS_COLORS, STATUS_BAR_COLORS } from '../data/mockData';

// Avatar Colors Palette
const AVATAR_COLORS = [
  'bg-amber-100 text-amber-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
];

// Helper: Format Date
function formatEventDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Single Draggable Lead Card Component
function SortableLeadCard({ lead, index, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id, data: { lead } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const initials = lead.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(lead.id)}
      className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100/90 hover:border-amber-200 hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none group relative"
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 mt-0.5 ${colorClass}`}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition truncate">
              {lead.name}
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 font-normal mt-0.5 truncate">
            {lead.event}
          </p>
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-50 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-medium text-slate-500">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formatEventDate(lead.eventDate)}
            </span>
            {lead.budget > 0 && (
              <span className="font-semibold text-slate-700">
                ₹{(lead.quotation || lead.budget).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Drag Overlay Card (Lifted State Preview)
function LeadCardPreview({ lead }) {
  if (!lead) return null;
  const initials = lead.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);

  return (
    <div className="bg-white rounded-xl p-3.5 shadow-xl border-2 border-amber-400 scale-105 rotate-1 cursor-grabbing z-50 w-64 select-none">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-semibold text-xs flex-shrink-0 mt-0.5">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-900 truncate">{lead.name}</h4>
          <p className="text-[11px] text-slate-500 font-normal mt-0.5 truncate">{lead.event}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-medium text-slate-500">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formatEventDate(lead.eventDate)}
            </span>
            {lead.budget > 0 && (
              <span className="font-semibold text-slate-700">
                ₹{(lead.quotation || lead.budget).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Droppable Kanban Column Component
function KanbanColumn({ stage, leads, onCardClick, onAddLeadClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: { stage },
  });

  const columnBg =
    stage === 'Booked'
      ? 'bg-emerald-50/30 border-emerald-100/60'
      : stage === 'Negotiation'
      ? 'bg-purple-50/20 border-purple-100/50'
      : 'bg-slate-100/50 border-slate-200/60';

  const leadIds = useMemo(() => leads.map((l) => l.id), [leads]);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl border p-3 min-w-[240px] max-w-[280px] flex-1 transition-colors duration-150 ${columnBg} ${
        isOver ? 'ring-2 ring-amber-400/80 bg-amber-50/40 border-amber-300' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: STATUS_BAR_COLORS[stage] || '#94A3B8' }}
          />
          <h3 className="text-xs font-bold text-slate-800 tracking-tight">{stage}</h3>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200/60 shadow-2xs">
          {leads.length}
        </span>
      </div>

      {/* Cards Area with vertical scroll if overflow */}
      <div className="flex-1 overflow-y-auto space-y-2.5 min-h-[140px] pr-0.5">
        <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
          {leads.map((lead, idx) => (
            <SortableLeadCard
              key={lead.id}
              lead={lead}
              index={idx}
              onClick={onCardClick}
            />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="h-24 border-2 border-dashed border-slate-200/80 rounded-xl flex items-center justify-center text-[11px] text-slate-400">
            Drop leads here
          </div>
        )}
      </div>

      {/* Column Footer: Ghost Add Lead Button */}
      <div className="pt-3 mt-1 border-t border-slate-200/50">
        <button
          type="button"
          onClick={() => onAddLeadClick(stage)}
          className="w-full py-1.5 px-3 rounded-xl border border-dashed border-slate-300/80 hover:border-amber-400 bg-white/60 hover:bg-white text-slate-500 hover:text-amber-700 text-xs font-medium transition flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Lead</span>
        </button>
      </div>
    </div>
  );
}

export default function Pipeline() {
  const navigate = useNavigate();
  const { leads, updateLeadStatus } = useCrmStore();
  const [activeLeadId, setActiveLeadId] = useState(null);
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'list'

  // Drag Sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Avoid accidental drags when clicking
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Group leads by stage
  const columnsData = useMemo(() => {
    const grouped = {};
    STATUSES.forEach((status) => {
      grouped[status] = leads.filter((lead) => lead.status === status);
    });
    return grouped;
  }, [leads]);

  const activeLead = useMemo(() => {
    return leads.find((l) => l.id === activeLeadId) || null;
  }, [leads, activeLeadId]);

  const handleDragStart = (event) => {
    setActiveLeadId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveLeadId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find destination stage
    let destinationStage = null;

    if (STATUSES.includes(overId)) {
      destinationStage = overId;
    } else {
      // over is another card, find its lead and status
      const overLead = leads.find((l) => l.id === overId);
      if (overLead) {
        destinationStage = overLead.status;
      }
    }

    if (destinationStage) {
      const currentLead = leads.find((l) => l.id === activeId);
      if (currentLead && currentLead.status !== destinationStage) {
        // Instantly update lead status (will auto-create project if moved to 'Booked')
        updateLeadStatus(activeId, destinationStage);
      }
    }
  };

  const handleCardClick = (leadId) => {
    navigate(`/leads/${leadId}`);
  };

  const handleAddLeadToStage = (stage) => {
    navigate('/leads');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-100px)]">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Pipeline</h1>
          <p className="text-sm text-slate-500 mt-0.5">Drag and drop leads to update their status.</p>
        </div>

        {/* View Toggle Button Group */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-white rounded-xl border border-slate-200/80 p-1 shadow-sm text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                viewMode === 'board'
                  ? 'bg-amber-50 text-amber-800 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className={`w-3.5 h-3.5 ${viewMode === 'board' ? 'text-amber-600' : 'text-slate-400'}`} />
              <span>Board View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-amber-50 text-amber-800 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className={`w-3.5 h-3.5 ${viewMode === 'list' ? 'text-amber-600' : 'text-slate-400'}`} />
              <span>List View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Kanban Columns Container */}
      {viewMode === 'board' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto pb-4 flex items-stretch gap-4 min-h-0">
            {STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                stage={status}
                leads={columnsData[status] || []}
                onCardClick={handleCardClick}
                onAddLeadClick={handleAddLeadToStage}
              />
            ))}
          </div>

          <DragOverlay>
            {activeLead ? <LeadCardPreview lead={activeLead} /> : null}
          </DragOverlay>
        </DndContext>
      ) : (
        /* List View alternative */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            {STATUSES.map((status) => {
              const stageLeads = columnsData[status] || [];
              const statusPillClass = STATUS_COLORS[status] || 'bg-slate-100 text-slate-700';

              return (
                <div key={status} className="border-b border-slate-100 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusPillClass}`}>
                        {status}
                      </span>
                      <span className="text-xs text-slate-400">({stageLeads.length} leads)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => navigate(`/leads/${lead.id}`)}
                        className="p-2.5 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-slate-50/60 transition cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">{lead.name}</div>
                          <div className="text-[11px] text-slate-400">{lead.event} &bull; {formatEventDate(lead.eventDate)}</div>
                        </div>
                        {lead.budget > 0 && (
                          <div className="text-xs font-semibold text-slate-700">
                            ₹{(lead.quotation || lead.budget).toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
