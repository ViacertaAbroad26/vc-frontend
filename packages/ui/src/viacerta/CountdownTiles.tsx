import { useEffect, useState } from "react";

function useCountdown(target: string) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(target).getTime() - Date.now()));

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, new Date(target).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [target]);

  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining / (60 * 60 * 1000)) % 24);
  const minutes = Math.floor((remaining / (60 * 1000)) % 60);
  return { days, hours, minutes };
}

function Tile({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-white/10 px-4 py-2">
      <span className="text-2xl font-bold text-white tabular-nums">{String(value).padStart(2, "0")}</span>
      <span className="text-[10px] uppercase tracking-wide text-white/70">{label}</span>
    </div>
  );
}

export function CountdownTiles({ targetDate, label }: { targetDate: string; label?: string }) {
  const { days, hours, minutes } = useCountdown(targetDate);

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 p-4">
      <div className="flex gap-2">
        <Tile value={days} label="Days" />
        <Tile value={hours} label="Hours" />
        <Tile value={minutes} label="Min" />
      </div>
      {label && (
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide text-white/60">Intake</p>
          <p className="text-sm font-semibold text-white">{label}</p>
        </div>
      )}
    </div>
  );
}
