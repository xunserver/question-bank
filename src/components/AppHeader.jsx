import { Stat } from './Stat';

export function AppHeader({ bankName, answeredCount, correctCount, wrongCount, progressPercent, onOpenData, onReset }) {
  return (
    <header className="border-b border-slate-200 px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold tracking-normal">刷题助手</h1>
          <p className="max-w-36 truncate text-xs text-slate-500 sm:max-w-48">{bankName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            className="rounded-full border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 active:scale-95"
            onClick={onOpenData}
          >
            设置
          </button>
          <button
            className="rounded-full border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 active:scale-95"
            onClick={onReset}
          >
            重置
          </button>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
        <Stat label="已答" value={answeredCount} />
        <Stat label="正确" value={correctCount} />
        <Stat label="错题" value={wrongCount} />
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progressPercent}%` }} />
      </div>
    </header>
  );
}
