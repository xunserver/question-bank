import questionBank from './data/questionBank.generated.json';

type NormalizedAnswer = boolean | string[];

type Question = {
  type: string;
  options: Array<{
    id: number;
    question_id: number;
    label: string;
    content: string;
  }>;
  normalizedAnswer: NormalizedAnswer;
};

type QuestionBank = {
  metadata?: {
    questionCount?: number;
  };
  questions?: Question[];
};

const bank = questionBank as QuestionBank;
const questions = Array.isArray(bank.questions) ? bank.questions : [];
const questionCount = bank.metadata?.questionCount ?? questions.length;
const hasQuestions = questionCount > 0;
const hasTrueFalse = questions.some((question) => question.type === 'true_false');
const hasSingleChoice = questions.some(
  (question) => question.options.length > 0 && Array.isArray(question.normalizedAnswer) && question.normalizedAnswer.length === 1,
);
const hasMultipleChoice = questions.some(
  (question) => question.options.length > 0 && Array.isArray(question.normalizedAnswer) && question.normalizedAnswer.length > 1,
);

function App() {
  const availableTypes = [
    hasTrueFalse ? '判断题' : null,
    hasSingleChoice ? '单选题' : null,
    hasMultipleChoice ? '多选题' : null,
  ].filter(Boolean);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">电工刷题</div>
      </header>

      <main className="app-main" aria-labelledby="status-title">
        {hasQuestions ? (
          <section className="status-surface status-surface--loaded" aria-label={`已检测题型：${availableTypes.join('、')}`}>
            <p className="status-label">本地题库</p>
            <h1 id="status-title">题库已加载</h1>
            <p className="question-count">共 {questionCount} 题</p>
            <p className="status-body">支持判断题、单选题、多选题。</p>
            <button className="primary-button" type="button">
              开始刷题
            </button>
            <p className="helper-text">刷题流程将在下一阶段启用</p>
          </section>
        ) : (
          <section className="status-surface status-surface--error">
            <p className="status-label">构建检查</p>
            <h1 id="status-title">题库加载失败</h1>
            <p className="status-body">请确认构建时已生成题库文件，然后重新刷新页面。</p>
            <button className="primary-button primary-button--error" type="button" onClick={() => window.location.reload()}>
              重新加载页面
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
