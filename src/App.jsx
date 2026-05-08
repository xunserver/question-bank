import { useEffect, useRef, useMemo, useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { Tab } from './components/Tab';
import { DataPanel } from './views/DataPanel';
import { EmptyWrongBook } from './views/EmptyWrongBook';
import { Overview } from './views/Overview';
import { PracticeView } from './views/PracticeView';
import { countOptions, isAnswerCorrect, isMultipleChoice, sortQuestions, toggleAnswerLabel } from './lib/questions';
import {
  createQuestionBankEntry,
  dateStamp,
  defaultState,
  downloadJson,
  exportableBank,
  getBuiltinQuestionBank,
  pruneStateForQuestions,
  readLibrary,
  validateBackup,
  writeLibrary,
} from './lib/storage';

export function App() {
  const [library, setLibrary] = useState(readLibrary);
  const [showAnswer, setShowAnswer] = useState(false);
  const [draftAnswer, setDraftAnswer] = useState('');
  const dataImportRef = useRef(null);
  const builtinBank = useMemo(getBuiltinQuestionBank, []);

  const activeBank = useMemo(
    () => library.banks.find((bank) => bank.id === library.activeBankId) ?? library.banks[0],
    [library],
  );
  const state = activeBank.state;
  const questionBank = { questions: activeBank.questions };
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
  const builtinBankExists = library.banks.some((bank) => bank.id === builtinBank.id);

  function isEditableTarget(target) {
    return (
      target instanceof HTMLElement &&
      (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName))
    );
  }

  function commitLibrary(updater) {
    setLibrary((prev) => {
      const next = updater(prev);
      writeLibrary(next);
      return next;
    });
  }

  function updateActiveBank(updater) {
    commitLibrary((prev) => ({
      ...prev,
      banks: prev.banks.map((bank) => (bank.id === prev.activeBankId ? updater(bank) : bank)),
    }));
  }

  function commitState(updater) {
    updateActiveBank((bank) => {
      const nextState = updater(bank.state);
      return {
        ...bank,
        state: nextState,
      };
    });
  }

  function switchBank(bankId) {
    commitLibrary((prev) => ({
      ...prev,
      activeBankId: bankId,
      banks: prev.banks.map((bank) =>
        bank.id === bankId
          ? {
              ...bank,
              state: {
                ...bank.state,
                mode: state.mode,
              },
            }
          : bank,
      ),
    }));
    setShowAnswer(false);
    setDraftAnswer('');
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
    if (!confirm(`确定清空「${activeBank.name}」的答题记录、错题本和当前进度吗？`)) return;
    updateActiveBank((bank) => ({
      ...bank,
      state: defaultState,
    }));
    setShowAnswer(false);
    setDraftAnswer('');
  }

  function exportAllData() {
    downloadJson(`question-bank-data-${dateStamp()}.json`, {
      ...exportableBank(activeBank),
    });
  }

  async function importAllData(file) {
    if (!file) return;
    try {
      const backup = validateBackup(JSON.parse(await file.text()));
      const fallbackName = file.name?.replace(/\.json$/i, '') || backup.name;
      const nextBank = createQuestionBankEntry({
        id: backup.id || undefined,
        title: backup.title || backup.name || fallbackName,
        questions: backup.bank.questions,
        state: pruneStateForQuestions(backup.state, backup.bank.questions),
      });
      const existingBank = library.banks.find((bank) => bank.id === nextBank.id);
      const confirmText = existingBank
        ? `已存在 ID 为「${nextBank.id}」的题库「${existingBank.name}」。导入会覆盖该题库并清空它的答题记录、错题本和当前进度。确定继续吗？`
        : `将「${nextBank.name}」导入为新的题库，并切换到该题库。确定继续吗？`;
      if (!confirm(confirmText)) return;

      commitLibrary((prev) => ({
        activeBankId: nextBank.id,
        banks: existingBank
          ? prev.banks.map((bank) =>
              bank.id === nextBank.id
                ? {
                    ...nextBank,
                    state: defaultState,
                  }
                : bank,
            )
          : [...prev.banks, nextBank],
      }));
      setShowAnswer(false);
      setDraftAnswer('');
      alert(`${existingBank ? '题库覆盖成功' : '题库导入成功'}，共 ${nextBank.questions.length} 题。`);
    } catch (error) {
      alert(error instanceof Error ? error.message : '完整数据导入失败');
    } finally {
      if (dataImportRef.current) dataImportRef.current.value = '';
    }
  }

  function deleteActiveBank() {
    if (library.banks.length <= 1) {
      alert('至少需要保留一套题库。');
      return;
    }

    if (activeBank.id === builtinBank.id) {
      alert('系统默认题库不能删除。');
      return;
    }

    if (!confirm(`确定删除「${activeBank.name}」及其答题记录吗？此操作只影响当前浏览器。`)) return;

    commitLibrary((prev) => {
      const banks = prev.banks.filter((bank) => bank.id !== prev.activeBankId);
      const [nextActiveBank] = banks;
      return {
        activeBankId: nextActiveBank.id,
        banks: banks.map((bank) =>
          bank.id === nextActiveBank.id
            ? {
                ...bank,
                state: {
                  ...bank.state,
                  mode: state.mode,
                },
              }
            : bank,
        ),
      };
    });
    setShowAnswer(false);
    setDraftAnswer('');
  }

  function restoreBuiltinBank() {
    if (builtinBankExists) {
      commitLibrary((prev) => ({
        ...prev,
        activeBankId: builtinBank.id,
        banks: prev.banks.map((bank) =>
          bank.id === builtinBank.id
            ? {
                ...bank,
                state: {
                  ...bank.state,
                  mode: state.mode,
                },
              }
            : bank,
        ),
      }));
      setShowAnswer(false);
      setDraftAnswer('');
      alert('系统默认题库已存在，已切换到该题库。');
      return;
    }

    const restoredBank = createQuestionBankEntry({
      id: builtinBank.id,
      title: builtinBank.title,
      questions: builtinBank.questions,
      state: {
        ...defaultState,
        mode: state.mode,
      },
    });

    commitLibrary((prev) => ({
      activeBankId: restoredBank.id,
      banks: [...prev.banks, restoredBank],
    }));
    setShowAnswer(false);
    setDraftAnswer('');
    alert(`系统默认题库已恢复，共 ${restoredBank.questions.length} 题。`);
  }

  return (
    <main className="app-viewport bg-slate-100 text-slate-950">
      <div className="app-shell mx-auto flex w-full max-w-md flex-col bg-white shadow-soft">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur">
          <AppHeader
            bankName={activeBank.name}
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
              banks={library.banks}
              activeBankId={activeBank.id}
              questionCount={orderedQuestions.length}
              optionCount={optionCount}
              answeredCount={answeredCount}
              wrongCount={wrongCount}
              importRef={dataImportRef}
              canDeleteBank={activeBank.id !== builtinBank.id}
              builtinBankExists={builtinBankExists}
              onSelectBank={switchBank}
              onDeleteBank={deleteActiveBank}
              onRestoreBuiltinBank={restoreBuiltinBank}
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
