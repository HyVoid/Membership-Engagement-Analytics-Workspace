import React from 'react';
import { Contact, Event, AttendanceLedger, AppSettings, CalculatedContactMetric } from '../types';
import { Info, HelpCircle, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';

interface EngineViewProps {
  contacts: Contact[];
  events: Event[];
  ledger: AttendanceLedger[];
  settings: AppSettings;
  metrics: CalculatedContactMetric[];
  onUpdateWeights: (newWeights: AppSettings['weights']) => void;
}

export default function EngineView({
  contacts,
  events,
  ledger,
  settings,
  metrics,
  onUpdateWeights,
}: EngineViewProps) {
  // Helpers to calculate intermediate points for a contact
  const getIntermediatePoints = (contact: Contact) => {
    const contactLedger = ledger.filter((l) => l.contactId === contact.id);
    const attendedEntries = contactLedger.filter((l) => l.attendanceStatus === 'Attended');

    const attendedEvents = attendedEntries
      .map((entry) => events.find((e) => e.id === entry.eventId))
      .filter((e): e is Event => !!e);

    attendedEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const total = attendedEvents.length;
    const lastDate = total > 0 ? attendedEvents[0].date : null;

    let recencyDays = 9999;
    if (lastDate) {
      const diffTime = new Date('2026-07-01').getTime() - new Date(lastDate).getTime();
      recencyDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    }

    let recencyPoints = 0;
    if (recencyDays <= 30) recencyPoints = 100;
    else if (recencyDays <= 90) recencyPoints = 80;
    else if (recencyDays <= 180) recencyPoints = 50;
    else if (recencyDays <= 365) recencyPoints = 20;

    const twelveMonthsAgo = new Date('2026-07-01');
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
    const inLast12m = attendedEvents.filter((e) => new Date(e.date) >= twelveMonthsAgo).length;

    let frequencyPoints = 0;
    if (inLast12m === 1) frequencyPoints = 30;
    else if (inLast12m === 2) frequencyPoints = 60;
    else if (inLast12m === 3) frequencyPoints = 85;
    else if (inLast12m >= 4) frequencyPoints = 100;

    if (attendedEvents.length > 0) {
      let totalWeight = 0;
      attendedEvents.forEach((evt) => {
        const typeSetting = settings.eventTypes.find((t) => t.type === evt.type);
        totalWeight += typeSetting ? typeSetting.weight : 1.0;
      });
      const avgWeight = totalWeight / attendedEvents.length;
      frequencyPoints = Math.min(100, Math.round(frequencyPoints * avgWeight));
    }

    let statusPoints = 0;
    if (contact.memberStatus === 'Premium Member') statusPoints = 100;
    else if (contact.memberStatus === 'Regular Member') statusPoints = 80;
    else if (contact.memberStatus === 'Non-Member') statusPoints = 30;

    const uniqueTypes = Array.from(new Set(attendedEvents.map((e) => e.type))).length;
    let diversityPoints = 0;
    if (uniqueTypes >= 3) diversityPoints = 100;
    else if (uniqueTypes === 2) diversityPoints = 70;
    else if (uniqueTypes === 1) diversityPoints = 40;

    return {
      recencyPoints,
      frequencyPoints,
      statusPoints,
      diversityPoints,
      recencyDays,
      inLast12m,
      uniqueTypes,
    };
  };

  const handleWeightSliderChange = (key: keyof AppSettings['weights'], val: number) => {
    const updatedWeights = { ...settings.weights, [key]: val };
    onUpdateWeights(updatedWeights);
  };

  const totalWeightsSum =
    settings.weights.recency +
    settings.weights.frequency +
    settings.weights.status +
    settings.weights.diversity;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Settings weights panel */}
      <div className="bg-white rounded-[12px] p-6 card-shadow">
        <h3 className="font-serif text-lg font-bold text-[#051C2C] mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#2251FF]" />
          Real-Time Weight Tuning Engine
        </h3>
        <p className="text-xs text-[#888888] mb-6">
          Adjust the relative weights of each core category. Slide any value and watch every attendee's Engagement Score recalculate instantly! Weights must add up to 100%.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Recency weight */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#051C2C] uppercase tracking-wider">Recency Weight</span>
              <span className="text-[#2251FF]">{settings.weights.recency}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.weights.recency}
              onChange={(e) => handleWeightSliderChange('recency', Number(e.target.value))}
              className="w-full accent-[#2251FF]"
            />
            <span className="text-[10px] text-[#888888] block">Inactivity & last attended date</span>
          </div>

          {/* Frequency weight */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#051C2C] uppercase tracking-wider">Frequency Weight</span>
              <span className="text-[#2251FF]">{settings.weights.frequency}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.weights.frequency}
              onChange={(e) => handleWeightSliderChange('frequency', Number(e.target.value))}
              className="w-full accent-[#2251FF]"
            />
            <span className="text-[10px] text-[#888888] block">Attendance totals in last 12 mos</span>
          </div>

          {/* Member Status weight */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#051C2C] uppercase tracking-wider">Member Status Weight</span>
              <span className="text-[#2251FF]">{settings.weights.status}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.weights.status}
              onChange={(e) => handleWeightSliderChange('status', Number(e.target.value))}
              className="w-full accent-[#2251FF]"
            />
            <span className="text-[10px] text-[#888888] block">Financial join level loyalty multiplier</span>
          </div>

          {/* Diversity weight */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#051C2C] uppercase tracking-wider">Activity Diversity Weight</span>
              <span className="text-[#2251FF]">{settings.weights.diversity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.weights.diversity}
              onChange={(e) => handleWeightSliderChange('diversity', Number(e.target.value))}
              className="w-full accent-[#2251FF]"
            />
            <span className="text-[10px] text-[#888888] block">Breadth of event categories attended</span>
          </div>
        </div>

        {/* Sum Indicator */}
        <div className="mt-6 pt-4 border-t border-[#E8E8E6] flex items-center justify-between">
          <div className="text-xs text-[#888888] flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#2251FF]" />
            Formula: Score = (Recency × {settings.weights.recency}% + Frequency × {settings.weights.frequency}% + Status × {settings.weights.status}% + Diversity × {settings.weights.diversity}%)
          </div>
          <div className="text-xs font-semibold">
            Weight Sum:{' '}
            <span
              className={totalWeightsSum === 100 ? 'text-[#00C853]' : 'text-red-600 font-bold'}
            >
              {totalWeightsSum}% {totalWeightsSum === 100 ? '(Balanced)' : '(Should equal 100%)'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Audit Sheet */}
      <div className="bg-white rounded-[12px] p-6 card-shadow">
        <div className="pb-4 border-b border-[#E8E8E6] mb-4">
          <h2 className="font-serif text-xl font-bold text-[#051C2C]">Audit & Traceability Grid</h2>
          <p className="text-xs text-[#888888] mt-1">
            Trace the precise calculations running behind each contact profile, proving individual operational accountability.
          </p>
        </div>

        <div className="overflow-x-auto rounded-[8px] border border-[#E8E8E6]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[rgba(5,28,44,0.04)] border-b-2 border-[rgba(5,28,44,0.12)]">
                <th className="px-4 py-3 text-left font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                  Contact Name
                </th>
                <th className="px-4 py-3 text-right font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                  Recency Points
                </th>
                <th className="px-4 py-3 text-right font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                  Frequency Points
                </th>
                <th className="px-4 py-3 text-right font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                  Status Points
                </th>
                <th className="px-4 py-3 text-right font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                  Diversity Points
                </th>
                <th className="px-4 py-3 text-right font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                  Calculation Formula
                </th>
                <th className="px-4 py-3 text-right font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em] w-36">
                  Weighted Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E6]">
              {contacts.map((contact, idx) => {
                const pts = getIntermediatePoints(contact);
                const met = metrics.find((m) => m.contactId === contact.id);

                return (
                  <tr
                    key={contact.id}
                    className={`hover:bg-[rgba(34,81,255,0.01)] transition-colors ${
                      idx % 2 === 0 ? 'bg-[#F5F5F2]/20' : 'bg-white'
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-semibold text-[#051C2C]">{contact.name}</div>
                      <span className="text-[10px] font-mono font-semibold text-[#888888]">
                        {contact.id} · {contact.memberStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs">
                      <div className="font-mono text-[#051C2C]">{pts.recencyPoints} pts</div>
                      <div className="text-[10px] text-[#888888] font-semibold uppercase">
                        {pts.recencyDays === 9999 ? 'Never' : `${pts.recencyDays} days ago`}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs">
                      <div className="font-mono text-[#051C2C]">{pts.frequencyPoints} pts</div>
                      <div className="text-[10px] text-[#888888] font-semibold uppercase">
                        {pts.inLast12m} times (last 12m)
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs">
                      <div className="font-mono text-[#051C2C]">{pts.statusPoints} pts</div>
                      <div className="text-[10px] text-[#888888] font-semibold uppercase">
                        Multiplier
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs">
                      <div className="font-mono text-[#051C2C]">{pts.diversityPoints} pts</div>
                      <div className="text-[10px] text-[#888888] font-semibold uppercase">
                        {pts.uniqueTypes} Event types
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[10px] text-[#888888] max-w-[220px] truncate" title={`(${pts.recencyPoints} * ${settings.weights.recency} + ${pts.frequencyPoints} * ${settings.weights.frequency} + ${pts.statusPoints} * ${settings.weights.status} + ${pts.diversityPoints} * ${settings.weights.diversity}) / ${totalWeightsSum}`}>
                      ({pts.recencyPoints} × {settings.weights.recency} + {pts.frequencyPoints} × {settings.weights.frequency} + {pts.statusPoints} × {settings.weights.status} + {pts.diversityPoints} × {settings.weights.diversity}) / 100
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm font-mono font-bold text-[#2251FF]">
                          {met?.engagementScore || 0}
                        </span>
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full bg-[#2251FF] rounded-full"
                            style={{ width: `${met?.engagementScore || 0}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider mt-1 ${
                        met?.churnStatus === 'Active' ? 'bg-green-50 text-[#00C853]' : 'bg-red-50 text-[#D32F2F]'
                      }`}>
                        {met?.churnStatus}
                      </span>
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
