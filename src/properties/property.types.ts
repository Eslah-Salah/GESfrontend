export type PropertyStatus = 'Approved' | 'Pending' | 'Rejected' | 'Suspended';
export type PropertyType = 'Hotel' | 'Travel agency';
export type PropertyAction = 'Approve' | 'Reject' | 'Suspend' | 'Turn back on';

export interface PropertyLog {
  at: number;
  person: string;
  action: string;
  reason: string;
}

export interface PropertyDetails {
  cr: string;
  tax: string;
  phone: string;
  fax: string;
  email: string;
  city: string;
  address: string;
  languages: string;
  openingDays: string;
}

export interface PropertyRecord {
  id: string;
  name: string;
  nameAr: string;
  type: PropertyType;
  status: PropertyStatus;
  plan: string;
  users: number;
  details: PropertyDetails;
  accessEndsAt: number | null;
  holdStarted: boolean;
  holdStartedAt: number | null;
  logs: PropertyLog[];
}
