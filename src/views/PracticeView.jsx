import { QuestionCard } from '../components/QuestionCard';
import { answerText } from '../lib/questions';

export function PracticeView({
  currentQuestion,
  currentIndex,
  total,
  selectedAnswer,
  showAnswer,
  answered,
  isCorrect,
  onSelectAnswer,
  onMove,
}) {
  const explanation = currentQuestion.explanation?.trim();

  return (
    <>
      <QuestionCard
        question={currentQuestion}
        index={currentIndex}
        total={total}
        selectedAnswer={selectedAnswer}
        showAnswer={showAnswer || answered}
        onSelect={onSelectAnswer}
      />

      {(showAnswer || answered) && (
        <div
          className={[
            'mt-3 rounded-lg border p-3 sm:mt-4 sm:p-4',
            isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800',
          ].join(' ')}
        >
          <div className="text-sm font-semibold">{isCorrect ? '回答正确' : '回答错误'}</div>
          <div className="mt-2 text-sm">正确答案：{answerText(currentQuestion, currentQuestion.answer)}</div>
          {!isCorrect && explanation && (
            <div className="mt-3 border-t border-current/20 pt-3">
              <div className="text-sm font-semibold">解析</div>
              <div className="mt-1 whitespace-pre-line text-sm leading-6">{explanation}</div>
            </div>
          )}
        </div>
      )}

      <div className="mt-auto grid grid-cols-2 gap-3 pt-4 sm:pt-6">
        <button
          className="rounded-lg border border-slate-200 py-2.5 text-base font-semibold text-slate-700 disabled:opacity-40 sm:py-3"
          disabled={currentIndex === 0}
          onClick={() => onMove(-1)}
        >
          上一题
        </button>
        <button
          className="rounded-lg bg-slate-950 py-2.5 text-base font-semibold text-white disabled:bg-slate-300 sm:py-3"
          disabled={currentIndex >= total - 1}
          onClick={() => onMove(1)}
        >
          下一题
        </button>
      </div>
    </>
  );
}
