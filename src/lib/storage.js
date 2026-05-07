import builtinQuestionBank from '../../question-bank.json';

export const STORAGE_KEY = 'question_bank_state_v1';
export const BANK_STORAGE_KEY = 'question_bank_data_v1';

export const defaultState = {
  currentIndex: 0,
  wrongIndex: 0,
  answers: {},
  wrongBook: {},
  mode: 'practice',
};

export function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

export function writeState(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function readQuestionBank() {
  try {
    const raw = localStorage.getItem(BANK_STORAGE_KEY);
    if (!raw) return getBuiltinQuestionBank();
    return validateQuestionBank(JSON.parse(raw));
  } catch {
    return getBuiltinQuestionBank();
  }
}

export function writeQuestionBank(bank) {
  localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(bank));
}

export function getBuiltinQuestionBank() {
  return validateQuestionBank(builtinQuestionBank);
}

export function validateQuestionBank(data) {
  const questions = data?.questions;

  if (!Array.isArray(questions)) {
    throw new Error('题库文件必须包含 questions 数组');
  }

  const optionsByQuestionId = Array.isArray(data?.options)
    ? data.options.reduce((map, option) => {
        if (!map.has(option.question_id)) map.set(option.question_id, []);
        map.get(option.question_id).push(option);
        return map;
      }, new Map())
    : null;

  const normalizedQuestions = questions.map((question) => {
    if (question?.id == null || !question?.type || !question?.stem || question?.answer == null) {
      throw new Error('题库 questions 中存在缺少 id/type/stem/answer 的题目');
    }

    const options = Array.isArray(question.options)
      ? question.options
      : question.type === 'true_false'
        ? [
            { label: 'true', content: '正确' },
            { label: 'false', content: '错误' },
          ]
        : (optionsByQuestionId?.get(question.id) ?? []);

    for (const option of options) {
      if (option?.label == null || option?.content == null) {
        throw new Error('题目 options 中存在缺少 label/content 的选项');
      }
    }

    return {
      id: question.id,
      type: question.type,
      stem: question.stem,
      answer: question.answer,
      explanation: question.explanation ?? '',
      options: options.map(({ label, content }) => ({ label, content })),
    };
  });

  return { questions: normalizedQuestions };
}

export function validateUserState(data) {
  const state = data;
  if (!state || typeof state !== 'object') throw new Error('用户数据格式不正确');

  return {
    currentIndex: state.currentIndex ?? 0,
    wrongIndex: state.wrongIndex ?? 0,
    answers: state.answers && typeof state.answers === 'object' ? state.answers : {},
    wrongBook: state.wrongBook && typeof state.wrongBook === 'object' ? state.wrongBook : {},
    mode: defaultState.mode,
  };
}

export function exportableState(state) {
  return {
    currentIndex: state.currentIndex ?? 0,
    wrongIndex: state.wrongIndex ?? 0,
    answers: state.answers && typeof state.answers === 'object' ? state.answers : {},
    wrongBook: state.wrongBook && typeof state.wrongBook === 'object' ? state.wrongBook : {},
  };
}

export function validateBackup(data) {
  if (Array.isArray(data?.questions)) {
    return {
      bank: validateQuestionBank(data),
      state: validateUserState(data.state ?? {}),
    };
  }

  throw new Error('完整数据文件格式不正确');
}

export function pruneStateForQuestions(state, questions) {
  const ids = new Set(questions.map((question) => String(question.id)));
  const answers = Object.fromEntries(Object.entries(state.answers).filter(([id]) => ids.has(String(id))));
  const wrongBook = Object.fromEntries(Object.entries(state.wrongBook).filter(([id]) => ids.has(String(id))));

  return {
    ...state,
    currentIndex: Math.min(state.currentIndex ?? 0, Math.max(questions.length - 1, 0)),
    wrongIndex: Math.min(state.wrongIndex ?? 0, Math.max(Object.keys(wrongBook).length - 1, 0)),
    answers,
    wrongBook,
  };
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}
