"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabasePublic } from "@/lib/supabase";

type Slot = {
  id: string;
  date: string;
  time: string;
  duration_minutes: number;
  status: string;
};

type Booking = {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service: string;
  status: string;
  slot_id: string;
  slots: Slot;
};

type Tab = "calendar" | "add" | "appointments" | "reschedule";

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabasePublic.auth.getSession();
  let session = data.session;

  const expiresInMs = session?.expires_at ? session.expires_at * 1000 - Date.now() : 0;
  if (session && expiresInMs < 60000) {
    const { data: refreshed } = await supabasePublic.auth.refreshSession();
    session = refreshed.session ?? session;
  }

  return session ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("calendar");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [openSlots, setOpenSlots] = useState<Slot[]>([]);
  const [allSlots, setAllSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const { data, error } = await supabasePublic.auth.getUser();
      if (error || !data.user) {
        await supabasePublic.auth.signOut();
        router.push("/admin/login");
        return;
      }
      setChecking(false);
    }
    checkSession();
  }, [router]);

  const loadData = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    const headers = await authHeaders();
    const [bookingsRes, slotsRes, allSlotsRes] = await Promise.all([
      fetch("/api/admin/bookings", { headers }),
      fetch("/api/slots"),
      fetch("/api/admin/slots", { headers }),
    ]);

    if (bookingsRes.status === 401 || allSlotsRes.status === 401) {
      await supabasePublic.auth.signOut();
      router.push("/admin/login?expired=1");
      return;
    }

    const bookingsData = await bookingsRes.json();
    const slotsData = await slotsRes.json();
    const allSlotsData = await allSlotsRes.json();
    setBookings(bookingsData.bookings || []);
    setOpenSlots(slotsData.slots || []);
    setAllSlots(allSlotsData.slots || []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (checking) return;

    loadData();

    const interval = setInterval(() => loadData({ silent: true }), 15000);

    function onFocus() {
      loadData({ silent: true });
    }
    function onVisibilityChange() {
      if (document.visibilityState === "visible") loadData({ silent: true });
    }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [checking, loadData]);

  async function handleLogout() {
    await supabasePublic.auth.signOut();
    router.push("/admin/login");
  }

  if (checking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-sm text-black/50">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row min-h-[80vh]">
      <Sidebar tab={tab} setTab={setTab} onLogout={handleLogout} />
      <MobileTabBar tab={tab} setTab={setTab} onLogout={handleLogout} />
      <div className="flex-1 min-w-0 px-4 sm:px-8 py-6 sm:py-10">
        {loading ? (
          <p className="text-sm text-black/50">Loading...</p>
        ) : (
          <>
            {tab === "calendar" && (
              <CalendarView bookings={bookings} slots={allSlots} />
            )}
            {tab === "add" && <AddTimeslotsView onCreated={loadData} />}
            {tab === "appointments" && (
              <AppointmentsView
                bookings={bookings}
                allSlots={allSlots}
                onChange={loadData}
              />
            )}
            {tab === "reschedule" && (
              <RescheduleView
                bookings={bookings}
                openSlots={openSlots}
                onChange={loadData}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Sidebar({
  tab,
  setTab,
  onLogout,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  onLogout: () => void;
}) {
  const items: { key: Tab; label: string }[] = [
    { key: "calendar", label: "Calendar" },
    { key: "add", label: "Add Timeslots" },
    { key: "appointments", label: "Appointments" },
    { key: "reschedule", label: "Reschedule" },
  ];

  return (
    <aside className="hidden sm:flex w-56 shrink-0 bg-[var(--sage)]/30 border-r border-black/10 px-4 py-10 flex-col justify-between">
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`text-left px-4 py-2.5 rounded-lg text-sm tracking-wide transition-colors ${
              tab === item.key
                ? "bg-[var(--ink)] text-white"
                : "hover:bg-black/5"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button
        onClick={onLogout}
        className="text-left px-4 py-2.5 text-sm text-black/50 hover:text-black transition-colors"
      >
        Log out
      </button>
    </aside>
  );
}

function MobileTabBar({
  tab,
  setTab,
  onLogout,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const items: { key: Tab; label: string }[] = [
    { key: "calendar", label: "Calendar" },
    { key: "add", label: "Add Timeslots" },
    { key: "appointments", label: "Appointments" },
    { key: "reschedule", label: "Reschedule" },
  ];
  const currentLabel = items.find((i) => i.key === tab)?.label ?? "Menu";

  return (
    <div className="sm:hidden relative border-b border-black/10 bg-[var(--sage)]/30">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5"
        aria-label="Menu"
        aria-expanded={open}
      >
        <span className="text-sm font-medium tracking-wide">{currentLabel}</span>
        <span className={`text-black/50 transition-transform ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>
      {open && (
        <nav className="animate-grow-in absolute top-full inset-x-0 z-30 bg-[var(--sage)] border-b border-black/10 shadow-lg flex flex-col px-4 py-3 gap-1">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setTab(item.key);
                setOpen(false);
              }}
              className={`text-left px-4 py-2.5 rounded-lg text-sm tracking-wide transition-colors ${
                tab === item.key
                  ? "bg-[var(--ink)] text-white"
                  : "hover:bg-black/5"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="text-left px-4 py-2.5 mt-1 pt-3 border-t border-black/10 text-sm text-black/50 hover:text-black transition-colors"
          >
            Log out
          </button>
        </nav>
      )}
    </div>
  );
}

function getCurrentWeekDates(): Date[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
}

function getMonthDates(ref: Date): (Date | null)[] {
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(firstWeekday).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  return cells;
}

function formatDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minuteStr} ${period}`;
}

function CalendarView({
  bookings,
  slots,
}: {
  bookings: Booking[];
  slots: Slot[];
}) {
  const [viewMode, setViewMode] = useState<"week" | "month">("month");
  const [monthOffset, setMonthOffset] = useState(0);

  const activeBookingBySlot = new Map<string, Booking>();
  bookings.forEach((b) => {
    if (b.status === "pending" || b.status === "accepted") {
      activeBookingBySlot.set(b.slot_id, b);
    }
  });

  const weekDates = getCurrentWeekDates();
  const monthRef = new Date();
  monthRef.setDate(1);
  monthRef.setMonth(monthRef.getMonth() + monthOffset);
  const monthDates = getMonthDates(monthRef);

  const datesToShow = viewMode === "week" ? weekDates : monthDates;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-2xl tracking-[0.1em] uppercase">
          {viewMode === "week"
            ? "This Week"
            : monthRef.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
        </h1>
        <div className="flex items-center gap-2">
          {viewMode === "month" && (
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={() => setMonthOffset((o) => o - 1)}
                className="text-sm px-2.5 py-1.5 rounded-full border border-black/20 hover:bg-black/5"
              >
                ←
              </button>
              <button
                onClick={() => setMonthOffset((o) => o + 1)}
                className="text-sm px-2.5 py-1.5 rounded-full border border-black/20 hover:bg-black/5"
              >
                →
              </button>
            </div>
          )}
          <button
            onClick={() => setViewMode("week")}
            className={`text-xs px-4 py-2 rounded-full transition-colors ${
              viewMode === "week"
                ? "bg-[var(--ink)] text-white"
                : "border border-black/20 hover:bg-black/5"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => {
              setViewMode("month");
              setMonthOffset(0);
            }}
            className={`text-xs px-4 py-2 rounded-full transition-colors ${
              viewMode === "month"
                ? "bg-[var(--ink)] text-white"
                : "border border-black/20 hover:bg-black/5"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-[10px] uppercase tracking-wide text-black/40 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {datesToShow.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const key = formatDateKey(date);
          const daySlots = slots
            .filter((s) => s.date === key)
            .sort((a, b) => a.time.localeCompare(b.time));

          return (
            <div key={key} className="border border-black/10 rounded-xl p-2">
              <div className="text-xs font-medium mb-1.5">
                {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </div>
              {daySlots.length === 0 ? (
                <p className="text-[11px] text-black/40">No slots</p>
              ) : (
                <ul className="space-y-1.5">
                  {daySlots.map((s) => {
                    const booking = activeBookingBySlot.get(s.id);
                    return (
                      <li key={s.id} className="text-xs">
                        {booking ? (
                          <>
                            <div className="font-medium">
                              {formatTime(s.time)} — {booking.client_name}
                            </div>
                            <div className="text-black/50">{booking.service}</div>
                            <StatusBadge status={booking.status} />
                          </>
                        ) : (
                          <>
                            <div className="font-medium">{formatTime(s.time)}</div>
                            <StatusBadge status={s.status} />
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "text-amber-600",
    accepted: "text-green-600",
    declined: "text-red-600",
    cancelled: "text-black/40",
    open: "text-blue-600",
    booked: "text-green-600",
  };
  return <span className={colors[status] || "text-black/50"}>{status}</span>;
}

function AddTimeslotsView({ onCreated }: { onCreated: () => void }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    const res = await fetch("/api/slots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify({ date, time }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Something went wrong");
    } else {
      setMessage("Slot added");
      setDate("");
      setTime("");
      onCreated();
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-sm">
      <h1 className="font-display text-2xl tracking-[0.1em] uppercase mb-8">
        Add Timeslot
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-black/20 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Time</label>
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border border-black/20 rounded-lg px-3 py-2"
          />
        </div>
        <p className="text-xs text-black/40">Every slot is a fixed 150-minute block.</p>
        {message && <p className="text-sm">{message}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-[var(--ink)] text-white rounded-full px-6 py-2.5 text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add Slot"}
        </button>
      </form>
    </div>
  );
}

function AppointmentsView({
  bookings,
  allSlots,
  onChange,
}: {
  bookings: Booking[];
  allSlots: Slot[];
  onChange: () => void;
}) {
  const pending = bookings.filter((b) => b.status === "pending");
  const accepted = bookings.filter((b) => b.status === "accepted");
  const sortedSlots = [...allSlots].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  async function act(id: string, action: "accept" | "decline") {
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify({ action }),
    });
    onChange();
  }

  async function cancel(id: string) {
    if (!confirm("Cancel this appointment?")) return;
    await fetch(`/api/admin/bookings/${id}/cancel`, {
      method: "PATCH",
      headers: await authHeaders(),
    });
    onChange();
  }

  async function removeSlot(id: string) {
    if (!confirm("Remove this timeslot?")) return;
    const res = await fetch(`/api/slots/${id}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Could not remove slot");
      return;
    }
    onChange();
  }

  const openSlots = sortedSlots.filter((s) => s.status === "open");

  return (
    <div>
      <h1 className="font-display text-2xl tracking-[0.1em] uppercase mb-8">
        Appointments
      </h1>

      <h2 className="text-sm font-medium mb-3 text-black/60">Book for Client</h2>
      <BookForClientForm openSlots={openSlots} onBooked={onChange} />

      <h2 className="text-sm font-medium mb-3 mt-10 text-black/60">All Timeslots</h2>
      <SlotTable slots={sortedSlots} onRemove={removeSlot} />

      <h2 className="text-sm font-medium mb-3 mt-10 text-black/60">Pending</h2>
      <BookingTable
        bookings={pending}
        renderActions={(b) => (
          <div className="flex gap-2">
            <button
              onClick={() => act(b.id, "accept")}
              className="text-xs bg-[var(--ink)] text-white rounded-full px-3 py-1.5"
            >
              Accept
            </button>
            <button
              onClick={() => act(b.id, "decline")}
              className="text-xs border border-black/20 rounded-full px-3 py-1.5"
            >
              Decline
            </button>
          </div>
        )}
      />

      <h2 className="text-sm font-medium mb-3 mt-10 text-black/60">Approved</h2>
      <BookingTable
        bookings={accepted}
        renderActions={(b) => (
          <button
            onClick={() => cancel(b.id)}
            className="text-xs border border-black/20 rounded-full px-3 py-1.5"
          >
            Cancel
          </button>
        )}
      />
    </div>
  );
}

function BookingTable({
  bookings,
  renderActions,
}: {
  bookings: Booking[];
  renderActions: (b: Booking) => React.ReactNode;
}) {
  if (bookings.length === 0) {
    return <p className="text-sm text-black/40 mb-4">None right now.</p>;
  }

  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-black/50 border-b border-black/10">
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Time</th>
            <th className="py-2 pr-4">Client</th>
            <th className="py-2 pr-4">Service</th>
            <th className="py-2 pr-4">Contact</th>
            <th className="py-2 pr-4">Phone Number</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b border-black/5">
              <td className="py-3 pr-4">{b.slots?.date}</td>
              <td className="py-3 pr-4">{b.slots?.time && formatTime(b.slots.time)}</td>
              <td className="py-3 pr-4">{b.client_name}</td>
              <td className="py-3 pr-4">{b.service}</td>
              <td className="py-3 pr-4 text-black/50">{b.client_email}</td>
              <td className="py-3 pr-4 text-black/50">{b.client_phone}</td>
              <td className="py-3">{renderActions(b)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BookForClientForm({
  openSlots,
  onBooked,
}: {
  openSlots: Slot[];
  onBooked: () => void;
}) {
  const [slotId, setSlotId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [service, setService] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    const res = await fetch("/api/admin/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify({
        slot_id: slotId,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        service,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Something went wrong");
    } else {
      setMessage("Booked");
      setSlotId("");
      setClientName("");
      setClientEmail("");
      setClientPhone("");
      setService("");
      onBooked();
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 mb-4">
      <div>
        <label className="block text-xs mb-1 text-black/60">Timeslot</label>
        <select
          required
          value={slotId}
          onChange={(e) => setSlotId(e.target.value)}
          className="border border-black/20 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select slot...</option>
          {openSlots.map((s) => (
            <option key={s.id} value={s.id}>
              {s.date} at {formatTime(s.time)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs mb-1 text-black/60">Client Name</label>
        <input
          type="text"
          required
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="border border-black/20 rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs mb-1 text-black/60">Email</label>
        <input
          type="email"
          required
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          className="border border-black/20 rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs mb-1 text-black/60">Phone</label>
        <input
          type="tel"
          required
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
          className="border border-black/20 rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs mb-1 text-black/60">Service</label>
        <input
          type="text"
          required
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="border border-black/20 rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="text-xs bg-[var(--ink)] text-white rounded-full px-4 py-2.5 disabled:opacity-50"
      >
        {submitting ? "Booking..." : "Book"}
      </button>
      {message && <p className="text-sm w-full">{message}</p>}
    </form>
  );
}

function SlotTable({
  slots,
  onRemove,
}: {
  slots: Slot[];
  onRemove: (id: string) => void;
}) {
  if (slots.length === 0) {
    return <p className="text-sm text-black/40 mb-4">No timeslots yet.</p>;
  }

  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-black/50 border-b border-black/10">
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Time</th>
            <th className="py-2 pr-4">Duration</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {slots.map((s) => (
            <tr key={s.id} className="border-b border-black/5">
              <td className="py-3 pr-4">{s.date}</td>
              <td className="py-3 pr-4">{formatTime(s.time)}</td>
              <td className="py-3 pr-4">{s.duration_minutes} min</td>
              <td className="py-3 pr-4">
                <StatusBadge status={s.status} />
              </td>
              <td className="py-3">
                {s.status === "open" && (
                  <button
                    onClick={() => onRemove(s.id)}
                    className="text-xs border border-black/20 rounded-full px-3 py-1.5"
                  >
                    Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RescheduleView({
  bookings,
  openSlots,
  onChange,
}: {
  bookings: Booking[];
  openSlots: Slot[];
  onChange: () => void;
}) {
  const accepted = bookings.filter((b) => b.status === "accepted");
  const [selected, setSelected] = useState<Record<string, string>>({});

  async function reschedule(bookingId: string) {
    const newSlotId = selected[bookingId];
    if (!newSlotId) return;

    await fetch(`/api/admin/bookings/${bookingId}/reschedule`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeaders()),
      },
      body: JSON.stringify({ new_slot_id: newSlotId }),
    });
    onChange();
  }

  return (
    <div>
      <h1 className="font-display text-2xl tracking-[0.1em] uppercase mb-8">
        Reschedule
      </h1>
      {accepted.length === 0 ? (
        <p className="text-sm text-black/40">No approved appointments to reschedule.</p>
      ) : (
        <div className="space-y-4">
          {accepted.map((b) => (
            <div
              key={b.id}
              className="flex flex-wrap items-center gap-3 border border-black/10 rounded-xl p-4"
            >
              <div className="flex-1 min-w-[180px]">
                <div className="font-medium text-sm">
                  {b.client_name} — {b.service}
                </div>
                <div className="text-xs text-black/50">
                  Currently: {b.slots?.date} at {b.slots?.time && formatTime(b.slots.time)}
                </div>
              </div>
              <select
                value={selected[b.id] || ""}
                onChange={(e) =>
                  setSelected((prev) => ({ ...prev, [b.id]: e.target.value }))
                }
                className="border border-black/20 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select new slot...</option>
                {openSlots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.date} at {formatTime(s.time)}
                  </option>
                ))}
              </select>
              <button
                onClick={() => reschedule(b.id)}
                disabled={!selected[b.id]}
                className="text-xs bg-[var(--ink)] text-white rounded-full px-4 py-2 disabled:opacity-40"
              >
                Reschedule
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}