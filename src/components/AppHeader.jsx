import { Stat } from './Stat';

export function AppHeader({ answeredCount, correctCount, wrongCount, progressPercent, onOpenData, onReset }) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-normal">question-bank</h1>
          <p className="mt-1 text-sm text-slate-500">通用题库练习平台</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 active:scale-95"
            onClick={onOpenData}
          >
            导入导出
          </button>
          <button
            className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 active:scale-95"
            onClick={onReset}
          >
            重置
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="已答" value={answeredCount} />
        <Stat label="正确" value={correctCount} />
        <Stat label="错题" value={wrongCount} />
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progressPercent}%` }} />
      </div>
    </header>
  );
}
