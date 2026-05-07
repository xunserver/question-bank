import { QuestionCard } from '../components/QuestionCard';
import { answerText, isMultipleChoice } from '../lib/questions';

export function PracticeView({
  currentQuestion,
  currentIndex,
  total,
  selectedAnswer,
  showAnswer,
  answered,
  isCorrect,
  canRetryAnswer,
  onSelectAnswer,
  onSubmitAnswer,
  onRetryAnswer,
  onMove,
}) {
  const explanation = currentQuestion.explanation?.trim();
  const showSubmitAnswer = isMultipleChoice(currentQuestion) && !answered && !showAnswer;
  const showRetryAnswer = canRetryAnswer && answered && showAnswer && !isCorrect;
  const showMiddleAction = showSubmitAnswer || showRetryAnswer;
  const canSubmitAnswer = Boolean(selectedAnswer);

  return (
    <>
      <div className="pb-24 sm:pb-28">
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
            {explanation && (
              <div className="mt-3 border-t border-current/20 pt-3">
                <div className="text-sm font-semibold">解析</div>
                <div className="mt-1 whitespace-pre-line text-sm leading-6">{explanation}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-slate-200 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className={`grid gap-3 ${showMiddleAction ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <button
            className="rounded-lg border border-slate-200 py-2.5 text-base font-semibold text-slate-700 disabled:opacity-40 sm:py-3"
            disabled={currentIndex === 0}
            onClick={() => onMove(-1)}
          >
            上一题
          </button>
          {showSubmitAnswer && (
            <button
              className="rounded-lg bg-slate-950 py-2.5 text-base font-semibold text-white disabled:bg-slate-300 sm:py-3"
              disabled={!canSubmitAnswer}
              onClick={onSubmitAnswer}
            >
              提交答案
            </button>
          )}
          {showRetryAnswer && (
            <button
              className="rounded-lg bg-slate-950 py-2.5 text-base font-semibold text-white sm:py-3"
              onClick={onRetryAnswer}
            >
              重新作答
            </button>
          )}
          <button
            className="rounded-lg bg-slate-950 py-2.5 text-base font-semibold text-white disabled:bg-slate-300 sm:py-3"
            disabled={currentIndex >= total - 1}
            onClick={() => onMove(1)}
          >
            下一题
          </button>
        </div>
      </div>
    </>
  );
}
