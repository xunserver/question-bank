import builtinQuestionBank from '../../question-bank.json';

export const STORAGE_KEY = 'question_bank_state_v1';
export const BANK_STORAGE_KEY = 'question_bank_data_v1';
export const LIBRARY_STORAGE_KEY = 'question_bank_library_v2';

export const defaultState = {
  currentIndex: 0,
  wrongIndex: 0,
  answers: {},
  wrongBook: {},
  mode: 'practice',
};

export const DEFAULT_BANK_NAME = '默认题库';
export const DEFAULT_BANK_ID = 'builtin';

function createId(prefix = 'bank') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeBankName(name, fallback = DEFAULT_BANK_NAME) {
  const text = String(name ?? '').trim();
  return text || fallback;
}

export function createQuestionBankEntry({ id, name, title, questions, state }) {
  const bank = validateQuestionBank({ questions });
  const nextState = pruneStateForQuestions(validateUserState(state ?? {}), bank.questions);
  const resolvedTitle = normalizeBankName(title ?? name);

  return {
    id: String(id ?? createId()),
    title: resolvedTitle,
    name: resolvedTitle,
    questions: bank.questions,
    state: nextState,
  };
}

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

export function readLibrary() {
  try {
    const raw = localStorage.getItem(LIBRARY_STORAGE_KEY);
    if (raw) return validateLibrary(JSON.parse(raw));
  } catch {
    // Fall through to v1 migration.
  }

  return migrateLegacyLibrary();
}

export function writeLibrary(library) {
  localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(validateLibrary(library)));
}

export function getBuiltinQuestionBank() {
  const bank = validateQuestionBank(builtinQuestionBank);
  return {
    id: String(builtinQuestionBank.id ?? DEFAULT_BANK_ID),
    title: normalizeBankName(builtinQuestionBank.title ?? builtinQuestionBank.name),
    name: normalizeBankName(builtinQuestionBank.title ?? builtinQuestionBank.name),
    questions: bank.questions,
  };
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

export function validateLibrary(data) {
  const banks = data?.banks;
  if (!Array.isArray(banks) || banks.length === 0) {
    return migrateLegacyLibrary();
  }

  const normalizedBanks = banks.map((bank, index) =>
    createQuestionBankEntry({
      id: bank?.id ?? `bank-${index + 1}`,
      title: bank?.title ?? bank?.name ?? `${DEFAULT_BANK_NAME} ${index + 1}`,
      questions: bank?.questions,
      state: bank?.state,
    }),
  );
  const activeBankId = normalizedBanks.some((bank) => bank.id === data?.activeBankId)
    ? String(data.activeBankId)
    : normalizedBanks[0].id;

  return {
    activeBankId,
    banks: normalizedBanks,
  };
}

export function validateUserState(data) {
  const state = data;
  if (!state || typeof state !== 'object') throw new Error('用户数据格式不正确');
  const supportedModes = ['practice', 'overview', 'wrong', 'data'];

  return {
    currentIndex: state.currentIndex ?? 0,
    wrongIndex: state.wrongIndex ?? 0,
    answers: state.answers && typeof state.answers === 'object' ? state.answers : {},
    wrongBook: state.wrongBook && typeof state.wrongBook === 'object' ? state.wrongBook : {},
    mode: supportedModes.includes(state.mode) ? state.mode : defaultState.mode,
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
      id: String(data.id ?? '').trim(),
      title: String(data.title ?? data.name ?? '').trim(),
      name: String(data.name ?? data.title ?? '').trim(),
      bank: validateQuestionBank(data),
      state: validateUserState(data.state ?? {}),
    };
  }

  throw new Error('完整数据文件格式不正确');
}

export function exportableBank(bank) {
  return {
    id: String(bank?.id ?? '').trim(),
    title: normalizeBankName(bank?.title ?? bank?.name),
    name: normalizeBankName(bank?.title ?? bank?.name),
    questions: validateQuestionBank({ questions: bank?.questions }).questions,
    state: exportableState(bank?.state ?? {}),
  };
}

function migrateLegacyLibrary() {
  const bank = readQuestionBank();
  const state = validateUserState(readState());
  const entry = createQuestionBankEntry({
    id: bank.id,
    title: bank.title,
    questions: bank.questions,
    state,
  });

  return {
    activeBankId: entry.id,
    banks: [entry],
  };
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
