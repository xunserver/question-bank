import { getQuestionOptions, normalizeAnswer } from '../lib/questions';

export function QuestionCard({ question, index, total, selectedAnswer, showAnswer, onSelect }) {
  const choices = getQuestionOptions(question);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {question.type === 'true_false' ? '判断题' : '单选题'}
        </span>
        <span className="text-sm text-slate-500">
          {index + 1} / {total}
        </span>
      </div>

      <h2 className="mt-3 whitespace-pre-line text-base font-semibold leading-7 sm:mt-5 sm:text-lg sm:leading-8">
        {question.stem}
      </h2>

      <div className="mt-4 space-y-2 sm:mt-6 sm:space-y-3">
        {choices.map((choice) => {
          const selected = normalizeAnswer(selectedAnswer) === normalizeAnswer(choice.label);
          const correct = normalizeAnswer(question.answer) === normalizeAnswer(choice.label);
          const tone = showAnswer
            ? correct
              ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
              : selected
                ? 'border-rose-500 bg-rose-50 text-rose-800'
                : 'border-slate-200 bg-white text-slate-700'
            : selected
              ? 'border-slate-950 bg-slate-950 text-white'
              : 'border-slate-200 bg-white text-slate-800';

          return (
            <button
              key={choice.label}
              className={`flex w-full items-start gap-2.5 rounded-lg border p-3 text-left active:scale-[0.99] sm:gap-3 sm:p-4 ${tone}`}
              onClick={() => onSelect(choice.label)}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-sm font-semibold">
                {question.type === 'true_false' ? (choice.label === 'true' ? '对' : '错') : choice.label}
              </span>
              <span className="min-w-0 flex-1 text-sm leading-6 sm:text-base sm:leading-7">{choice.content}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
}
