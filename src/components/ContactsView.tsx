import React, { useState } from 'react';
import { Contact, Event, AttendanceLedger, CalculatedContactMetric } from '../types';
import { Search, UserPlus, Eye, Edit2, Trash2, Mail, Calendar, Sparkles, X, ChevronRight } from 'lucide-react';

interface ContactsViewProps {
  contacts: Contact[];
  events: Event[];
  ledger: AttendanceLedger[];
  metrics: CalculatedContactMetric[];
  onAddContact: (newContact: Contact) => void;
  onUpdateContact: (updatedContact: Contact) => void;
  onDeleteContact: (id: string) => void;
}

export default function ContactsView({
  contacts,
  events,
  ledger,
  metrics,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
}: ContactsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  // Selected contact for detail drawer / side-card
  const [selectedContactId, setSelectedContactId] = useState<string | null>(contacts[0]?.id || null);

  // Form states for adding
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStatus, setNewStatus] = useState<Contact['memberStatus']>('Regular Member');
  const [newJoinDate, setNewJoinDate] = useState('2026-01-01');

  // Form states for editing
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState<Contact['memberStatus']>('Regular Member');
  const [editJoinDate, setEditJoinDate] = useState('');

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || c.memberStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const selectedContact = contacts.find((c) => c.id === selectedContactId);
  const selectedMetric = metrics.find((m) => m.contactId === selectedContactId);

  // Get participation ledger for selected contact
  const selectedContactLedger = selectedContactId
    ? ledger.filter((l) => l.contactId === selectedContactId)
    : [];

  // Sort contact ledger descending by event date
  const sortedLedgerWithEvents = selectedContactLedger
    .map((l) => {
      const event = events.find((e) => e.id === l.eventId);
      return { ledger: l, event };
    })
    .filter((item) => item.event !== undefined)
    .sort((a, b) => new Date(b.event!.date).getTime() - new Date(a.event!.date).getTime());

  // Form handlers
  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    // Auto generate C00x ID
    const maxNum = contacts.reduce((max, c) => {
      const num = parseInt(c.id.replace('C', ''));
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    const newId = `C${String(maxNum + 1).padStart(3, '0')}`;

    const newContact: Contact = {
      id: newId,
      name: newName,
      email: newEmail,
      memberStatus: newStatus,
      joinDate: newJoinDate,
    };

    onAddContact(newContact);
    
    // Reset
    setNewName('');
    setNewEmail('');
    setNewStatus('Regular Member');
    setIsAdding(false);
    setSelectedContactId(newId); // select newly created
  };

  const startEdit = (contact: Contact) => {
    setEditingContactId(contact.id);
    setEditName(contact.name);
    setEditEmail(contact.email);
    setEditStatus(contact.memberStatus);
    setEditJoinDate(contact.joinDate);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContactId || !editName || !editEmail) return;

    const updated: Contact = {
      id: editingContactId,
      name: editName,
      email: editEmail,
      memberStatus: editStatus,
      joinDate: editJoinDate,
    };

    onUpdateContact(updated);
    setEditingContactId(null);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-up">
      {/* Left 2 Columns: Contacts List Table */}
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-white rounded-[12px] p-6 card-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E8E8E6] gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#051C2C]">Master Contacts Database</h2>
              <p className="text-xs text-[#888888] mt-1">
                Maintain individual attendee records, membership statuses, and track active conversion candidates.
              </p>
            </div>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#2251FF] hover:bg-[#1a3ecb] rounded-[6px] transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              Add Contact
            </button>
          </div>

          {/* Form to Add Contact */}
          {isAdding && (
            <form onSubmit={handleCreateContact} className="mt-4 p-4 bg-[rgba(5,28,44,0.02)] rounded-[8px] space-y-4 animate-fade-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Sarah Smith"
                    className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e] focus:outline-none focus:border-[#2251FF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. sarah@example.com"
                    className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e] focus:outline-none focus:border-[#2251FF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Membership Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as Contact['memberStatus'])}
                    className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e] focus:outline-none"
                  >
                    <option value="Regular Member">Regular Member</option>
                    <option value="Premium Member">Premium Member</option>
                    <option value="Non-Member">Non-Member</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Join / Created Date</label>
                  <input
                    type="date"
                    required
                    value={newJoinDate}
                    onChange={(e) => setNewJoinDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e] focus:outline-none focus:border-[#2251FF]"
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
                  Save Contact
                </button>
              </div>
            </form>
          )}

          {/* Form to Edit Contact */}
          {editingContactId && (
            <form onSubmit={handleSaveEdit} className="mt-4 p-4 bg-yellow-50 rounded-[8px] space-y-4 animate-fade-up border border-yellow-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Membership Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Contact['memberStatus'])}
                    className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e] focus:outline-none"
                  >
                    <option value="Regular Member">Regular Member</option>
                    <option value="Premium Member">Premium Member</option>
                    <option value="Non-Member">Non-Member</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Join Date</label>
                  <input
                    type="date"
                    required
                    value={editJoinDate}
                    onChange={(e) => setEditJoinDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e] focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingContactId(null)}
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
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-white text-[#1a1a2e] focus:outline-none focus:border-[#2251FF]"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-white text-[#1a1a2e] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Regular Member">Regular Member</option>
              <option value="Premium Member">Premium Member</option>
              <option value="Non-Member">Non-Member</option>
            </select>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-[8px] border border-[#E8E8E6]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[rgba(5,28,44,0.04)] border-b-2 border-[rgba(5,28,44,0.12)]">
                  <th className="px-4 py-3 text-left font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                    Attendances
                  </th>
                  <th className="px-4 py-3 text-right font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                    Score
                  </th>
                  <th className="px-4 py-3 text-center font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em] w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E6]">
                {filteredContacts.map((contact, idx) => {
                  const m = metrics.find((met) => met.contactId === contact.id);
                  const isSelected = selectedContactId === contact.id;

                  return (
                    <tr
                      key={contact.id}
                      onClick={() => setSelectedContactId(contact.id)}
                      className={`cursor-pointer transition-colors hover:bg-[rgba(34,81,255,0.02)] ${
                        isSelected ? 'bg-blue-50/50' : idx % 2 === 0 ? 'bg-[#F5F5F2]/20' : 'bg-white'
                      }`}
                    >
                      <td className="px-4 py-3 text-xs font-mono font-semibold text-[#051C2C]">
                        {contact.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-[#051C2C]">{contact.name}</div>
                        <div className="text-[11px] text-[#888888]">{contact.email}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            contact.memberStatus === 'Premium Member'
                              ? 'bg-purple-50 text-purple-700 border border-purple-100'
                              : contact.memberStatus === 'Regular Member'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {contact.memberStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-mono">
                        {m?.totalAttendances || 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-xs font-mono font-semibold text-[#051C2C]">
                            {m?.engagementScore || 0}
                          </span>
                          {/* Mini inline indicator bar */}
                          <div className="w-12 h-1.5 bg-[rgba(5,28,44,0.1)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#2251FF] rounded-full"
                              style={{ width: `${m?.engagementScore || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-xs" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedContactId(contact.id)}
                            title="View Personal ledger"
                            className="p-1 text-[#051C2C] hover:bg-gray-100 rounded"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => startEdit(contact)}
                            title="Edit Contact"
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete contact ${contact.name}?`)) {
                                onDeleteContact(contact.id);
                                if (selectedContactId === contact.id) {
                                  setSelectedContactId(null);
                                }
                              }
                            }}
                            title="Delete Contact"
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

      {/* Right Column: Master Profile Ledger Side Panel */}
      <div className="xl:col-span-1 space-y-6">
        {selectedContact && selectedMetric ? (
          <div className="bg-white rounded-[12px] p-6 card-shadow sticky top-24 border-t-4 border-[#2251FF] animate-fade-up">
            <div className="flex items-start justify-between pb-4 border-b border-[#E8E8E6]">
              <div>
                <span className="text-[10px] font-mono font-semibold text-[#888888]">
                  {selectedContact.id} · Member Since {selectedContact.joinDate}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#051C2C] mt-1">
                  {selectedContact.name}
                </h3>
                <p className="text-xs text-[#888888] flex items-center gap-1 mt-1">
                  <Mail className="w-3 h-3" />
                  {selectedContact.email}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  selectedMetric.churnStatus === 'Active'
                    ? 'bg-[#00C853]/10 text-[#00C853]'
                    : selectedMetric.churnStatus === 'Slipping'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {selectedMetric.churnStatus}
              </span>
            </div>

            {/* Metric Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 my-6">
              <div className="bg-[rgba(5,28,44,0.02)] p-3 rounded-[8px]">
                <div className="text-[10px] text-[#888888] font-semibold uppercase tracking-wider">
                  Engagement Score
                </div>
                <div className="font-serif text-2xl font-bold text-[#2251FF] mt-1">
                  {selectedMetric.engagementScore}
                </div>
              </div>
              <div className="bg-[rgba(5,28,44,0.02)] p-3 rounded-[8px]">
                <div className="text-[10px] text-[#888888] font-semibold uppercase tracking-wider">
                  Lifetime Attendance
                </div>
                <div className="font-serif text-2xl font-bold text-[#051C2C] mt-1">
                  {selectedMetric.totalAttendances}
                </div>
              </div>
              <div className="bg-[rgba(5,28,44,0.02)] p-3 rounded-[8px]">
                <div className="text-[10px] text-[#888888] font-semibold uppercase tracking-wider">
                  Last 12 Months
                </div>
                <div className="font-serif text-lg font-bold text-[#051C2C] mt-1">
                  {selectedMetric.attendancesLast12Months}
                </div>
              </div>
              <div className="bg-[rgba(5,28,44,0.02)] p-3 rounded-[8px]">
                <div className="text-[10px] text-[#888888] font-semibold uppercase tracking-wider">
                  Days Since Last
                </div>
                <div className="font-serif text-lg font-bold text-[#051C2C] mt-1">
                  {selectedMetric.recencyDays === 9999 ? 'Never' : selectedMetric.recencyDays}
                </div>
              </div>
            </div>

            {/* Personal Attendance Ledger */}
            <div>
              <h4 className="font-serif text-sm font-bold text-[#051C2C] mb-3 uppercase tracking-wider border-b pb-1">
                Personal Attendance Ledger
              </h4>
              {sortedLedgerWithEvents.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#888888]">No historical attendance records found.</div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {sortedLedgerWithEvents.map(({ ledger: item, event }) => {
                    if (!event) return null;
                    return (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-[6px] bg-[#F5F5F2] hover:bg-gray-100 transition-colors flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-[#051C2C] truncate max-w-[160px]">
                            {event.name}
                          </div>
                          <div className="text-[10px] text-[#888888] flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {event.date} · {event.type}
                          </div>
                          {item.purchaserName && item.purchaserName !== selectedContact.name && (
                            <div className="text-[10px] text-[#2251FF]">
                              Paid by: {item.purchaserName}
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              item.attendanceStatus === 'Attended'
                                ? 'bg-green-50 text-green-700'
                                : item.attendanceStatus === 'No-Show'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {item.attendanceStatus}
                          </span>
                          <div className="text-[9px] text-[#888888] mt-0.5 font-mono">
                            {item.ticketType} (${item.paidAmount})
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Special Callouts */}
            {selectedMetric.conversionCandidate && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-[8px] border-l-4 border-yellow-500 text-xs text-yellow-800 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Conversion Opportunity!
                </div>
                <p className="text-[11px] text-yellow-700">
                  {selectedContact.name} is a high-potential non-member with {selectedMetric.totalAttendances} attendances. They are ready to be converted into a paid member.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[12px] p-8 text-center text-xs text-[#888888] card-shadow">
            Select a contact to view their personal master relationship database and attendance ledger.
          </div>
        )}
      </div>
    </div>
  );
}
