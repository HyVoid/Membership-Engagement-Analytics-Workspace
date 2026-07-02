import React from 'react';
import { Contact, Event, AttendanceLedger, AppSettings, CalculatedContactMetric } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Users, UserCheck, UserX, Target, Mail, ArrowUpRight, TrendingUp, Calendar, ShieldCheck, Zap } from 'lucide-react';

interface DashboardProps {
  contacts: Contact[];
  events: Event[];
  ledger: AttendanceLedger[];
  settings: AppSettings;
  metrics: CalculatedContactMetric[];
  onUpdateContacts: (updated: Contact[]) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({
  contacts,
  events,
  ledger,
  settings,
  metrics,
  onUpdateContacts,
  onNavigateToTab,
}: DashboardProps) {
  // ── 1. KPI Calculations ──
  const totalContacts = contacts.length;
  const membersCount = contacts.filter((c) => c.memberStatus !== 'Non-Member').length;
  const nonMembersCount = totalContacts - membersCount;

  // Active definition: Attended at least 1 event in the last churn period (e.g. 6 months)
  const activeCount = metrics.filter((m) => m.churnStatus === 'Active').length;
  const activeRate = totalContacts > 0 ? Math.round((activeCount / totalContacts) * 100) : 0;

  // High potential non-members ready to convert
  const conversionCandidates = metrics.filter((m) => m.conversionCandidate);
  const conversionCount = conversionCandidates.length;

  // Slipping or Dormant members
  const slippingOrDormantMembers = metrics.filter(
    (m) =>
      (m.churnStatus === 'Slipping' || m.churnStatus === 'Dormant') &&
      contacts.find((c) => c.id === m.contactId)?.memberStatus !== 'Non-Member'
  );
  const dormantCount = slippingOrDormantMembers.length;

  // ── 2. Chart 1: Monthly Attendance Trend ──
  // Group ledger entries (Attended) by Month
  const monthlyDataMap: { [key: string]: number } = {};
  
  // Initialize last 6 months to ensure we have data points even if empty
  const months = ['Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26'];
  months.forEach(m => { monthlyDataMap[m] = 0; });

  ledger.forEach((l) => {
    if (l.attendanceStatus === 'Attended') {
      const event = events.find((e) => e.id === l.eventId);
      if (event) {
        // Simple map from YYYY-MM-DD to Month string
        const dateObj = new Date(event.date);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mString = `${monthNames[dateObj.getMonth()]} ${String(dateObj.getFullYear()).slice(-2)}`;
        monthlyDataMap[mString] = (monthlyDataMap[mString] || 0) + 1;
      }
    }
  });

  const trendData = Object.keys(monthlyDataMap)
    .map((key) => ({
      month: key,
      attendances: monthlyDataMap[key],
    }))
    // Sort chronologically (Jan 26, Feb 26, etc)
    .sort((a, b) => {
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const aParts = a.month.split(' ');
      const bParts = b.month.split(' ');
      const indexA = monthOrder.indexOf(aParts[0]);
      const indexB = monthOrder.indexOf(bParts[0]);
      return indexA - indexB;
    });

  // ── 3. Chart 2: Attendance by Event Type ──
  const typeDataMap: { [key: string]: number } = {};
  events.forEach((e) => {
    typeDataMap[e.type] = 0;
  });
  ledger.forEach((l) => {
    if (l.attendanceStatus === 'Attended') {
      const event = events.find((e) => e.id === l.eventId);
      if (event) {
        typeDataMap[event.type] = (typeDataMap[event.type] || 0) + 1;
      }
    }
  });

  const typeData = Object.keys(typeDataMap).map((key) => ({
    name: key,
    attendances: typeDataMap[key],
  }));

  // ── 4. Quick Actions ──
  const handleConvertMember = (contactId: string) => {
    const updated = contacts.map((c) => {
      if (c.id === contactId) {
        return { ...c, memberStatus: 'Regular Member' as const };
      }
      return c;
    });
    onUpdateContacts(updated);
  };

  const [notifiedContacts, setNotifiedContacts] = React.useState<string[]>([]);
  const handleSendReminder = (contactId: string) => {
    setNotifiedContacts((prev) => [...prev, contactId]);
    setTimeout(() => {
      alert(`Simulated Re-engagement Email sent successfully to ${contacts.find(c => c.id === contactId)?.email}!`);
    }, 100);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-2">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#051C2C] tracking-tight">
            Engagement Analytics Workspace
          </h1>
          <p className="text-sm text-[#888888] mt-1">
            Real-time relationship analysis & participation metrics based on individual attendance history ledger.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <button
            onClick={() => onNavigateToTab('ledger')}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#2251FF] hover:bg-[#1a3ecb] rounded-[6px] transition-all flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            Sign-In Attendance
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-white rounded-[12px] p-6 card-shadow hover-float border-l-4 border-[#051C2C]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-[#888888] uppercase">Total Contacts</span>
            <Users className="w-5 h-5 text-[#051C2C]" />
          </div>
          <div className="mt-4">
            <span className="font-serif text-4xl font-bold tracking-tight text-[#051C2C]">
              {totalContacts}
            </span>
          </div>
          <div className="mt-2 text-xs text-[#888888] flex items-center gap-1">
            <span className="font-semibold text-[#051C2C]">{membersCount}</span> Members · 
            <span className="font-semibold text-[#051C2C]">{nonMembersCount}</span> Non-Members
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-[12px] p-6 card-shadow hover-float border-l-4 border-[#2251FF]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-[#888888] uppercase">Engagement Rate</span>
            <TrendingUp className="w-5 h-5 text-[#2251FF]" />
          </div>
          <div className="mt-4">
            <span className="font-serif text-4xl font-bold tracking-tight text-[#2251FF]">
              {activeRate}%
            </span>
          </div>
          <div className="mt-2 text-xs text-[#888888]">
            <span className="font-semibold text-[#2251FF]">{activeCount}</span> of {totalContacts} active in the last {settings.churnMonths} mos.
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-[12px] p-6 card-shadow hover-float border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-[#888888] uppercase">High Potential Non-Members</span>
            <Target className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="mt-4">
            <span className="font-serif text-4xl font-bold tracking-tight text-[#051C2C]">
              {conversionCount}
            </span>
          </div>
          <div className="mt-2 text-xs text-[#888888]">
            Non-members with <span className="font-semibold text-yellow-600">{settings.conversionThreshold}+</span> lifetime attendances.
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-[12px] p-6 card-shadow hover-float border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-[#888888] uppercase">Slipping Members</span>
            <UserX className="w-5 h-5 text-red-600" />
          </div>
          <div className="mt-4">
            <span className="font-serif text-4xl font-bold tracking-tight text-[#051C2C]">
              {dormantCount}
            </span>
          </div>
          <div className="mt-2 text-xs text-[#888888]">
            Members inactive for &gt; <span className="font-semibold text-red-600">{settings.churnMonths}</span> months.
          </div>
        </div>
      </div>

      {/* Operational Insights / Business Recommendations */}
      <div className="insight-box p-6 rounded-r-[12px] space-y-3">
        <h3 className="font-serif text-lg font-bold text-[#051C2C] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#2251FF]" />
          Executive Operational Digest
        </h3>
        <p className="text-xs text-[#051C2C] leading-relaxed">
          <strong>Observation:</strong> Out of {nonMembersCount} total non-members,{' '}
          <span className="font-semibold">{conversionCount} have emerged as high-frequency participants</span>, exceeding our current threshold of {settings.conversionThreshold} attendances. They represent prime conversion candidates for a formal membership campaign.
          Meanwhile, we have identified <span className="font-semibold">{dormantCount} slipping regular/premium members</span> who have been inactive beyond the configured {settings.churnMonths}-month churn threshold. Implementing proactive re-engagement outreach immediately is recommended to mitigate churn risks.
        </p>
      </div>

      {/* Main Charts Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Chart */}
        <div className="bg-white rounded-[12px] p-6 card-shadow">
          <h2 className="font-serif text-lg font-bold text-[#051C2C] mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#2251FF]" />
            Monthly Attendance Trend (Last 6 Months)
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E8E6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888888' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#888888' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#051C2C',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="attendances"
                  stroke="#2251FF"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Type Chart */}
        <div className="bg-white rounded-[12px] p-6 card-shadow">
          <h2 className="font-serif text-lg font-bold text-[#051C2C] mb-6 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#2251FF]" />
            Attendance Distribution by Event Type
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E8E6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888888' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#888888' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#051C2C',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="attendances" fill="#051C2C" radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two lists side by side: High Potential Conversions & Dormant Outreach */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* High Potential List */}
        <div className="bg-white rounded-[12px] p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-[#051C2C] flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              High-Potential Non-Members
            </h3>
            <span className="text-[11px] font-semibold text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {conversionCount} Candidates
            </span>
          </div>
          <p className="text-xs text-[#888888] mb-4">
            Non-members who attend frequently. Convert them to members to build long-term relationships.
          </p>
          {conversionCandidates.length === 0 ? (
            <div className="text-center py-8 text-[#888888] text-xs">No current candidates meet the conversion threshold.</div>
          ) : (
            <div className="divide-y divide-[#E8E8E6] max-h-80 overflow-y-auto">
              {conversionCandidates.map((m) => {
                const contact = contacts.find((c) => c.id === m.contactId);
                if (!contact) return null;
                return (
                  <div key={m.contactId} className="py-3 flex items-center justify-between group">
                    <div>
                      <div className="font-medium text-[#051C2C]">{contact.name}</div>
                      <div className="text-xs text-[#888888]">{contact.email}</div>
                      <div className="text-[11px] text-[#2251FF] font-semibold mt-0.5">
                        {m.totalAttendances} Attendances · Score: {m.engagementScore}
                      </div>
                    </div>
                    <button
                      onClick={() => handleConvertMember(contact.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#2251FF] hover:text-white bg-blue-50 hover:bg-[#2251FF] rounded-[4px] transition-all flex items-center gap-1 border border-blue-100"
                    >
                      Convert Member
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dormant/Slipping List */}
        <div className="bg-white rounded-[12px] p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-[#051C2C] flex items-center gap-2">
              <UserX className="w-4 h-4 text-red-500" />
              Slipping & Dormant Members
            </h3>
            <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {dormantCount} Slipping
            </span>
          </div>
          <p className="text-xs text-[#888888] mb-4">
            Members inactive for too long. Re-engage them before they officially cancel.
          </p>
          {slippingOrDormantMembers.length === 0 ? (
            <div className="text-center py-8 text-[#888888] text-xs">All members are highly active. Stellar job!</div>
          ) : (
            <div className="divide-y divide-[#E8E8E6] max-h-80 overflow-y-auto">
              {slippingOrDormantMembers.map((m) => {
                const contact = contacts.find((c) => c.id === m.contactId);
                if (!contact) return null;
                const isNotified = notifiedContacts.includes(contact.id);
                return (
                  <div key={m.contactId} className="py-3 flex items-center justify-between group">
                    <div>
                      <div className="font-medium text-[#051C2C]">{contact.name}</div>
                      <div className="text-xs text-[#888888]">
                        Last Attended:{' '}
                        <span className="font-semibold text-red-600">
                          {m.lastAttendanceDate || 'Never'}
                        </span>{' '}
                        ({m.recencyDays === 9999 ? 'N/A' : `${m.recencyDays} days ago`})
                      </div>
                      <div className="text-[11px] text-red-600 font-semibold mt-0.5">
                        Status: {m.churnStatus} · Score: {m.engagementScore}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendReminder(contact.id)}
                      disabled={isNotified}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-all flex items-center gap-1.5 border ${
                        isNotified
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-red-100'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {isNotified ? 'Email Sent' : 'Send Outreach'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
