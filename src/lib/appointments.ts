export const CAR_TYPES = [
  "Sedan",
  "SUV",
  "Minivan",
  "Coupe",
  "Truck",
  "Hatchback",
  "Crossover",
  "Van",
  "Convertible",
  "Other",
] as const;

export const TIME_SLOTS = [
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
] as const;

export const STATUS_LABELS = {
  BOOKED: "Booked",
  CONFIRMED: "Confirmed",
  CANCELED: "Canceled",
} as const;

export const STATUS_COLORS = {
  BOOKED: "#3b82f6",
  CONFIRMED: "#22c55e",
  CANCELED: "#ef4444",
} as const;
