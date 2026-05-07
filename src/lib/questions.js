export function normalizeAnswer(answer) {
  return String(answer).trim().toLowerCase();
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
  return answer;
}

export function sortQuestions(questions) {
  return [...questions].sort((a, b) => a.id - b.id);
}

export function countOptions(questions) {
  return questions.reduce((total, question) => total + (Array.isArray(question.options) ? question.options.length : 0), 0);
}
