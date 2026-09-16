# LensFlow CRM — Photography Business Management System

A sleek, frontend-only CRM built for photography studios and creative professionals. Built with **React**, **Vite**, **Tailwind CSS**, and **Zustand** with full `localStorage` persistence.

---

## ✨ Features

- **📊 Studio Dashboard**:
  - Live computed stats: Total Leads, New Leads, Pending Follow-ups, and Bookings.
  - Recharts Donut chart visualizing lead source attribution with center metrics.
  - Sales Pipeline stage breakdown with proportional horizontal progress indicators.
  - Today's Follow-up list with one-click call action and Recent Bookings log.

- **👥 Lead Management**:
  - Full lead directory with search by name, email, or phone.
  - Multi-criteria filter dropdowns by **Source** (Instagram, WhatsApp, Website, Referral, Facebook), **Status**, and **Event Type**.
  - Color-coded status pills matching design specifications (`New`, `Contacted`, `Quotation`, `Negotiation`, `Booked`, `Follow-up`, `Lost`).
  - Interactive pagination and quick `+ Add Lead` modal.

- **🗂️ Sales Pipeline (Kanban Board)**:
  - Drag-and-drop Kanban workflow powered by `@dnd-kit`.
  - 5 fixed stages: `New` → `Contacted` → `Quotation` → `Negotiation` → `Booked`.
  - **Auto-Sync to Projects**: Dragging any lead into `Booked` automatically creates a project entry in the Projects store with milestone tracking.
  - Switchable Board View and List View.

- **💼 Projects & Milestone Tracker**:
  - Tracks booked photography assignments from shoot to final album delivery.
  - 5-step milestone checklist: `Booking Confirmed` → `Shoot Completed` → `Editing` → `Album` → `Final Delivery`.
  - Live progress bar and commercial payment summary (Total, Paid Advance, Remaining).

- **📞 Follow-ups Queue**:
  - Categorized tabs: **Overdue**, **Today**, **Upcoming**, and **Completed**.
  - Relative time tags (`Today`, `1 day overdue`, `Tomorrow`).
  - Actions to Call, Mark as Done, or Reschedule follow-ups.

- **🤝 Clients Directory**:
  - Aggregated directory of confirmed/booked clients.
  - Financial overview showing contract values and advance payments with direct links to project workflows.

- **📅 Studio Calendar**:
  - Monthly calendar view tracking both **Shoot Days** (indigo) and **Follow-up Reminders** (amber).
  - Day details modal with direct phone links and client details.

- **📈 Business Analytics**:
  - Recharts visualizations: Leads by Source, Monthly Booking Trends, Conversion Drop-off Funnel, and Event Type Breakdown.

- **🔒 Auth & Settings**:
  - Demo authentication guard (`/login` with one-click quick demo access).
  - Studio profile customization, notification toggles, and mock data reset utility.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State Management**: Zustand (with `persist` middleware in `localStorage`)
- **Charts**: Recharts
- **Drag and Drop**: `@dnd-kit/core` & `@dnd-kit/sortable`
- **Icons**: Lucide React
- **Typography**: Inter

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd "ultra albums demo CRM"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) or the port displayed in your terminal.

### 4. Build for production
```bash
npm run build
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx
│   └── layout/
│       └── AppShell.jsx
├── data/
│   └── mockData.js
├── pages/
│   ├── Analytics.jsx
│   ├── Calendar.jsx
│   ├── Clients.jsx
│   ├── Dashboard.jsx
│   ├── FollowUps.jsx
│   ├── LeadDetails.jsx
│   ├── Leads.jsx
│   ├── Login.jsx
│   ├── Pipeline.jsx
│   ├── Projects.jsx
│   └── Settings.jsx
├── store/
│   └── useCrmStore.js
├── App.jsx
├── index.css
└── main.jsx
```

---

## 📄 License
MIT License. Built for photography studio CRM demonstrations.
