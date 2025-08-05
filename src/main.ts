import { consolePrinter, RubyVM } from "@ruby/wasm-wasi";
import { File, OpenFile, PreopenDirectory, WASI } from "@bjorn3/browser_wasi_shim";

const response = await fetch("https://cdn.jsdelivr.net/npm/@ruby/3.4-wasm-wasi@2.7.1/dist/ruby+stdlib.wasm");
const module = await WebAssembly.compileStreaming(response);

const args = [];
const env = [];

const fds = [
  new OpenFile(new File([])),
  new OpenFile(new File([])),
  new OpenFile(new File([])),
  new PreopenDirectory("/", new Map()),
];

const wasi = new WASI(args, env, fds, { debug: false });

const output = <HTMLTextAreaElement>document.getElementById("output"); // ⬅️ 追加・移動OK
const printer = consolePrinter({
  stderr: (text) => { output.value += "⚠️ " + text + "\n"; },
  stdout: (text) => { output.value += text + "\n"; }
});

const { vm } = await RubyVM.instantiateModule({
  module: module, wasip1: wasi,
  addToImports: (imports) => {
    printer.addToImports(imports);
  },
  setMemory: (memory) => {
    printer.setMemory(memory);
  }
});

const textbox = <HTMLTextAreaElement>document.getElementById("textbox");
const button = <HTMLButtonElement>document.getElementById("button");

button.addEventListener("click", async () => {
  output.value = ""; // ← 前回の出力を消す（好みで）
  await vm.evalAsync(textbox.value); // 出力はconsolePrinter経由で反映済

});

// 行番号表示用の要素を取得
const lineNumbers = document.getElementById("linenumbers");

// 行番号を更新する関数
function updateLineNumbers() {
  const lines = textbox.value.split("\n").length;
  let lineNumberText = "";
  for (let i = 1; i <= lines; i++) {
    lineNumberText += i + "\n";
  }
  if (lineNumbers) lineNumbers.textContent = lineNumberText;
}

// 入力時に行番号を更新
textbox.addEventListener("input", updateLineNumbers);
textbox.addEventListener("scroll", () => {
  if (lineNumbers) {
    lineNumbers.scrollTop = textbox.scrollTop;
  }
});

// 初期化時にも更新
updateLineNumbers();
