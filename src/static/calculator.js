/**
 * Standard Calculator Logic
 */

(function () {
  // State
  let currentInput = "0";
  let previousInput = "";
  let operator = null;
  let waitingForOperand = false;
  let expression = "";

  // DOM refs
  const resultEl = document.getElementById("calc-result");
  const expressionEl = document.getElementById("calc-expression");
  const operatorButtons = document.querySelectorAll(".btn-operator");

  // Display helpers
  function updateDisplay() {
    // Limit display length to avoid overflow
    const display =
      currentInput.length > 12
        ? parseFloat(currentInput).toExponential(6)
        : currentInput;
    resultEl.textContent = display;
    expressionEl.textContent = expression;
  }

  function setActiveOperator(op) {
    operatorButtons.forEach((btn) => {
      if (btn.dataset.op === op) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  function clearActiveOperator() {
    operatorButtons.forEach((btn) => btn.classList.remove("active"));
  }

  // Button handlers
  function handleNumber(num) {
    if (waitingForOperand) {
      currentInput = num;
      waitingForOperand = false;
    } else {
      if (currentInput === "0" && num !== ".") {
        currentInput = num;
      } else {
        if (currentInput.length < 12) {
          currentInput += num;
        }
      }
    }
    updateDisplay();
  }

  function handleDecimal() {
    if (waitingForOperand) {
      currentInput = "0.";
      waitingForOperand = false;
      updateDisplay();
      return;
    }
    if (!currentInput.includes(".")) {
      currentInput += ".";
      updateDisplay();
    }
  }

  function handleOperator(op) {
    const current = parseFloat(currentInput);

    if (operator && !waitingForOperand) {
      // Chain operations: compute previous result first
      const result = calculate(parseFloat(previousInput), current, operator);
      currentInput = formatResult(result);
      previousInput = currentInput;
    } else {
      previousInput = currentInput;
    }

    operator = op;
    waitingForOperand = true;

    const opSymbol = { "+": "+", "-": "−", "*": "×", "/": "÷" }[op] || op;
    expression = previousInput + " " + opSymbol;
    setActiveOperator(op);
    updateDisplay();
  }

  function handleEquals() {
    if (!operator || waitingForOperand) return;

    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    const opSymbol = { "+": "+", "-": "−", "*": "×", "/": "÷" }[operator] || operator;

    expression = previousInput + " " + opSymbol + " " + currentInput + " =";
    const result = calculate(prev, current, operator);
    currentInput = formatResult(result);

    operator = null;
    waitingForOperand = true;
    previousInput = "";
    clearActiveOperator();
    updateDisplay();
  }

  function handleClear() {
    currentInput = "0";
    previousInput = "";
    operator = null;
    waitingForOperand = false;
    expression = "";
    clearActiveOperator();
    updateDisplay();
  }

  function handleSign() {
    if (currentInput === "0") return;
    currentInput = currentInput.startsWith("-")
      ? currentInput.slice(1)
      : "-" + currentInput;
    updateDisplay();
  }

  function handlePercent() {
    const value = parseFloat(currentInput);
    currentInput = formatResult(value / 100);
    updateDisplay();
  }

  // Core calculation
  function calculate(a, b, op) {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return b === 0 ? "Error" : a / b;
      default:
        return b;
    }
  }

  function formatResult(value) {
    if (value === "Error") return "Error";
    if (!isFinite(value)) return "Error";
    // Avoid floating-point display issues
    const str = parseFloat(value.toPrecision(12)).toString();
    return str;
  }

  // Wire up buttons
  document.querySelectorAll(".btn-number").forEach((btn) => {
    btn.addEventListener("click", () => handleNumber(btn.dataset.num));
  });

  document.getElementById("btn-decimal").addEventListener("click", handleDecimal);

  document.querySelectorAll(".btn-operator").forEach((btn) => {
    btn.addEventListener("click", () => handleOperator(btn.dataset.op));
  });

  document.getElementById("btn-equals").addEventListener("click", handleEquals);
  document.getElementById("btn-clear").addEventListener("click", handleClear);
  document.getElementById("btn-sign").addEventListener("click", handleSign);
  document.getElementById("btn-percent").addEventListener("click", handlePercent);

  // Keyboard support
  document.addEventListener("keydown", (e) => {
    if (e.key >= "0" && e.key <= "9") {
      handleNumber(e.key);
    } else if (e.key === ".") {
      handleDecimal();
    } else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") {
      handleOperator(e.key);
    } else if (e.key === "Enter" || e.key === "=") {
      handleEquals();
    } else if (e.key === "Escape") {
      handleClear();
    } else if (e.key === "Backspace") {
      if (!waitingForOperand && currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
        if (currentInput === "-") currentInput = "0";
        updateDisplay();
      } else {
        handleClear();
      }
    } else if (e.key === "%") {
      handlePercent();
    }
  });

  // Initial render
  updateDisplay();
})();
