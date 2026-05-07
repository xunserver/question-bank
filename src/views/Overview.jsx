function LegendDot({ color, label, value }) {
  return (
    <div className="rounded-lg bg-slate-100 px-2 py-2">
      <div className="flex items-center justify-center gap-1.5">
        <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
        <span className="font-semibold text-slate-700">{label}</span>
      </div>
      <div className="mt-1 text-slate-500">{value}</div>
    </div>
  );
}

export function Overview({ questions, answers, onJump }) {
  const correctCount = questions.filter((question) => answers[question.id]?.correct).length;
  const wrongCount = questions.filter((question) => answers[question.id]?.correct === false).length;
  const untouchedCount = questions.length - correctCount - wrongCount;

  return (
    <div className="flex flex-1 flex-col">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">题目总览</h2>
            <p className="mt-1 text-sm text-slate-500">点击题号快速跳转</p>
          </div>
          <div className="text-right text-sm text-slate-500">共 {questions.length} 题</div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <LegendDot color="bg-emerald-500" label="正确" value={correctCount} />
          <LegendDot color="bg-rose-500" label="错误" value={wrongCount} />
          <LegendDot color="bg-white border border-slate-300" label="未做" value={untouchedCount} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-8 gap-2 pb-4">
        {questions.map((question, index) => {
          const answer = answers[question.id];
          const tone =
            answer?.correct === true
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : answer?.correct === false
                ? 'border-rose-500 bg-rose-500 text-white'
                : 'border-slate-300 bg-white text-slate-700';

          return (
            <button
              key={question.id}
              className={`aspect-square rounded-md border text-xs font-semibold leading-none active:scale-95 ${tone}`}
              onClick={() => onJump(index)}
              aria-label={`跳转到第 ${index + 1} 题`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
