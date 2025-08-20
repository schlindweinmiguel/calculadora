const resultEl = document.getElementById("result");
const historyEl = document.getElementById("history");

let current = "0";
let expression = "";
let justEvaluated = false;

function updateDisplay() {
  resultEl.textContent = current;
  historyEl.textContent = expression;
}

function appendNumber(num) {
  if (justEvaluated) {
    current = "0";
    expression = "";
    justEvaluated = false;
  }
  if (num === "." && current.includes(".")) return;
  if (current === "0" && num !== ".") {
    current = num;
  } else {
    current += num;
  }
  updateDisplay();
}

function setOperator(op) {
  if (justEvaluated) {
    expression = current;
    justEvaluated = false;
  } else {
    expression += current;
  }
  expression += " " + op + " ";
  current = "0";
  updateDisplay();
}

function clearAll() {
  current = "0";
  expression = "";
  justEvaluated = false;
  updateDisplay();
}

function deleteOne() {
  if (justEvaluated) return;
  if (current.length <= 1) current = "0";
  else current = current.slice(0, -1);
  updateDisplay();
}

function evaluate() {
  try {
    let exp = expression + current;
    let res = Function("return " + exp)();
    expression = exp + " =";
    current = String(res);
    justEvaluated = true;
    updateDisplay();
  } catch {
    current = "Erro";
    expression = "";
    justEvaluated = true;
    updateDisplay();
  }
}

function percent() {
  current = String(parseFloat(current) / 100);
  updateDisplay();
}

function toggleSign() {
  current = current.startsWith("-") ? current.slice(1) : "-" + current;
  updateDisplay();
}

function sqrt() {
  current = String(Math.sqrt(parseFloat(current)));
  updateDisplay();
}

function pow() {
  current = String(Math.pow(parseFloat(current), 2));
  updateDisplay();
}

function inverse() {
  current = String(1 / parseFloat(current));
  updateDisplay();
}

// Eventos
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    const num = btn.dataset.number;
    const op = btn.dataset.operator;
    const action = btn.dataset.action;
    const func = btn.dataset.func;

    if (num) appendNumber(num);
    if (op) setOperator(op);

    switch (action) {
      case "clear": clearAll(); break;
      case "delete": deleteOne(); break;
      case "equals": evaluate(); break;
      case "percent": percent(); break;
      case "sign": toggleSign(); break;
    }

    switch (func) {
      case "sqrt": sqrt(); break;
      case "pow": pow(); break;
      case "inverse": inverse(); break;
    }
  });
});

updateDisplay();
