/**
 * VibeFX Currency Converter (v1.0.0)
 * Mobile-First Currency Converter Tailored for Chrome on Android.
 * Features: PWA Offline Support, Android Haptics, Web Share API,
 * Multi-Currency Watchlist, Math Numpad, and Live CORS Feed.
 */

import { BASELINE_RATES, CURRENCIES, DEFAULT_WATCHLIST } from './currencies.js';

// ============================================================================
// Application State
// ============================================================================
const state = {
  fromCurrency: localStorage.getItem('vibefx_from') || 'USD',
  toCurrency: localStorage.getItem('vibefx_to') || 'EUR',
  amountStr: localStorage.getItem('vibefx_amount') || '100',
  expressionStr: '',
  rates: { ...BASELINE_RATES },
  ratesTimestamp: 'Default baseline',
  isOffline: !navigator.onLine,
  invertRateDisplay: false,
  decimals: parseInt(localStorage.getItem('vibefx_decimals') || '2', 10),
  hapticsEnabled: localStorage.getItem('vibefx_haptics') !== 'false',
  inputMode: localStorage.getItem('vibefx_input_mode') || 'keypad', // 'keypad' or 'native'
  watchlist: JSON.parse(localStorage.getItem('vibefx_watchlist') || 'null') || [...DEFAULT_WATCHLIST],
  history: JSON.parse(localStorage.getItem('vibefx_history') || '[]'),
  modalTarget: null, // 'from', 'to', or 'watchlist-add'
  modalFilter: 'all',
  searchQuery: '',
};

// ============================================================================
// DOM Element Selectors
// ============================================================================
const DOM = {
  // Connection & Header
  connectionPill: document.getElementById('connection-pill'),
  connectionText: document.getElementById('connection-text'),
  btnRefresh: document.getElementById('btn-refresh'),
  refreshIcon: document.getElementById('refresh-icon'),
  btnOpenSettings: document.getElementById('btn-open-settings'),

  // PWA Banner
  pwaBanner: document.getElementById('pwa-install-banner'),
  btnInstallPwa: document.getElementById('btn-install-pwa'),
  btnDismissInstall: document.getElementById('btn-dismiss-install'),

  // Input Mode & Numpad
  btnToggleKeyboard: document.getElementById('btn-toggle-keyboard'),
  keypadModeIcon: document.getElementById('keypad-mode-icon'),
  keypadModeLabel: document.getElementById('keypad-mode-label'),
  tactileNumpad: document.getElementById('tactile-numpad-container'),
  amountNativeInput: document.getElementById('amount-native-input'),
  amountKeypadDisplay: document.getElementById('amount-keypad-display'),
  displayNumber: document.getElementById('display-number'),
  mathExpressionTape: document.getElementById('math-expression-tape'),

  // Source (From) Row
  btnSelectFrom: document.getElementById('btn-select-from'),
  fromFlag: document.getElementById('from-flag'),
  fromCode: document.getElementById('from-code'),
  fromName: document.getElementById('from-name'),
  fromSymbol: document.getElementById('from-symbol'),

  // Divider / Rate
  rateToggle: document.getElementById('rate-toggle'),
  rateRatioText: document.getElementById('rate-ratio-text'),
  btnSwap: document.getElementById('btn-swap-currencies'),
  swapIcon: document.getElementById('swap-icon'),

  // Target (To) Row
  btnSelectTo: document.getElementById('btn-select-to'),
  toFlag: document.getElementById('to-flag'),
  toCode: document.getElementById('to-code'),
  toName: document.getElementById('to-name'),
  toSymbol: document.getElementById('to-symbol'),
  convertedResult: document.getElementById('converted-result'),
  lastUpdatedHint: document.getElementById('last-updated-hint'),
  resultBox: document.getElementById('result-box'),

  // Action Buttons
  btnCopyResult: document.getElementById('btn-copy-result'),
  btnShareResult: document.getElementById('btn-share-result'),
  btnSaveConversion: document.getElementById('btn-save-conversion'),

  // Watchlist & History
  watchlistGrid: document.getElementById('watchlist-grid'),
  btnEditWatchlist: document.getElementById('btn-edit-watchlist'),
  historyList: document.getElementById('history-list'),
  historyCount: document.getElementById('history-count'),
  btnClearHistory: document.getElementById('btn-clear-history'),

  // Currency Modal
  currencyModal: document.getElementById('currency-modal'),
  modalTitle: document.getElementById('modal-title'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  currencySearchInput: document.getElementById('currency-search-input'),
  btnClearSearch: document.getElementById('btn-clear-search'),
  modalCurrencyList: document.getElementById('modal-currency-list'),
  filterChips: document.querySelectorAll('.filter-chip'),

  // Settings Modal
  settingsModal: document.getElementById('settings-modal'),
  btnCloseSettings: document.getElementById('btn-close-settings'),
  selectDecimals: document.getElementById('select-decimals'),
  toggleHaptics: document.getElementById('toggle-haptics'),
  btnSettingsUpdateRates: document.getElementById('btn-settings-update-rates'),
  settingsRateInfo: document.getElementById('settings-rate-info'),

  // Toast
  toast: document.getElementById('toast'),
  toastMessage: document.getElementById('toast-message'),
};

// ============================================================================
// Android Haptics Helper
// ============================================================================
function triggerHaptic(type = 'light') {
  if (!state.hapticsEnabled || !navigator.vibrate) return;
  try {
    switch (type) {
      case 'light':
        navigator.vibrate(12);
        break;
      case 'medium':
        navigator.vibrate(22);
        break;
      case 'success':
        navigator.vibrate([15, 45, 15]);
        break;
      case 'swap':
        navigator.vibrate([18, 30, 25]);
        break;
      case 'error':
        navigator.vibrate([35, 40, 35]);
        break;
    }
  } catch (err) {
    // Ignore unsupported device error
  }
}

// ============================================================================
// Toast Notification System
// ============================================================================
let toastTimeout = null;
function showToast(message, duration = 2200) {
  if (toastTimeout) clearTimeout(toastTimeout);
  DOM.toastMessage.textContent = message;
  DOM.toast.classList.remove('hidden');

  toastTimeout = setTimeout(() => {
    DOM.toast.classList.add('hidden');
  }, duration);
}

// ============================================================================
// PWA & Service Worker Registration
// ============================================================================
let deferredInstallPrompt = null;

function setupPWA() {
  // Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .then((reg) => {
          console.log('[VibeFX] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[VibeFX] Service Worker registration failed:', err);
        });
    });
  }

  // Chrome Android beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    DOM.pwaBanner.classList.remove('hidden');
  });

  DOM.btnInstallPwa.addEventListener('click', async () => {
    triggerHaptic('medium');
    if (!deferredInstallPrompt) {
      showToast('Tap the Chrome menu (⋮) and select "Install App"');
      return;
    }
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      showToast('Thank you for installing VibeFX!');
      DOM.pwaBanner.classList.add('hidden');
    }
    deferredInstallPrompt = null;
  });

  DOM.btnDismissInstall.addEventListener('click', () => {
    triggerHaptic('light');
    DOM.pwaBanner.classList.add('hidden');
  });

  window.addEventListener('appinstalled', () => {
    DOM.pwaBanner.classList.add('hidden');
    showToast('VibeFX successfully installed on your Android device!');
  });
}

// ============================================================================
// Network & Exchange Rates Fetching
// ============================================================================
async function fetchExchangeRates(force = false) {
  DOM.btnRefresh.classList.add('rotating');
  updateConnectionStatus();

  // Check cached rates in localStorage
  const cachedRatesJson = localStorage.getItem('vibefx_cached_rates');
  const cachedTimestamp = localStorage.getItem('vibefx_rates_updated');

  if (!force && cachedRatesJson && cachedTimestamp) {
    const ageMs = Date.now() - parseInt(cachedTimestamp, 10);
    // Use cached rates if less than 6 hours old
    if (ageMs < 6 * 60 * 60 * 1000) {
      try {
        state.rates = JSON.parse(cachedRatesJson);
        state.ratesTimestamp = new Date(parseInt(cachedTimestamp, 10)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        finishRatesUpdate('Cached Rates', false);
        return;
      } catch (e) {
        // Continue to network fetch
      }
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();

    if (data && data.rates) {
      state.rates = { ...BASELINE_RATES, ...data.rates };
      const now = Date.now();
      localStorage.setItem('vibefx_cached_rates', JSON.stringify(state.rates));
      localStorage.setItem('vibefx_rates_updated', now.toString());
      state.ratesTimestamp = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      finishRatesUpdate('Live Rates Updated', true);
    } else {
      throw new Error('Invalid rate data received');
    }
  } catch (error) {
    console.warn('[VibeFX] Rates fetch error, utilizing baseline/cached rates:', error);
    state.isOffline = true;
    finishRatesUpdate('Offline (Using Cached Rates)', false);
  }
}

function finishRatesUpdate(message, isSuccess) {
  setTimeout(() => {
    DOM.btnRefresh.classList.remove('rotating');
  }, 400);

  updateConnectionStatus();
  updateUI();
  if (message) showToast(message);
}

function updateConnectionStatus() {
  state.isOffline = !navigator.onLine;
  if (state.isOffline) {
    DOM.connectionPill.className = 'status-pill offline';
    DOM.connectionText.textContent = 'Offline';
    DOM.lastUpdatedHint.textContent = `Offline (${state.ratesTimestamp})`;
  } else {
    DOM.connectionPill.className = 'status-pill online';
    DOM.connectionText.textContent = 'Live';
    DOM.lastUpdatedHint.textContent = `Live (${state.ratesTimestamp})`;
  }
}

// Window online/offline event listeners
window.addEventListener('online', () => {
  fetchExchangeRates(true);
});
window.addEventListener('offline', () => {
  updateConnectionStatus();
  showToast('Switched to Offline Mode');
});

// ============================================================================
// Currency Conversion Math Engine
// ============================================================================
function getCurrencyInfo(code) {
  return CURRENCIES.find((c) => c.code === code) || {
    code,
    name: code,
    symbol: code,
    flag: '🌐',
    popular: false,
  };
}

function calculateExchangeRate(fromCode, toCode) {
  const fromRateUSD = state.rates[fromCode] || BASELINE_RATES[fromCode] || 1.0;
  const toRateUSD = state.rates[toCode] || BASELINE_RATES[toCode] || 1.0;

  // Since both are against USD: (1 / fromRate) * toRate = toRate / fromRate
  return toRateUSD / fromRateUSD;
}

function evaluateMathExpression(str) {
  // Safe evaluation of simple arithmetic strings (+ - * /)
  if (!str) return 0;
  // Clean string to digits, operators and decimals only
  const sanitized = str.replace(/[^0-9+\-*/.]/g, '');
  if (!sanitized) return 0;

  try {
    // Simple tokenizer and precedence parser
    const tokens = sanitized.match(/(\d+\.?\d*|[+\-*/])/g);
    if (!tokens) return 0;

    // First pass: multiplication and division
    const intermediate = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token === '*' || token === '/') {
        const prev = parseFloat(intermediate.pop());
        const next = parseFloat(tokens[++i]);
        if (isNaN(next) || isNaN(prev)) return prev || 0;
        const res = token === '*' ? prev * next : next === 0 ? 0 : prev / next;
        intermediate.push(res);
      } else {
        intermediate.push(token);
      }
    }

    // Second pass: addition and subtraction
    let result = parseFloat(intermediate[0]) || 0;
    for (let i = 1; i < intermediate.length; i += 2) {
      const op = intermediate[i];
      const val = parseFloat(intermediate[i + 1]) || 0;
      if (op === '+') result += val;
      else if (op === '-') result -= val;
    }

    return isNaN(result) ? 0 : result;
  } catch (e) {
    return parseFloat(sanitized) || 0;
  }
}

function parseCurrentAmount() {
  if (state.inputMode === 'native') {
    const val = parseFloat(DOM.amountNativeInput.value.replace(/,/g, ''));
    return isNaN(val) ? 0 : val;
  }

  // Keypad mode: evaluate math expression if present, else parse raw string
  const fullExpr = state.expressionStr + (state.amountStr || '0');
  return evaluateMathExpression(fullExpr);
}

function formatCurrencyAmount(num, decimals = state.decimals) {
  if (num === 0) return '0.00';
  if (num < 0.0001 && num > 0) {
    return num.toExponential(4);
  }
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// ============================================================================
// UI Rendering & Synchronization
// ============================================================================
function updateUI() {
  const fromInfo = getCurrencyInfo(state.fromCurrency);
  const toInfo = getCurrencyInfo(state.toCurrency);

  // Update From UI
  DOM.fromFlag.textContent = fromInfo.flag;
  DOM.fromCode.textContent = fromInfo.code;
  DOM.fromName.textContent = fromInfo.name;
  DOM.fromSymbol.textContent = fromInfo.symbol;

  // Update To UI
  DOM.toFlag.textContent = toInfo.flag;
  DOM.toCode.textContent = toInfo.code;
  DOM.toName.textContent = toInfo.name;
  DOM.toSymbol.textContent = toInfo.symbol;

  // Calculate Exchange Rate
  const rate = calculateExchangeRate(state.fromCurrency, state.toCurrency);
  const inverseRate = 1 / rate;

  if (!state.invertRateDisplay) {
    DOM.rateRatioText.textContent = `1 ${state.fromCurrency} = ${formatCurrencyAmount(rate, 4)} ${state.toCurrency}`;
  } else {
    DOM.rateRatioText.textContent = `1 ${state.toCurrency} = ${formatCurrencyAmount(inverseRate, 4)} ${state.fromCurrency}`;
  }

  // Amount parsing & conversion
  const currentAmount = parseCurrentAmount();
  const convertedValue = currentAmount * rate;

  // Sync Input displays
  if (state.inputMode === 'native') {
    DOM.displayNumber.textContent = DOM.amountNativeInput.value || '0';
    DOM.mathExpressionTape.textContent = '';
  } else {
    DOM.displayNumber.textContent = state.amountStr || '0';
    DOM.mathExpressionTape.textContent = state.expressionStr;
    DOM.amountNativeInput.value = state.amountStr || '0';
  }

  DOM.convertedResult.textContent = formatCurrencyAmount(convertedValue);

  // Persist selections
  localStorage.setItem('vibefx_from', state.fromCurrency);
  localStorage.setItem('vibefx_to', state.toCurrency);
  localStorage.setItem('vibefx_amount', state.amountStr);

  // Re-render sub-components
  renderWatchlist(currentAmount);
  renderHistory();
}

// ============================================================================
// Multi-Currency Watchlist
// ============================================================================
function renderWatchlist(baseAmount) {
  DOM.watchlistGrid.innerHTML = '';

  state.watchlist.forEach((code) => {
    const info = getCurrencyInfo(code);
    const rate = calculateExchangeRate(state.fromCurrency, code);
    const converted = baseAmount * rate;

    const card = document.createElement('div');
    card.className = 'watchlist-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Convert ${baseAmount} ${state.fromCurrency} to ${info.name}`);

    card.innerHTML = `
      <div class="watchlist-left">
        <span class="watchlist-flag">${info.flag}</span>
        <div class="watchlist-info">
          <span class="watchlist-code">${code}</span>
          <span class="watchlist-rate">1 = ${formatCurrencyAmount(rate, 3)}</span>
        </div>
      </div>
      <div class="watchlist-val">${info.symbol} ${formatCurrencyAmount(converted)}</div>
    `;

    // Tapping a watchlist card sets it as the active "To" currency
    card.addEventListener('click', () => {
      triggerHaptic('light');
      state.toCurrency = code;
      updateUI();
      showToast(`Set Target to ${code}`);
    });

    DOM.watchlistGrid.appendChild(card);
  });
}

// ============================================================================
// Conversion History Tape
// ============================================================================
function saveCurrentConversionToHistory() {
  triggerHaptic('success');
  const fromInfo = getCurrencyInfo(state.fromCurrency);
  const toInfo = getCurrencyInfo(state.toCurrency);
  const amount = parseCurrentAmount();
  const rate = calculateExchangeRate(state.fromCurrency, state.toCurrency);
  const result = amount * rate;

  const entry = {
    id: Date.now(),
    fromCode: state.fromCurrency,
    toCode: state.toCurrency,
    fromAmount: amount,
    toAmount: result,
    rate: rate,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  // Add to top, cap at 15 entries
  state.history.unshift(entry);
  if (state.history.length > 15) state.history.pop();
  localStorage.setItem('vibefx_history', JSON.stringify(state.history));

  renderHistory();
  showToast('Conversion pinned to history!');
}

function renderHistory() {
  DOM.historyCount.textContent = state.history.length.toString();

  if (state.history.length === 0) {
    DOM.historyList.innerHTML = `
      <div class="empty-state-card">
        <span>No saved conversions yet. Tap Pin or Share to log your exchanges.</span>
      </div>
    `;
    return;
  }

  DOM.historyList.innerHTML = '';
  state.history.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'history-item';
    row.innerHTML = `
      <div class="history-from-to">
        <span>${formatCurrencyAmount(item.fromAmount)} ${item.fromCode}</span>
        <span class="history-arrow">➔</span>
        <span>${formatCurrencyAmount(item.toAmount)} ${item.toCode}</span>
      </div>
      <span class="history-date">${item.time}</span>
    `;

    // Tap to restore
    row.addEventListener('click', () => {
      triggerHaptic('medium');
      state.fromCurrency = item.fromCode;
      state.toCurrency = item.toCode;
      state.amountStr = item.fromAmount.toString();
      state.expressionStr = '';
      updateUI();
      showToast(`Restored: ${item.fromAmount} ${item.fromCode} to ${item.toCode}`);
    });

    DOM.historyList.appendChild(row);
  });
}

function clearHistory() {
  triggerHaptic('medium');
  state.history = [];
  localStorage.removeItem('vibefx_history');
  renderHistory();
  showToast('History tape cleared');
}

// ============================================================================
// Numpad & Keyboard Input Logic
// ============================================================================
function handleNumpadKey(key) {
  triggerHaptic('light');

  if (key === 'clear') {
    state.amountStr = '0';
    state.expressionStr = '';
    updateUI();
    return;
  }

  if (key === 'backspace') {
    if (state.amountStr.length > 1) {
      state.amountStr = state.amountStr.slice(0, -1);
    } else {
      state.amountStr = '0';
    }
    updateUI();
    return;
  }

  if (['+', '-', '*', '/'].includes(key)) {
    triggerHaptic('medium');
    const operatorSymbol = key === '*' ? '×' : key === '/' ? '÷' : key;
    state.expressionStr += `${state.amountStr} ${operatorSymbol} `;
    state.amountStr = '0';
    updateUI();
    return;
  }

  if (key === '=') {
    triggerHaptic('medium');
    const evaluated = parseCurrentAmount();
    state.amountStr = evaluated.toString();
    state.expressionStr = '';
    updateUI();
    return;
  }

  if (key === 'quick-max') {
    state.amountStr = '100';
    state.expressionStr = '';
    updateUI();
    return;
  }

  if (key === '.') {
    if (!state.amountStr.includes('.')) {
      state.amountStr += '.';
    }
    updateUI();
    return;
  }

  if (key === '00') {
    if (state.amountStr !== '0') {
      state.amountStr += '00';
    }
    updateUI();
    return;
  }

  // Digits 0-9
  if (state.amountStr === '0') {
    state.amountStr = key;
  } else {
    // Prevent excessively long numbers
    if (state.amountStr.length < 12) {
      state.amountStr += key;
    }
  }

  updateUI();
}

function toggleInputMode() {
  triggerHaptic('medium');
  if (state.inputMode === 'keypad') {
    state.inputMode = 'native';
    DOM.tactileNumpad.classList.add('hidden');
    DOM.amountKeypadDisplay.classList.add('hidden');
    DOM.amountNativeInput.classList.remove('hidden');
    DOM.keypadModeIcon.textContent = '🔢';
    DOM.keypadModeLabel.textContent = 'Numpad';
    DOM.amountNativeInput.focus();
    showToast('Switched to Android Keyboard');
  } else {
    state.inputMode = 'keypad';
    DOM.tactileNumpad.classList.remove('hidden');
    DOM.amountKeypadDisplay.classList.remove('hidden');
    DOM.amountNativeInput.classList.add('hidden');
    DOM.keypadModeIcon.textContent = '⌨️';
    DOM.keypadModeLabel.textContent = 'Android Kbd';
    showToast('Switched to Tactile Numpad');
  }
  localStorage.setItem('vibefx_input_mode', state.inputMode);
  updateUI();
}

// ============================================================================
// Android Native Features: Web Share & Clipboard
// ============================================================================
async function shareConversionResult() {
  triggerHaptic('success');
  const amount = parseCurrentAmount();
  const rate = calculateExchangeRate(state.fromCurrency, state.toCurrency);
  const result = amount * rate;
  const fromInfo = getCurrencyInfo(state.fromCurrency);
  const toInfo = getCurrencyInfo(state.toCurrency);

  const shareText = `${amount} ${state.fromCurrency} (${fromInfo.name}) = ${formatCurrencyAmount(result)} ${state.toCurrency} (${toInfo.name})\nExchange Rate: 1 ${state.fromCurrency} = ${formatCurrencyAmount(rate, 4)} ${state.toCurrency}\nConverted via VibeFX (v1.0.0)`;

  // Check Web Share API (native on Chrome Android)
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'VibeFX Currency Conversion',
        text: shareText,
        url: window.location.href,
      });
      showToast('Shared successfully!');
      return;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Share error:', err);
      }
    }
  }

  // Fallback to Clipboard copy if share canceled or unsupported
  copyToClipboard(shareText, 'Conversion copied to clipboard for sharing!');
}

function copyResultOnly() {
  triggerHaptic('light');
  const amount = parseCurrentAmount();
  const rate = calculateExchangeRate(state.fromCurrency, state.toCurrency);
  const result = formatCurrencyAmount(amount * rate);
  copyToClipboard(`${result} ${state.toCurrency}`, `Copied: ${result} ${state.toCurrency}`);
}

function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast(successMsg))
      .catch(() => fallbackCopy(text, successMsg));
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMsg);
  } catch (err) {
    showToast('Failed to copy to clipboard');
  }
  document.body.removeChild(textArea);
}

// Swap currencies
function swapCurrencies() {
  triggerHaptic('swap');
  DOM.swapIcon.classList.add('rotated');
  setTimeout(() => DOM.swapIcon.classList.remove('rotated'), 350);

  const temp = state.fromCurrency;
  state.fromCurrency = state.toCurrency;
  state.toCurrency = temp;

  updateUI();
  showToast(`Swapped: ${state.fromCurrency} ⇄ ${state.toCurrency}`);
}

// Invert rate view
function toggleRateRatio() {
  triggerHaptic('light');
  state.invertRateDisplay = !state.invertRateDisplay;
  updateUI();
}

// ============================================================================
// Currency Selector Modal
// ============================================================================
function openCurrencyModal(target) {
  triggerHaptic('medium');
  state.modalTarget = target;
  state.searchQuery = '';
  DOM.currencySearchInput.value = '';
  DOM.btnClearSearch.classList.add('hidden');

  if (target === 'from') {
    DOM.modalTitle.textContent = 'Select Source Currency';
  } else if (target === 'to') {
    DOM.modalTitle.textContent = 'Select Target Currency';
  } else if (target === 'watchlist-add') {
    DOM.modalTitle.textContent = 'Add to Watchlist';
  }

  DOM.currencyModal.classList.remove('hidden');
  renderModalCurrencies();

  // On Chrome Android, focus without forced scrolling
  setTimeout(() => {
    DOM.currencySearchInput.focus({ preventScroll: true });
  }, 100);
}

function closeCurrencyModal() {
  triggerHaptic('light');
  DOM.currencyModal.classList.add('hidden');
  state.modalTarget = null;
}

function renderModalCurrencies() {
  DOM.modalCurrencyList.innerHTML = '';
  const query = state.searchQuery.toLowerCase().trim();
  const filter = state.modalFilter;

  const filtered = CURRENCIES.filter((curr) => {
    // Category filter
    if (filter === 'popular' && !curr.popular) return false;
    if (['americas', 'europe', 'asia', 'middle-east', 'africa', 'crypto'].includes(filter)) {
      if (curr.region !== filter) return false;
    }

    // Search query filter
    if (query) {
      const matchCode = curr.code.toLowerCase().includes(query);
      const matchName = curr.name.toLowerCase().includes(query);
      return matchCode || matchName;
    }
    return true;
  });

  if (filtered.length === 0) {
    DOM.modalCurrencyList.innerHTML = `
      <div class="empty-state-card">
        <span>No matching currencies found for "${query}".</span>
      </div>
    `;
    return;
  }

  const activeCode = state.modalTarget === 'from' ? state.fromCurrency : state.toCurrency;

  filtered.forEach((curr) => {
    const isSelected = curr.code === activeCode;
    const rateAgainstBase = calculateExchangeRate(state.fromCurrency, curr.code);

    const item = document.createElement('div');
    item.className = `currency-option-item ${isSelected ? 'selected' : ''}`;
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', isSelected.toString());

    item.innerHTML = `
      <div class="opt-left">
        <span class="opt-flag">${curr.flag}</span>
        <div class="opt-details">
          <span class="opt-code">${curr.code}</span>
          <span class="opt-name">${curr.name}</span>
        </div>
      </div>
      <div class="opt-right">
        <span class="opt-symbol">${curr.symbol}</span>
        <span class="opt-rate">1 ${state.fromCurrency} = ${formatCurrencyAmount(rateAgainstBase, 3)}</span>
      </div>
    `;

    item.addEventListener('click', () => {
      triggerHaptic('light');
      handleCurrencySelection(curr.code);
    });

    DOM.modalCurrencyList.appendChild(item);
  });
}

function handleCurrencySelection(code) {
  if (state.modalTarget === 'from') {
    state.fromCurrency = code;
    showToast(`Source set to ${code}`);
  } else if (state.modalTarget === 'to') {
    state.toCurrency = code;
    showToast(`Target set to ${code}`);
  } else if (state.modalTarget === 'watchlist-add') {
    if (!state.watchlist.includes(code)) {
      state.watchlist.push(code);
      localStorage.setItem('vibefx_watchlist', JSON.stringify(state.watchlist));
      showToast(`Added ${code} to Watchlist`);
    } else {
      showToast(`${code} already in Watchlist`);
    }
  }

  closeCurrencyModal();
  updateUI();
}

// ============================================================================
// Settings Modal Logic
// ============================================================================
function openSettingsModal() {
  triggerHaptic('medium');
  DOM.selectDecimals.value = state.decimals.toString();
  DOM.toggleHaptics.checked = state.hapticsEnabled;
  DOM.settingsRateInfo.textContent = `Last sync: ${state.ratesTimestamp} (${Object.keys(state.rates).length} pairs)`;
  DOM.settingsModal.classList.remove('hidden');
}

function closeSettingsModal() {
  triggerHaptic('light');
  DOM.settingsModal.classList.add('hidden');
}

// ============================================================================
// Event Listeners Initialization
// ============================================================================
function initEventListeners() {
  // Numpad key clicks
  document.querySelectorAll('.numpad-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const key = btn.dataset.key;
      if (key) handleNumpadKey(key);
    });
  });

  // Toggle Input Mode (Numpad vs Android Native Keyboard)
  DOM.btnToggleKeyboard.addEventListener('click', toggleInputMode);

  // Native input change
  DOM.amountNativeInput.addEventListener('input', () => {
    state.amountStr = DOM.amountNativeInput.value;
    updateUI();
  });

  // Currency Selectors
  DOM.btnSelectFrom.addEventListener('click', () => openCurrencyModal('from'));
  DOM.btnSelectTo.addEventListener('click', () => openCurrencyModal('to'));
  DOM.btnEditWatchlist.addEventListener('click', () => openCurrencyModal('watchlist-add'));

  // Swap & Invert Rate
  DOM.btnSwap.addEventListener('click', swapCurrencies);
  DOM.rateToggle.addEventListener('click', toggleRateRatio);

  // Copy & Share Actions
  DOM.btnCopyResult.addEventListener('click', copyResultOnly);
  DOM.resultBox.addEventListener('click', copyResultOnly);
  DOM.btnShareResult.addEventListener('click', shareConversionResult);
  DOM.btnSaveConversion.addEventListener('click', saveCurrentConversionToHistory);

  // History Clear
  DOM.btnClearHistory.addEventListener('click', clearHistory);

  // Refresh Rates
  DOM.btnRefresh.addEventListener('click', () => {
    triggerHaptic('medium');
    fetchExchangeRates(true);
  });

  // Modal Close buttons & overlay click
  DOM.btnCloseModal.addEventListener('click', closeCurrencyModal);
  DOM.currencyModal.addEventListener('click', (e) => {
    if (e.target === DOM.currencyModal) closeCurrencyModal();
  });

  // Search input events
  DOM.currencySearchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    if (state.searchQuery) {
      DOM.btnClearSearch.classList.remove('hidden');
    } else {
      DOM.btnClearSearch.classList.add('hidden');
    }
    renderModalCurrencies();
  });

  DOM.btnClearSearch.addEventListener('click', () => {
    triggerHaptic('light');
    DOM.currencySearchInput.value = '';
    state.searchQuery = '';
    DOM.btnClearSearch.classList.add('hidden');
    DOM.currencySearchInput.focus();
    renderModalCurrencies();
  });

  // Filter Chips in Modal
  DOM.filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      triggerHaptic('light');
      DOM.filterChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      state.modalFilter = chip.dataset.filter;
      renderModalCurrencies();
    });
  });

  // Settings Modal events
  DOM.btnOpenSettings.addEventListener('click', openSettingsModal);
  DOM.btnCloseSettings.addEventListener('click', closeSettingsModal);
  DOM.settingsModal.addEventListener('click', (e) => {
    if (e.target === DOM.settingsModal) closeSettingsModal();
  });

  DOM.selectDecimals.addEventListener('change', (e) => {
    state.decimals = parseInt(e.target.value, 10);
    localStorage.setItem('vibefx_decimals', state.decimals.toString());
    updateUI();
    showToast(`Decimals set to ${state.decimals}`);
  });

  DOM.toggleHaptics.addEventListener('change', (e) => {
    state.hapticsEnabled = e.target.checked;
    localStorage.setItem('vibefx_haptics', state.hapticsEnabled.toString());
    if (state.hapticsEnabled) triggerHaptic('medium');
    showToast(`Haptics ${state.hapticsEnabled ? 'enabled' : 'disabled'}`);
  });

  DOM.btnSettingsUpdateRates.addEventListener('click', () => {
    triggerHaptic('medium');
    fetchExchangeRates(true);
    closeSettingsModal();
  });
}

// ============================================================================
// App Bootstrap
// ============================================================================
function initApp() {
  setupPWA();
  initEventListeners();
  updateUI();
  fetchExchangeRates(false);
  console.log('[VibeFX] (v1.0.0) Ready for Chrome on Android.');
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
