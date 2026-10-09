export interface GuestAccessEntry {
  id: string;
  staffName: string;
  guestName: string;
  openedAt: number;
}

const HOUR = 60 * 60 * 1000;
const now = Date.now();

const entries: GuestAccessEntry[] = [
  { id: 'a1', staffName: 'Nora Hassan', guestName: 'Layla Mansour', openedAt: now - 1 * HOUR },
  { id: 'a2', staffName: 'Omar Khaled', guestName: 'James Whitfield', openedAt: now - 3 * HOUR },
  { id: 'a3', staffName: 'Nora Hassan', guestName: 'Sara Al-Qahtani', openedAt: now - 6 * HOUR },
  { id: 'a4', staffName: 'Youssef Adel', guestName: 'Layla Mansour', openedAt: now - 20 * HOUR },
  { id: 'a5', staffName: 'Omar Khaled', guestName: 'Chen Wei', openedAt: now - 26 * HOUR },
  { id: 'a6', staffName: 'Mona Fathy', guestName: 'Ahmed Nasser', openedAt: now - 30 * HOUR },
  { id: 'a7', staffName: 'Youssef Adel', guestName: 'Elena Petrova', openedAt: now - 50 * HOUR },
  { id: 'a8', staffName: 'Mona Fathy', guestName: 'James Whitfield', openedAt: now - 70 * HOUR },
];

// BACKEND LATER: replace the body with a fetch of the real "who opened this guest" endpoint.
export function getGuestAccessLog(): GuestAccessEntry[] {
  return entries;
}

// BACKEND LATER: the real answer comes from the API (a 403 means no access).
// For now, add ?demo=refused to the page URL to preview the refusal screen.
export function canViewGuestAccessLog(): boolean {
  return new URLSearchParams(window.location.search).get('demo') !== 'refused';
}
