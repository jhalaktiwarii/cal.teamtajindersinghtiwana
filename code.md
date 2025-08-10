import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Filter,
  Plus,
  Share2,
  Printer,
  Check,
  X,
  Clock,
  AlertTriangle,
  Gift,
  Users2,
  ChevronDown,
  ChevronRight,
  Search,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

/**
 * VIP Calendar — Sidebar Redesign & Layout Shell
 * -------------------------------------------------
 * Goal: Replace the heavy, listy sidebar with a premium, glanceable, role-aware panel.
 * - Roles: "principal" (read/approve), "staff" (create/edit), "admin" (tenant, access)
 * - Sections: Quick Actions, Pending Approvals/Urgent, Upcoming (7 days), Birthdays
 * - Filters live in a floating drawer; the sidebar is for content, not settings
 * - Top Metric Bar summarizes the day at a glance
 *
 * Drop this file into a React + Tailwind project. Icons: lucide-react. Animations: framer-motion.
 * Calendar area is stubbed — wire your calendar component where noted.
 */

// ---- Demo dataset (replace with your API/state) ----
const demoEvents = [
  {
    id: "e1",
    title: "District review meeting",
    date: "2025-08-05",
    time: "10:30 AM",
    location: "Collector Office",
    urgent: false,
    needsApproval: true,
    attendees: 12,
  },
  {
    id: "e2",
    title: "Public hearing",
    date: "2025-08-05",
    time: "01:00 PM",
    location: "Town Hall",
    urgent: true,
    needsApproval: true,
    attendees: 80,
  },
  {
    id: "e3",
    title: "Inauguration: Water Project",
    date: "2025-08-06",
    time: "11:00 AM",
    location: "Ward 14",
    urgent: false,
    needsApproval: false,
    attendees: 150,
  },
];

const demoBirthdays = [
  { id: "b1", name: "Kanchan Anil Gandhi", date: "2025-08-17" },
  { id: "b2", name: "Gopal Ranjendrakumar Varma", date: "2025-08-20" },
  { id: "b3", name: "Kirtida Janak Dave", date: "2025-08-24" },
];

// ---- Helpers ----
function classNames(...c) {
  return c.filter(Boolean).join(" ");
}

function formatDate(d) {
  try {
    const date = new Date(d);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

// ---- Top Metric Bar ----
function MetricBar({ approvals, urgent, birthdays, role }) {
  const cards = [
    {
      label: role === "principal" ? "Approvals Needed" : "Awaiting Approval",
      value: approvals,
      icon: ShieldCheck,
      color: "from-indigo-500 to-violet-500",
    },
    { label: "Urgent Today", value: urgent, icon: AlertTriangle, color: "from-rose-500 to-orange-500" },
    { label: "Upcoming Birthdays", value: birthdays, icon: Gift, color: "from-amber-500 to-lime-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl ring-1 ring-slate-200 bg-white p-3 sm:p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={classNames("h-10 w-10 rounded-xl grid place-items-center text-white shadow-md bg-gradient-to-br", c.color)}>
              <c.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-500">{c.label}</div>
              <div className="text-xl font-semibold text-slate-900">{c.value}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Collapsible Section ----
function Section({ title, badge, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl ring-1 ring-slate-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 text-left">
          <ChevronDown className={classNames("h-4 w-4 text-slate-400 transition-transform", open ? "rotate-0" : "-rotate-90")} />
          <span className="font-semibold text-slate-800">{title}</span>
          {badge != null && (
            <span className="ml-1 text-xs rounded-full bg-slate-100 text-slate-700 px-2 py-0.5">{badge}</span>
          )}
        </div>
        <span className="text-xs text-slate-400">{open ? "Hide" : "Show"}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-3"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Sidebar items ----
function ApprovalItem({ ev, role, onApprove, onDecline, onToggleUrgent }) {
  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-slate-800">{ev.title}</span>
          {ev.urgent && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 ring-1 ring-rose-200">Urgent</span>
          )}
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {ev.date} • {ev.time}
          </span>
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-1">
        {role !== "principal" ? (
          <button
            className="text-xs px-2 py-1 rounded-lg ring-1 ring-slate-200 hover:bg-slate-100"
            onClick={() => onToggleUrgent(ev.id)}
            title={ev.urgent ? "Remove urgent" : "Mark urgent"}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            className="text-xs px-2 py-1 rounded-lg ring-1 ring-rose-200 text-rose-600 hover:bg-rose-50"
            onClick={() => onToggleUrgent(ev.id)}
            title={ev.urgent ? "Remove urgent" : "Mark urgent"}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
          </button>
        )}
        {role !== "staff" && (
          <>
            <button
              className="text-xs px-2 py-1 rounded-lg bg-emerald-500 text-white hover:brightness-95"
              onClick={() => onApprove(ev.id)}
              title="Approve"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              className="text-xs px-2 py-1 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
              onClick={() => onDecline(ev.id)}
              title="Decline"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function UpcomingItem({ ev }) {
  return (
    <div className="p-3 rounded-xl hover:bg-slate-50">
      <div className="font-medium text-slate-800 truncate">{ev.title}</div>
      <div className="text-xs text-slate-500 flex items-center gap-2">
        <CalendarDays className="h-3.5 w-3.5" />
        <span>
          {formatDate(ev.date)} • {ev.time} • {ev.location}
        </span>
      </div>
    </div>
  );
}

function BirthdayCard({ b, onWish }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl ring-1 ring-slate-200 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-500 to-lime-500 grid place-items-center text-white">
          <Gift className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="font-medium text-slate-800 truncate">{b.name}</div>
          <div className="text-xs text-slate-500">{formatDate(b.date)}</div>
        </div>
      </div>
      <button
        className="text-xs px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-lime-500 text-white shadow hover:shadow-md"
        onClick={() => onWish(b.id)}
      >
        Send wishes
      </button>
    </div>
  );
}

// ---- Filters Drawer ----
function FiltersDrawer({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/30"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-0 h-full w-full sm:w-[360px] bg-white shadow-xl p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-slate-500" />
              <h3 className="font-semibold text-slate-800">Filters</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500">Search</label>
                <div className="mt-1 flex items-center gap-2 rounded-xl ring-1 ring-slate-200 px-3 py-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input className="w-full outline-none text-sm" placeholder="Search by name or location" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500">Status</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {["All", "Scheduled", "Approved", "Declined", "Urgent"].map((s) => (
                    <button key={s} className="text-sm px-3 py-2 rounded-xl ring-1 ring-slate-200 hover:bg-slate-50">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500">Date</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input type="date" className="text-sm px-3 py-2 rounded-xl ring-1 ring-slate-200" />
                  <input type="date" className="text-sm px-3 py-2 rounded-xl ring-1 ring-slate-200" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded-xl">Reset</button>
              <button className="px-3 py-2 text-sm rounded-xl bg-slate-900 text-white">Apply</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---- Sidebar ----
function Sidebar({ role, events, birthdays, actions }) {
  const approvals = events.filter((e) => e.needsApproval);
  const urgent = events.filter((e) => e.urgent);
  const upcoming = events.slice(0, 4);

  return (
    <aside className="w-full lg:w-[360px] shrink-0 space-y-4">
      {/* Quick Actions */}
      <div className="rounded-2xl ring-1 ring-slate-200 bg-white shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800">Quick Actions</h3>
          </div>
          <span className="text-[11px] text-slate-500 capitalize">Role: {role}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {role !== "principal" && (
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow hover:shadow-md" onClick={actions.onAdd}>
              <Plus className="h-4 w-4" /> New Event
            </button>
          )}
          {role !== "staff" && (
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl ring-1 ring-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" onClick={actions.onApproveAll}>
              <ShieldCheck className="h-4 w-4" /> Approve All
            </button>
          )}
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl ring-1 ring-slate-200 hover:bg-slate-50" onClick={actions.onShare}>
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl ring-1 ring-slate-200 hover:bg-slate-50" onClick={actions.onPrint}>
            <Printer className="h-4 w-4" /> PDF/Print
          </button>
        </div>
      </div>

      {/* Metrics */}
      <MetricBar approvals={approvals.length} urgent={urgent.length} birthdays={birthdays.length} role={role} />

      {/* Approvals/Urgent */}
      <Section title={role === "principal" ? "Pending Approvals" : "Awaiting Approval"} badge={approvals.length}>
        {approvals.length === 0 ? (
          <div className="text-sm text-slate-500 p-3">Nothing pending. Nice!</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {approvals.map((e) => (
              <ApprovalItem
                key={e.id}
                ev={e}
                role={role}
                onApprove={actions.onApprove}
                onDecline={actions.onDecline}
                onToggleUrgent={actions.onToggleUrgent}
              />
            ))}
          </div>
        )}
      </Section>

      {/* Upcoming */}
      <Section title="Upcoming (7 days)" defaultOpen={false}>
        <div className="divide-y divide-slate-100">
          {upcoming.map((e) => (
            <UpcomingItem key={e.id} ev={e} />
          ))}
        </div>
      </Section>

      {/* Birthdays */}
      <Section title="Upcoming Birthdays" badge={birthdays.length} defaultOpen>
        <div className="space-y-2">
          {birthdays.map((b) => (
            <BirthdayCard key={b.id} b={b} onWish={actions.onWish} />
          ))}
        </div>
      </Section>
    </aside>
  );
}

// ---- View Switcher (Day/Week/Month/Year/Birthdays) ----
function ViewSwitcher({ value, onChange }) {
  const opts = ["Day", "Week", "Month", "Year", "Birthdays"];
  return (
    <div className="inline-flex rounded-xl ring-1 ring-slate-200 bg-white p-1 shadow-sm">
      {opts.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={classNames(
              "px-3 py-1.5 text-sm rounded-lg",
              active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

// ---- Main App Shell (Calendar on the right) ----
export default function VipCalendarShell() {
  const [role, setRole] = useState("principal"); // "principal" | "staff" | "admin"
  const [events, setEvents] = useState(demoEvents);
  const [birthdays, setBirthdays] = useState(demoBirthdays);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState("Month");

  const actions = useMemo(
    () => ({
      onAdd: () => alert("Open create-event form"),
      onShare: () => alert("Open secure share"),
      onPrint: () => window.print(),
      onApproveAll: () => setEvents((arr) => arr.map((e) => ({ ...e, needsApproval: false }))),
      onApprove: (id) => setEvents((arr) => arr.map((e) => (e.id === id ? { ...e, needsApproval: false } : e))),
      onDecline: (id) => setEvents((arr) => arr.filter((e) => e.id !== id)),
      onToggleUrgent: (id) => setEvents((arr) => arr.map((e) => (e.id === id ? { ...e, urgent: !e.urgent } : e))),
      onWish: (id) => alert(`Send wishes for ${id}`),
    }),
    []
  );

  const counts = useMemo(() => {
    const approvals = events.filter((e) => e.needsApproval).length;
    const urgent = events.filter((e) => e.urgent).length;
    return { approvals, urgent };
  }, [events]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 ring-1 ring-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 grid place-items-center text-white shadow">
              <Users2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">VIP Calendar</div>
              <div className="text-[11px] text-slate-500">Zero-miss scheduling for MLAs/MPs</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ViewSwitcher value={view} onChange={setView} />
            <button className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl ring-1 ring-slate-200 hover:bg-slate-50" onClick={() => setFiltersOpen(true)}>
              <Filter className="h-4 w-4" /> Filters
            </button>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
              <span>Role</span>
              <select
                className="text-sm px-2 py-1 rounded-lg ring-1 ring-slate-200"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="principal">Principal</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-6">
        <Sidebar role={role} events={events} birthdays={birthdays} actions={actions} />

        {/* Calendar Area (replace with your calendar component) */}
        <div className="rounded-3xl ring-1 ring-slate-200 bg-white p-4 sm:p-6 shadow-sm min-h-[640px] relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <CalendarDays className="h-5 w-5" />
              <span className="font-medium">{view} View</span>
            </div>
            <button className="sm:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl ring-1 ring-slate-200 hover:bg-slate-50" onClick={() => setFiltersOpen(true)}>
              <Filter className="h-4 w-4" /> Filters
            </button>
          </div>

          <div className="mt-6 grid place-items-center text-slate-400">
            <div className="text-sm text-center">
              <div className="font-medium text-slate-500">Calendar placeholder</div>
              <div>Drop your Day/Week/Month/Year component here.</div>
            </div>
          </div>

          {/* Floating Create FAB for staff/admin */}
          {(role === "staff" || role === "admin") && (
            <button
              onClick={actions.onAdd}
              className="fixed lg:absolute bottom-6 right-6 inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-white shadow-lg bg-gradient-to-r from-indigo-500 to-violet-500"
            >
              <Plus className="h-4 w-4" /> New Event
            </button>
          )}
        </div>
      </main>

      {/* Filters Drawer */}
      <FiltersDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} />

      {/* Test Instructions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        <div className="mt-2 rounded-2xl bg-white ring-1 ring-slate-200 p-4 text-sm text-slate-600">
          <div className="font-semibold mb-1">Test this redesign</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Switch roles (top-right) to see sidebar behavior for Principal vs Staff.</li>
            <li>Approve/Decline items from the <em>Pending Approvals</em> section.</li>
            <li>Mark an item urgent and watch metrics update.</li>
            <li>Open the <em>Filters</em> drawer; notice the sidebar stays focused on content.</li>
            <li>Try the <em>New Event</em>, <em>Share</em>, and <em>PDF/Print</em> quick actions.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
