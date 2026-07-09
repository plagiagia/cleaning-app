export type Service = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  emoji: string | null;
};

export type TimeSlot = {
  id: string;
  label: string;
  available: boolean;
};

export type DayAvailability = {
  date: string;
  slots: TimeSlot[];
  serviceIds: string[];
};
