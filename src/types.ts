export interface Contact {
  id: string;
  name: string;
  email: string;
  memberStatus: 'Regular Member' | 'Premium Member' | 'Non-Member';
  joinDate: string;
}

export interface Event {
  id: string;
  name: string;
  type: string; // e.g. "Mixer", "Workshop", "Seminar", "Social"
  date: string; // YYYY-MM-DD
  ticketPriceMember: number;
  ticketPriceNonMember: number;
}

export interface AttendanceLedger {
  id: string;
  contactId: string;
  eventId: string;
  attendanceStatus: 'Attended' | 'Registered' | 'No-Show';
  ticketType: 'Paid' | 'Free';
  purchaserName: string; // The person who paid for the ticket (solves多人代报名)
  paidAmount: number;
}

export interface EventTypeSetting {
  type: string;
  weight: number; // multiplier or score bump for this event type
}

export interface EngagementWeights {
  recency: number; // e.g. 40
  frequency: number; // e.g. 30
  status: number; // e.g. 20
  diversity: number; // e.g. 10
}

export interface AppSettings {
  eventTypes: EventTypeSetting[];
  weights: EngagementWeights;
  churnMonths: number; // default e.g. 6 months
  conversionThreshold: number; // default e.g. 3 attendances for Non-Members
}

export interface CalculatedContactMetric {
  contactId: string;
  totalAttendances: number;
  attendancesLast12Months: number;
  recencyDays: number; // days since last attendance
  lastAttendanceDate: string | null;
  attendedTypes: string[];
  engagementScore: number; // 0-100
  churnStatus: 'Active' | 'Slipping' | 'Dormant'; // based on churnMonths
  conversionCandidate: boolean; // non-member with >= conversionThreshold attendances
}
