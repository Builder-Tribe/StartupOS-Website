export type Campaign = {
  id: string;
  brand: string;
  brandInitials: string;
  title: string;
  category: string;
  platform: string;
  location: string;
  budget: number;
  applicants: number;
  deadline: string;
  match: number;
  featured?: boolean;
  description: string;
  objective?: string;
  deliverables: string[];
  requirements: string[];
};

export const campaigns: Campaign[] = [
  {
    id: "earthkind-summer",
    brand: "EarthKind",
    brandInitials: "EK",
    title: "Summer Skin, Naturally",
    category: "Beauty",
    platform: "Instagram",
    location: "Pan India",
    budget: 25000,
    applicants: 18,
    deadline: "2026-09-14",
    match: 96,
    featured: true,
    description: "Create warm, honest skincare content for EarthKind's new mineral sunscreen. Show how it fits into a real Indian summer routine without over-polished claims.",
    deliverables: ["1 Instagram Reel", "3 story frames", "30-day organic usage"],
    requirements: ["Beauty or wellness niche", "10K+ followers", "Hindi or English"]
  },
  {
    id: "brew-district-cold-coffee",
    brand: "Brew District",
    brandInitials: "BD",
    title: "Cold Coffee, City Stories",
    category: "Food",
    platform: "Instagram",
    location: "Delhi NCR",
    budget: 18000,
    applicants: 11,
    deadline: "2026-09-18",
    match: 91,
    description: "Tell a quick city story over a Brew District cold coffee. We are looking for creators who make everyday moments feel worth sharing.",
    deliverables: ["1 Instagram Reel", "1 static post"],
    requirements: ["Delhi NCR based", "Food, lifestyle or city niche", "8K+ followers"]
  },
  {
    id: "stride-labs-commute",
    brand: "Stride Labs",
    brandInitials: "SL",
    title: "Move Through Your City",
    category: "Fitness",
    platform: "Instagram",
    location: "Mumbai",
    budget: 32000,
    applicants: 27,
    deadline: "2026-09-20",
    match: 88,
    description: "Document an active commute across Mumbai in Stride Labs trainers. The content should feel energetic, practical and grounded in the city.",
    deliverables: ["1 Instagram Reel", "5 edited photographs"],
    requirements: ["Mumbai based", "Fitness or lifestyle niche", "20K+ followers"]
  },
  {
    id: "loom-local-festive",
    brand: "Loom Local",
    brandInitials: "LL",
    title: "Festive Fits, Local Hands",
    category: "Fashion",
    platform: "YouTube",
    location: "Pan India",
    budget: 45000,
    applicants: 34,
    deadline: "2026-09-24",
    match: 84,
    description: "Style a festive look around handwoven pieces and introduce your audience to the makers behind them.",
    deliverables: ["1 YouTube integration", "2 Shorts", "60-day organic usage"],
    requirements: ["Fashion or culture niche", "25K+ subscribers", "English or regional language"]
  },
  {
    id: "nimbus-notes-campus",
    brand: "Nimbus Notes",
    brandInitials: "NN",
    title: "Build Your Semester System",
    category: "Technology",
    platform: "YouTube",
    location: "Bengaluru",
    budget: 22000,
    applicants: 9,
    deadline: "2026-09-28",
    match: 79,
    description: "Show students how you plan a busy semester using Nimbus Notes. Useful workflows matter more than a polished desk setup.",
    deliverables: ["1 YouTube video", "1 community post"],
    requirements: ["Student or productivity niche", "Bengaluru preferred", "12K+ subscribers"]
  }
];