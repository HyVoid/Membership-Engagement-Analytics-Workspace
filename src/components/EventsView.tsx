import React, { useState } from 'react';
import { Event, AttendanceLedger, Contact } from '../types';
import { Search, Calendar, DollarSign, Plus, Eye, Edit2, Trash2, Users, Receipt, Percent } from 'lucide-react';

interface EventsViewProps {
  events: Event[];
  contacts: Contact[];
  ledger: AttendanceLedger[];
  onAddEvent: (newEvent: Event) => void;
  onUpdateEvent: (updatedEvent: Event) => void;
  onDeleteEvent: (id: string) => void;
}

export default function EventsView({
  events,
  contacts,
  ledger,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
}: EventsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Selected event for detail cards
  const [selectedEventId, setSelectedEventId] = useState<string | null>(events[0]?.id || null);

  // Form states for adding
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Mixer');
  const [newDate, setNewDate] = useState('2026-07-15');
  const [newPriceMember, setNewPriceMember] = useState(15);
  const [newPriceNonMember, setNewPriceNonMember] = useState(35);

  // Form states for editing
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editPriceMember, setEditPriceMember] = useState(0);
  const [editPriceNonMember, setEditPriceNonMember] = useState(0);

  // Filtered events
  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || e.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Generate event types list for filtering
  const eventTypes = Array.from(new Set(events.map((e) => e.type)));

  // Calculate statistics for each event
  const getEventStats = (eventId: string) => {
    const eventLedger = ledger.filter((l) => l.eventId === eventId);
    const totalRegistered = eventLedger.length;
    const attendedCount = eventLedger.filter((l) => l.attendanceStatus === 'Attended').length;
    const noShowCount = eventLedger.filter((l) => l.attendanceStatus === 'No-Show').length;
    const pendingCount = eventLedger.filter((l) => l.attendanceStatus === 'Registered').length;

    const totalRevenue = eventLedger.reduce((sum, l) => sum + (l.paidAmount || 0), 0);

    const attendanceRate = totalRegistered > 0 ? Math.round((attendedCount / totalRegistered) * 100) : 0;

    return {
      totalRegistered,
      attendedCount,
      noShowCount,
      pendingCount,
      totalRevenue,
      attendanceRate,
      ledgerEntries: eventLedger,
    };
  };

  const selectedStats = selectedEvent ? getEventStats(selectedEvent.id) : null;

  // Form handlers
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    // Auto generate E00x ID
    const maxNum = events.reduce((max, ev) => {
      const num = parseInt(ev.id.replace('E', ''));
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    const newId = `E${String(maxNum + 1).padStart(3, '0')}`;

    const newEvent: Event = {
      id: newId,
      name: newName,
      type: newType,
      date: newDate,
      ticketPriceMember: Number(newPriceMember),
      ticketPriceNonMember: Number(newPriceNonMember),
    };

    onAddEvent(newEvent);
    setNewName('');
    setIsAdding(false);
    setSelectedEventId(newId);
  };

  const startEdit = (ev: Event) => {
    setEditingEventId(ev.id);
    setEditName(ev.name);
    setEditType(ev.type);
    setEditDate(ev.date);
    setEditPriceMember(ev.ticketPriceMember);
    setEditPriceNonMember(ev.ticketPriceNonMember);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEventId || !editName) return;

    const updated: Event = {
      id: editingEventId,
      name: editName,
      type: editType,
      date: editDate,
      ticketPriceMember: Number(editPriceMember),
      ticketPriceNonMember: Number(editPriceNonMember),
    };

    onUpdateEvent(updated);
    setEditingEventId(null);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-up">
      {/* Left 2 Columns: Event Table */}
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-white rounded-[12px] p-6 card-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E8E8E6] gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#051C2C]">Master Events Registry</h2>
              <p className="text-xs text-[#888888] mt-1">
                Establish calendar events, manage ticket configurations, and track attendance success rates.
              </p>
            </div>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#2251FF] hover:bg-[#1a3ecb] rounded-[6px] transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          </div>

          {/* Form to Add Event */}
          {isAdding && (
            <form onSubmit={handleCreateEvent} className="mt-4 p-4 bg-[rgba(5,28,44,0.02)] rounded-[8px] space-y-4 animate-fade-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Annual Charity Luncheon"
                    className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e] focus:outline-none focus:border-[#2251FF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Event Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e] focus:outline-none"
                  >
                    <option value="Mixer">Mixer</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Social">Social</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Member Price ($)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newPriceMember}
                    onChange={(e) => setNewPriceMember(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Non-Member Price ($)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newPriceNonMember}
                    onChange={(e) => setNewPriceNonMember(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e] focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#051C2C] hover:bg-gray-100 rounded-[4px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2251FF] hover:bg-[#1a3ecb] rounded-[4px]"
                >
                  Save Event
                </button>
              </div>
            </form>
          )}

          {/* Form to Edit Event */}
          {editingEventId && (
            <form onSubmit={handleSaveEdit} className="mt-4 p-4 bg-yellow-50 rounded-[8px] space-y-4 border border-yellow-100 animate-fade-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Event Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e] focus:outline-none"
                  >
                    <option value="Mixer">Mixer</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Social">Social</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Member Price ($)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editPriceMember}
                    onChange={(e) => setEditPriceMember(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Non-Member Price ($)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editPriceNonMember}
                    onChange={(e) => setEditPriceNonMember(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e] focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEventId(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#051C2C] hover:bg-gray-100 rounded-[4px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#051C2C] hover:bg-black rounded-[4px]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 my-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#888888]" />
              </span>
              <input
                type="text"
                placeholder="Search by event title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-white text-[#1a1a2e] focus:outline-none focus:border-[#2251FF]"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-white text-[#1a1a2e] focus:outline-none"
            >
              <option value="All">All Types</option>
              {eventTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Events Table */}
          <div className="overflow-x-auto rounded-[8px] border border-[#E8E8E6]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[rgba(5,28,44,0.04)] border-b-2 border-[rgba(5,28,44,0.12)]">
                  <th className="px-4 py-3 text-left font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                    Event Name
                  </th>
                  <th className="px-4 py-3 text-left font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                    Pricing (Mem/Non)
                  </th>
                  <th className="px-4 py-3 text-center font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em] w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E6]">
                {filteredEvents.map((ev, idx) => {
                  const isSelected = selectedEventId === ev.id;
                  return (
                    <tr
                      key={ev.id}
                      onClick={() => setSelectedEventId(ev.id)}
                      className={`cursor-pointer transition-colors hover:bg-[rgba(34,81,255,0.02)] ${
                        isSelected ? 'bg-blue-50/50' : idx % 2 === 0 ? 'bg-[#F5F5F2]/20' : 'bg-white'
                      }`}
                    >
                      <td className="px-4 py-3 text-xs font-mono font-semibold text-[#051C2C]">
                        {ev.id}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-[#051C2C]">
                        {ev.name}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-[#051C2C] border border-gray-200">
                          {ev.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-[#051C2C]">
                        {ev.date}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-mono">
                        ${ev.ticketPriceMember} / ${ev.ticketPriceNonMember}
                      </td>
                      <td className="px-4 py-3 text-center text-xs" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedEventId(ev.id)}
                            className="p-1 text-[#051C2C] hover:bg-gray-100 rounded"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => startEdit(ev)}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete event ${ev.name}? This will also remove its ledger records.`)) {
                                onDeleteEvent(ev.id);
                                if (selectedEventId === ev.id) {
                                  setSelectedEventId(null);
                                }
                              }
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: Event Analytics Panel */}
      <div className="xl:col-span-1">
        {selectedEvent && selectedStats ? (
          <div className="bg-white rounded-[12px] p-6 card-shadow sticky top-24 border-t-4 border-[#051C2C] animate-fade-up space-y-6">
            <div className="pb-4 border-b border-[#E8E8E6]">
              <span className="text-[10px] font-mono font-semibold text-[#888888] uppercase tracking-wider">
                Event Performance Dashboard
              </span>
              <h3 className="font-serif text-xl font-bold text-[#051C2C] mt-1">
                {selectedEvent.name}
              </h3>
              <div className="text-xs text-[#888888] mt-1">
                Date: <span className="font-semibold text-[#051C2C]">{selectedEvent.date}</span> · 
                Type: <span className="font-semibold text-[#051C2C]">{selectedEvent.type}</span>
              </div>
            </div>

            {/* Price points banner */}
            <div className="flex justify-between p-3 bg-gray-50 rounded-[8px] text-xs">
              <div>
                <span className="text-[#888888] block">Member Price</span>
                <span className="font-serif text-lg font-bold text-[#051C2C]">${selectedEvent.ticketPriceMember}</span>
              </div>
              <div className="border-r border-[#E8E8E6]"></div>
              <div>
                <span className="text-[#888888] block">Non-Member Price</span>
                <span className="font-serif text-lg font-bold text-[#051C2C]">${selectedEvent.ticketPriceNonMember}</span>
              </div>
            </div>

            {/* Stats Grids */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[rgba(5,28,44,0.02)] p-3 rounded-[8px] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#888888] font-semibold uppercase tracking-wider">Revenue</div>
                  <div className="font-serif text-xl font-bold text-[#2251FF] mt-0.5">
                    ${selectedStats.totalRevenue}
                  </div>
                </div>
                <Receipt className="w-5 h-5 text-[#2251FF] opacity-60" />
              </div>

              <div className="bg-[rgba(5,28,44,0.02)] p-3 rounded-[8px] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#888888] font-semibold uppercase tracking-wider">Attended</div>
                  <div className="font-serif text-xl font-bold text-[#00C853] mt-0.5">
                    {selectedStats.attendedCount} / {selectedStats.totalRegistered}
                  </div>
                </div>
                <Users className="w-5 h-5 text-[#00C853] opacity-60" />
              </div>

              <div className="bg-[rgba(5,28,44,0.02)] p-3 rounded-[8px] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#888888] font-semibold uppercase tracking-wider">Attendance Rate</div>
                  <div className="font-serif text-xl font-bold text-[#051C2C] mt-0.5">
                    {selectedStats.attendanceRate}%
                  </div>
                </div>
                <Percent className="w-5 h-5 text-[#051C2C] opacity-60" />
              </div>

              <div className="bg-[rgba(5,28,44,0.02)] p-3 rounded-[8px] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#888888] font-semibold uppercase tracking-wider">No-Shows</div>
                  <div className="font-serif text-xl font-bold text-red-600 mt-0.5">
                    {selectedStats.noShowCount}
                  </div>
                </div>
                <Users className="w-5 h-5 text-red-600 opacity-60" />
              </div>
            </div>

            {/* List of Attendees registered for this event */}
            <div>
              <h4 className="font-serif text-xs font-bold text-[#051C2C] mb-3 uppercase tracking-wider border-b pb-1">
                Attendees Sign-In Roster
              </h4>
              {selectedStats.ledgerEntries.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#888888]">No attendees registered yet for this event.</div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {selectedStats.ledgerEntries.map((item) => {
                    const contact = contacts.find((c) => c.id === item.contactId);
                    return (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-[6px] bg-[#F5F5F2] flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-semibold text-[#051C2C]">
                            {contact?.name || 'Unknown Attendee'}
                          </div>
                          <div className="text-[9px] text-[#888888]">
                            Payer: {item.purchaserName || 'Self'}
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                              item.attendanceStatus === 'Attended'
                                ? 'bg-green-100 text-green-700'
                                : item.attendanceStatus === 'No-Show'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {item.attendanceStatus}
                          </span>
                          <div className="text-[9px] text-[#888888] mt-0.5 font-mono">
                            ${item.paidAmount}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[12px] p-8 text-center text-xs text-[#888888] card-shadow">
            Select an event to load detailed sign-in rosters, check collected revenue, and audit attendance status.
          </div>
        )}
      </div>
    </div>
  );
}
