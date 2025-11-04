export type Organizer = {
  name: string;
  visibility: string;
  region: string;
  accent: string; // tailwind gradient classes
};

export type Event = {
  id: string;
  name: string;
  organizer: string;
  type: string;
  date: string;
  location: string;
  teams: string;
  fee: string;
  image: string;
  division: string;
  slots: {
    filled: number;
    capacity: number;
    statusLabel?: string;
  };
  pricePerParticipant: string;
  description: string;
  tags?: string[];
  gallery?: string[];
  availableDivisions?: DivisionPricing[];
};

export type EventCategory = {
  title: string;
  subtitle: string;
  events: Event[];
};

export type DivisionPricing = {
  name: string;
  earlyBird?: {
    price: number;
    deadline: string; // ISO date (YYYY-MM-DD)
  };
  regular: {
    price: number;
  };
};
