import * as Blockly from "blockly";

// グローバル(window)にRubyジェネレーターを追加
(window as any).Ruby = new Blockly.Generator("Ruby");

// 優先順位定数を定義
(window as any).Ruby.ORDER_ATOMIC = 0;
(window as any).Ruby.ORDER_NONE = 99;

// ジェネレーター関数は prototype へ登録
(window as any).Ruby.forBlock["text_print"] = function(block: any) {
  const msg = (window as any).Ruby.valueToCode(block, "TEXT", (window as any).Ruby.ORDER_NONE) || '""';
  return `puts ${msg}\n`;
};

// math_number
(window as any).Ruby.forBlock["math_number"] = function(block: any) {
  return [block.getFieldValue("NUM"), (window as any).Ruby.ORDER_ATOMIC];
};

// text
(window as any).Ruby.forBlock["text"] = function(block: any) {
  const code = (window as any).Ruby.quote_(block.getFieldValue("TEXT"));
  return [code, (window as any).Ruby.ORDER_ATOMIC];
};

// controls_if
(window as any).Ruby.forBlock["controls_if"] = function(block: any) {
  let n = 0;
  let code = "";
  do {
    const condition = (window as any).Ruby.valueToCode(block, "IF" + n, (window as any).Ruby.ORDER_NONE) || "false";
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

// logic_compare
(window as any).Ruby.forBlock["logic_compare"] = function(block: any) {
  const OPERATORS = {
    EQ: "==",
    NEQ: "!=",
    LT: "<",
    LTE: "<=",
    GT: ">",
    GTE: ">="
  };
  const op = OPERATORS[block.getFieldValue("OP")];
  const a = (window as any).Ruby.valueToCode(block, "A", (window as any).Ruby.ORDER_ATOMIC) || "0";
  const b = (window as any).Ruby.valueToCode(block, "B", (window as any).Ruby.ORDER_ATOMIC) || "0";
  const code = `${a} ${op} ${b}`;
  return [code, (window as any).Ruby.ORDER_ATOMIC];
};

// math_arithmetic
(window as any).Ruby.forBlock["math_arithmetic"] = function(block: any) {
  const OPERATORS = {
    ADD: "+",
    MINUS: "-",
    MULTIPLY: "*",
    DIVIDE: "/",
    POWER: "**"
  };
  const op = OPERATORS[block.getFieldValue("OP")];
  const a = (window as any).Ruby.valueToCode(block, "A", (window as any).Ruby.ORDER_ATOMIC) || "0";
  const b = (window as any).Ruby.valueToCode(block, "B", (window as any).Ruby.ORDER_ATOMIC) || "0";
  const code = `${a} ${op} ${b}`;
  return [code, (window as any).Ruby.ORDER_ATOMIC];
};

// variables_set
(window as any).Ruby.forBlock["variables_set"] = function(block: any) {
  const varName = (window as any).Ruby.nameDB_.getName(block.getFieldValue("VAR"), Blockly.VARIABLE_CATEGORY_NAME);
  const value = (window as any).Ruby.valueToCode(block, "VALUE", (window as any).Ruby.ORDER_NONE) || "nil";
  return `${varName} = ${value}\n`;
};

// variables_get
(window as any).Ruby.forBlock["variables_get"] = function(block: any) {
  const varName = (window as any).Ruby.nameDB_.getName(block.getFieldValue("VAR"), Blockly.VARIABLE_CATEGORY_NAME);
  return [varName, (window as any).Ruby.ORDER_ATOMIC];
};

(window as any).Ruby.quote_ = function(str: string) {
  // シングルクォートで囲み、内部のシングルクォートをエスケープ
  return `'${str.replace(/'/g, "\\'")}'`;
};