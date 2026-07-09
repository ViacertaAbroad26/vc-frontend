import { Logo } from "@viacerta/ui";
import { useEffect, useState } from "react";

import { LoginForm } from "@/features/auth/LoginForm";
import { NAVY, NAVY_LIGHT, NAVY_MID, TEAL, TEAL_LIGHT } from "@/features/auth/brand";

type Destination = {
  city: string;
  country: string;
  flag: string;
  rank: string;
  x: string;
  y: string;
  duration: number;
  delay: number;
};

const DESTINATIONS: Destination[] = [
  { city: "Paris", country: "France", flag: "🇫🇷", rank: "#1 in Art & Design", x: "6%", y: "65%", duration: 7, delay: 0 },
  { city: "Tokyo", country: "Japan", flag: "🇯🇵", rank: "#1 in Engineering", x: "22%", y: "72%", duration: 8.5, delay: 1.5 },
  { city: "London", country: "UK", flag: "🇬🇧", rank: "#2 in Business", x: "40%", y: "68%", duration: 7.5, delay: 0.8 },
  { city: "Berlin", country: "Germany", flag: "🇩🇪", rank: "#1 in Tech", x: "58%", y: "70%", duration: 9, delay: 2 },
  { city: "Melbourne", country: "Australia", flag: "🇦🇺", rank: "#3 in Sciences", x: "72%", y: "66%", duration: 7.2, delay: 3 },
  { city: "Toronto", country: "Canada", flag: "🇨🇦", rank: "#2 in Medicine", x: "12%", y: "58%", duration: 8, delay: 4 },
  { city: "Singapore", country: "Singapore", flag: "🇸🇬", rank: "#1 in Finance", x: "50%", y: "60%", duration: 8.5, delay: 2.5 },
  { city: "Amsterdam", country: "Netherlands", flag: "🇳🇱", rank: "#2 in Design", x: "30%", y: "75%", duration: 7.8, delay: 1.2 },
];

const WORLD_DOTS = [
  { cx: 155, cy: 95, delay: 0 },
  { cx: 163, cy: 90, delay: 0.3 },
  { cx: 190, cy: 88, delay: 0.6 },
  { cx: 320, cy: 110, delay: 0.9 },
  { cx: 300, cy: 115, delay: 1.2 },
  { cx: 290, cy: 125, delay: 0.4 },
  { cx: 105, cy: 120, delay: 0.7 },
  { cx: 90, cy: 135, delay: 1.0 },
  { cx: 120, cy: 150, delay: 0.2 },
  { cx: 145, cy: 170, delay: 0.8 },
  { cx: 190, cy: 155, delay: 1.4 },
  { cx: 265, cy: 135, delay: 0.5 },
  { cx: 340, cy: 185, delay: 1.1 },
  { cx: 240, cy: 105, delay: 0.1 },
  { cx: 175, cy: 95, delay: 1.5 },
];

const CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 6],
  [3, 4],
  [4, 5],
  [8, 9],
  [12, 13],
];

const PULSE_DOTS = [WORLD_DOTS[0]!, WORLD_DOTS[3]!, WORLD_DOTS[6]!];

const HEADLINE_PARTS = [
  { text: "Career first.", color: "#ffffff" },
  { text: " Countries", color: TEAL_LIGHT },
  { text: " second.", color: "#ffffff" },
];
const HEADLINE_FULL = HEADLINE_PARTS.map((p) => p.text).join("");

function TypewriterHeadline() {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed >= HEADLINE_FULL.length) return;
    const timer = setTimeout(() => setRevealed((r) => r + 1), 40);
    return () => clearTimeout(timer);
  }, [revealed]);

  let consumed = 0;
  return (
    <h2 className="font-heading text-[38px] font-extrabold leading-[1.15] tracking-tight">
      {HEADLINE_PARTS.map(({ text, color }) => {
        const start = consumed;
        consumed += text.length;
        return (
          <span key={text}>
            {text.split("").map((ch, i) => (
              <span key={i} style={{ color, opacity: revealed > start + i ? 1 : 0 }}>
                {ch}
              </span>
            ))}
          </span>
        );
      })}
      <span
        className="ml-0.5 inline-block h-[0.85em] w-[3px] animate-blink rounded-sm align-middle"
        style={{ background: TEAL_LIGHT }}
      />
    </h2>
  );
}

function FloatingDestinationCard({ city, country, flag, rank, x, y, duration, delay }: Destination) {
  return (
    <div
      className="animate-float-drift pointer-events-none absolute"
      style={{ left: x, top: y, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
    >
      <div
        className="flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 backdrop-blur-sm"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}
      >
        <span className="text-[18px] leading-none">{flag}</span>
        <div>
          <p className="text-[12px] font-semibold leading-tight text-white">
            {city}, {country}
          </p>
          <p className="text-[10px] leading-tight" style={{ color: TEAL_LIGHT }}>
            {rank}
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-xl font-bold leading-none text-white">{value}</p>
      <p className="mt-0.5 text-[11px] leading-tight text-white/50">{label}</p>
    </div>
  );
}

function WorldMap() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
      <svg viewBox="0 0 440 240" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        {CONNECTIONS.map(([a, b], i) => (
          <line
            key={i}
            x1={WORLD_DOTS[a]!.cx}
            y1={WORLD_DOTS[a]!.cy}
            x2={WORLD_DOTS[b]!.cx}
            y2={WORLD_DOTS[b]!.cy}
            stroke={TEAL}
            strokeWidth={0.5}
            strokeOpacity={0.4}
          />
        ))}
        {WORLD_DOTS.map((d, i) => (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={2.5}
            fill={TEAL}
            className="animate-dot-glow"
            style={{ animationDelay: `${d.delay}s` }}
          />
        ))}
        {PULSE_DOTS.map((d, i) => (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={2.5}
            fill="none"
            stroke={TEAL_LIGHT}
            strokeWidth={0.8}
            className="animate-pulse-ring"
            style={{ animationDelay: `${i * 1.3}s` }}
          />
        ))}
      </svg>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full lg:h-screen lg:overflow-hidden">
      {/* ── Brand panel ─────────────────────────────────────────────────── */}
      <div
        className="relative hidden w-[55%] flex-col overflow-hidden lg:flex"
        style={{ background: `linear-gradient(145deg, ${NAVY} 0%, ${NAVY_MID} 50%, ${NAVY_LIGHT} 100%)` }}
      >
        {/* Morphing glow blobs */}
        <div
          className="animate-blob pointer-events-none absolute rounded-full"
          style={{ width: 400, height: 400, left: "-10%", top: "10%", background: TEAL, filter: "blur(80px)", opacity: 0.25 }}
        />
        <div
          className="animate-blob pointer-events-none absolute rounded-full"
          style={{ width: 350, height: 350, left: "50%", top: "50%", background: NAVY_LIGHT, filter: "blur(80px)", opacity: 0.25, animationDelay: "2s", animationDuration: "12s" }}
        />
        <div
          className="animate-blob pointer-events-none absolute rounded-full"
          style={{ width: 300, height: 300, left: "20%", top: "70%", background: TEAL, filter: "blur(80px)", opacity: 0.25, animationDelay: "4s", animationDuration: "14s" }}
        />

        {/* Dot-grid overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <WorldMap />

        {DESTINATIONS.map((dest) => (
          <FloatingDestinationCard key={dest.city} {...dest} />
        ))}

        {/* Logo */}
        <div className="relative z-10 p-9 pb-0">
          <Logo inverted tagline />
        </div>

        {/* Hero copy */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 pb-8">
          <p
            className="mb-4 text-[11px] font-bold uppercase"
            style={{ letterSpacing: "0.2em", color: TEAL_LIGHT }}
          >
            Study Abroad Platform
          </p>

          <TypewriterHeadline />

          <p className="mt-5 max-w-[380px] text-[15px] leading-[1.7] text-white/60">
            Your personalised path to studying abroad — guided every step of the way by a
            dedicated advisor who puts your career first.
          </p>

          <div className="mt-10 flex gap-10 border-t border-white/10 pt-10">
            <Stat value="50+" label="Countries worldwide" />
            <Stat value="2,400+" label="Students placed" />
            <Stat value="98%" label="Visa success rate" />
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[200px]"
          style={{ background: `linear-gradient(to top, ${NAVY} 0%, transparent 100%)` }}
        />
      </div>

      {/* ── Form panel ──────────────────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#F8F9FA] px-4 py-8">
        <div
          className="animate-blob pointer-events-none absolute rounded-full"
          style={{ width: 500, height: 500, top: "-20%", right: "-15%", background: `radial-gradient(circle, ${TEAL}1f 0%, transparent 70%)`, animationDuration: "16s" }}
        />
        <div
          className="animate-blob pointer-events-none absolute rounded-full"
          style={{ width: 400, height: 400, bottom: "-15%", left: "-10%", background: `radial-gradient(circle, ${NAVY}1a 0%, transparent 70%)`, animationDuration: "18s", animationDelay: "3s" }}
        />

        {/* Mobile logo */}
        <div className="z-10 mb-8 flex lg:hidden">
          <Logo />
        </div>

        <div className="relative z-10 w-full max-w-[400px]">
          <div
            className="relative overflow-hidden rounded-[20px] bg-white px-9 py-10"
            style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.05), 0 20px 60px rgba(0,0,0,0.08)" }}
          >
            <div
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ background: `linear-gradient(90deg, ${NAVY} 0%, ${TEAL} 100%)` }}
            />

            <div className="mb-8">
              <h1 className="font-heading text-2xl font-bold text-navy-900">Welcome back</h1>
              <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
            </div>

            <LoginForm />
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} ViaCerta · Privacy · Terms
          </p>
        </div>
      </div>
    </div>
  );
}
