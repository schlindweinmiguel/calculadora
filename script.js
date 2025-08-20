const resultEl = document.getElementById("result");
const historyEl = document.getElementById("history");
const keys = document.querySelector(".keys");

let expression = ""; // expressão em caracteres amigáveis (÷ × −)
let lastResult = null;

function updateDisplay() {
  resultEl.value = expression.length ? expression : "0";
}

function appendValue(v) {
  // Evita dois operadores seguidos (exceto trocar operador)
  const ops = ["+", "−", "×", "÷"];
  const last = expression.slice(-1);
  if (ops.includes(v) && ops.includes(last)) {
    expression = expression.slice(0, -1) + v;
  } else if (v === "." || v === ",") {
    // vírgula/decimal: evita dois pontos no número atual
    const tail = getCurrentNumber();
    if (!tail.includes(".")) {
      expression += ".";
    }
  } else {
    expression += v;
  }
  updateDisplay();
}

function getCurrentNumber() {
  const parts = expression.split(/([+\-−×÷])/);
  return parts[parts.length - 1] || "";
}

function clearAll() {
  expression = "";
  updateDisplay();
  historyEl.textContent = "";
}

function delOne() {
  expression = expression.slice(0, -1);
  updateDisplay();
}

function invertSign() {
  // inverte o número atual
  const num = getCurrentNumber();
  if (!num) return;
  const start = expression.length - num.length;
  if (num.startsWith("−")) {
    expression = expression.slice(0, start) + num.slice(1);
  } else if (num.startsWith("-")) {
    expression = expression.slice(0, start) + num.slice(1);
  } else {
    expression = expression.slice(0, start) + "−" + num;
  }
  updateDisplay();
}

function percent() {
  // transforma o número atual em percentual (divide por 100)
  const num = getCurrentNumber();
  if (!num) return;
  const start = expression.length - num.length;
  const value = safeToNumber(num);
  if (value == null) return;
  const p = value / 100;
  expression = expression.slice(0, start) + String(p);
  updateDisplay();
}

function normalizeForEval(exp) {
  return exp
    .replace(/÷/g, "/")
    .replace(/×/g, "*")
    .replace(/−/g, "-");
}

function safeToNumber(str) {
  const normalized = normalizeForEval(str);
  if (!/^[-]?\d+(\.\d+)?$/.test(normalized)) return null;
  return parseFloat(normalized);
}

function calculate() {
  if (!expression) return;
  // evita fim com operador
  if (/[+\-−×÷.]$/.test(expression)) expression = expression.slice(0, -1);

  const exp = normalizeForEval(expression);

  // valida somente números, operadores e ponto
  if (!/^[\d+\-*/. ()]+$/.test(exp)) return;

  try {
    // avalia com Function de forma controlada
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${exp});`)();
    if (typeof result === "number" && isFinite(result)) {
      const out = Number(result.toPrecision(12)) + ""; // reduz ruído de ponto flutuante
      historyEl.textContent = expression + " =";
      resultEl.value = out;
      expression = out;
      lastResult = out;
    }
  } catch (e) {
    historyEl.textContent = "Erro de expressão";
  }
}

/* Clique dos botões */
keys.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const val = btn.getAttribute("data-value");
  const action = btn.getAttribute("data-action");

  if (val) {
    if (val === "%") return percent();
    appendValue(val);
  } else if (action) {
    if (action === "clear") clearAll();
    if (action === "del") delOne();
    if (action === "invert") invertSign();
    if (action === "equals") calculate();
  }
});

/* Suporte ao teclado */
window.addEventListener("keydown", (e) => {
  const k = e.key;

  if (/\d/.test(k)) appendValue(k);
  else if (k === "." || k === ",") appendValue(".");
  else if (k === "+" ) appendValue("+");
  else if (k === "-" ) appendValue("−");
  else if (k === "*" ) appendValue("×");
  else if (k === "/" ) appendValue("÷");
  else if (k === "Enter" || k === "=") { e.preventDefault(); calculate(); }
  else if (k === "Backspace") delOne();
  else if (k === "Escape") clearAll();
  else if (k === "%") percent();
});
