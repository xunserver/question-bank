import { useEffect, useRef, useMemo, useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { Tab } from './components/Tab';
import { DataPanel } from './views/DataPanel';
import { EmptyWrongBook } from './views/EmptyWrongBook';
import { Overview } from './views/Overview';
import { PracticeView } from './views/PracticeView';
import { countOptions, isAnswerCorrect, isMultipleChoice, sortQuestions, toggleAnswerLabel } from './lib/questions';
import {
  dateStamp,
  defaultState,
  downloadJson,
  exportableState,
  pruneStateForQuestions,
  readQuestionBank,
  readState,
  validateBackup,
  writeQuestionBank,
  writeState,
} from './lib/storage';

export function App() {
  const [state, setState] = useState(readState);
  const [questionBank, setQuestionBank] = useState(readQuestionBank);
  const [showAnswer, setShowAnswer] = useState(false);
  const [draftAnswer, setDraftAnswer] = useState('');
  const dataImportRef = useRef(null);

  const orderedQuestions = useMemo(() => sortQuestions(questionBank.questions), [questionBank.questions]);
  const optionCount = useMemo(() => countOptions(orderedQuestions), [orderedQuestions]);
  const wrongQuestions = useMemo(
    () => orderedQuestions.filter((question) => state.wrongBook[question.id]),
    [orderedQuestions, state.wrongBook],
  );

  const activeList = state.mode === 'wrong' ? wrongQuestions : orderedQuestions;
  const savedIndex = state.mode === 'wrong' ? state.wrongIndex : state.currentIndex;
  const currentIndex = Math.min(savedIndex, Math.max(activeList.length - 1, 0));
  const currentQuestion = activeList[currentIndex];
  const answeredCount = Object.keys(state.answers).length;
  const wrongCount = Object.keys(state.wrongBook).length;
  const correctCount = Object.values(state.answers).filter((item) => item.correct).length;
  const progressPercent = orderedQuestions.length ? Math.round((answeredCount / orderedQuestions.length) * 100) : 0;
  const savedAnswer = currentQuestion ? state.answers[currentQuestion.id]?.selected : null;
  const multipleChoice = currentQuestion ? isMultipleChoice(currentQuestion) : false;
  const retryingWrongMultiple = state.mode === 'wrong' && multipleChoice && !showAnswer;
  const answered = Boolean(savedAnswer) && !retryingWrongMultiple;
  const selectedAnswer = multipleChoice && !answered && !showAnswer ? draftAnswer : savedAnswer;
  const isCorrect = answered && isAnswerCorrect(currentQuestion, savedAnswer);

  function isEditableTarget(target) {
    return (
      target instanceof HTMLElement &&
      (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName))
    );
  }

  function commitState(updater) {
    setState((prev) => {
      const next = updater(prev);
      writeState(next);
      return next;
    });
  }

  function switchMode(mode) {
    commitState((prev) => ({ ...prev, mode }));
    setShowAnswer(false);
    setDraftAnswer('');
  }

  function commitAnswer(answer) {
    if (!currentQuestion) return;

    const correct = isAnswerCorrect(currentQuestion, answer);
    commitState((prev) => {
      const wrongBook = { ...prev.wrongBook };
      if (correct) {
        delete wrongBook[currentQuestion.id];
      } else {
        wrongBook[currentQuestion.id] = {
          questionId: currentQuestion.id,
          selected: answer,
          correctAnswer: currentQuestion.answer,
          updatedAt: new Date().toISOString(),
        };
      }

      return {
        ...prev,
        answers: {
          ...prev.answers,
          [currentQuestion.id]: {
            selected: answer,
            correct,
            updatedAt: new Date().toISOString(),
          },
        },
        wrongBook,
      };
    });
    setShowAnswer(true);
    setDraftAnswer('');
  }

  function selectAnswer(answer) {
    if (!currentQuestion) return;

    if (isMultipleChoice(currentQuestion) && !answered && !showAnswer) {
      setDraftAnswer((prev) => toggleAnswerLabel(prev, answer));
      return;
    }

    commitAnswer(answer);
  }

  function submitAnswer() {
    if (!currentQuestion || !draftAnswer) return;
    commitAnswer(draftAnswer);
  }

  function retryAnswer() {
    setShowAnswer(false);
    setDraftAnswer('');
  }

  function move(delta) {
    if (!activeList.length) return;
    commitState((prev) => ({
      ...prev,
      [prev.mode === 'wrong' ? 'wrongIndex' : 'currentIndex']: Math.min(
        Math.max(currentIndex + delta, 0),
        activeList.length - 1,
      ),
    }));
    setShowAnswer(false);
    setDraftAnswer('');
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.defaultPrevented || isEditableTarget(event.target)) return;
      if (!currentQuestion || !['practice', 'wrong'].includes(state.mode)) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        move(-1);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        move(1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, state.mode, currentIndex, activeList.length]);

  function jumpToQuestion(index) {
    commitState((prev) => ({
      ...prev,
      mode: 'practice',
      currentIndex: index,
    }));
    setShowAnswer(false);
    setDraftAnswer('');
  }

  function resetAll() {
    if (!confirm('确定清空答题记录、错题本和当前进度吗？')) return;
    writeState(defaultState);
    setState(defaultState);
    setShowAnswer(false);
    setDraftAnswer('');
  }

  function exportAllData() {
    downloadJson(`question-bank-data-${dateStamp()}.json`, {
      questions: questionBank.questions,
      state: exportableState(state),
    });
  }

  async function importAllData(file) {
    if (!file) return;
    try {
      const backup = validateBackup(JSON.parse(await file.text()));
      if (!confirm('导入完整数据会覆盖当前题库、进度、答题记录和错题本。确定继续吗？')) return;

      const nextState = pruneStateForQuestions(backup.state, backup.bank.questions);
      writeQuestionBank(backup.bank);
      writeState(nextState);
      setQuestionBank(backup.bank);
      setState(nextState);
      setShowAnswer(false);
      setDraftAnswer('');
      alert(`完整数据导入成功，共 ${backup.bank.questions.length} 题。`);
    } catch (error) {
      alert(error instanceof Error ? error.message : '完整数据导入失败');
    } finally {
      if (dataImportRef.current) dataImportRef.current.value = '';
    }
  }

  return (
    <main className="app-viewport bg-slate-100 text-slate-950">
      <div className="app-shell mx-auto flex w-full max-w-md flex-col bg-white shadow-soft">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur">
          <AppHeader
            answeredCount={answeredCount}
            correctCount={correctCount}
            wrongCount={wrongCount}
            progressPercent={progressPercent}
            onOpenData={() => switchMode('data')}
            onReset={resetAll}
          />

          <nav className="grid grid-cols-3 gap-2 border-b border-slate-200 px-4 py-2">
            <Tab active={state.mode === 'practice'} onClick={() => switchMode('practice')}>
              顺序练习
            </Tab>
            <Tab active={state.mode === 'overview'} onClick={() => switchMode('overview')}>
              题目总览
            </Tab>
            <Tab active={state.mode === 'wrong'} onClick={() => switchMode('wrong')}>
              错题本
            </Tab>
          </nav>
        </div>

        <section className="flex flex-1 flex-col mt-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {state.mode === 'data' ? (
            <DataPanel
              questionCount={orderedQuestions.length}
              optionCount={optionCount}
              answeredCount={answeredCount}
              wrongCount={wrongCount}
              importRef={dataImportRef}
              onExport={exportAllData}
              onImport={importAllData}
            />
          ) : state.mode === 'overview' ? (
            <Overview questions={orderedQuestions} answers={state.answers} onJump={jumpToQuestion} />
          ) : !currentQuestion ? (
            <EmptyWrongBook onBack={() => switchMode('practice')} />
          ) : (
            <PracticeView
              currentQuestion={currentQuestion}
              currentIndex={currentIndex}
              total={activeList.length}
              selectedAnswer={selectedAnswer}
              showAnswer={showAnswer}
              answered={answered}
              isCorrect={isCorrect}
              canRetryAnswer={state.mode === 'wrong' && multipleChoice}
              onSelectAnswer={selectAnswer}
              onSubmitAnswer={submitAnswer}
              onRetryAnswer={retryAnswer}
              onMove={move}
            />
          )}
        </section>
      </div>
    </main>
  );
}
