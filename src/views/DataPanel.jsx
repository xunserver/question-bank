import { Stat } from '../components/Stat';

function ImportExportBlock({ title, description, exportText, importText, inputRef, onExport, onImport }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          className="rounded-lg bg-slate-950 py-3 text-sm font-semibold text-white active:scale-95"
          onClick={onExport}
        >
          {exportText}
        </button>
        <button
          className="rounded-lg border border-slate-200 py-3 text-sm font-semibold text-slate-700 active:scale-95"
          onClick={() => inputRef.current?.click()}
        >
          {importText}
        </button>
      </div>
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept="application/json,.json"
        onChange={(event) => onImport(event.target.files?.[0])}
      />
    </div>
  );
}

export function DataPanel({
  banks,
  activeBankId,
  questionCount,
  optionCount,
  answeredCount,
  wrongCount,
  importRef,
  canDeleteBank,
  builtinBankExists,
  onSelectBank,
  onDeleteBank,
  onRestoreBuiltinBank,
  onExport,
  onImport,
}) {
  const activeBank = banks.find((bank) => bank.id === activeBankId) ?? banks[0];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">题库管理</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">每套题库都有独立的当前进度、答题记录和错题本。导入相同 ID 的 JSON 会覆盖原题库并清空该题库记录。</p>

        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-500" htmlFor="question-bank-select">
            当前题库
          </label>
          <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
            <select
              id="question-bank-select"
              className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800"
              value={activeBankId}
              onChange={(event) => onSelectBank(event.target.value)}
            >
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.name}
                </option>
              ))}
            </select>
            <button
              className="rounded-lg border border-rose-200 px-3 py-2.5 text-sm font-semibold text-rose-700 disabled:opacity-40"
              disabled={banks.length <= 1 || !canDeleteBank}
              onClick={onDeleteBank}
            >
              删除
            </button>
          </div>
          <div className="mt-2 truncate text-xs text-slate-500">{activeBank.name}</div>
        </div>

        <button
          className="mt-3 w-full rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-40"
          disabled={builtinBankExists}
          onClick={onRestoreBuiltinBank}
        >
          {builtinBankExists ? '系统默认题库已存在' : '恢复系统默认题库'}
        </button>

        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <Stat label="题目" value={questionCount} />
          <Stat label="选项" value={optionCount} />
          <Stat label="已答" value={answeredCount} />
          <Stat label="错题" value={wrongCount} />
        </div>
      </div>

      <ImportExportBlock
        title="当前题库数据"
        description="导出的 JSON 只包含当前题库及其练习记录。导入时会按题库 ID 新增或覆盖，并自动切换过去。"
        exportText="导出当前题库"
        importText="导入新题库"
        inputRef={importRef}
        onExport={onExport}
        onImport={onImport}
      />
    </div>
  );
}
