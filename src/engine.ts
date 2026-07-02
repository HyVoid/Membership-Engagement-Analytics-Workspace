import { Contact, Event, AttendanceLedger, AppSettings, CalculatedContactMetric } from './types';

// Anchor date: 2026-07-01
export const REFERENCE_DATE = '2026-07-01';

export function calculateMetrics(
  contacts: Contact[],
  events: Event[],
  ledger: AttendanceLedger[],
  settings: AppSettings
): CalculatedContactMetric[] {
  const refDate = new Date(REFERENCE_DATE);

  return contacts.map((contact) => {
    // 1. Get all ledger entries for this contact where they actually attended
    const contactLedger = ledger.filter((l) => l.contactId === contact.id);
    const attendedEntries = contactLedger.filter((l) => l.attendanceStatus === 'Attended');

    // Get event details for attended events
    const attendedEvents = attendedEntries
      .map((entry) => events.find((e) => e.id === entry.eventId))
      .filter((e): e is Event => !!e);

    // Sort by date descending (most recent first)
    attendedEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalAttendances = attendedEntries.length;

    // Last attendance date
    const lastAttendanceDate = attendedEvents.length > 0 ? attendedEvents[0].date : null;

    // Calculate recency in days
    let recencyDays = 9999; // represent infinity or never
    if (lastAttendanceDate) {
      const lastDate = new Date(lastAttendanceDate);
      const diffTime = refDate.getTime() - lastDate.getTime();
      recencyDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    }

    // Calculate attendances in the last 12 months (365 days from 2026-07-01)
    const twelveMonthsAgo = new Date(REFERENCE_DATE);
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
    const attendancesLast12Months = attendedEvents.filter(
      (e) => new Date(e.date) >= twelveMonthsAgo
    ).length;

    // Attended event types
    const attendedTypes = Array.from(new Set(attendedEvents.map((e) => e.type)));

    // ────────────────────────────────────────────────────────
    // ENGAGEMENT SCORE MATH
    // ────────────────────────────────────────────────────────

    // A. Recency Score (max 100)
    let recencyScore = 0;
    if (recencyDays <= 30) {
      recencyScore = 100;
    } else if (recencyDays <= 90) {
      recencyScore = 80;
    } else if (recencyDays <= 180) {
      recencyScore = 50;
    } else if (recencyDays <= 365) {
      recencyScore = 20;
    } else {
      recencyScore = 0;
    }

    // B. Frequency Score (max 100)
    let frequencyScore = 0;
    if (attendancesLast12Months === 0) {
      frequencyScore = 0;
    } else if (attendancesLast12Months === 1) {
      frequencyScore = 30;
    } else if (attendancesLast12Months === 2) {
      frequencyScore = 60;
    } else if (attendancesLast12Months === 3) {
      frequencyScore = 85;
    } else {
      frequencyScore = 100;
    }

    // Apply Event Type Weights to Frequency Score
    if (attendedEvents.length > 0) {
      // Find weights for attended types
      let totalWeight = 0;
      attendedEvents.forEach((evt) => {
        const typeSetting = settings.eventTypes.find((t) => t.type === evt.type);
        totalWeight += typeSetting ? typeSetting.weight : 1.0;
      });
      const avgWeight = totalWeight / attendedEvents.length;
      frequencyScore = Math.min(100, Math.round(frequencyScore * avgWeight));
    }

    // C. Membership Status Score (max 100)
    let statusScore = 0;
    if (contact.memberStatus === 'Premium Member') {
      statusScore = 100;
    } else if (contact.memberStatus === 'Regular Member') {
      statusScore = 80;
    } else if (contact.memberStatus === 'Non-Member') {
      statusScore = 30;
    }

    // D. Diversity Score (max 100)
    const uniqueTypesCount = attendedTypes.length;
    let diversityScore = 0;
    if (uniqueTypesCount >= 3) {
      diversityScore = 100;
    } else if (uniqueTypesCount === 2) {
      diversityScore = 70;
    } else if (uniqueTypesCount === 1) {
      diversityScore = 40;
    } else {
      diversityScore = 0;
    }

    // Calculate Weighted Total Score
    const w = settings.weights;
    const totalWeightsSum = w.recency + w.frequency + w.status + w.diversity;
    const normFactor = totalWeightsSum > 0 ? totalWeightsSum : 100;

    const rawWeightedScore =
      (recencyScore * w.recency +
        frequencyScore * w.frequency +
        statusScore * w.status +
        diversityScore * w.diversity) /
      normFactor;

    const engagementScore = Math.round(rawWeightedScore);

    // ────────────────────────────────────────────────────────
    // STATUS / CATEGORIES & ALERTS
    // ────────────────────────────────────────────────────────

    // Churn status: Slipping/Dormant based on churnMonths
    // Let's convert churnMonths to days (approx 30 days per month)
    const churnThresholdDays = settings.churnMonths * 30.4;
    let churnStatus: 'Active' | 'Slipping' | 'Dormant' = 'Active';

    if (totalAttendances === 0) {
      churnStatus = 'Dormant';
    } else if (recencyDays > churnThresholdDays) {
      // e.g. > 180 days for 6 months
      churnStatus = 'Dormant';
    } else if (recencyDays > churnThresholdDays * 0.6) {
      // e.g. > 108 days
      churnStatus = 'Slipping';
    } else {
      churnStatus = 'Active';
    }

    // Non-member ready for conversion
    const conversionCandidate =
      contact.memberStatus === 'Non-Member' && totalAttendances >= settings.conversionThreshold;

    return {
      contactId: contact.id,
      totalAttendances,
      attendancesLast12Months,
      recencyDays,
      lastAttendanceDate,
      attendedTypes,
      engagementScore,
      churnStatus,
      conversionCandidate,
    };
  });
}
