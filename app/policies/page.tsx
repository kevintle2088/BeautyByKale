const policies = [
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

export default function PoliciesPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="font-display text-center text-2xl sm:text-3xl tracking-[0.1em] uppercase mb-6">
        Policies
      </h1>
      <p className="text-center text-black/70 leading-relaxed mb-12">
        A $20 non-refundable deposit is required to make an appointment.
      </p>
      <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
        {policies.map((policy) => (
          <div key={policy.title}>
            <h2 className="font-display text-lg sm:text-xl tracking-[0.1em] uppercase mb-3">
              {policy.title}
            </h2>
            {policy.body.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-black/70 leading-relaxed mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
