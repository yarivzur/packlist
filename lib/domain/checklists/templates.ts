export type ChecklistCategory =
  | "crucial"
  | "clothing"
  | "evening"
  | "sports"
  | "accessories"
  | "tech"
  | "toiletries";

export interface TemplateItem {
  text: string;
  category: ChecklistCategory;
  priority: number;
  id: string; // used as source_rule
}

// Base items for every trip
export const BASE_ITEMS: TemplateItem[] = [
  // Crucial
  { id: "passport", text: "Passport", category: "crucial", priority: 10 },
  { id: "id-card", text: "ID card / driver's license", category: "crucial", priority: 15 },
  { id: "phone", text: "Phone", category: "crucial", priority: 11 },
  { id: "phone-charger", text: "Phone charger", category: "crucial", priority: 12 },
  { id: "wallet", text: "Wallet + cards", category: "crucial", priority: 13 },
  { id: "keys", text: "Keys", category: "crucial", priority: 14 },
  // Clothing
  { id: "underwear", text: "Underwear", category: "clothing", priority: 20 },
  { id: "socks", text: "Socks", category: "clothing", priority: 21 },
  { id: "t-shirts", text: "T-shirts / tops", category: "clothing", priority: 22 },
  { id: "sleepwear", text: "Sleepwear / pajamas", category: "clothing", priority: 25 },
  // Toiletries
  { id: "toothbrush", text: "Toothbrush", category: "toiletries", priority: 20 },
  { id: "toothpaste", text: "Toothpaste", category: "toiletries", priority: 21 },
  { id: "deodorant", text: "Deodorant", category: "toiletries", priority: 22 },
];

// International travel extras
export const INTERNATIONAL_ITEMS: TemplateItem[] = [
  { id: "travel-insurance", text: "Travel insurance docs", category: "crucial", priority: 16 },
  { id: "esim", text: "SIM card / eSIM for destination", category: "tech", priority: 35 },
  { id: "power-adapter", text: "Power adapter (check plug type)", category: "tech", priority: 30 },
  { id: "currency", text: "Local currency / Revolut/Wise card", category: "crucial", priority: 17 },
];

// Business / mixed trip extras
export const BUSINESS_ITEMS: TemplateItem[] = [
  { id: "laptop", text: "Laptop", category: "tech", priority: 11 },
  { id: "laptop-charger", text: "Laptop charger", category: "tech", priority: 13 },
  { id: "business-cards", text: "Business cards", category: "accessories", priority: 50 },
  { id: "formal-outfit", text: "Formal / business attire", category: "evening", priority: 20 },
  { id: "notebook-pen", text: "Notebook + pen", category: "accessories", priority: 55 },
];

// Rain items
export const RAIN_ITEMS: TemplateItem[] = [
  { id: "umbrella", text: "Umbrella / rain jacket", category: "clothing", priority: 30 },
  { id: "waterproof-shoes", text: "Waterproof shoes", category: "sports", priority: 40 },
];

// Cold weather items
export const COLD_ITEMS: TemplateItem[] = [
  { id: "warm-coat", text: "Warm coat / jacket", category: "clothing", priority: 22 },
  { id: "warm-layers", text: "Thermal layers / sweater", category: "clothing", priority: 24 },
  { id: "gloves-hat", text: "Gloves + hat / scarf", category: "accessories", priority: 26 },
];

// Hot weather items
export const HOT_ITEMS: TemplateItem[] = [
  { id: "sunscreen", text: "Sunscreen (SPF 50+)", category: "toiletries", priority: 25 },
  { id: "sunglasses", text: "Sunglasses", category: "accessories", priority: 30 },
  { id: "light-clothing", text: "Light / breathable clothing", category: "clothing", priority: 23 },
  { id: "swimwear", text: "Swimwear", category: "sports", priority: 40 },
];

// Carry-on specific reminders
export const CARRY_ON_ITEMS: TemplateItem[] = [];

// Health items
export const HEALTH_ITEMS: TemplateItem[] = [
  { id: "prescription-meds", text: "Prescription medications", category: "crucial", priority: 8 },
  { id: "painkillers", text: "Painkillers / basic meds", category: "toiletries", priority: 40 },
  { id: "hand-sanitizer", text: "Hand sanitizer", category: "toiletries", priority: 50 },
];

// Category display order
export const CATEGORY_ORDER: ChecklistCategory[] = [
  "crucial",
  "clothing",
  "evening",
  "sports",
  "accessories",
  "tech",
  "toiletries",
];

export const CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  crucial: "Crucial",
  clothing: "Clothing",
  evening: "Evening",
  sports: "Sports",
  accessories: "Accessories",
  tech: "Tech",
  toiletries: "Toiletries",
};

export const CATEGORY_ICONS: Record<ChecklistCategory, string> = {
  crucial: "⭐",
  clothing: "👕",
  evening: "🌙",
  sports: "🏃",
  accessories: "🎧",
  tech: "💻",
  toiletries: "🧴",
};
