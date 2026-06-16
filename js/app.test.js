/**
 * Tests for js/app.js — UI controller wiring DOM events to CalculatorState.
 *
 * Because app.js has module-level side effects (querySelector, addEventListener,
 * render() on load) we set up a full jsdom environment via Jest's default
 * test environment and mock the CalculatorState module before importing app.js.
 */

// ── DOM scaffold ──────────────────────────────────────────────────────────────
function buildDOM() {
  document.body.innerHTML = `
    <div id="history"></div>
    <div id="current"></div>
    <div class="keys">
      <button data-action="number"   data-value="7">7</button>
      <button data-action="number"   data-value="0">0</button>
      <button data-action="decimal">.</button>
      <button data-action="operator" data-operator="+" class="key-operator">+</button>
      <button data-action="operator" data-operator="-" class="key-operator">\u2212</button>
      <button data-action="operator" data-operator="*" class="key-operator">\u00d7</button>
      <button data-action="operator" data-operator="/" class="key-operator">\u00f7</button>
      <button data-action="equals">=</button>
      <button data-action="clear">AC</button>
      <button data-action="sign">+/-</button>
      <button data-action="percent">%</button>
    </div>
  `;
}

// ── Mock CalculatorState ───────────────────────────────────────────────────────
const mockState = {
  current: '0',
  previous: null,
  operator: null,
  inputDigit: jest.fn(),
  inputDecimal: jest.fn(),
  chooseOperator: jest.fn(),
  equals: jest.fn(),
  reset: jest.fn(),
  toggleSign: jest.fn(),
  percent: jest.fn(),
};

jest.mock('./calculator.js', () => ({
  CalculatorState: jest.fn(() => mockState),
}));

// ── Helpers ────────────────────────────────────────────────────────────────────
function fireClick(selector) {
  const btn = document.querySelector(selector);
  btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

function fireKey(key, extra = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...extra }));
}

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('app.js — UI controller', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    // Reset observable state
    mockState.current = '0';
    mockState.previous = null;
    mockState.operator = null;

    buildDOM();

    // Re-import app so module-level code runs with fresh DOM + fresh mocks
    require('./app.js');
  });

  // ── 1. Happy path: render() paints the display on initial load ───────────────
  test('renders initial state on load (current = "0", history empty)', () => {
    const currentEl = document.getElementById('current');
    const historyEl = document.getElementById('history');

    expect(currentEl.textContent).toBe('0');
    expect(historyEl.textContent).toBe('');
  });

  // ── 2. Happy path: clicking a number button calls inputDigit and re-renders ──
  test('clicking a number button calls state.inputDigit and updates display', () => {
    mockState.inputDigit.mockImplementation(() => {
      mockState.current = '7';
    });

    fireClick('button[data-action="number"][data-value="7"]');

    expect(mockState.inputDigit).toHaveBeenCalledWith('7');
    expect(document.getElementById('current').textContent).toBe('7');
  });

  // ── 3. Happy path: operator → equals flow updates history then clears it ─────
  test('operator then equals updates history display correctly', () => {
    // Simulate pressing "+" then "="
    mockState.chooseOperator.mockImplementation(() => {
      mockState.previous = '4';
      mockState.operator = '+';
      mockState.current = '4';
    });

    fireClick('button[data-action="operator"][data-operator="+"]');
    expect(mockState.chooseOperator).toHaveBeenCalledWith('+');
    expect(document.getElementById('history').textContent).toBe('4 +');

    mockState.equals.mockImplementation(() => {
      mockState.previous = null;
      mockState.operator = null;
      mockState.current = '8';
    });

    fireClick('button[data-action="equals"]');
    expect(mockState.equals).toHaveBeenCalled();
    expect(document.getElementById('history').textContent).toBe('');
    expect(document.getElementById('current').textContent).toBe('8');
  });

  // ── 4. Edge case: highlightOperator adds/removes "active" class correctly ────
  test('highlightOperator marks the active operator button and clears others', () => {
    mockState.chooseOperator.mockImplementation(() => {
      mockState.operator = '*';
      mockState.previous = '3';
    });

    fireClick('button[data-action="operator"][data-operator="*"]');

    const starBtn  = document.querySelector('button[data-operator="*"]');
    const plusBtn  = document.querySelector('button[data-operator="+"]');

    expect(starBtn.classList.contains('active')).toBe(true);
    expect(plusBtn.classList.contains('active')).toBe(false);
  });

  // ── 5. Edge case: keyboard input dispatches correct actions ──────────────────
  test('keyboard digits, operators, Enter, Escape are routed correctly', () => {
    fireKey('5');
    expect(mockState.inputDigit).toHaveBeenCalledWith('5');

    fireKey('.');
    expect(mockState.inputDecimal).toHaveBeenCalled();

    fireKey('+');
    expect(mockState.chooseOperator).toHaveBeenCalledWith('+');

    fireKey('Enter');
    expect(mockState.equals).toHaveBeenCalled();

    fireKey('Escape');
    expect(mockState.reset).toHaveBeenCalled();
  });

  // ── 6. Error / unknown action: unrecognised action is a no-op ────────────────
  test('handleAction with unknown action does not throw and still calls render', () => {
    // Inject a button with an unrecognised action at runtime
    const keysEl = document.querySelector('.keys');
    const mystery = document.createElement('button');
    mystery.dataset.action = 'teleport';
    keysEl.appendChild(mystery);

    expect(() => {
      mystery.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }).not.toThrow();

    // render() is still called — display should still show current value
    expect(document.getElementById('current').textContent).toBe(mockState.current);
  });
});