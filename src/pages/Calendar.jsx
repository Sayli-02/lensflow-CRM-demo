import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Camera,
  MapPin,
  X,
  ExternalLink,
  Phone,
} from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';

// Days of week
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const { leads } = useCrmStore();

  // Current view date state (year and month)
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  // Today's date reference
  const today = new Date();
  const isCurrentMonthView =
    today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  // Month navigation helpers
  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleGoToToday = () => {
    setViewDate(new Date());
  };

  const monthName = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Previous month filler days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthDays - i,
        isCurrentMonth: false,
        dateString: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(
          prevMonthDays - i
        ).padStart(2, '0')}`,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const formattedMonth = String(currentMonth + 1).padStart(2, '0');
      const formattedDay = String(d).padStart(2, '0');
      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateString: `${currentYear}-${formattedMonth}-${formattedDay}`,
        isToday:
          isCurrentMonthView &&
          today.getDate() === d &&
          today.getFullYear() === currentYear &&
          today.getMonth() === currentMonth,
      });
    }

    // Next month filler days to complete 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remainingCells; n++) {
      days.push({
        dayNumber: n,
        isCurrentMonth: false,
        dateString: `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-${String(
          n
        ).padStart(2, '0')}`,
      });
    }

    return days;
  }, [currentYear, currentMonth, isCurrentMonthView]);

  // Map all leads to events keyed by YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = {};

    leads.forEach((lead) => {
      // 1. Shoot / Event Date
      if (lead.eventDate) {
        if (!map[lead.eventDate]) map[lead.eventDate] = [];
        map[lead.eventDate].push({
          id: `shoot-${lead.id}`,
          leadId: lead.id,
          leadName: lead.name,
          phone: lead.phone,
          type: 'shoot',
          title: `${lead.name} — ${lead.event}`,
          event: lead.event,
          location: lead.location,
          status: lead.status,
          date: lead.eventDate,
        });
      }

      // 2. Follow-up reminder date
      if (lead.nextFollowUp) {
        if (!map[lead.nextFollowUp]) map[lead.nextFollowUp] = [];
        map[lead.nextFollowUp].push({
          id: `followup-${lead.id}`,
          leadId: lead.id,
          leadName: lead.name,
          phone: lead.phone,
          type: 'followup',
          title: `Follow-up: ${lead.name}`,
          event: lead.event,
          followUpTime: lead.followUpTime || '2:00 PM',
          status: lead.status,
          date: lead.nextFollowUp,
        });
      }
    });

    return map;
  }, [leads]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Calendar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Schedule and event management.</p>
        </div>

        {/* Month Navigation & Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-4 px-3 py-1.5 bg-white border border-slate-100 rounded-xl shadow-2xs text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-slate-600 font-medium">Follow-up</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <span className="text-slate-600 font-medium">Shoot Day</span>
            </div>
          </div>

          <div className="flex items-center bg-white rounded-xl border border-slate-200/80 p-1 shadow-sm">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 min-w-[120px] text-center">
              {monthName}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoToToday}
            className="px-3.5 py-2 bg-[#FDF3E7] hover:bg-[#faebd7] text-amber-800 text-xs font-semibold rounded-xl border border-amber-200/60 shadow-2xs transition cursor-pointer"
          >
            Today
          </button>
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100/90 overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/60 text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-3">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* 7-Column Month Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100/90">
          {calendarDays.map((day, idx) => {
            const dayEvents = eventsByDate[day.dateString] || [];
            const visibleEvents = dayEvents.slice(0, 2);
            const extraCount = dayEvents.length - 2;

            return (
              <div
                key={`${day.dateString}-${idx}`}
                onClick={() => {
                  if (dayEvents.length > 0) {
                    setSelectedDayEvents({
                      dateString: day.dateString,
                      events: dayEvents,
                    });
                  }
                }}
                className={`min-h-[110px] p-2 flex flex-col justify-between transition group ${
                  !day.isCurrentMonth
                    ? 'bg-slate-50/40 text-slate-300'
                    : 'bg-white text-slate-800'
                } ${
                  day.isToday
                    ? 'ring-2 ring-inset ring-amber-400 bg-amber-50/20'
                    : ''
                } ${
                  dayEvents.length > 0 ? 'cursor-pointer hover:bg-slate-50/80' : ''
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      day.isToday
                        ? 'bg-amber-500 text-white shadow-xs'
                        : day.isCurrentMonth
                        ? 'text-slate-700'
                        : 'text-slate-300'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {dayEvents.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </div>

                {/* Event Chips inside Day Cell */}
                <div className="mt-1 space-y-1">
                  {visibleEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 leading-tight ${
                        evt.type === 'shoot'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/80'
                          : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                      }`}
                      title={evt.title}
                    >
                      {evt.type === 'shoot' ? (
                        <Camera className="w-2.5 h-2.5 flex-shrink-0 text-indigo-600" />
                      ) : (
                        <Clock className="w-2.5 h-2.5 flex-shrink-0 text-amber-600" />
                      )}
                      <span className="truncate">{evt.leadName}</span>
                    </div>
                  ))}

                  {extraCount > 0 && (
                    <div className="text-[10px] font-semibold text-slate-400 pl-1">
                      +{extraCount} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Events Popover Modal */}
      {selectedDayEvents && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {new Date(selectedDayEvents.dateString).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedDayEvents.events.length} event(s) scheduled
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Event Items */}
            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
              {selectedDayEvents.events.map((evt) => (
                <div
                  key={evt.id}
                  className={`p-3.5 rounded-xl border transition ${
                    evt.type === 'shoot'
                      ? 'bg-indigo-50/40 border-indigo-100'
                      : 'bg-amber-50/40 border-amber-200/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {evt.type === 'shoot' ? (
                        <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                          <Camera className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                          <Clock className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{evt.leadName}</h4>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {evt.type === 'shoot' ? `${evt.event} Shoot` : 'Follow-up Call'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        evt.type === 'shoot'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {evt.type === 'shoot' ? 'Shoot' : evt.followUpTime || 'Follow-up'}
                    </span>
                  </div>

                  {evt.location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{evt.location}</span>
                    </div>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex items-center justify-between">
                    {evt.phone && (
                      <a
                        href={`tel:${evt.phone}`}
                        className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{evt.phone}</span>
                      </a>
                    )}
                    <Link
                      to={`/leads/${evt.leadId}`}
                      onClick={() => setSelectedDayEvents(null)}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 ml-auto"
                    >
                      <span>View Lead</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
