"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

const bookingPolicies = [
  {
    title: "Payment ♡",
    body: "Deposits can be made through Zelle, Apple Pay, or Venmo. Remaining will be paid in CASH ONLY❗️ (469-733-5393)",
  },
  {
    title: "Rescheduling & Cancellations ♡",
    body: "If you need to cancel or reschedule please let me know 24hrs before your scheduled appointment. Cancelling after the 24hr time frame is up will result in a forfeited deposit.\n\nIf you need to reschedule, your deposit will roll over once, more than once, your deposit will be lost and you will have to make a new deposit payment.\n\nThere is a 10 minute grace period. Late 15 minutes, your appointment will be cancelled.",
  },
  {
    title: "No Call/No Show ♡",
    body: "You will not be booked for any future appointments. Please be courteous of my time, as I'm yours.\n\nNo extra guests.",
  },
  {
    title: "Foreign Removals ♡",
    body: "I only remove previous work done by me. New clients please come with bare nails.",
  },
];

type PolicyEntry = { title: string; body?: string; list?: string[] };

const privacySections: PolicyEntry[] = [
  {
    title: "What we collect",
    body: "When you book an appointment through this website, we collect your name, email address, phone number, and the service you request. We collect this information solely to schedule and manage your appointment.",
  },
  {
    title: "How we use your information",
    body: "We use the information you provide to:",
    list: [
      "Confirm, reschedule, or cancel your appointment",
      "Send appointment confirmations, reminders, and schedule updates by text message, if you have opted in",
      "Contact you regarding your appointment if needed",
    ],
  },
  {
    title: "Information sharing",
    body: "We do not sell, rent, or share your personal information with third parties for marketing purposes. Your information is not shared with third parties or affiliates for their own marketing use.\n\nWe use service providers to operate this website and deliver messages, including our hosting provider, our database provider, and our SMS provider. These providers process your information only to deliver these services on our behalf.",
  },
  {
    title: "Mobile opt-in data",
    body: "No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. Text messaging originator opt-in data and consent will not be shared with any third parties.",
  },
  {
    title: "Data retention",
    body: "We retain appointment records for as long as needed to manage bookings and maintain appointment history. You may request deletion of your information by contacting us.",
  },
  {
    title: "Contact",
    body: "Questions about this policy? Reach us on Instagram at @beautyby.kale.",
  },
];

const smsTerms: PolicyEntry[] = [
  {
    title: "Program description",
    body: "By opting in, you agree to receive text messages from BeautyByKale related to your appointments. These messages include booking confirmations, appointment reminders, and notifications about schedule changes such as rescheduling or cancellation. This program sends transactional appointment messages only. We do not send promotional or marketing messages.",
  },
  {
    title: "How to opt in",
    body: "You may opt in by checking the consent box when submitting an appointment request on our booking page at /book. Consent is not a condition of purchase or of receiving services.",
  },
  {
    title: "Message frequency",
    body: "Message frequency varies based on your appointment activity. You can expect approximately 3 to 5 messages per appointment booked.",
  },
  {
    title: "Message and data rates",
    body: "Message and data rates may apply. Charges are billed by and payable to your mobile service provider. Please contact your carrier for details about your plan.",
  },
  {
    title: "Carriers",
    body: "Carriers are not liable for delayed or undelivered messages.",
  },
  {
    title: "To opt out: reply STOP",
    body: "You can cancel the SMS service at any time by replying STOP to any message you receive from us. After you send STOP, we will send you a message confirming that you have been unsubscribed. You will no longer receive text messages from us. To rejoin, opt in again through our booking page.",
  },
  {
    title: "For help: reply HELP",
    body: "If you are experiencing issues with the messaging program, reply HELP to any message for assistance, or contact us on Instagram at @beautyby.kale.",
  },
];

type Tab = "booking" | "privacy";

function PolicyGrid({ entries }: { entries: PolicyEntry[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
      {entries.map((policy) => (
        <div key={policy.title}>
          <h3 className="font-display text-lg sm:text-xl tracking-[0.1em] uppercase mb-3">
            {policy.title}
          </h3>
          {policy.body?.split("\n\n").map((paragraph, i) => (
            <p key={i} className="text-black/70 leading-relaxed mb-3 last:mb-0">
              {paragraph}
            </p>
          ))}
          {policy.list && (
            <ul className="list-disc pl-5 space-y-1.5 text-black/70 leading-relaxed">
              {policy.list.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function PoliciesContent() {
  const searchParams = useSearchParams();
  const initialTab: Tab = searchParams.get("tab") === "privacy" ? "privacy" : "booking";
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="font-display text-center text-2xl sm:text-3xl tracking-[0.1em] uppercase mb-6">
        Policies
      </h1>

      <div className="flex items-center justify-center gap-2 mb-10">
        <button
          onClick={() => setTab("booking")}
          className={`text-xs px-4 py-2 rounded-full transition-colors ${
            tab === "booking"
              ? "bg-[var(--ink)] text-white"
              : "border border-black/20 hover:bg-black/5"
          }`}
        >
          Booking Policies
        </button>
        <button
          onClick={() => setTab("privacy")}
          className={`text-xs px-4 py-2 rounded-full transition-colors ${
            tab === "privacy"
              ? "bg-[var(--ink)] text-white"
              : "border border-black/20 hover:bg-black/5"
          }`}
        >
          Privacy Policy
        </button>
      </div>

      {tab === "booking" ? (
        <>
          <p className="text-center text-black/70 leading-relaxed mb-10">
            A $20 non-refundable deposit is required to make an appointment.
          </p>
          <PolicyGrid entries={bookingPolicies} />
        </>
      ) : (
        <>
          <p className="text-center text-black/50 text-sm mb-10">Last updated: August 21, 2026</p>

          <h2 className="font-display text-xl sm:text-2xl tracking-[0.1em] uppercase mb-8">
            Privacy Policy
          </h2>
          <PolicyGrid entries={privacySections} />

          <hr className="border-black/10 my-14" />

          <h2 className="font-display text-xl sm:text-2xl tracking-[0.1em] uppercase mb-8">
            SMS Terms &amp; Conditions
          </h2>
          <PolicyGrid entries={smsTerms} />
        </>
      )}
    </section>
  );
}

export default function PoliciesPage() {
  return (
    <Suspense fallback={null}>
      <PoliciesContent />
    </Suspense>
  );
}
