export function normalizeAnswer(answer) {
  return String(answer).trim().toLowerCase();
}

export function isMultipleChoice(question) {
  return question.type === 'multiple_choice';
}

export function answerLabels(answer) {
  if (Array.isArray(answer)) {
    return answer.map((item) => String(item).trim()).filter(Boolean);
  }

  const text = String(answer ?? '').trim();
  if (!text) return [];

  if (/[,，、\s]/.test(text)) {
    return text.split(/[,，、\s]+/).filter(Boolean);
  }

  if (/^[a-z]+$/i.test(text) && text.length > 1) {
    return text.split('');
  }

  return [text];
}

export function normalizeAnswerSet(answer) {
  return answerLabels(answer)
    .map((item) => item.toLowerCase())
    .sort()
    .join('|');
}

export function isAnswerCorrect(question, answer) {
  if (isMultipleChoice(question)) {
    return normalizeAnswerSet(answer) === normalizeAnswerSet(question.answer);
  }

  return normalizeAnswer(answer) === normalizeAnswer(question.answer);
}

export function isChoiceInAnswer(answer, label) {
  const normalizedLabel = normalizeAnswer(label);
  return answerLabels(answer).some((item) => normalizeAnswer(item) === normalizedLabel);
}

export function toggleAnswerLabel(answer, label) {
  const labels = answerLabels(answer);
  const normalizedLabel = normalizeAnswer(label);
  const exists = labels.some((item) => normalizeAnswer(item) === normalizedLabel);
  const nextLabels = exists ? labels.filter((item) => normalizeAnswer(item) !== normalizedLabel) : [...labels, label];

  return nextLabels.sort((a, b) => String(a).localeCompare(String(b))).join(',');
}

export function questionTypeLabel(type) {
  if (type === 'true_false') return '判断题';
  if (type === 'single_choice') return '单选题';
  if (type === 'multiple_choice') return '多选题';
  return '其他题型';
}

export function getQuestionOptions(question) {
  if (Array.isArray(question.options)) {
    return question.options;
  }
  if (question.type === 'true_false') {
    return [
      { label: 'true', content: '正确' },
      { label: 'false', content: '错误' },
    ];
  }
  return [];
}

export function answerText(question, answer) {
  if (question.type === 'true_false') {
    return answer === 'true' ? '正确' : '错误';
  }
  if (isMultipleChoice(question)) {
    return answerLabels(answer).join('、');
  }
  return answer;
}

export function sortQuestions(questions) {
  return [...questions].sort((a, b) => a.id - b.id);
}

export function countOptions(questions) {
  return questions.reduce((total, question) => total + (Array.isArray(question.options) ? question.options.length : 0), 0);
}
