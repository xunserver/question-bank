export function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-2">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
