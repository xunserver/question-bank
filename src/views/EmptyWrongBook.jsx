export function EmptyWrongBook({ onBack }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="text-lg font-semibold">暂无错题</div>
      <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">练习中答错的题会自动进入错题本，答对后会从错题本移除。</p>
      <button className="mt-6 rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white" onClick={onBack}>
        返回练习
      </button>
    </div>
  );
}
