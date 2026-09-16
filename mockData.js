// mockData.js
// Single source of truth for the LensFlow CRM demo.
// No backend — this array is read/written by the Zustand store and
// persisted to localStorage so state survives a page refresh.

export const STATUSES = [
  "New",
  "Contacted",
  "Quotation",
  "Negotiation",
  "Booked",
];

export const SOURCES = [
  "Instagram",
  "WhatsApp",
  "Facebook",
  "Website",
  "Referral",
];

export const EVENT_TYPES = [
  "Wedding",
  "Pre-Wedding",
  "Engagement",
  "Birthday",
  "Maternity",
  "Corporate",
];

// Badge colors keyed by source — use these consistently everywhere
// (Leads table, Lead Details, Pipeline cards) so the demo feels coherent.
export const SOURCE_COLORS = {
  Instagram: "bg-pink-100 text-pink-700",
  WhatsApp: "bg-green-100 text-green-700",
  Facebook: "bg-blue-100 text-blue-700",
  Website: "bg-purple-100 text-purple-700",
  Referral: "bg-amber-100 text-amber-700",
};

export const STATUS_COLORS = {
  New: "bg-slate-100 text-slate-700",
  Contacted: "bg-blue-100 text-blue-700",
  Quotation: "bg-amber-100 text-amber-700",
  Negotiation: "bg-orange-100 text-orange-700",
  Booked: "bg-green-100 text-green-700",
};

export const initialLeads = [
  {
    id: "lead-001",
    name: "Rahul Sharma",
    source: "Instagram",
    handle: "@rahulsharma",
    phone: "+91 98200 11223",
    email: "rahul@email.com",
    event: "Wedding",
    eventDate: "2026-12-24",
    location: "Mumbai",
    guests: 350,
    requirements: ["Photography", "Videography", "Cinematic Film", "Album", "Reels"],
    budget: 150000,
    quotation: 165000,
    advance: 50000,
    status: "Quotation",
    nextFollowUp: "2026-09-18",
    activity: [
      { date: "2026-09-13", note: "Instagram enquiry" },
      { date: "2026-09-15", note: "Called client" },
      { date: "2026-09-16", note: "Quotation sent" },
    ],
    createdAt: "2026-09-13",
  },
  {
    id: "lead-002",
    name: "Priya Mehta",
    source: "WhatsApp",
    handle: null,
    phone: "+91 90040 55667",
    email: "priya.mehta@email.com",
    event: "Pre-Wedding",
    eventDate: "2026-11-02",
    location: "Udaipur",
    guests: 2,
    requirements: ["Photography", "Videography"],
    budget: 60000,
    quotation: null,
    advance: 0,
    status: "Contacted",
    nextFollowUp: "2026-09-16",
    activity: [
      { date: "2026-09-14", note: "WhatsApp enquiry" },
      { date: "2026-09-15", note: "Initial call completed" },
    ],
    createdAt: "2026-09-14",
  },
  {
    id: "lead-003",
    name: "Arjun Patel",
    source: "Website",
    handle: null,
    phone: "+91 91234 88990",
    email: "arjun.patel@email.com",
    event: "Engagement",
    eventDate: "2026-10-30",
    location: "Ahmedabad",
    guests: 120,
    requirements: ["Photography", "Album"],
    budget: 45000,
    quotation: null,
    advance: 0,
    status: "New",
    nextFollowUp: "2026-09-18",
    activity: [{ date: "2026-09-16", note: "Website form submission" }],
    createdAt: "2026-09-16",
  },
  {
    id: "lead-004",
    name: "Neha Shah",
    source: "Referral",
    handle: null,
    phone: "+91 99887 66554",
    email: "neha.shah@email.com",
    event: "Wedding",
    eventDate: "2026-12-05",
    location: "Pune",
    guests: 400,
    requirements: ["Photography", "Videography", "Cinematic Film", "Album", "Drone"],
    budget: 200000,
    quotation: 210000,
    advance: 70000,
    status: "Booked",
    nextFollowUp: null,
    activity: [
      { date: "2026-08-20", note: "Referred by Rahul Sharma" },
      { date: "2026-08-22", note: "Initial call completed" },
      { date: "2026-08-25", note: "Quotation sent" },
      { date: "2026-09-01", note: "Advance received — booking confirmed" },
    ],
    createdAt: "2026-08-20",
  },
  {
    id: "lead-005",
    name: "Karan Desai",
    source: "Facebook",
    handle: null,
    phone: "+91 97765 43210",
    email: "karan.desai@email.com",
    event: "Birthday",
    eventDate: "2026-10-12",
    location: "Surat",
    guests: 60,
    requirements: ["Photography"],
    budget: 15000,
    quotation: null,
    advance: 0,
    status: "New",
    nextFollowUp: "2026-09-20",
    activity: [{ date: "2026-09-16", note: "Facebook enquiry" }],
    createdAt: "2026-09-16",
  },
];

// Booked leads auto-generate a project record like this.
// When status flips to "Booked" in the store, push a matching entry here.
export const initialProjects = [
  {
    id: "proj-001",
    leadId: "lead-004",
    name: "Neha Shah",
    event: "Wedding Photography",
    eventDate: "2026-12-05",
    location: "Pune",
    milestones: {
      bookingConfirmed: true,
      shootCompleted: false,
      editing: false,
      album: false,
      finalDelivery: false,
    },
    total: 210000,
    paid: 70000,
  },
];
