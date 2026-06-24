import { useState, useMemo, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  Copy,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  ServerCrash,
  Layers,
  Code2,
  Zap,
} from "lucide-react";

// ── constants ────────────────────────────────────────────────────────────────

const ACCEPTED = {
  pdf: "PDF",
  docx: "Word",
  doc: "Word",
  xlsx: "Excel",
  xls: "Excel",
  pptx: "PowerPoint",
  ppt: "PowerPoint",
};

const MAX_BYTES = 250 * 1024 * 1024; // 250 MB

const MODES = [
  { value: "standard", label: "Standard" },
  { value: "tables-first", label: "Tables First" },
  { value: "audit", label: "Audit" },
];

const OCR_OPTS = [
  { value: "auto", label: "Auto" },
  { value: "on", label: "On" },
  { value: "off", label: "Off" },
];

const ARCH_BULLETS = [
  "React frontend validates and uploads files to POST /api/convert.",
  "FastAPI or Node backend routes conversion by file type.",
  "Python workers handle document parsing (PyMuPDF, python-docx, openpyxl, python-pptx).",
  "OCR is backend-controlled — never processed in the browser.",
  "Response returns Markdown, warnings array, and a conversion manifest.",
  "Backend is responsible for temporary-file cleanup after each job.",
];

const API_FIELDS = ["file", "mode", "ocr", "preserveTables", "includeMetadata"];
const API_RETURNS = ["fileName", "sourceType", "markdown", "warnings", "manifest"];

// ── helpers ──────────────────────────────────────────────────────────────────

function ext(name) {
  return name.split(".").pop().toLowerCase();
}

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function mkId() {
  return Math.random().toString(36).slice(2, 10);
}

function fallbackMd(name, endpoint, errMsg) {
  return [
    `# Backend Required: ${name}`,
    "",
    "This file requires a running conversion backend.",
    "",
    `**Attempted endpoint:** \`${endpoint}\``,
    `**Error:** ${errMsg}`,
    "",
    "## Setup",
    "Deploy a FastAPI or Node service at `/api/convert` accepting multipart/form-data.",
    "See the **Architecture** and **API Contract** tabs for details.",
  ].join("\n");
}

// ── status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    ready: { icon: Clock, color: "text-slate-400", label: "Ready" },
    processing: { icon: Loader2, color: "text-blue-400 animate-spin", label: "Converting…" },
    done: { icon: CheckCircle, color: "text-emerald-400", label: "Done" },
    blocked: { icon: XCircle, color: "text-red-400", label: "Blocked" },
    "backend-required": { icon: ServerCrash, color: "text-amber-400", label: "Backend required" },
  };
  const { icon: Icon, color, label } = map[status] ?? map.ready;
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${color}`}>
      <Icon size={13} />
      {label}
    </span>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function FileMarkdownConverter() {
  const [tab, setTab] = useState("converter");
  const [queue, setQueue] = useState([]);
  const [selected, setSelected] = useState(null);
  const [opts, setOpts] = useState({
    mode: "standard",
    ocr: "auto",
    preserveTables: true,
    includeMetadata: false,
  });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  // ── queue helpers ────────────────────────────────────────────────────────

  const patchItem = useCallback((id, patch) => {
    setQueue((q) => q.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const addFiles = useCallback((files) => {
    const items = Array.from(files).map((f) => {
      const extension = ext(f.name);
      const typeLabel = ACCEPTED[extension];
      if (!typeLabel) {
        return {
          id: mkId(), file: f, name: f.name, extension, size: f.size,
          typeLabel: "Unknown", status: "blocked", progress: 0,
          warnings: [`Unsupported file type: .${extension}`],
          markdown: "", outputName: f.name + ".md", manifest: null,
        };
      }
      if (f.size > MAX_BYTES) {
        return {
          id: mkId(), file: f, name: f.name, extension, size: f.size,
          typeLabel, status: "blocked", progress: 0,
          warnings: [`File exceeds 250 MB limit (${fmtSize(f.size)})`],
          markdown: "", outputName: f.name.replace(/\.[^.]+$/, ".md"), manifest: null,
        };
      }
      return {
        id: mkId(), file: f, name: f.name, extension, size: f.size,
        typeLabel, status: "ready", progress: 0,
        warnings: [], markdown: "", outputName: f.name.replace(/\.[^.]+$/, ".md"), manifest: null,
      };
    });
    setQueue((q) => [...q, ...items]);
  }, []);

  // ── conversion ───────────────────────────────────────────────────────────

  const convert = useCallback(
    async (id) => {
      setQueue((q) =>
        q.map((item) =>
          item.id === id && item.status === "ready"
            ? { ...item, status: "processing", progress: 10 }
            : item
        )
      );

      const item = queue.find((i) => i.id === id);
      if (!item) return;

      const body = new FormData();
      body.append("file", item.file);
      body.append("mode", opts.mode);
      body.append("ocr", opts.ocr);
      body.append("preserveTables", String(opts.preserveTables));
      body.append("includeMetadata", String(opts.includeMetadata));

      try {
        const res = await fetch("/api/convert", { method: "POST", body });
        patchItem(id, { progress: 80 });

        if (!res.ok) {
          const msg = await res.text().catch(() => `HTTP ${res.status}`);
          throw new Error(msg);
        }

        const data = await res.json();
        patchItem(id, {
          status: "done",
          progress: 100,
          markdown: data.markdown ?? "",
          outputName: data.fileName ?? item.outputName,
          warnings: data.warnings ?? [],
          manifest: data.manifest ?? null,
        });
        setSelected(id);
      } catch (err) {
        patchItem(id, {
          status: "backend-required",
          progress: 0,
          markdown: fallbackMd(item.name, "/api/convert", err.message),
          warnings: [err.message],
        });
        setSelected(id);
      }
    },
    [queue, opts, patchItem]
  );

  const convertAll = useCallback(() => {
    queue.filter((i) => i.status === "ready").forEach((i) => convert(i.id));
  }, [queue, convert]);

  // ── drag/drop ────────────────────────────────────────────────────────────

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  // ── selected item ─────────────────────────────────────────────────────────

  const activeItem = useMemo(() => queue.find((i) => i.id === selected), [queue, selected]);

  const copyMarkdown = () => {
    if (activeItem?.markdown) navigator.clipboard.writeText(activeItem.markdown);
  };

  const downloadMd = () => {
    if (!activeItem?.markdown) return;
    const blob = new Blob([activeItem.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeItem.outputName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* header */}
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <FileText className="text-indigo-400" size={24} />
          <div>
            <h1 className="text-lg font-semibold tracking-tight">File → Markdown Converter</h1>
            <p className="text-xs text-slate-400">
              Convert PDF, Word, Excel and PowerPoint files to clean Markdown via /api/convert
            </p>
          </div>
        </div>
      </header>

      {/* tab bar */}
      <div className="border-b border-slate-800 px-6">
        <div className="max-w-7xl mx-auto flex gap-1 pt-2">
          {[
            { id: "converter", label: "Converter", icon: Zap },
            { id: "architecture", label: "Architecture", icon: Layers },
            { id: "api", label: "API Contract", icon: Code2 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-t transition-colors ${
                tab === id
                  ? "bg-slate-800 text-white border-t border-x border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* ── CONVERTER TAB ── */}
        {tab === "converter" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* left column */}
            <div className="flex flex-col gap-4">
              {/* upload card */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Upload Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      dragging
                        ? "border-indigo-500 bg-indigo-950/20"
                        : "border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <Upload className="mx-auto mb-2 text-slate-400" size={28} />
                    <p className="text-sm text-slate-300">Drag & drop files here</p>
                    <p className="text-xs text-slate-500 mt-1">or click to browse</p>
                    <p className="text-xs text-slate-600 mt-2">
                      PDF · DOCX · DOC · XLSX · XLS · PPTX · PPT — max 250 MB each
                    </p>
                    <input
                      ref={inputRef}
                      type="file"
                      multiple
                      accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt"
                      className="hidden"
                      onChange={(e) => addFiles(e.target.files)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* options card */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">
                    Conversion Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex gap-4 flex-wrap">
                    {/* mode */}
                    <div className="flex flex-col gap-1 min-w-[140px]">
                      <label className="text-xs text-slate-400">Mode</label>
                      <select
                        value={opts.mode}
                        onChange={(e) => setOpts((o) => ({ ...o, mode: e.target.value }))}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {MODES.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* ocr */}
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <label className="text-xs text-slate-400">OCR</label>
                      <select
                        value={opts.ocr}
                        onChange={(e) => setOpts((o) => ({ ...o, ocr: e.target.value }))}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {OCR_OPTS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* checkboxes */}
                  <div className="flex flex-col gap-2">
                    {[
                      { key: "preserveTables", label: "Preserve tables as Markdown tables" },
                      { key: "includeMetadata", label: "Include metadata / conversion manifest" },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={opts[key]}
                          onChange={(e) => setOpts((o) => ({ ...o, [key]: e.target.checked }))}
                          className="accent-indigo-500 w-4 h-4"
                        />
                        <span className="text-xs text-slate-300">{label}</span>
                      </label>
                    ))}
                  </div>

                  {/* convert all */}
                  <Button
                    onClick={convertAll}
                    disabled={!queue.some((i) => i.status === "ready")}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm mt-1 disabled:opacity-40"
                  >
                    Convert All Ready Files
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* right column */}
            <div className="flex flex-col gap-4">
              {/* queue card */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-200">
                    Queue ({queue.length})
                  </CardTitle>
                  {queue.length > 0 && (
                    <button
                      onClick={() => { setQueue([]); setSelected(null); }}
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </CardHeader>
                <CardContent>
                  {queue.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">
                      No files added yet. Upload files to begin.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                      {queue.map((item) => (
                        <li
                          key={item.id}
                          onClick={() => setSelected(item.id)}
                          className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                            selected === item.id
                              ? "bg-slate-700"
                              : "bg-slate-800 hover:bg-slate-750"
                          }`}
                        >
                          <FileText size={16} className="text-slate-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-200 truncate">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {item.typeLabel} · .{item.extension} · {fmtSize(item.size)}
                            </p>
                            {item.warnings.length > 0 && (
                              <p className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                                <AlertTriangle size={10} />
                                {item.warnings[0]}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <StatusBadge status={item.status} />
                            {item.status === "ready" && (
                              <button
                                onClick={(e) => { e.stopPropagation(); convert(item.id); }}
                                className="text-[10px] text-indigo-400 hover:text-indigo-300"
                              >
                                Convert
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* markdown output card */}
              <Card className="bg-slate-900 border-slate-700 flex-1">
                <CardHeader className="pb-2 flex flex-row items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-sm font-medium text-slate-200">
                    Markdown Output
                    {activeItem && (
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        {activeItem.outputName}
                      </span>
                    )}
                  </CardTitle>
                  {activeItem?.markdown && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyMarkdown}
                        className="border-slate-700 text-slate-300 hover:text-white text-xs h-7 px-2"
                      >
                        <Copy size={12} className="mr-1" /> Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={downloadMd}
                        className="border-slate-700 text-slate-300 hover:text-white text-xs h-7 px-2"
                      >
                        <Download size={12} className="mr-1" /> Download .md
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {activeItem?.markdown ? (
                    <textarea
                      readOnly
                      value={activeItem.markdown}
                      className="w-full h-64 bg-slate-800 border border-slate-700 rounded p-3 text-xs text-slate-300 font-mono resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-xs text-slate-500">
                      Select a converted file to view its Markdown output
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ── ARCHITECTURE TAB ── */}
        {tab === "architecture" && (
          <div className="max-w-2xl flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-slate-200">Architecture Overview</h2>
            <div className="grid gap-2">
              {ARCH_BULLETS.map((bullet, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3"
                >
                  <span className="text-indigo-400 font-mono text-xs mt-0.5 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm text-slate-300">{bullet}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3">
              <p className="text-xs text-slate-400 font-semibold mb-1">Parser Library Mapping</p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li><span className="text-slate-200">PDF</span> — PyMuPDF, pdfplumber, OCR fallback</li>
                <li><span className="text-slate-200">Word (.docx)</span> — python-docx or mammoth</li>
                <li><span className="text-slate-200">Word (.doc)</span> — LibreOffice headless</li>
                <li><span className="text-slate-200">Excel</span> — openpyxl, pandas, xlrd or LibreOffice fallback</li>
                <li><span className="text-slate-200">PowerPoint (.pptx)</span> — python-pptx</li>
                <li><span className="text-slate-200">PowerPoint (.ppt)</span> — LibreOffice headless</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── API CONTRACT TAB ── */}
        {tab === "api" && (
          <div className="max-w-xl flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-slate-200">API Contract</h2>
            <Card className="bg-slate-900 border-slate-700">
              <CardContent className="pt-4">
                <p className="text-xs font-mono text-indigo-400 mb-3">POST /api/convert</p>
                <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">
                  Request — multipart/form-data
                </p>
                <ul className="text-xs text-slate-300 mb-4 space-y-1">
                  {API_FIELDS.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <code className="text-indigo-300">{f}</code>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">
                  Response — application/json
                </p>
                <ul className="text-xs text-slate-300 space-y-1">
                  {API_RETURNS.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <code className="text-emerald-300">{f}</code>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardContent className="pt-4">
                <p className="text-xs text-slate-400 font-semibold mb-2">Field Enums</p>
                <div className="text-xs text-slate-400 space-y-1">
                  <p><code className="text-indigo-300">mode</code>: standard | tables-first | audit</p>
                  <p><code className="text-indigo-300">ocr</code>: auto | on | off</p>
                  <p><code className="text-indigo-300">preserveTables</code>: true | false</p>
                  <p><code className="text-indigo-300">includeMetadata</code>: true | false</p>
                  <p><code className="text-emerald-300">sourceType</code>: pdf | docx | doc | xlsx | xls | pptx | ppt</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
