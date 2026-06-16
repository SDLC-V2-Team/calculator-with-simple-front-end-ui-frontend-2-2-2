// Unit tests for the pure arithmetic engine.
// Run with: npm test
import { describe, it, expect } from 'vitest';
import {
  operate,
  add,
  subtract,
  multiply,
  divide,
  roundResult,
  CalculatorState,
} from '../js/calculator.js';

describe('arithmetic primitives', () => {
  it('adds', () => expect(add(2, 3)).toBe(5));
  it('subtracts', () => expect(subtract(5, 3)).toBe(2));
  it('multiplies', () => expect(multiply(4, 3)).toBe(12));
  it('divides', () => expect(divide(10, 2)).toBe(5));
  it('throws on divide by zero', () => expect(() => divide(1, 0)).toThrow());
});

describe('operate', () => {
  it('dispatches to the correct op', () => {
    expect(operate(6, 2, '/')).toBe(3);
    expect(operate(6, 2, '*')).toBe(12);
  });
  it('throws on unknown operator', () => {
    expect(() => operate(1, 1, '^')).toThrow();
  });
});

describe('roundResult', () => {
  it('eliminates floating point noise', () => {
    expect(roundResult(0.1 + 0.2)).toBe(0.3);
  });
});

describe('CalculatorState', () => {
  it('chains a simple calculation', () => {
    const s = new CalculatorState();
    s.inputDigit('1').inputDigit('2').chooseOperator('+').inputDigit('8').equals();
    expect(s.current).toBe('20');
  });

  it('handles decimals', () => {
    const s = new CalculatorState();
    s.inputDigit('1').inputDecimal().inputDigit('5').chooseOperator('*').inputDigit('2').equals();
    expect(s.current).toBe('3');
  });

  it('reports error on divide by zero', () => {
    const s = new CalculatorState();
    s.inputDigit('5').chooseOperator('/').inputDigit('0').equals();
    expect(s.current).toBe('Error');
  });

  it('resets to zero', () => {
    const s = new CalculatorState();
    s.inputDigit('9').reset();
    expect(s.current).toBe('0');
  });
});
