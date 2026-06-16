// UI controller: wires DOM events to the CalculatorState engine.
import { CalculatorState } from './calculator.js';

const state = new CalculatorState();

const currentEl = document.getElementById('current');
const historyEl = document.getElementById('history');
const keysEl = document.querySelector('.keys');

const OPERATOR_SYMBOLS = { '+': '+', '-': '\u2212', '*': '\u00d7', '/': '\u00f7' };

function render() {
  currentEl.textContent = state.current;
  if (state.operator && state.previous !== null) {
    historyEl.textContent = `${state.previous} ${OPERATOR_SYMBOLS[state.operator]}`;
  } else {
    historyEl.textContent = '';
  }
  highlightOperator();
}

function highlightOperator() {
  document.querySelectorAll('.key-operator').forEach((btn) => {
    const isActive = state.operator && btn.dataset.operator === state.operator;
    btn.classList.toggle('active', Boolean(isActive));
  });
}

function handleAction(action, dataset) {
  switch (action) {
    case 'number':
      state.inputDigit(dataset.value);
      break;
    case 'decimal':
      state.inputDecimal();
      break;
    case 'operator':
      state.chooseOperator(dataset.operator);
      break;
    case 'equals':
      state.equals();
      break;
    case 'clear':
      state.reset();
      break;
    case 'sign':
      state.toggleSign();
      break;
    case 'percent':
      state.percent();
      break;
    default:
      break;
  }
  render();
}

// Event delegation for all button clicks.
keysEl.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  handleAction(button.dataset.action, button.dataset);
});

// Keyboard support.
window.addEventListener('keydown', (event) => {
  const { key } = event;
  if (key >= '0' && key <= '9') {
    handleAction('number', { value: key });
  } else if (key === '.') {
    handleAction('decimal', {});
  } else if (['+', '-', '*', '/'].includes(key)) {
    handleAction('operator', { operator: key });
  } else if (key === 'Enter' || key === '=') {
    event.preventDefault();
    handleAction('equals', {});
  } else if (key === 'Escape') {
    handleAction('clear', {});
  } else if (key === 'Backspace') {
    handleAction('clear', {});
  }
});

// Initial paint.
render();
