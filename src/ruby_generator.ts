import * as Blockly from "blockly";
import "blockly/blocks";

(window as any).Ruby = new Blockly.Generator("Ruby");

// 優先順位定数
(window as any).Ruby.ORDER_ATOMIC = 0;
(window as any).Ruby.ORDER_NONE = 99;

// ★ 1. ジェネレーターの初期化関数 (必須)
/**
 * ジェネレーターの初期化
 * @param {Blockly.Workspace} workspace ワークスペース
 */
(window as any).Ruby.init = function (workspace: Blockly.Workspace) {
  // Rubyの予約語リスト
  const RESERVED_WORDS = 'begin,end,if,else,elsif,unless,while,until,for,in,do,break,next,return,yield,super,self,true,false,nil,alias,undef,module,class,def,defined?,__FILE__,__LINE__';
  
  // 変数データベースを初期化
  (window as any).Ruby.variableDB_ = new Blockly.Names(RESERVED_WORDS);
  (window as any).Ruby.variableDB_.setVariableMap(workspace.getVariableMap());
};

/**
 * ブロックのコードを整形 (次のブロックのコードを連結)
 */
(window as any).Ruby.scrub_ = function (block: Blockly.Block, code: string, thisOnly?: boolean) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  let nextCode = '';
  if (nextBlock) {
    nextCode = (window as any).Ruby.blockToCode(nextBlock);
  }
  return code + (nextCode ? '\n' + nextCode : '');
};

/**
 * 接続されていない値ブロックのコードを整形
 */
(window as any).Ruby.scrubNakedValue = function (line: string) {
  return line + '\n'; 
};


// (controls_each の定義の後に追加)

// --- 📖 Ruby: リスト (配列) ---
// 標準の lists_create_with を上書きして見た目を Ruby らしくする
if (Blockly.Blocks["lists_create_with"]) {
  const originalListInit = Blockly.Blocks["lists_create_with"].init;

  Blockly.Blocks["lists_create_with"].init = function () {
    // 元の init を呼び出す (mutator や + - ボタンのセットアップのため)
    originalListInit.call(this);

    // 見た目をカスタマイズ
    this.setColour(260); // リストブロックの色
    this.setOutput(true, "Array"); // 出力は "Array" 型
    this.setTooltip("リスト（配列）を作成します。");

    // updateShape_ (形状更新) 関数を上書きして [ と ] を追加
    const originalUpdateShape = this.updateShape_;
    this.updateShape_ = function () {
      // 元の updateShape_ を呼び出す (ADD0, ADD1... の入力を作成するため)
      originalUpdateShape.call(this);

      // 既存の [ と ] ラベルを削除 (重複防止のため)
      this.removeInput('BEGIN', true);
      this.removeInput('END', true);
      this.removeInput('EMPTY', true);

      if (this.itemCount_ > 0) {
        // 要素が1つ以上ある場合
        // 先頭 (ADD0) に "[" を追加
        this.getInput("ADD0")!.insertFieldAt(0, "[", "BEGIN");

        // 末尾に "]" を追加
        this.appendDummyInput("END").appendField("]");

      } else {
        // 要素が0個の場合
        this.appendDummyInput("EMPTY").appendField("[ ]");
      }
    };

    // 形状を即時更新
    this.updateShape_();
  };
} else {
  console.error("Blockly 'lists_create_with' block not found. Make sure 'blockly/blocks' is imported.");
}

// --- (ここからブロックの「定義」) ---

// --- puts (旧 print) ---
Blockly.Blocks["text_print"] = {
  init: function () {
    this.appendValueInput("TEXT")
      .setCheck(null)
      .appendField("puts"); // ラベルもputsに変更
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("テキストを出力する（Ruby: puts）");
    this.setHelpUrl("");
  }
};


// --- Booleanリテラル ---
Blockly.Blocks["logic_boolean"] = {
  init: function () {
    this.setColour(210);
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ["true", "TRUE"],
        ["false", "FALSE"]
      ]),
      "BOOL"
    );
    this.setOutput(true, "Boolean");
  }
};

// --- 数値リテラル ---
Blockly.Blocks["math_number"] = {
  init: function () {
    this.setColour(230);
    this.appendDummyInput()
      .appendField(new Blockly.FieldNumber(0), "NUM"); // Directly editable
    this.setOutput(true, "Number");
    this.setTooltip("数値を入力");
  }
};

// --- テキストリテラル ---
Blockly.Blocks["text"] = {
  init: function () {
    this.setColour(160);
    this.appendDummyInput()
      .appendField(new Blockly.FieldTextInput(""), "TEXT"); // Directly editable
    this.setOutput(true, "String");
    this.setTooltip("文字列を入力");
  }
};

Blockly.Blocks["texts"] = {
  init: function () {
    this.setColour(180);
    this.appendDummyInput()
      .appendField(new Blockly.FieldTextInput('""'), "TEXT"); // Directly editable
    this.setOutput(true, "String");
    this.setTooltip("文字列を入力");
  }
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


// ★ 2. 新しいブロックの「定義」を追加

// --- 🔀 ローカル変数への代入 ---
Blockly.Blocks["variables_set_local"] = {
  init: function () {
    this.setColour(330); // 変数ブロックの色
    this.appendValueInput("VALUE")
      .appendField("set")
      .appendField(new Blockly.FieldVariable("variable"), "VAR") // 'variable' はデフォルトの変数名
      .appendField("=");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("ローカル変数に値を代入します");
  }
};

// --- 🔂 Ruby: .each 繰り返し ---
Blockly.Blocks["controls_each"] = {
  init: function () {
    this.setColour(120); // ループブロックの色
    
    // ★ 入力1: ([list] .each do | [a] |)
    // (ValueInput を削除し、FieldVariable に変更)
    this.appendDummyInput()
      .appendField(new Blockly.FieldVariable("list"), "LIST_VAR") // ★ 1. リスト変数
      .appendField(".each do |")
      .appendField(new Blockly.FieldVariable("a"), "VAR")      // ★ 2. ループ変数
      .appendField("|");
      
    // ★ 入力2: (do [ ])
    this.appendStatementInput("DO")
      .appendField("do");
      
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    
    // (入力が2行なので setInputsInline(true) は削除)
    
    this.setTooltip("リスト（配列）の各要素について処理を繰り返します (Array.each)");
  }
};


// --- (ここからコードジェネレーター (翻訳機)) ---

(window as any).Ruby.forBlock["text_print"] = function (block: any) {
  const msg =
    (window as any).Ruby.valueToCode(
      block,
      "TEXT",
      (window as any).Ruby.ORDER_NONE
    ) || '""';
  return `puts ${msg}\n`;
};


(window as any).Ruby.forBlock["logic_boolean"] = function (block: any) {
  const val = block.getFieldValue("BOOL");
  return [val === "TRUE" ? "true" : "false", (window as any).Ruby.ORDER_ATOMIC];
};


// --- 数値リテラル ---
(window as any).Ruby.forBlock["math_number"] = function (block: any) {
  const num = block.getFieldValue("NUM"); // 入力値を取得
  return [num, (window as any).Ruby.ORDER_ATOMIC];
};

// --- テキストリテラル ---
(window as any).Ruby.forBlock["text"] = function (block: any) {
  const txt = block.getFieldValue("TEXT"); // 入力値を取得
  const code = `${txt}`; // Ruby用にクォート
  return [code, (window as any).Ruby.ORDER_ATOMIC];
};

(window as any).Ruby.forBlock["texts"] = function (block: any) {
  const txt = block.getFieldValue("TEXT"); // 入力値を取得
  const code = `${txt}`; // Ruby用にクォート
  return [code, (window as any).Ruby.ORDER_ATOMIC];
};

// --- if文 ---
(window as any).Ruby.forBlock["controls_if"] = function (block: any) {
  let n = 0;
  let code = "";
  do {
    const condition =
      (window as any).Ruby.valueToCode(
        block,
        "IF" + n,
        (window as any).Ruby.ORDER_NONE
      ) || "false";
    const branch = (window as any).Ruby.statementToCode(block, "DO" + n);
    code += (n === 0 ? "if " : "elsif ") + condition + "\n" + branch;
    n++;
  } while (block.getInput("IF" + n));
  if (block.getInput("ELSE")) {
    const branch = (window as any).Ruby.statementToCode(block, "ELSE");
    code += "else\n" + branch;
  }
  code += "end\n";
  return code;
};


// --- 比較演算子 ---
(window as any).Ruby.forBlock["logic_compare"] = function (block: any) {
  const OPERATORS: any = {
    EQ: "==",
    NEQ: "!=",
    LT: "<",
    LTE: "<=",
    GT: ">",
    GTE: ">="
  };
  const op = OPERATORS[block.getFieldValue("OP")];
  const a =
    (window as any).Ruby.valueToCode(
      block,
      "A",
      (window as any).Ruby.ORDER_ATOMIC
    ) || "0";
  const b =
    (window as any).Ruby.valueToCode(
      block,
      "B",
      (window as any).Ruby.ORDER_ATOMIC
    ) || "0";
  const code = `${a} ${op} ${b}`;
  return [code, (window as any).Ruby.ORDER_ATOMIC];
};

// --- 四則演算 ---
(window as any).Ruby.forBlock["math_arithmetic"] = function (block: any) {
  const OPERATORS: any = {
    ADD: "+",
    MINUS: "-",
    MULTIPLY: "*",
    DIVIDE: "/",
    POWER: "**"
  };
  const op = OPERATORS[block.getFieldValue("OP")];
  const a =
    (window as any).Ruby.valueToCode(
      block,
      "A",
      (window as any).Ruby.ORDER_ATOMIC
    ) || "0";
  const b =
    (window as any).Ruby.valueToCode(
      block,
      "B",
      (window as any).Ruby.ORDER_ATOMIC
    ) || "0";
  const code = `${a} ${op} ${b}`;
  return [code, (window as any).Ruby.ORDER_ATOMIC];
};


// ★ 3. 新しいブロックの「ジェネレーター」を追加

// --- 🔀 ローカル変数への代入 ---
(window as any).Ruby.forBlock["variables_set_local"] = function (block: any) {
  // 1. 代入する値 (右辺) のコードを取得
  const value = (window as any).Ruby.valueToCode(
    block,
    "VALUE",
    (window as any).Ruby.ORDER_NONE
  ) || "nil"; // 何も接続されていなければ 'nil' を代入

  // 2. 変数名を取得
  const variableId = block.getFieldValue("VAR");
  const variableModel = block.workspace.getVariableById(variableId);
  if (!variableModel) {
    return `error_variable = ${value}\n`; // エラー時
  }
  const variableName = variableModel.name;
  
  const variable = (window as any).Ruby.variableDB_.getName(
     variableName,
     Blockly.Names.NameType.VARIABLE
  );
  
  // 3. Rubyコードを組み立てる
  const code = `${variable} = ${value}\n`;
  return code;
};

// --- 🔂 Ruby: .each 繰り返し ---
// (ruby_generator.ts 348行目あたり)

// ▼▼▼ この関数を丸ごと置き換えてください ▼▼▼

// --- 🔂 Ruby: .each 繰り返し ---
(window as any).Ruby.forBlock["controls_each"] = function (block: any) {
  // ★ 1. 繰り返し対象の「リスト変数名」を取得 (LIST_VAR から)
  const listVarId = block.getFieldValue("LIST_VAR");
  const listVarModel = block.workspace.getVariableById(listVarId);
  if (!listVarModel) {
    console.error("Ruby Generator: List variable not found for ID:", listVarId);
    return "# error: list variable not found\n";
  }
  const listVarName = listVarModel.name;
  const list = (window as any).Ruby.variableDB_.getName(
     listVarName,
     Blockly.Names.NameType.VARIABLE
  );

  // ★ 2. 「ループ変数名」 (|a|) を取得 (VAR から)
  const loopVarId = block.getFieldValue("VAR");
  const loopVarModel = block.workspace.getVariableById(loopVarId);
  if (!loopVarModel) {
    console.error("Ruby Generator: Loop variable not found for ID:", loopVarId);
    return `${list}.each do |error_var|\nend\n`;
  }
  const loopVarName = loopVarModel.name;
  const variable = (window as any).Ruby.variableDB_.getName(
     loopVarName,
     Blockly.Names.NameType.VARIABLE
  );

  // 3. 'do' の中身のコード（文）を取得
  const branch = (window as any).Ruby.statementToCode(block, "DO") || "";

  // 4. Rubyコードを組み立てる
  const code = `${list}.each do |${variable}|\n${branch}end\n`;
  
  return code;
};
// ▲▲▲ 置き換えここまで ▲▲▲


// (controls_each のジェネレーターの後に追加)

// --- 📖 Ruby: リスト (配列) ---
// (controls_each のジェネレーターの後に追加)

// --- 📖 Ruby: リスト (配列) ---
(window as any).Ruby.forBlock["lists_create_with"] = function (block: any) {
  const elements = [];
  // + ボタンで追加された要素の数だけループ
  for (let i = 0; i < block.itemCount_; i++) {
    // 各要素 (ADD0, ADD1, ...) のコードを取得
    const element = (window as any).Ruby.valueToCode(
      block,
      "ADD" + i,
      (window as any).Ruby.ORDER_NONE
    ) || "nil"; // 接続されていなければ 'nil'
    elements.push(element);
  }
  
  // 取得したコードを [ と ] で囲み、, で連結
  const code = `[${elements.join(", ")}]`;
  return [code, (window as any).Ruby.ORDER_ATOMIC];
};