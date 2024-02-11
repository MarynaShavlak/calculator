import {
  onDelBtnPress,
  onDecimalBtnPress,
  onSwitchSignBtnPress,
  onDigitPress,
  onMathOperationBtnPress,
  onResultBtnPress,
  resetCalculator,
} from './index.js';

export function addBtsEventHandlers() {
  const select = selector => document.querySelector(selector);

  const resultOperationBtn = select('#result-btn');
  const clearAllBtn = select('#clearAll-btn');
  const deleteBtn = select('#delete-btn');
  const decimalBtn = select('#decimal-btn');
  const switchSignBtn = select('#switch-sign-btn');
  const copyIcon = select('.copy-icon');

  resultOperationBtn.addEventListener('click', onResultBtnPress);
  clearAllBtn.addEventListener('click', resetCalculator);
  deleteBtn.addEventListener('click', onDelBtnPress);
  decimalBtn.addEventListener('click', onDecimalBtnPress);
  switchSignBtn.addEventListener('click', onSwitchSignBtnPress);
  copyIcon.addEventListener('click', copyDisplayValueToClipboard);

  const buttonsTablo = select('.buttons-tablo');
  buttonsTablo.addEventListener('click', function (e) {
    const clickedEl = e.target;
    if (clickedEl.classList.contains('digit-btn')) {
      onDigitPress(clickedEl);
    }
    if (clickedEl.classList.contains('math-operation-btn')) {
      onMathOperationBtnPress(clickedEl);
    }
  });
}

// ______Copy value to clipboard from display ______//
function copyDisplayValueToClipboard() {
  const display = document.querySelector('#main-calc-display');
  const text = display.value;
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
}
