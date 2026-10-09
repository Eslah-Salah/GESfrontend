export interface PropertyUsageRow {
  id: string;
  name: string;
  usage: number;
}

export interface PlatformUsage {
  activeProperties: number;
  quietProperties: number;
  modulesInUse: number;
  rows: PropertyUsageRow[];
}

// PLACEHOLDER: a property with a usage number below this counts as "quiet".
export const QUIET_THRESHOLD = 10;

const rows: PropertyUsageRow[] = [
  { id: 'palm-court', name: 'Palm Court Hotel', usage: 240 },
  { id: 'atlas-travel', name: 'Atlas Travel Co.', usage: 128 },
  { id: 'red-sea-resort', name: 'Red Sea Resort', usage: 87 },
  { id: 'nile-view', name: 'Nile View Hotel', usage: 43 },
  { id: 'horizon-tours', name: 'Horizon Tours', usage: 6 },
  { id: 'old-town-inn', name: 'Old Town Inn', usage: 0 },
];

// BACKEND LATER: replace the body with a fetch of the platform-wide usage numbers.
export function getPlatformUsage(): PlatformUsage {
  const quiet = rows.filter((row) => row.usage < QUIET_THRESHOLD).length;
  return { activeProperties: rows.length - quiet, quietProperties: quiet, modulesInUse: 5, rows };
}