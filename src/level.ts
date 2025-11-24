import * as Blockly from "blockly";
import "blockly/blocks";
import "./ruby_generator";

// Window型にBlocklyプロパティを追加
declare global {
  interface Window {
    Blockly: typeof Blockly;
    Ruby?: any; // 追加: Rubyプロパティを許可
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  // Blocklyの初期化
  const blocklyDiv = document.getElementById("blocklyDiv")!;
  const workspace = Blockly.inject(blocklyDiv, {
    toolbox: {
      "kind": "flyoutToolbox",
      "contents": [
        { "kind": "block", "type": "controls_if" },
        { "kind": "block", "type": "logic_boolean" },
        { "kind": "block", "type": "logic_compare" },
        { "kind": "block", "type": "math_number" },
        { "kind": "block", "type": "math_arithmetic" },
        { "kind": "block", "type": "text" },
        { "kind": "block", "type": "text_print" },
      ]
    }
  });


  Blockly.Blocks["text_print"] = {
  init: function () {
    this.appendValueInput("TEXT")
      .setCheck(null)
      .appendField("puts"); // ← print → puts に変更
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("テキストを出力する（Ruby: puts）");
    this.setHelpUrl("");
  }
};

// --- 数値リテラル ---
Blockly.Blocks["math_number"].init = function () {
  this.setColour(230);
  this.appendDummyInput().appendField(new Blockly.FieldNumber(0), "NUM");
  this.setOutput(true, "Number");
};

// --- テキストリテラル ---
Blockly.Blocks["text"].init = function () {
  this.setColour(160);
  this.appendDummyInput().appendField(new Blockly.FieldTextInput(""), "TEXT");
  this.setOutput(true, "String");
};

// --- if文（シンプル版）---
Blockly.Blocks["controls_if"] = {
  init: function () {
    this.setColour(210);
    this.appendValueInput("IF0").appendField("if");
    this.appendStatementInput("DO0").appendField("then");
    this.appendStatementInput("ELSE").appendField("else");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
  }
};


// --- 比較演算子 ---
Blockly.Blocks["logic_compare"] = {
  init: function () {
    this.setColour(210);
    this.appendValueInput("A");
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["==", "EQ"],
        ["!=", "NEQ"],
        ["<", "LT"],
        ["<=", "LTE"],
        [">", "GT"],
        [">=", "GTE"]
      ]),
      "OP"
    );
    this.appendValueInput("B");
    this.setOutput(true, "Boolean");
  }
};

// --- 四則演算 ---
Blockly.Blocks["math_arithmetic"] = {
  init: function () {
    this.setColour(230);
    this.appendValueInput("A");
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["+", "ADD"],
        ["-", "MINUS"],
        ["*", "MULTIPLY"],
        ["/", "DIVIDE"],
        ["**", "POWER"]
      ]),
      "OP"
    );
    this.appendValueInput("B");
    this.setInputsInline(true);
    this.setOutput(true, "Number");
  }
};



  // Rubyジェネレーターがグローバルに追加されている前提
  const textbox = document.getElementById("textbox") as HTMLTextAreaElement;
  workspace.addChangeListener((event: any) => {
    // @ts-ignore
    const rubyCode = (window as any).Ruby.workspaceToCode(workspace);
    textbox.value = rubyCode;
  });

  if (event instanceof Blockly.Events.BlockMove) {
      
      // 'instanceof' を通過すると 'event' は 'BlockMove' 型として扱われるため、
      // 'isUiEvent' プロパティに安全にアクセスできます。
      if (event.isUiEvent) {
        try {
          // levelX.html の body タグから levelId を取得
          const levelId = document.body.dataset.levelId;
          if (!levelId) return; // IDがなければ何もしない

          const newPercentage = 40;
          const storageKey = 'progress_' + levelId;
          
          // 現在の進捗を取得
          const currentProgress = parseInt(localStorage.getItem(storageKey) || '0');
          
          // 新しい進捗の方が大きい場合のみ保存
          if (newPercentage > currentProgress) {
            localStorage.setItem(storageKey, newPercentage.toString());
            console.log(`Progress updated for ${levelId}: ${newPercentage}% (Blockly move)`);
          }
        } catch (e) {
          console.error('Failed to save 40% progress from Blockly', e);
        }
      }
    }

  // --- RubyVMの初期化・実行ボタンの処理 ---
  const { consolePrinter, RubyVM } = await import("@ruby/wasm-wasi");
  const { File, OpenFile, PreopenDirectory, WASI } = await import("@bjorn3/browser_wasi_shim");

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

  const output = document.getElementById("output") as HTMLTextAreaElement;
  const printer = consolePrinter({
    stderr: (text: string) => { output.value += "⚠️ " + text + "\n"; },
    stdout: (text: string) => { output.value += text + "\n"; }
  });

  const { vm } = await RubyVM.instantiateModule({
    module: module, wasip1: wasi,
    addToImports: (imports: any) => {
      printer.addToImports(imports);
    },
    setMemory: (memory: any) => {
      printer.setMemory(memory);
    }
  });

  const button = document.getElementById("button") as HTMLButtonElement;
  button.addEventListener("click", async () => {
    output.value = "";
    await vm.evalAsync(textbox.value);
  });

  textbox.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      button.click();
    }
  });
});