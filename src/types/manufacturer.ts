export const manufacturerOptions = [
  'SUNLU',
  'Bambu Lab',
  'Polymaker',
  'eSUN',
  'Siraya Tech',
  'Prusament',
] as const;

export type Manufacturer = (typeof manufacturerOptions)[number];
