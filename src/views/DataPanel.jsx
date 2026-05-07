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
  questionCount,
  optionCount,
  answeredCount,
  wrongCount,
  importRef,
  onExport,
  onImport,
}) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">导入导出</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">完整数据包含题库、当前进度、答题记录和错题本，换设备时导入一个文件即可继续使用。</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <Stat label="题目" value={questionCount} />
          <Stat label="选项" value={optionCount} />
          <Stat label="已答" value={answeredCount} />
          <Stat label="错题" value={wrongCount} />
        </div>
      </div>

      <ImportExportBlock
        title="完整数据"
        description="导出的 JSON 同时保存当前题库和个人练习记录。导入会覆盖当前浏览器中的题库和练习记录。"
        exportText="导出完整数据"
        importText="导入完整数据"
        inputRef={importRef}
        onExport={onExport}
        onImport={onImport}
      />
    </div>
  );
}
