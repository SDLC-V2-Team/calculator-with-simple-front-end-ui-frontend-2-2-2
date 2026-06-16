import {
  operate,
  add,
  subtract,
  multiply,
  divide,
  roundResult,
  CalculatorState,
} from './calculator.js';

// ---------------------------------------------------------------------------
// Core arithmetic helpers
// ---------------------------------------------------------------------------

describe('add', () => {
  it('adds two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('adds a positive and a negative number', () => {
    expect(add(10, -4)).toBe(6);
  });
});

describe('subtract', () => {
  it('subtracts the second operand from the first', () => {
    expect(subtract(9, 4)).toBe(5);
  });
});

describe('multiply', () => {
  it('multiplies two numbers', () => {
    expect(multiply(3, 7)).toBe(21);
  });
});

describe('divide', () => {
  it('divides two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('throws on division by zero', () => {
    expect(() => divide(5, 0)).toThrow('Cannot divide by zero');
  });
});

// ---------------------------------------------------------------------------
// operate dispatcher
// ---------------------------------------------------------------------------

describe('operate', () => {
  it('dispatches + operator', () => {
    expect(operate(1, 2, '+')).toBe(3);
  });

  it('dispatches - operator', () => {
    expect(operate(5, 3, '-')).toBe(2);
  });

  it('dispatches * operator', () => {
    expect(operate(4, 5, '*')).toBe(20);
  });

  it('dispatches / operator', () => {
    expect(operate(8, 4, '/')).toBe(2);
  });

  it('throws on an unknown operator', () => {
    expect(() => operate(1, 2, '%')).toThrow('Unknown operator: %');
  });

  it('throws on division by zero via operate', () => {
    expect(() => operate(9, 0, '/')).toThrow('Cannot divide by zero');
  });
});

// ---------------------------------------------------------------------------
// roundResult
// ---------------------------------------------------------------------------

describe('roundResult', () => {
  it('rounds floating point artifacts (0.1 + 0.2)', () => {
    expect(roundResult(0.1 + 0.2)).toBe(0.3);
  });

  it('passes through exact integers unchanged', () => {
    expect(roundResult(42)).toBe(42);
  });

  it('passes through Infinity unchanged', () => {
    expect(roundResult(Infinity)).toBe(Infinity);
  });
});

// ---------------------------------------------------------------------------
// CalculatorState
// ---------------------------------------------------------------------------

describe('CalculatorState', () => {
  let calc;

  beforeEach(() => {
    calc = new CalculatorState();
  });

  it('initialises with current display of "0"', () => {
    expect(calc.current).toBe('0');
    expect(calc.operator).toBeNull();
    expect(calc.previous).toBeNull();
  });

  it('inputs digits and builds a multi-digit number', () => {
    calc.inputDigit(4).inputDigit(2);
    expect(calc.current).toBe('42');
  });

  it('does not prepend leading zeros to a non-zero digit', () => {
    calc.inputDigit(7);
    expect(calc.current).toBe('7');
  });

  it('inputs a decimal point and builds a decimal number', () => {
    calc.inputDigit(3).inputDecimal().inputDigit(1).inputDigit(4);
    expect(calc.current).toBe('3.14');
  });

  it('prevents duplicate decimal points', () => {
    calc.inputDecimal().inputDecimal();
    expect(calc.current.split('.').length - 1).toBe(1);
  });

  it('toggles the sign of the current number', () => {
    calc.inputDigit(5).toggleSign();
    expect(calc.current).toBe('-5');
    calc.toggleSign();
    expect(calc.current).toBe('5');
  });

  it('does not toggle sign when current is "0"', () => {
    calc.toggleSign();
    expect(calc.current).toBe('0');
  });

  it('converts current value to a percentage', () => {
    calc.inputDigit(5).inputDigit(0).percent();
    expect(calc.current).toBe('0.5');
  });

  it('performs a simple addition via chooseOperator + equals', () => {
    calc.inputDigit(3).chooseOperator('+').inputDigit(4).equals();
    expect(calc.current).toBe('7');
  });

  it('chains operators (3 + 4 * 2 evaluates 3+4 first then *2)', () => {
    calc.inputDigit(3).chooseOperator('+').inputDigit(4).chooseOperator('*').inputDigit(2).equals();
    // chooseOperator('*') triggers equals() first: 3+4=7, then 7*2=14
    expect(calc.current).toBe('14');
  });

  it('sets current to "Error" when dividing by zero through equals', () => {
    calc.inputDigit(9).chooseOperator('/').inputDigit(0).equals();
    expect(calc.current).toBe('Error');
  });

  it('resets state back to initial values', () => {
    calc.inputDigit(5).chooseOperator('+').inputDigit(3).equals();
    calc.reset();
    expect(calc.current).toBe('0');
    expect(calc.operator).toBeNull();
    expect(calc.previous).toBeNull();
    expect(calc.overwrite).toBe(false);
  });

  it('equals() is a no-op when no operator has been chosen', () => {
    calc.inputDigit(7).equals();
    expect(calc.current).toBe('7');
  });
});