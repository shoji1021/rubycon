import { consolePrinter, RubyVM } from "@ruby/wasm-wasi";
import { File, OpenFile, PreopenDirectory, WASI } from "@bjorn3/browser_wasi_shim";

// Ruby WASM のロード
const response = await fetch("https://cdn.jsdelivr.net/npm/@ruby/3.4-wasm-wasi@2.7.1/dist/ruby+stdlib.wasm");
const module = await WebAssembly.compileStreaming(response);

// WASI の設定
const args: string[] = [];
const env: string[] = [];
const fds = [
  new OpenFile(new File([])), // stdin
  new OpenFile(new File([])), // stdout
  new OpenFile(new File([])), // stderr
  new PreopenDirectory("/", new Map()),
];
const wasi = new WASI(args, env, fds, { debug: false });

// DOM要素取得
const output = document.getElementById("output") as HTMLTextAreaElement;
const textbox = document.getElementById("textbox") as HTMLTextAreaElement;
const button = document.getElementById("button") as HTMLButtonElement;
const lineNumbers = document.getElementById("linenumbers");

// 標準出力/エラー出力
const printer = consolePrinter({
  stderr: (text) => { output.value += "⚠️ " + text + "\n"; },
  stdout: (text) => { output.value += text + "\n"; }
});

// Ruby VM 構築
const { vm } = await RubyVM.instantiateModule({
  module,
  wasip1: wasi,
  addToImports: (imports) => printer.addToImports(imports),
  setMemory: (memory) => printer.setMemory(memory),
});

// 実行ボタンの処理
button.addEventListener("click", async () => {
  output.value = ""; // 出力をリセット
  await vm.evalAsync(textbox.value);
});

// 行番号更新関数
function updateLineNumbers() {
  const lines = textbox.value.split("\n").length;
  let lineNumberText = "";
  for (let i = 1; i <= lines; i++) {
    lineNumberText += i + "\n";
  }
  if (lineNumbers) lineNumbers.textContent = lineNumberText;
}

// 行番号スクロール同期
textbox.addEventListener("input", updateLineNumbers);
textbox.addEventListener("scroll", () => {
  if (lineNumbers) {
    lineNumbers.scrollTop = textbox.scrollTop;
  }
});
updateLineNumbers(); // 初期化時にも更新

// Ctrl+Enter で実行
textbox.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") {
    e.preventDefault();
    button.click(); // 実行トリガー
  }
}); 