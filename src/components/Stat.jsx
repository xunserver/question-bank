export function Stat({ label, value }) {
  return (
    <div className="rounded-md bg-slate-100 px-2 py-1">
      <div className="text-sm font-semibold leading-5">{value}</div>
      <div className="text-[10px] leading-3 text-slate-500">{label}</div>
    </div>
  );
}
