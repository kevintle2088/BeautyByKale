import Image from "next/image";

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

const gallery = [
  { src: "/gallery-1.jpg", caption: "Caption 1" },
  { src: "/gallery-2.jpg", caption: "Caption 2" },
  { src: "/gallery-3.jpg", caption: "Caption 3" },
  { src: "/gallery-4.jpg", caption: "Caption 4" },
  { src: "/gallery-5.jpg", caption: "Caption 5" },
  { src: "/gallery-6.jpg", caption: "Caption 6" },
  { src: "/IMG_6562.jpeg", caption: "Tier 4" },
  { src: "/IMG_0063.jpeg", caption: "Tier 4" },
  { src: "/IMG_7753.jpeg", caption: "Tier 4" },
];

export default function HomePage() {
  return (
    <>
      <section className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
        <Image
          src="/IMG_1542.jpg"
          alt=""
          fill
          priority
          className="object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 text-center px-6">
          <h1 className="font-display text-white text-4xl sm:text-6xl tracking-[0.15em] uppercase">
            Beauty by Kale
          </h1>
          <a
            href="/book"
            className="inline-block mt-8 bg-white text-[var(--ink)] rounded-full px-8 py-3 text-sm tracking-wide hover:bg-white/90 transition-colors"
          >
            Book Now
          </a>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-12 text-center">
        <h2 className="font-display text-2xl sm:text-3xl tracking-[0.1em] uppercase mb-2">
          Kayli Phan
        </h2>
        <p className="text-black/70">Rowlett, TX</p>
        <p className="text-black/70">(469) 733-5393</p>
        <p className="text-black/70 mt-2">
          Specializing in Gel-X Extension and Builder Gel
        </p>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-center text-2xl sm:text-3xl tracking-[0.1em] uppercase mb-6">
          Policies
        </h2>
        <p className="text-center text-black/70 leading-relaxed mb-12">
          A $20 non-refundable deposit is required to make an appointment.
        </p>
        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
          {policies.map((policy) => (
            <div key={policy.title}>
              <h3 className="font-display text-lg sm:text-xl tracking-[0.1em] uppercase mb-3">
                {policy.title}
              </h3>
              {policy.body.split("\n\n").map((paragraph, i) => (
                <p key={i} className="text-black/70 leading-relaxed mb-3 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-center text-2xl sm:text-3xl tracking-[0.1em] uppercase mb-12">
          Gallery
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {gallery.map((item, i) => (
            <div key={i}>
              <div className="relative aspect-square bg-[var(--sage)]/40">
                <Image
                  src={item.src}
                  alt={item.caption}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="mt-2 text-center text-sm text-black">
                {item.caption}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}