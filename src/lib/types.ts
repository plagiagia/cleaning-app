export type Service = {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  emoji: string;
  tag?: string;
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
