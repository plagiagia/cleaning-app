export type Service = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  emoji: string | null;
};

export type DayAvailability = {
  date: string;
  serviceIds: string[];
};
