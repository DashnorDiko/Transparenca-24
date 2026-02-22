# LLogaria AL – Transparenca24

Municipal budget transparency platform for Albania (hackathon MVP). Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts, Framer Motion, and Sonner. Includes a **real-time public spending simulation** and an **interaction layer** for citizen reports and official responses.

## Features

### Authentication & roles

- **Unified login** – Same email/password form for everyone at `/login`; admins can also use `/admin/login`. One set of credentials, role determined by account type.
- **Roles** – **Guest** (browse only), **Citizen** (report anomalies, create/support proposals; no admin access), **Admin** (full access including admin panel).
- **Access control** – Citizens are redirected away from `/admin/*`; only admin accounts can access the control panel, inbox, KLSH pipeline, and settings.
- **Session & logout** – Session and role stored in `localStorage`; header “Dil” (Log out) clears session for both citizens and admins.

**Demo credentials (change in production):**

| Role   | Email                      | Password      |
|--------|----------------------------|---------------|
| User   | user@llogaria.al           | Llogaria2026! |
| User   | qytetar@transparenca24.al  | Transparenca24! |
| Admin  | admin@transparenca24.al    | Transparenca24! |
| Admin  | admin@llogaria.al          | Llogaria2026! |

### Landing & Dashboard

- **Landing** – Hero “Ndjekim Paranë Publike”, interactive region/municipality selector (Albania map), live transaction feed
- **Dashboard** – Sidebar filters (Municipality, Category, Year), spending by category (Recharts BarChart), transaction table with “Raporto Anomali” per row
- **Live feed** – Prioritises flagged and large transactions; shows alerts for anomalies
- **Theme** – GovTech deep blue (#0f172a), dark mode by default with light toggle
- **i18n** – Default Albanian; SQ/EN toggle in header
- **Formatting** – Currency in Lek; dates DD/MM/YYYY (Albanian)

### Public Spending Simulation

- **Real-time simulation** – Start/pause/stop from the dashboard; generates projects, bids, contracts, and transactions over time
- **Municipal budgets** – Fixed yearly budget per municipality; remaining budget updates as projects are created
- **Project lifecycle** – Bidding → Evaluation → In progress (progress payments) → Completed or Reported
- **Procurement** – Multiple companies bid per project; risk score and corruption probability; winner selection; contracts created automatically
- **Transactions** – Budget allocation, progress payments (30% / 60% / 40%), final payment; some status variety (Aprovuar, Në pritje, Anuluar)
- **Anomalies** – Overpriced bids, single bidder, budget overrun; flagged projects feed anomaly statistics
- **Notifications** – Top-left toasts when a new project is created; click to open project detail
- **Control panel** – Speed, corruption probability, project frequency, municipality filter
- **Persistence** – Simulation state (and reports) saved to `localStorage`; restores after reload

### Citizen Reporting & Interaction Layer

- **Report flow** – Multi-step dialog: Description → Evidence (upload/URL) → Contact info; submits a citizen report linked to the transaction
- **Report statuses** – E Verifikuar (blue), Në Debat (purple), Implementuar (green), Në Pritje (amber); shown in the transaction table when a report exists
- **Admin Inbox** (`/admin/inbox`) – Dashboard for municipal officials: list of all citizen reports with Card layout, status badge, linked transaction, and “Përgjigju” button
- **Official Response** – “Dërgo Përgjigje Zyrtare” dialog: change status, write official message, “Njofto Qytetarin” checkbox; updates report and history; success toast via Sonner
- **History tab** – On project detail page: audit trail (e.g. “Raportuar nga Qytetari”, “Kaluar në Debat nga Bashkia”) plus project lifecycle events

### Proposals & voting

- **Proposals** (`/proposals`) – Logged-in users can create citizen proposals (title + description) and support/vote on others.
- **Guest restriction** – Supporting or voting on proposals requires login (to limit abuse).
- **Persistence** – Proposals and transaction vote data (verification/anomaly counts, risk alerts) stored in `localStorage`.

### Admin area

- **Control panel** (`/admin`) – Overview for administrators.
- **Inbox** (`/admin/inbox`) – All citizen reports; status badges, linked transaction, “Përgjigju” (Respond); mock AI risk score (0–100) from transaction amount for display.
- **KLSH pipeline** (`/admin/klsh`) – Build a digital audit package (JSON) from a report: transaction, mock risk score/level, citizen evidence, admin notes; for sending to KLSH (Supreme State Audit).
- **Settings** (`/admin/settings`) – Admin settings (e.g. logout).

### Risk & flagging (rule-based, no real AI)

- **Simulation** – Bids get a risk score and corruption probability from config + randomness; projects get anomaly flags (e.g. SingleBidder, OverpricedBid) from rules in the simulation engine.
- **Citizen reports** – Submitting “Raporto Anomali” flags that transaction (adds to `flaggedTransactionIds`); used in live feed and stats.
- **Crowd alerts** – When anomaly votes on a transaction exceed a threshold (e.g. 5), a risk alert is created and score set to 90.
- **Admin/KLSH “AI risk”** – Mock score from transaction amount brackets (e.g. ≥50M Lek → 85); level high/medium/low from score. Replace with real AI/API in production.

## Tech stack

- Next.js 14 (App Router), TypeScript
- Tailwind CSS, shadcn-style UI (Button, Card, Input, Badge, Dialog, Tabs, Select, Table)
- Recharts (BarChart, Area sparklines)
- Framer Motion
- Sonner (toasts)
- Client-side state: React Context (Auth, AdminAuth, Simulation, Reports, ProposalsAndVoting); mock data and simulation engine; `localStorage` for session, role, simulation, reports, proposals

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- **`app/`** – Routes: `/` (landing), `/login` (unified email/password), `/dashboard`, `/projects`, `/projects/[id]`, `/proposals`, `/admin` (panel), `/admin/login`, `/admin/inbox`, `/admin/klsh`, `/admin/settings`; layout, loading skeletons
- **`components/`** – Header, AlbaniaMap, StatCards, LiveFeed, TransactionTable, ReportAnomalyDialog, OfficialResponseDialog, NotificationToast, SimulationControlPanel, SimulationUI, PageTransition, ThemeProvider, LanguageProvider, UI primitives in `components/ui/`
- **`context/`** – AuthContext (role: Guest/Citizen/Admin), AdminAuthContext (session, login/logout, validates credentials), SimulationContext (simulation state, tick, persistence, flagTransaction), ReportsContext (citizen reports, official responses, persistence), ProposalsAndVotingContext (proposals, transaction votes, risk alerts)
- **`lib/`** – `utils.ts`, `auth.ts` (role storage), `admin-auth.ts` (credentials, session, validateCredentials), `mock-data.ts`, `i18n.ts`, `simulation-types.ts`, `simulation-engine.ts`, `simulation-persistence.ts`, `reports-types.ts`, `proposals-types.ts`

## Data & simulation

- **61 municipalities** – All Albanian bashkitë; in simulation each has fixed `budgetTotal` and live `budgetRemaining`
- **Simulation** – Creates projects (weighted by municipality size and season), bids with risk/corruption, contracts, and transactions; supports delays, over-budget, and status variety
- **Citizen reports** – Stored in ReportsContext and `localStorage`; status workflow: PENDING → E_VERIFIKUAR / NE_DEBAT / IMPLEMENTUAR
- **Auth accounts** – Admin and user accounts defined in `lib/admin-auth.ts` (and env `NEXT_PUBLIC_ADMIN_EMAIL` / `NEXT_PUBLIC_ADMIN_PASSWORD`); replace with server-side auth in production
- **Mock data** – Used when simulation has no data; 61 municipalities, 50+ transactions, 10 contracts (see `lib/mock-data.ts`)

All currency is in **Lek**; dates are formatted **DD/MM/YYYY** for display.
