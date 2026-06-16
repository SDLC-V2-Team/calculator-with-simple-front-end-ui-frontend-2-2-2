// Core arithmetic engine for the calculator.
// Pure, framework-free ES6 module — fully unit-testable and free of DOM access.

/**
 * Performs a basic arithmetic operation.
 * @param {number} a - left operand
 * @param {number} b - right operand
 * @param {('+'|'-'|'*'|'/')} operator - arithmetic operator
 * @returns {number} result of the operation
 * @throws {Error} on division by zero or unknown operator
 */
export function operate(a, b, operator) {
  switch (operator) {
    case '+':
      return add(a, b);
    case '-':
      return subtract(a, b);
    case '*':
      return multiply(a, b);
    case '/':
      return divide(a, b);
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
}

export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(a, b) {
  return a * b;
}

export function divide(a, b) {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

/**
 * Rounds a floating point result to avoid IEEE-754 display artifacts
 * (e.g. 0.1 + 0.2 = 0.30000000000000004).
 * @param {number} value
 * @returns {number}
 */
export function roundResult(value) {
  if (!isFinite(value)) return value;
  return Math.round((value + Number.EPSILON) * 1e10) / 1e10;
}

/**
 * State machine that drives calculator behaviour from discrete input events.
 * Keeps zero coupling to the DOM so it can be tested in isolation.
 */
export class CalculatorState {
  constructor() {
    this.reset();
  }

  reset() {
    this.current = '0';
    this.previous = null;
    this.operator = null;
    this.overwrite = false;
    return this;
  }

  inputDigit(digit) {
    if (this.overwrite) {
      this.current = String(digit);
      this.overwrite = false;
    } else {
      this.current = this.current === '0' ? String(digit) : this.current + digit;
    }
    return this;
  }

  inputDecimal() {
    if (this.overwrite) {
      this.current = '0.';
      this.overwrite = false;
      return this;
    }
    if (!this.current.includes('.')) {
      this.current += '.';
    }
    return this;
  }

  toggleSign() {
    if (this.current === '0') return this;
    this.current = this.current.startsWith('-')
      ? this.current.slice(1)
      : '-' + this.current;
    return this;
  }

  percent() {
    this.current = String(roundResult(parseFloat(this.current) / 100));
    return this;
  }

  chooseOperator(operator) {
    if (this.operator && !this.overwrite) {
      this.equals();
    }
    this.previous = this.current;
    this.operator = operator;
    this.overwrite = true;
    return this;
  }

  equals() {
    if (this.operator === null || this.previous === null) {
      return this;
    }
    const a = parseFloat(this.previous);
    const b = parseFloat(this.current);
    try {
      this.current = String(roundResult(operate(a, b, this.operator)));
    } catch (err) {
      this.current = 'Error';
    }
    this.previous = null;
    this.operator = null;
    this.overwrite = true;
    return this;
  }
}
