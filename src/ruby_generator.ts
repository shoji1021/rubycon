import * as Blockly from "blockly";

(window as any).Ruby = new Blockly.Generator("Ruby");

// 優先順位定数
(window as any).Ruby.ORDER_ATOMIC = 0;
(window as any).Ruby.ORDER_NONE = 99;


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
  return [block.getFieldValue("NUM"), (window as any).Ruby.ORDER_ATOMIC];
};

// --- テキストリテラル ---
(window as any).Ruby.forBlock["text"] = function (block: any) {
  const code = (window as any).Ruby.quote_(block.getFieldValue("TEXT"));
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

