"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type TierId = "tier1" | "tier2" | "tier3" | "tier4";

type FreestyleType = "normal" | "moodboard" | "artist";

type LengthId = "xshort" | "short" | "medium" | "long";

type Service = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  kind: "tiered" | "freestyle" | "simple";
};

type CartItem = {
  key: string;
  serviceId: string;
  serviceName: string;
  tierLabel: string | null;
  removal: boolean;
  total: number;
};

type Slot = {
  id: string;
  date: string;
  time: string;
  duration_minutes: number;
  status: string;
};

const REMOVAL_PRICE = 15;

const TIERS: { id: TierId; label: string; add: number }[] = [
  { id: "tier1", label: "Tier 1", add: 25 },
  { id: "tier2", label: "Tier 2", add: 30 },
  { id: "tier3", label: "Tier 3", add: 35 },
  { id: "tier4", label: "Tier 4", add: 40 },
];

const FREESTYLE_TYPES: { id: FreestyleType; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "moodboard", label: "Moodboard" },
  { id: "artist", label: "Artist Creative" },
];

const LENGTHS: { id: LengthId; label: string }[] = [
  { id: "xshort", label: "Extra Short" },
  { id: "short", label: "Short" },
  { id: "medium", label: "Medium" },
  { id: "long", label: "Long" },
];

const SERVICES: Service[] = [
  { id: "builder-gel", name: "Builder Gel / Natural Nail", price: 75, image: "/IMG_6249.jpeg", kind: "tiered" },
  { id: "gelx-xshort", name: "Gel-X Extra Short", price: 70, image: "/hero.jpg", kind: "tiered" },
  { id: "gelx-short", name: "Gel-X Short", price: 75, image: "/IMG_0063.jpeg", kind: "tiered" },
  { id: "gelx-medium", name: "Gel-X Medium", price: 80, image: "/IMG_6562.jpeg", kind: "tiered" },
  { id: "gelx-long", name: "Gel-X Long", price: 85, image: "/IMG_7753.jpeg", kind: "tiered" },
  { id: "freestyle", name: "Freestyle", price: 85, image: null, kind: "freestyle" },
  { id: "removal", name: "Removal Only", price: 15, image: null, kind: "simple" },
];

function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minuteStr} ${period}`;
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getMonthCells(ref: Date): (Date | null)[] {
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

function describeItem(item: CartItem): string {
  const parts: string[] = [];
  if (item.tierLabel) parts.push(item.tierLabel);
  if (item.removal) parts.push("Removal");
  return parts.length ? `${item.serviceName} (${parts.join(" + ")})` : item.serviceName;
}

export default function BookPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [step, setStep] = useState<"services" | "details" | "done">("services");

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  function addToCart(item: CartItem) {
    setCart((prev) => [...prev, item]);
    setActiveService(null);
  }

  function removeFromCart(key: string) {
    setCart((prev) => prev.filter((item) => item.key !== key));
  }

  return (
    <div className="pb-28">
      <div className="mx-auto max-w-3xl px-6 pt-16 pb-8 text-center">
        <h1 className="font-display text-3xl sm:text-4xl tracking-[0.15em] uppercase mb-3">
          Book Now
        </h1>
        <p className="text-black/60">
          {step === "services"
            ? "Select a service to see pricing and add it to your booking."
            : step === "details"
            ? "Pick a time and share your info to confirm."
            : "You're all set!"}
        </p>
      </div>

      {step === "services" && (
        <>
          <div className="mx-auto max-w-3xl px-6 space-y-5">
            {SERVICES.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onSelect={() => setActiveService(service)}
              />
            ))}
          </div>

          {cart.length > 0 && (
            <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-black/10 px-6 py-4">
              <div className="mx-auto max-w-3xl flex items-center justify-between gap-4">
                <div className="text-sm">
                  <span className="font-medium">{cart.length}</span> item{cart.length > 1 ? "s" : ""} · $
                  {cartTotal}
                </div>
                <button
                  onClick={() => setStep("details")}
                  className="bg-[var(--ink)] text-white rounded-full px-6 py-2.5 text-sm tracking-wide hover:opacity-90 transition-opacity"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {step === "details" && (
        <DetailsStep
          cart={cart}
          cartTotal={cartTotal}
          onRemove={removeFromCart}
          onBack={() => setStep("services")}
          onDone={() => setStep("done")}
        />
      )}

      {step === "done" && (
        <div className="mx-auto max-w-md px-6 text-center py-12">
          <p className="font-display text-lg tracking-wide uppercase mb-3">Request sent</p>
          <p className="text-black/60 mb-8">
            Your appointment request has been submitted. You&apos;ll hear back once it&apos;s
            confirmed — a deposit is required to lock in your slot.
          </p>
          <a
            href="/book"
            className="inline-block bg-[var(--ink)] text-white rounded-full px-6 py-2.5 text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            Book Another
          </a>
        </div>
      )}

      {activeService && (
        <ServiceModal
          key={activeService.id}
          service={activeService}
          onClose={() => setActiveService(null)}
          onAdd={addToCart}
        />
      )}
    </div>
  );
}

function ServiceCard({ service, onSelect }: { service: Service; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left flex flex-col sm:flex-row border border-black/10 rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-shadow"
    >
      <div className="relative w-full sm:w-56 h-44 sm:h-auto shrink-0 bg-[var(--sage)]/40">
        {service.image ? (
          <Image src={service.image} alt={service.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-3xl text-[var(--ink)]/30 tracking-widest">✕</span>
          </div>
        )}
      </div>
      <div className="flex-1 p-6 flex flex-col justify-between gap-4">
        <div>
          <h3 className="font-display text-lg tracking-[0.1em] uppercase">{service.name}</h3>
          {service.kind === "tiered" && (
            <p className="text-sm text-black/50 mt-2">
              Choose an art tier, plus removal if you have an old set.
            </p>
          )}
          {service.kind === "freestyle" && (
            <p className="text-sm text-black/50 mt-2">
              Choose your freestyle style, plus removal if you have an old set.
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-black/60">{service.kind === "simple" ? "Flat rate" : "Starting at"}</span>
          <div className="flex items-center gap-4">
            <span className="font-medium">
              ${service.price}
              {service.kind === "simple" ? "" : "+"}
            </span>
            <span className="bg-[var(--ink)] text-white rounded-full px-6 py-2 text-sm tracking-wide">
              Select
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function ServiceModal({
  service,
  onClose,
  onAdd,
}: {
  service: Service;
  onClose: () => void;
  onAdd: (item: CartItem) => void;
}) {
  const [tierId, setTierId] = useState<TierId | null>(null);
  const [freestyleType, setFreestyleType] = useState<FreestyleType | null>(null);
  const [length, setLength] = useState<LengthId | null>(null);
  const [removal, setRemoval] = useState(false);

  const tier = tierId ? TIERS.find((t) => t.id === tierId)! : null;
  const total = service.price + (tier?.add ?? 0) + (removal ? REMOVAL_PRICE : 0);

  const needsLength = freestyleType === "normal" || freestyleType === "moodboard";
  const canAdd = service.kind !== "freestyle" || (freestyleType !== null && (!needsLength || length !== null));

  function handleAdd() {
    let tierLabel: string | null = null;
    if (service.kind === "tiered") {
      tierLabel = tier?.label ?? null;
    } else if (service.kind === "freestyle" && freestyleType) {
      const typeLabel = FREESTYLE_TYPES.find((f) => f.id === freestyleType)!.label;
      const lengthLabel = length ? LENGTHS.find((l) => l.id === length)!.label : null;
      tierLabel = lengthLabel ? `Freestyle: ${typeLabel} (${lengthLabel})` : `Freestyle: ${typeLabel}`;
    }

    onAdd({
      key: crypto.randomUUID(),
      serviceId: service.id,
      serviceName: service.name,
      tierLabel,
      removal,
      total,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <h3 className="font-display text-xl tracking-[0.1em] uppercase pr-4">{service.name}</h3>
          <button
            onClick={onClose}
            className="text-black/40 hover:text-black text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {service.kind === "tiered" && (
          <div className="mb-5">
            <p className="text-sm font-medium mb-2">Art tier</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between border border-black/10 rounded-xl px-4 py-3 opacity-40 cursor-default select-none">
                <span className="text-sm">No Art (Base Set)</span>
                <span className="text-sm">included</span>
              </div>
              {TIERS.map((t) => (
                <label
                  key={t.id}
                  className={`flex items-center justify-between border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                    tierId === t.id ? "border-[var(--ink)] bg-[var(--sage)]/25" : "border-black/10"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="tier"
                      checked={tierId === t.id}
                      onChange={() => setTierId(t.id)}
                      className="accent-[var(--ink)]"
                    />
                    <span className="text-sm">{t.label}</span>
                  </span>
                  <span className="text-sm text-black/60">+${t.add}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {service.kind === "freestyle" && (
          <div className="mb-5">
            <p className="text-sm font-medium mb-2">Freestyle style</p>
            <div className="space-y-2 mb-4">
              {FREESTYLE_TYPES.map((f) => (
                <label
                  key={f.id}
                  className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                    freestyleType === f.id ? "border-[var(--ink)] bg-[var(--sage)]/25" : "border-black/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="freestyle"
                    checked={freestyleType === f.id}
                    onChange={() => {
                      setFreestyleType(f.id);
                      setLength(null);
                    }}
                    className="accent-[var(--ink)]"
                  />
                  <span className="text-sm">{f.label}</span>
                </label>
              ))}
            </div>

            {needsLength && (
              <div>
                <label className="block text-sm mb-1">Length</label>
                <select
                  value={length ?? ""}
                  onChange={(e) => setLength(e.target.value as LengthId)}
                  className="w-full border border-black/20 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="" disabled>
                    Select length...
                  </option>
                  {LENGTHS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {service.id !== "removal" && (
          <label className="flex items-center justify-between border border-black/10 rounded-xl px-4 py-3 mb-5 cursor-pointer">
            <span className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={removal}
                onChange={(e) => setRemoval(e.target.checked)}
                className="accent-[var(--ink)]"
              />
              <span className="text-sm">Removing an old set?</span>
            </span>
            <span className="text-sm text-black/60">+${REMOVAL_PRICE}</span>
          </label>
        )}

        <div className="flex items-center justify-between border-t border-black/10 pt-4 mb-5">
          <span className="text-sm text-black/60">Total</span>
          <span className="font-display text-xl">${total}</span>
        </div>

        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className="w-full bg-[var(--ink)] text-white rounded-full py-3 text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function DetailsStep({
  cart,
  cartTotal,
  onRemove,
  onBack,
  onDone,
}: {
  cart: CartItem[];
  cartTotal: number;
  onRemove: (key: string) => void;
  onBack: () => void;
  onDone: () => void;
}) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);
  const [slotId, setSlotId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    fetch("/api/slots")
      .then((res) => res.json())
      .then((data) => setSlots(data.slots || []))
      .finally(() => setLoadingSlots(false));
  }, []);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date)!.push(s);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [slots]);

  const autoSelectedRef = useRef(false);

  useEffect(() => {
    if (autoSelectedRef.current) return;
    if (slotsByDate.length === 0) return;
    autoSelectedRef.current = true;
    const firstDate = slotsByDate[0][0];
    setSelectedDate(firstDate);
    const d = new Date(`${firstDate}T00:00:00`);
    const now = new Date();
    setMonthOffset((d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth()));
  }, [slotsByDate]);

  function goToMonth(offset: number) {
    setMonthOffset(offset);
    setSelectedDate(null);
    setSlotId("");
  }

  const datesWithSlots = useMemo(() => new Set(slotsByDate.map(([date]) => date)), [slotsByDate]);

  const monthRef = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const monthCells = useMemo(() => getMonthCells(monthRef), [monthRef]);

  const timesForSelectedDate = slotsByDate.find(([date]) => date === selectedDate)?.[1] ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slotId) {
      setMessage("Please select a time.");
      return;
    }
    if (!agreed) {
      setMessage("Please acknowledge the policies before submitting.");
      return;
    }
    setSubmitting(true);
    setMessage("");

    const serviceSummary = `${cart.map(describeItem).join(", ")} — $${cartTotal}`;

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slot_id: slotId,
        client_name: name,
        client_email: email,
        client_phone: phone,
        service: serviceSummary,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Something went wrong");
      setSubmitting(false);
      return;
    }

    onDone();
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pb-16">
      <button onClick={onBack} className="text-sm text-black/50 hover:text-black mb-6 transition-colors">
        ← Back to services
      </button>

      <div className="border border-black/10 rounded-2xl p-5 mb-8">
        <h2 className="text-sm font-medium mb-3 text-black/60 uppercase tracking-wide">Your Booking</h2>
        <ul className="space-y-2">
          {cart.map((item) => (
            <li key={item.key} className="flex items-center justify-between text-sm">
              <span>{describeItem(item)}</span>
              <span className="flex items-center gap-3">
                <span className="text-black/60">${item.total}</span>
                <button
                  onClick={() => onRemove(item.key)}
                  className="text-black/30 hover:text-black text-xs"
                  aria-label="Remove"
                >
                  ✕
                </button>
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-black/10 mt-3 pt-3 font-medium text-sm">
          <span>Total</span>
          <span>${cartTotal}</span>
        </div>
      </div>

      <h2 className="text-sm font-medium mb-3 text-black/60 uppercase tracking-wide">Select a Time</h2>
      {loadingSlots ? (
        <p className="text-sm text-black/40 mb-8">Loading available times...</p>
      ) : slotsByDate.length === 0 ? (
        <p className="text-sm text-black/40 mb-8">No open times right now — check back soon.</p>
      ) : (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => goToMonth(Math.max(0, monthOffset - 1))}
              disabled={monthOffset === 0}
              className="text-sm w-8 h-8 rounded-full border border-black/20 hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              ←
            </button>
            <p className="text-sm font-medium">
              {monthRef.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </p>
            <button
              type="button"
              onClick={() => goToMonth(monthOffset + 1)}
              className="text-sm w-8 h-8 rounded-full border border-black/20 hover:bg-black/5"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-center text-[10px] uppercase tracking-wide text-black/40 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {monthCells.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} />;
              const key = formatDateKey(date);
              const available = datesWithSlots.has(key);
              const isSelected = selectedDate === key;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!available}
                  onClick={() => {
                    setSelectedDate(key);
                    setSlotId("");
                  }}
                  className={`aspect-square rounded-xl border text-sm flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-[var(--ink)] text-white border-[var(--ink)]"
                      : available
                      ? "border-black/20 hover:bg-[var(--sage)]/30"
                      : "border-transparent text-black/20 cursor-default"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            {timesForSelectedDate.length === 0 ? (
              <p className="text-sm text-black/40">Select a highlighted date to see times.</p>
            ) : (
              timesForSelectedDate.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSlotId(s.id)}
                  className={`text-sm rounded-full px-4 py-2 border transition-colors ${
                    slotId === s.id
                      ? "bg-[var(--ink)] text-white border-[var(--ink)]"
                      : "border-black/20 hover:bg-black/5"
                  }`}
                >
                  {formatTime(s.time)}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <h2 className="text-sm font-medium mb-3 text-black/60 uppercase tracking-wide">Your Info</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-black/20 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-black/20 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-black/20 rounded-lg px-3 py-2"
          />
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 accent-[var(--ink)]"
          />
          <span className="text-sm text-black/70">
            I&apos;ve read and agree to the{" "}
            <Link href="/policies" target="_blank" className="underline underline-offset-2 hover:text-black">
              booking policies
            </Link>
            , including the deposit and cancellation terms.
          </span>
        </label>

        {message && <p className="text-sm text-red-600">{message}</p>}
        <button
          type="submit"
          disabled={submitting || !agreed}
          className="w-full bg-[var(--ink)] text-white rounded-full py-3 text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Request Appointment"}
        </button>
      </form>
    </div>
  );
}
