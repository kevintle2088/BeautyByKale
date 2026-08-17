"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type GalleryItem = { src: string; caption: string };

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mx-auto max-w-3xl grid grid-cols-2 sm:grid-cols-3 gap-4">
      {items.map((item, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        return (
          <div
            key={i}
            className={visible ? "animate-grow-in" : "opacity-0"}
            style={visible ? { animationDelay: `${(row + col) * 90}ms` } : undefined}
          >
            <div className="relative aspect-square bg-[var(--sage)]/40">
              <Image src={item.src} alt={item.caption} fill className="object-cover" />
            </div>
            <p className="mt-2 text-center text-sm text-black">{item.caption}</p>
          </div>
        );
      })}
    </div>
  );
}
