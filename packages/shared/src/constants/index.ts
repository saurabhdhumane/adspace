export const BANNER_TYPES = [
  { label: 'Bus Stand', value: 'bus_stand' },
  { label: 'Hoarding', value: 'hoarding' },
  { label: 'Flyover Gantry', value: 'flyover_gantry' },
  { label: 'Unipole', value: 'unipole' },
  { label: 'Wall', value: 'wall' },
] as const;

export const ILLUMINATION_OPTIONS = [
  { label: 'Lit', value: 'lit' },
  { label: 'Non-Lit', value: 'non_lit' },
] as const;

export const POPULAR_CITIES = [
  'Pune',
  'Mumbai',
  'Bengaluru',
  'Delhi NCR',
  'Hyderabad',
  'Chennai',
  'Ahmedabad',
] as const;

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 50;
