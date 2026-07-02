import React, { useState } from 'react';
import { Contact, Event, AttendanceLedger } from '../types';
import { Plus, Users, Search, Calendar, User, DollarSign, Trash2, Edit2, Check, AlertCircle } from 'lucide-react';

interface LedgerViewProps {
  ledger: AttendanceLedger[];
  contacts: Contact[];
  events: Event[];
  onAddLedger: (newLedger: AttendanceLedger) => void;
  onAddLedgers: (newLedgers: AttendanceLedger[]) => void;
  onUpdateLedger: (updatedLedger: AttendanceLedger) => void;
  onDeleteLedger: (id: string) => void;
}

export default function LedgerView({
  ledger,
  contacts,
  events,
  onAddLedger,
  onAddLedgers,
  onUpdateLedger,
  onDeleteLedger,
}: LedgerViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEventId, setFilterEventId] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Form states for Single Sign-in
  const [isAdding, setIsAdding] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false); // Toggle split purchase mode

  // Single form states
  const [selectedContactId, setSelectedContactId] = useState(contacts[0]?.id || '');
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '');
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceLedger['attendanceStatus']>('Attended');
  const [ticketType, setTicketType] = useState<AttendanceLedger['ticketType']>('Paid');
  const [purchaserName, setPurchaserName] = useState('');
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // Bulk / Split Purchase states
  const [bulkEventId, setBulkEventId] = useState(events[0]?.id || '');
  const [bulkPurchaserId, setBulkPurchaserId] = useState(contacts[0]?.id || '');
  const [bulkAttendeesIds, setBulkAttendeesIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<AttendanceLedger['attendanceStatus']>('Registered');

  // In-place editing states
  const [editingLedgerId, setEditingLedgerId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceLedger['attendanceStatus']>('Attended');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editPurchaser, setEditPurchaser] = useState('');

  // Handle contact or event changes to auto-populate prices
  const updatePriceForSingle = (cId: string, eId: string, tType: AttendanceLedger['ticketType']) => {
    const contact = contacts.find((c) => c.id === cId);
    const event = events.find((e) => e.id === eId);
    if (!contact || !event) return;

    if (tType === 'Free') {
      setPaidAmount(0);
    } else {
      const isMember = contact.memberStatus !== 'Non-Member';
      setPaidAmount(isMember ? event.ticketPriceMember : event.ticketPriceNonMember);
    }
  };

  const handleContactChange = (cId: string) => {
    setSelectedContactId(cId);
    updatePriceForSingle(cId, selectedEventId, ticketType);
    // Auto populate purchaser name as self by default
    const contact = contacts.find((c) => c.id === cId);
    if (contact) {
      setPurchaserName(contact.name);
    }
  };

  const handleEventChange = (eId: string) => {
    setSelectedEventId(eId);
    updatePriceForSingle(selectedContactId, eId, ticketType);
  };

  const handleTicketTypeChange = (type: AttendanceLedger['ticketType']) => {
    setTicketType(type);
    updatePriceForSingle(selectedContactId, selectedEventId, type);
  };

  // Handlers for bulk list selection
  const handleToggleAttendee = (cId: string) => {
    if (bulkAttendeesIds.includes(cId)) {
      setBulkAttendeesIds(bulkAttendeesIds.filter((id) => id !== cId));
    } else {
      setBulkAttendeesIds([...bulkAttendeesIds, cId]);
    }
  };

  // Submit single sign-in
  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContactId || !selectedEventId) return;

    // Check if attendance already exists
    const exists = ledger.find((l) => l.contactId === selectedContactId && l.eventId === selectedEventId);
    if (exists) {
      alert('This attendee is already registered or signed-in for this event!');
      return;
    }

    const maxNum = ledger.reduce((max, item) => {
      const num = parseInt(item.id.replace('L', ''));
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    const newId = `L${String(maxNum + 1).padStart(3, '0')}`;

    const newEntry: AttendanceLedger = {
      id: newId,
      contactId: selectedContactId,
      eventId: selectedEventId,
      attendanceStatus,
      ticketType,
      purchaserName: purchaserName || contacts.find((c) => c.id === selectedContactId)?.name || 'Anonymous',
      paidAmount: Number(paidAmount),
    };

    onAddLedger(newEntry);
    setIsAdding(false);
  };

  // Submit bulk purchase / group split booking
  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkEventId || !bulkPurchaserId || bulkAttendeesIds.length === 0) {
      alert('Please configure event, payer, and select at least one actual attendee.');
      return;
    }

    const event = events.find((ev) => ev.id === bulkEventId);
    const purchaser = contacts.find((c) => c.id === bulkPurchaserId);
    if (!event || !purchaser) return;

    const newLedgers: AttendanceLedger[] = [];
    let maxNum = ledger.reduce((max, item) => {
      const num = parseInt(item.id.replace('L', ''));
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);

    bulkAttendeesIds.forEach((attendeeId) => {
      // Check if already registered
      const alreadyRegistered = ledger.find((l) => l.contactId === attendeeId && l.eventId === bulkEventId);
      if (alreadyRegistered) return; // skip duplicate

      maxNum += 1;
      const attendee = contacts.find((c) => c.id === attendeeId);
      if (!attendee) return;

      const isMember = attendee.memberStatus !== 'Non-Member';
      const ticketCost = isMember ? event.ticketPriceMember : event.ticketPriceNonMember;

      newLedgers.push({
        id: `L${String(maxNum).padStart(3, '0')}`,
        contactId: attendeeId,
        eventId: bulkEventId,
        attendanceStatus: bulkStatus,
        ticketType: ticketCost > 0 ? 'Paid' : 'Free',
        purchaserName: purchaser.name,
        paidAmount: ticketCost,
      });
    });

    if (newLedgers.length === 0) {
      alert('All selected contacts are already registered for this event.');
      return;
    }

    onAddLedgers(newLedgers);
    setIsAdding(false);
    setBulkAttendeesIds([]);
    alert(`Successfully generated ${newLedgers.length} split attendee records paid for by ${purchaser.name}!`);
  };

  // Filter ledger list
  const filteredLedger = ledger.filter((item) => {
    const contact = contacts.find((c) => c.id === item.contactId);
    const event = events.find((e) => e.id === item.eventId);
    if (!contact || !event) return false;

    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.purchaserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEvent = filterEventId === 'All' || item.eventId === filterEventId;
    const matchesStatus = filterStatus === 'All' || item.attendanceStatus === filterStatus;

    return matchesSearch && matchesEvent && matchesStatus;
  });

  // Calculate stats on filtered list
  const filteredRevenue = filteredLedger.reduce((sum, item) => sum + (item.paidAmount || 0), 0);

  // Quick edit helpers
  const startEdit = (item: AttendanceLedger) => {
    setEditingLedgerId(item.id);
    setEditStatus(item.attendanceStatus);
    setEditAmount(item.paidAmount);
    setEditPurchaser(item.purchaserName);
  };

  const saveEdit = (item: AttendanceLedger) => {
    onUpdateLedger({
      ...item,
      attendanceStatus: editStatus,
      paidAmount: Number(editAmount),
      purchaserName: editPurchaser,
    });
    setEditingLedgerId(null);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Section */}
      <div className="bg-white rounded-[12px] p-6 card-shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-[#E8E8E6] gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#051C2C]">Individual Attendance Ledger</h2>
            <p className="text-xs text-[#888888] mt-1">
              Avoid multi-ticket booking data losses. Split bulk registrations from platforms like DonorBox into distinct attendee ledger rows.
            </p>
          </div>
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setIsBulkMode(false);
            }}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#2251FF] hover:bg-[#1a3ecb] rounded-[6px] transition-all flex items-center gap-1.5 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Sign-In
          </button>
        </div>

        {/* Form Container (Supports single or bulk modes) */}
        {isAdding && (
          <div className="mt-6 p-6 bg-gray-50 rounded-[10px] space-y-6 border border-[#E8E8E6] animate-fade-up">
            <div className="flex border-b border-[#E8E8E6] pb-2">
              <button
                type="button"
                onClick={() => setIsBulkMode(false)}
                className={`pb-2 px-4 text-xs font-semibold border-b-2 transition-all ${
                  !isBulkMode ? 'border-[#2251FF] text-[#2251FF]' : 'border-transparent text-[#888888]'
                }`}
              >
                Single Attendee Sign-In
              </button>
              <button
                type="button"
                onClick={() => setIsBulkMode(true)}
                className={`pb-2 px-4 text-xs font-semibold border-b-2 transition-all ${
                  isBulkMode ? 'border-[#2251FF] text-[#2251FF]' : 'border-transparent text-[#888888]'
                }`}
              >
                Bulk Group Booking (DonorBox Split Solution)
              </button>
            </div>

            {/* A. Single Mode Form */}
            {!isBulkMode ? (
              <form onSubmit={handleSingleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">
                      Attendee Contact
                    </label>
                    <select
                      value={selectedContactId}
                      onChange={(e) => handleContactChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] focus:outline-none"
                    >
                      <option value="" disabled>Select contact...</option>
                      {contacts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.memberStatus})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">
                      Event Title
                    </label>
                    <select
                      value={selectedEventId}
                      onChange={(e) => handleEventChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] focus:outline-none"
                    >
                      <option value="" disabled>Select event...</option>
                      {events.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.date})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">
                      Attendance Sign-In Status
                    </label>
                    <select
                      value={attendanceStatus}
                      onChange={(e) => setAttendanceStatus(e.target.value as AttendanceLedger['attendanceStatus'])}
                      className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] focus:outline-none"
                    >
                      <option value="Attended">Attended (Signed In)</option>
                      <option value="Registered">Registered (Upcoming)</option>
                      <option value="No-Show">No-Show (Absent)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">
                      Ticket Status
                    </label>
                    <select
                      value={ticketType}
                      onChange={(e) => handleTicketTypeChange(e.target.value as AttendanceLedger['ticketType'])}
                      className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] focus:outline-none"
                    >
                      <option value="Paid">Paid Ticket</option>
                      <option value="Free">Free Ticket</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">
                      Purchased / Booked By
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tom Henderson"
                      value={purchaserName}
                      onChange={(e) => setPurchaserName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">
                      Actual Payment Amount ($)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#051C2C] hover:bg-gray-200 rounded-[4px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2251FF] hover:bg-[#1a3ecb] rounded-[4px]"
                  >
                    Confirm Registration
                  </button>
                </div>
              </form>
            ) : (
              /* B. Bulk Split Mode Form */
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div className="p-4 bg-blue-50/50 rounded-[8px] border-l-4 border-[#2251FF] mb-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#2251FF] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#051C2C] leading-relaxed">
                    <strong>Payer & Attendees Splitting Mechanism:</strong> This feature solves "多人代报名". Select who paid for the purchase (e.g., DonorBox donor) and select the multiple actual members or guest contacts who are attending. The system will automatically split and log individual attendance records, preventing data losses.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">
                      Event To Book
                    </label>
                    <select
                      value={bulkEventId}
                      onChange={(e) => setBulkEventId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] focus:outline-none"
                    >
                      {events.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} (${e.ticketPriceMember} Mem / ${e.ticketPriceNonMember} Non-Mem)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">
                      Who Paid / Purchased (Payer)
                    </label>
                    <select
                      value={bulkPurchaserId}
                      onChange={(e) => setBulkPurchaserId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] focus:outline-none"
                    >
                      {contacts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">
                      Sign-In Status
                    </label>
                    <select
                      value={bulkStatus}
                      onChange={(e) => setBulkStatus(e.target.value as AttendanceLedger['attendanceStatus'])}
                      className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] focus:outline-none"
                    >
                      <option value="Registered">Registered (Upcoming)</option>
                      <option value="Attended">Attended (Direct Sign-In)</option>
                    </select>
                  </div>
                </div>

                {/* Multiple Attendee Selector Grid */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider">
                    Select Actual Attendees (Check All That Apply)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white p-4 rounded-[8px] border border-[#E8E8E6] max-h-56 overflow-y-auto">
                    {contacts.map((c) => {
                      const isSelected = bulkAttendeesIds.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className={`flex items-center gap-2 p-2 rounded-[6px] cursor-pointer border transition-all hover-scale ${
                            isSelected
                              ? 'bg-blue-50 border-[#2251FF] text-[#2251FF]'
                              : 'bg-white border-gray-200 text-[#051C2C]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleAttendee(c.id)}
                            className="rounded text-[#2251FF] focus:ring-[#2251FF] w-3.5 h-3.5"
                          />
                          <div className="text-xs truncate">
                            <span className="font-semibold">{c.name}</span>
                            <span className="text-[10px] block opacity-75">{c.memberStatus}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#051C2C] hover:bg-gray-200 rounded-[4px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bulkAttendeesIds.length === 0}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#051C2C] hover:bg-black rounded-[4px] disabled:opacity-50"
                  >
                    Generate {bulkAttendeesIds.length} Split Registrations
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Main Ledger Table Cards */}
      <div className="bg-white rounded-[12px] p-6 card-shadow space-y-4">
        {/* Search, Filter, and Metric Row */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#888888]" />
              </span>
              <input
                type="text"
                placeholder="Search attendee, event, or purchaser..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-white text-[#1a1a2e] focus:outline-none focus:border-[#2251FF]"
              />
            </div>
            <select
              value={filterEventId}
              onChange={(e) => setFilterEventId(e.target.value)}
              className="px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-white text-[#1a1a2e] focus:outline-none"
            >
              <option value="All">All Events</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-white text-[#1a1a2e] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Attended">Attended (Signed In)</option>
              <option value="Registered">Registered</option>
              <option value="No-Show">No-Show</option>
            </select>
          </div>

          {/* Quick Filter Metrics */}
          <div className="bg-[#051C2C] text-white p-3 rounded-[8px] flex items-center justify-between gap-6 px-5 lg:self-start">
            <div>
              <span className="text-[10px] text-gray-300 font-semibold uppercase tracking-wider block">Ledger Rows</span>
              <span className="font-serif text-lg font-bold">{filteredLedger.length} Records</span>
            </div>
            <div className="w-px h-8 bg-gray-700"></div>
            <div>
              <span className="text-[10px] text-gray-300 font-semibold uppercase tracking-wider block">Ledger Revenue</span>
              <span className="font-serif text-lg font-bold text-[#2251FF]">${filteredRevenue}</span>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-[8px] border border-[#E8E8E6]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[rgba(5,28,44,0.04)] border-b-2 border-[rgba(5,28,44,0.12)]">
                <th className="px-4 py-3 text-left font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                  ID
                </th>
                <th className="px-4 py-3 text-left font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                  Actual Attendee
                </th>
                <th className="px-4 py-3 text-left font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                  Event Description
                </th>
                <th className="px-4 py-3 text-left font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                  Ticket Type
                </th>
                <th className="px-4 py-3 text-left font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                  Payer / Purchaser
                </th>
                <th className="px-4 py-3 text-right font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                  Amount Paid
                </th>
                <th className="px-4 py-3 text-center font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em] w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E6]">
              {filteredLedger.map((item, idx) => {
                const contact = contacts.find((c) => c.id === item.contactId);
                const event = events.find((e) => e.id === item.eventId);
                const isEditing = editingLedgerId === item.id;

                if (!contact || !event) return null;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-[rgba(34,81,255,0.01)] transition-colors ${
                      idx % 2 === 0 ? 'bg-[#F5F5F2]/20' : 'bg-white'
                    }`}
                  >
                    <td className="px-4 py-3.5 text-xs font-mono font-semibold text-[#051C2C]">
                      {item.id}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-medium text-[#051C2C]">{contact.name}</div>
                      <div className="text-[10px] text-[#888888]">{contact.memberStatus}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-medium text-[#051C2C]">{event.name}</div>
                      <div className="text-[10px] text-[#888888]">{event.date} · {event.type}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#051C2C]">
                      {item.ticketType}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#051C2C]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editPurchaser}
                          onChange={(e) => setEditPurchaser(e.target.value)}
                          className="px-2 py-1 text-xs border border-gray-300 rounded bg-[#FFFDE7]"
                        />
                      ) : (
                        <div className="flex flex-col">
                          <span className="font-medium">{item.purchaserName}</span>
                          {item.purchaserName !== contact.name && (
                            <span className="text-[9px] text-[#2251FF] font-semibold bg-blue-50 px-1 rounded self-start mt-0.5">
                              Split Purchase Row
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs font-mono font-medium text-[#051C2C]">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(Number(e.target.value))}
                          className="px-2 py-1 text-xs border border-gray-300 rounded bg-[#FFFDE7] w-16 text-right"
                        />
                      ) : (
                        `$${item.paidAmount}`
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center text-xs">
                      {isEditing ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as AttendanceLedger['attendanceStatus'])}
                          className="px-2 py-1 text-xs border border-gray-300 rounded bg-[#FFFDE7]"
                        >
                          <option value="Attended">Attended</option>
                          <option value="Registered">Registered</option>
                          <option value="No-Show">No-Show</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.attendanceStatus === 'Attended'
                              ? 'bg-green-50 text-green-700 border border-green-100'
                              : item.attendanceStatus === 'No-Show'
                              ? 'bg-red-50 text-red-600 border border-red-100'
                              : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}
                        >
                          {item.attendanceStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center text-xs">
                      <div className="flex items-center justify-center gap-1.5">
                        {isEditing ? (
                          <button
                            onClick={() => saveEdit(item)}
                            className="p-1 text-[#00C853] hover:bg-green-50 rounded"
                            title="Save Row"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                            title="Edit Row"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Delete this ledger record permanently? This will affect calculations.')) {
                              onDeleteLedger(item.id);
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Row"
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
  );
}
