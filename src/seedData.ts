import { Contact, Event, AttendanceLedger, AppSettings } from './types';

export const INITIAL_CONTACTS: Contact[] = [
  { id: 'C001', name: 'Tom Henderson', email: 'tom.h@gmail.com', memberStatus: 'Regular Member', joinDate: '2025-01-10' },
  { id: 'C002', name: 'Jane Henderson', email: 'jane.h@gmail.com', memberStatus: 'Regular Member', joinDate: '2025-01-12' },
  { id: 'C003', name: 'Mike Miller', email: 'mike.m@yahoo.com', memberStatus: 'Non-Member', joinDate: '2025-05-20' },
  { id: 'C004', name: 'Lisa Roberts', email: 'lisa.r@outlook.com', memberStatus: 'Premium Member', joinDate: '2024-06-15' },
  { id: 'C005', name: 'Peter Jenkins', email: 'p.jenkins@gmail.com', memberStatus: 'Non-Member', joinDate: '2026-02-01' },
  { id: 'C006', name: 'David Wu', email: 'david.wu@techcorp.com', memberStatus: 'Non-Member', joinDate: '2026-03-15' },
  { id: 'C007', name: 'Sarah Connolly', email: 'sarah.c@charity.org', memberStatus: 'Premium Member', joinDate: '2024-11-01' },
  { id: 'C008', name: 'Robert Taylor', email: 'robert.t@gmail.com', memberStatus: 'Regular Member', joinDate: '2025-08-10' },
];

export const INITIAL_EVENTS: Event[] = [
  { id: 'E001', name: 'New Year Networking Mixer', type: 'Mixer', date: '2026-01-15', ticketPriceMember: 10, ticketPriceNonMember: 25 },
  { id: 'E002', name: 'Donor Engagement Workshop', type: 'Workshop', date: '2026-02-20', ticketPriceMember: 20, ticketPriceNonMember: 45 },
  { id: 'E003', name: 'Spring Advocacy Seminar', type: 'Seminar', date: '2026-03-10', ticketPriceMember: 15, ticketPriceNonMember: 35 },
  { id: 'E004', name: 'Community Impact Social', type: 'Social', date: '2026-04-22', ticketPriceMember: 0, ticketPriceNonMember: 10 },
  { id: 'E005', name: 'Summer Gala & Fundraiser', type: 'Social', date: '2026-06-18', ticketPriceMember: 50, ticketPriceNonMember: 100 },
  { id: 'E006', name: 'Quarterly Board Panel', type: 'Seminar', date: '2026-06-29', ticketPriceMember: 10, ticketPriceNonMember: 20 },
];

export const INITIAL_SETTINGS: AppSettings = {
  eventTypes: [
    { type: 'Mixer', weight: 1.0 },
    { type: 'Workshop', weight: 1.5 }, // Workshops require higher engagement
    { type: 'Seminar', weight: 1.2 },
    { type: 'Social', weight: 1.0 },
  ],
  weights: {
    recency: 40,
    frequency: 30,
    status: 20,
    diversity: 10,
  },
  churnMonths: 6, // 6 months inactivity means Slipping / Dormant
  conversionThreshold: 3, // Non-members with 3+ attendances are ready to convert
};

export const INITIAL_LEDGER: AttendanceLedger[] = [
  // E001 Mixer
  { id: 'L001', contactId: 'C001', eventId: 'E001', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'Tom Henderson', paidAmount: 10 },
  { id: 'L002', contactId: 'C002', eventId: 'E001', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'Tom Henderson', paidAmount: 10 },
  { id: 'L003', contactId: 'C003', eventId: 'E001', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'Mike Miller', paidAmount: 25 },
  { id: 'L004', contactId: 'C004', eventId: 'E001', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'Lisa Roberts', paidAmount: 10 },
  { id: 'L005', contactId: 'C007', eventId: 'E001', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'Sarah Connolly', paidAmount: 10 },

  // E002 Workshop
  { id: 'L006', contactId: 'C001', eventId: 'E002', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'Tom Henderson', paidAmount: 20 },
  { id: 'L007', contactId: 'C004', eventId: 'E002', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'Lisa Roberts', paidAmount: 20 },
  { id: 'L008', contactId: 'C005', eventId: 'E002', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'Peter Jenkins', paidAmount: 45 },
  { id: 'L009', contactId: 'C008', eventId: 'E002', attendanceStatus: 'No-Show', ticketType: 'Paid', purchaserName: 'Robert Taylor', paidAmount: 20 },

  // E003 Seminar (Tom Henderson bought 3 tickets)
  { id: 'L010', contactId: 'C001', eventId: 'E003', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'Tom Henderson', paidAmount: 15 },
  { id: 'L011', contactId: 'C002', eventId: 'E003', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'Tom Henderson', paidAmount: 15 },
  { id: 'L012', contactId: 'C005', eventId: 'E003', attendanceStatus: 'No-Show', ticketType: 'Paid', purchaserName: 'Tom Henderson', paidAmount: 35 }, // Non-member rate

  // E004 Social
  { id: 'L013', contactId: 'C001', eventId: 'E004', attendanceStatus: 'Attended', ticketType: 'Free', purchaserName: 'Tom Henderson', paidAmount: 0 },
  { id: 'L014', contactId: 'C002', eventId: 'E004', attendanceStatus: 'Attended', ticketType: 'Free', purchaserName: 'Jane Henderson', paidAmount: 0 },
  { id: 'L015', contactId: 'C003', eventId: 'E004', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'Mike Miller', paidAmount: 10 },
  { id: 'L016', contactId: 'C004', eventId: 'E004', attendanceStatus: 'Attended', ticketType: 'Free', purchaserName: 'Lisa Roberts', paidAmount: 0 },
  { id: 'L017', contactId: 'C006', eventId: 'E004', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'David Wu', paidAmount: 10 },

  // E005 Summer Gala
  { id: 'L018', contactId: 'C001', eventId: 'E005', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'Tom Henderson', paidAmount: 50 },
  { id: 'L019', contactId: 'C004', eventId: 'E005', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'Lisa Roberts', paidAmount: 50 },
  { id: 'L020', contactId: 'C006', eventId: 'E005', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'David Wu', paidAmount: 100 },
  { id: 'L021', contactId: 'C007', eventId: 'E005', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'Sarah Connolly', paidAmount: 50 },

  // E006 Board Panel
  { id: 'L022', contactId: 'C001', eventId: 'E006', attendanceStatus: 'Registered', ticketType: 'Paid', purchaserName: 'Tom Henderson', paidAmount: 10 },
  { id: 'L023', contactId: 'C003', eventId: 'E006', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'Mike Miller', paidAmount: 20 },
  { id: 'L024', contactId: 'C004', eventId: 'E006', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'Lisa Roberts', paidAmount: 10 },
  { id: 'L025', contactId: 'C006', eventId: 'E006', attendanceStatus: 'Attended', ticketType: 'Paid', purchaserName: 'David Wu', paidAmount: 20 },
];
