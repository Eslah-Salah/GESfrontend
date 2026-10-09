export type TimelineKind = 'case' | 'request' | 'message' | 'survey' | 'call' | 'visit';

export interface TimelineItem {
  id: string;
  kind: TimelineKind;
  title: string;
  at: number;
}

export interface GuestPreference {
  label: string;
  value: string;
}

export type PropertyType = 'Hotel' | 'Travel agency';

// PLACEHOLDER stage names - replace when the real lists are confirmed with the backend dev.
export const STAGES_BY_TYPE: Record<PropertyType, string[]> = {
  Hotel: ['Pre-arrival', 'Check-in', 'In-stay', 'Check-out', 'Post-stay'],
  'Travel agency': ['Inquiry', 'Quotation', 'Booking confirmed', 'Travelling', 'Follow-up'],
};

export interface Guest {
  id: string;
  name: string;
  nameAr: string;
  phone: string;
  propertyType: PropertyType;
  currentStage: string;
  preferences: GuestPreference[];
  timeline: TimelineItem[];
}

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

const guest: Guest = {
  id: 'guest-001',
  name: 'Layla Mansour',
  nameAr: 'ليلى منصور',
  phone: '+966 55 123 4567',
  propertyType: 'Hotel',
  currentStage: 'In-stay',
  preferences: [
    { label: 'Room', value: 'High floor, quiet' },
    { label: 'Pillow', value: 'Soft' },
    { label: 'Language', value: 'Arabic' },
    { label: 'Dietary', value: 'No shellfish' },
    { label: 'Contact', value: 'WhatsApp' },
  ],
  timeline: [
    { id: 't1', kind: 'case', title: 'Air conditioning too loud', at: now - 1 * DAY },
    { id: 't2', kind: 'request', title: 'Extra towels to room 412', at: now - 2 * DAY },
    { id: 't3', kind: 'message', title: 'Asked about late check-out', at: now - 3 * DAY },
    { id: 't4', kind: 'survey', title: 'Stay survey completed (5 stars)', at: now - 5 * DAY },
    { id: 't5', kind: 'request', title: 'Airport pickup booked', at: now - 7 * DAY },
    { id: 't6', kind: 'message', title: 'Pre-arrival greeting sent', at: now - 9 * DAY },
    { id: 't7', kind: 'case', title: 'Billing question resolved', at: now - 10 * DAY },
  ],
};

// BACKEND LATER: replace the body with a PUT of the new stage.
export function setGuestStage(_id: string, stage: string): void {
  guest.currentStage = stage;
}

// BACKEND LATER: replace the body with a POST of the new contact.
export function addGuestContact(_id: string, kind: TimelineKind, title: string): void {
  guest.timeline.push({ id: `local-${Date.now()}`, kind, title, at: Date.now() });
}

// BACKEND LATER: replace the body with a fetch of the guest profile + timeline.
export function getGuest(_id: string): Guest {
  return guest;
}
