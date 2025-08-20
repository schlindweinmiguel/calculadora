const prevEl = document.getElementById("previous-operand");
const currEl = document.getElementById("current-operand");
const buttons = document.querySelectorAll("button");

let currentOperand = "0";
let previousOperand = "";
let operation = null;

function updateDisplay() {
  currEl.textContent = currentOperand;
  prevEl.textContent = operation ? `${previousOperand} ${operation}` : "";
}

function clear() {
  currentOperand = "0";
  previousOperand = "";
  operation = null;
  updateDisplay();
}

function deleteDigit() {
  if (currentOperand.length === 1 || currentOperand === "Erro") {
    currentOperand = "0";
  } else {
    currentOperand = currentOperand.slice(0, -1);
  }
  updateDisplay();
}

function appendNumber(number) {
  if (number === "." && currentOperand.includes(".")) return;
  if (currentOperand === "0" && number !== ".") {
    currentOperand = number;
  } else {
    currentOperand += number;
  }
  updateDisplay();
}

function chooseOperation(op) {
  if (currentOperand === "Erro") return;
  if (previousOperand !== "") compute();
  operation = op;
  previousOperand = currentOperand;
  currentOperand = "0";
  updateDisplay();
}

function compute() {
  let result;
  const prev = parseFloat(previousOperand);
  const curr = parseFloat(currentOperand);
  if (isNaN(prev) || isNaN(curr)) return;

  switch (operation) {
    case "+":
      result = prev + curr;
      break;
    case "−":
      result = prev - curr;
      break;
    case "×":
      result = prev * curr;
      break;
    case "÷":
      result = curr === 0 ? "Erro" : prev / curr;
      break;
    default:
      return;
  }

  currentOperand = result.toString();
  operation = null;
  previousOperand = "";
  updateDisplay();
}

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.num !== undefined) {
      appendNumber(btn.dataset.num);
    } else if (btn.dataset.op !== undefined) {
      chooseOperation(btn.dataset.op);
    } else if (btn.dataset.action === "equals") {
      compute();
    } else if (btn.dataset.action === "clear") {
      clear();
    } else if (btn.dataset.action === "delete") {
      deleteDigit();
    }
  });
});

updateDisplay();
