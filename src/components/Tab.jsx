export function Tab({ active, children, onClick }) {
  return (
    <button
      className={[
        'rounded-lg py-2.5 text-sm font-semibold transition',
        active ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600',
      ].join(' ')}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
