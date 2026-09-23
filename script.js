const valueEl = document.getElementById("value");
const exprEl = document.getElementById("expr");
const SYMBOL = { "+": "+", "-": "\u2212", "*": "\u00d7", "/": "\u00f7" };
const MAX_DIGITS = 12;

let current = "0";   // number being typed
let previous = null; // stored left-hand number
let operator = null; // pending operator
let waiting = false; // true right after an operator is pressed
let done = false;    // true right after "=" or an error
let error = false;

function compute(a, b, op) {
  a = parseFloat(a); b = parseFloat(b);
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") return b === 0 ? null : a / b;
}

function format(n) {
  // Trim floating point noise such as 0.1 + 0.2 = 0.30000000000000004
  return String(parseFloat(n.toPrecision(12)));
}

function render() {
  valueEl.textContent = current;
  valueEl.classList.toggle("small", error);
  document.querySelectorAll(".op").forEach((b) =>
    b.classList.toggle("active", waiting && b.dataset.op === operator)
  );
}

function reset() {
  current = "0"; previous = null; operator = null;
  waiting = false; done = false; error = false;
  exprEl.textContent = "";
}

function showError() {
  current = "Can't divide by 0";
  error = true; done = true;
  previous = null; operator = null; waiting = false;
  exprEl.textContent = "";
}

function inputNumber(d) {
  if (error) reset();
  if (done) exprEl.textContent = "";
  if (waiting || done) { current = "0"; waiting = false; done = false; }
  if (current.replace(/[-.]/g, "").length >= MAX_DIGITS) return;
  current = current === "0" ? d : current + d;
}

function inputDot() {
  if (error) reset();
  if (waiting || done) { current = "0"; waiting = false; done = false; }
  if (!current.includes(".")) current += ".";
}

function chooseOperator(op) {
  if (error) return;
  if (operator && !waiting) {
    const result = compute(previous, current, operator);
    if (result === null) return showError();
    current = format(result);
  }
  previous = current;
  operator = op;
  waiting = true;
  done = false;
  exprEl.textContent = `${previous} ${SYMBOL[op]}`;
}

function equals() {
  if (error || !operator || waiting) return;
  const result = compute(previous, current, operator);
  const text = `${previous} ${SYMBOL[operator]} ${current} =`;
  if (result === null) return showError();
  current = format(result);
  exprEl.textContent = text;
  previous = null; operator = null; done = true;
}

function backspace() {
  if (error || done) return reset();
  if (waiting) return;
  current = current.length > 1 ? current.slice(0, -1) : "0";
  if (current === "-") current = "0";
}

function percent() {
  if (error) return;
  current = format(parseFloat(current) / 100);
}

// Button clicks
document.querySelector(".keys").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  press(btn);
});

function press(btn) {
  const { num, op, action } = btn.dataset;
  if (num !== undefined) inputNumber(num);
  else if (op) chooseOperator(op);
  else if (action === "dot") inputDot();
  else if (action === "equals") equals();
  else if (action === "clear") reset();
  else if (action === "back") backspace();
  else if (action === "percent") percent();
  render();
}

// Keyboard support
document.addEventListener("keydown", (e) => {
  let selector = null;
  if (/^[0-9]$/.test(e.key)) selector = `[data-num="${e.key}"]`;
  else if ("+-*/".includes(e.key)) selector = `[data-op="${e.key}"]`;
  else if (e.key === "." || e.key === ",") selector = '[data-action="dot"]';
  else if (e.key === "Enter" || e.key === "=") selector = '[data-action="equals"]';
  else if (e.key === "Backspace") selector = '[data-action="back"]';
  else if (e.key === "Escape" || e.key.toLowerCase() === "c") selector = '[data-action="clear"]';
  else if (e.key === "%") selector = '[data-action="percent"]';
  if (!selector) return;
  e.preventDefault();
  const btn = document.querySelector(selector);
  btn.classList.add("pressed");
  setTimeout(() => btn.classList.remove("pressed"), 120);
  press(btn);
});

render();
