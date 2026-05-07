import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const questionsPath = path.join(rootDir, 'questions.json');
const optionsPath = path.join(rootDir, 'options.json');
const outputPath = path.join(rootDir, 'src', 'data', 'questionBank.generated.json');

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'));

const normalizeAnswer = (answer) => {
  if (answer === 'true') {
    return true;
  }

  if (answer === 'false') {
    return false;
  }

  const normalized = String(answer ?? '').trim().toUpperCase();
  if (!normalized) {
    return [];
  }

  if (/[,，;；\s]/u.test(normalized)) {
    return normalized.split(/[,，;；\s]+/u).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }

  return [normalized];
};

const questions = await readJson(questionsPath);
const options = await readJson(optionsPath);

if (!Array.isArray(questions) || questions.length === 0) {
  console.error('No questions loaded from questions.json');
  process.exit(1);
}

if (!Array.isArray(options)) {
  console.error('No options array loaded from options.json');
  process.exit(1);
}

const optionsByQuestionId = new Map();

for (const option of options) {
  const grouped = optionsByQuestionId.get(option.question_id) ?? [];
  grouped.push({
    id: option.id,
    question_id: option.question_id,
    label: option.label,
    content: option.content,
  });
  optionsByQuestionId.set(option.question_id, grouped);
}

const generatedQuestions = questions.map((question) => ({
  id: question.id,
  source_no: question.source_no,
  type: question.type,
  stem: question.stem,
  answer: question.answer,
  source_file: question.source_file,
  raw_text: question.raw_text,
  created_at: question.created_at,
  options: (optionsByQuestionId.get(question.id) ?? []).sort((a, b) => String(a.label).localeCompare(String(b.label))),
  normalizedAnswer: normalizeAnswer(question.answer),
}));

const questionBank = {
  metadata: {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    questionCount: generatedQuestions.length,
    optionCount: options.length,
  },
  questions: generatedQuestions,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(questionBank, null, 2)}\n`, 'utf8');

console.log(`Generated question bank: ${generatedQuestions.length} questions, ${options.length} options`);
