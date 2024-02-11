import {
  showInvalidOperAfterRootSignNotification,
  showOperWithoutFirstOperandNotification,
  showOperWithoutSecondOperandNotification,
  showInvalidPercentOrPowerOperNotification,
} from './notifications.js';
import {
  deleteLastCharacter,
  deleteFirstCharacter,
  getFirstCharacter,
  getSecondCharacter,
  getLastCharacter,
} from './utils.js';
import { processWithinLimits } from './digits-limits-functions.js';
import { addBtsEventHandlers } from './events.js';
import {
  calculateResult,
  updatePowerSettings,
} from './math-operation-funcs.js';
import { typeEffect } from './interface.js';

const display = document.querySelector('#main-calc-display');
const fullOperationsList = ['-', '+', '*', '/', '√', '%', '^'];
const standardOperationsList = ['-', '+', '*', '/', '√'];
let isOperatorLastPressed = false;
let operator = '';
let operand1 = '';
let operand2 = '';

addBtsEventHandlers();
typeEffect();

export function resetCalculator() {
  updateDisplayResult(0);
  isOperatorLastPressed = false;
  operator = '';
  updateOperand1('');
  updateOperand2('');
  updatePowerSettings(false);
}

export function onDelBtnPress() {
  if (isErrorOnDisplay()) {
    updateDisplayResult('');
    return;
  }
  const updatedValue = deleteLastCharacter(display.value);
  const isSecondOperandTotallyDeleted =
    hasAnyMathOperator() && operand2.length < 2;
  updateDisplayResult(updatedValue);

  if (!operand2) {
    deleteFirstOperandCharacter(updatedValue);
  } else if (isSecondOperandTotallyDeleted) {
    deleteSecondOperandTotally();
  } else {
    deleteSecondOperandCharacter();
  }
}

export function onDecimalBtnPress() {
  if (canAddDotInFirstOperand()) {
    addDotInFirstOperand();
    return;
  } else if (canCreateFloatSecondOperand()) {
    addDotInSecondOperand('0.');
  } else if (canAddDotInSecondOperand()) {
    addDotInSecondOperand('.');
  }
}

export function onSwitchSignBtnPress() {
  const isSignBefore = hasAnyMathOperator();
  if (isEmptyDisplay()) {
    updateOperand1('-');
    const updatedDisplayValue = '(-';
    updateDisplayResult(updatedDisplayValue);
  } else if (!isSignBefore) {
    updateDisplayResult(`${display.value * -1}`);
    updateOperand1(`${operand1 * -1}`);
  } else {
    updateOperand2('-');
    const updatedDisplayValue = display.value + '(-';
    updateDisplayResult(updatedDisplayValue);
  }
}

export function onDigitPress(el) {
  resetDisplayValueIfNeed();
  accumulateDigits(el.value);
}

export function onMathOperationBtnPress(el) {
  const clickedSign = el.value;
  if (isErrorOnDisplay()) {
    updateDisplayResult('');
    return;
  }

  const areTwoOperandsExisted = !!(operand1 && operand2);
  if (areTwoOperandsExisted) {
    onResultBtnPress();
  }
  if (isInvalidPercentOrPowerOperation(clickedSign)) {
    showInvalidPercentOrPowerOperNotification();
    return;
  }

  if (isActionWithoutFirstOperand(clickedSign)) {
    showOperWithoutFirstOperandNotification();
    return;
  }

  if (displayStartsWithRootSign(clickedSign)) {
    updateDisplayResult(`${display.value}${clickedSign}`);
    const isValidRoot = checkForInvalidRootOperation();
    if (isValidRoot) {
      updateOperatorSettings(clickedSign);
    }
    return;
  }

  if (isSquareRootOperation(clickedSign)) {
    updateOperatorSettings(clickedSign);
    updateDisplayResult(`${operand1}${operator}${clickedSign}`);
    return;
  }
  updateOperatorSettings(clickedSign);
  updateDisplayResult(`${operand1}${operator}`);
}

export function onResultBtnPress() {
  const value1 = getNumber1();
  const value2 = getNumber2();
  console.log('value1: ', value1);
  console.log('value2 : ', value2);
  console.log('operator: ', operator);
  if (isActionWithoutSecondOperand()) {
    showOperWithoutSecondOperandNotification();
    updateOperand2('');
  } else {
    makeOperWithTwoOperands(value1, value2);
    resetOperatorSettings();
  }
}

//________ OPERANDS functions________

function updateOperand1(value) {
  operand1 = value;
}
function updateOperand2(value) {
  operand2 = value;
}

function getNumber1() {
  //   return operand1 ? Number(operand1) : 0;
  return operand1;
}

function getNumber2() {
  let num;
  if (operator === '%' && !operand2) {
    num = 1;
  } else {
    num = Number(operand2);
  }
  return num;
}

//_______________make action functions________________
function makeOperWithTwoOperands(value1, value2) {
  if (operator !== '') {
    const isRootOnDispay = hasRootSignInFirstOperand();
    if (isRootOnDispay) {
      makeSqrRootOperation(value1, value2);
    } else {
      makeNotRootOperation(value1, value2);
    }
  }
}
function makeSqrRootOperation(value1, value2) {
  let result;
  const isRootFirstOnDisplay = displayStartsWithRootSign();
  if (isRootFirstOnDisplay) {
    const number1 = calculateResult(0, value1, '√');
    result = calculateResult(number1, value2, operator);
    updateOperand1(result);
  } else {
    const number2 = calculateResult(0, value2, '√');

    if (number2 === 'ERROR') {
      result = 'ERROR';
      updateOperand1('');
    } else {
      result = calculateResult(value1, number2, operator);
      updateOperand1(result);
    }
  }
  updateDisplayResult(result);
  updateOperand2('');
}

function makeNotRootOperation(value1, value2) {
  const result = calculateResult(value1, value2, operator);
  updateDisplayResult(result);
  updateOperand1(result);
  updateOperand2('');
}

//_____________________Delete button functions________________________//

function deleteFirstOperandCharacter(updatedValue) {
  updateOperand1(updatedValue);
  resetOperatorSettings();
}
function deleteSecondOperandTotally() {
  let sign = getLastCharacter(display.value);
  if (sign === '(') {
    const updatedValue = deleteLastCharacter(display.value);
    updateDisplayResult(updatedValue);
    sign = getLastCharacter(display.value);
  }
  updateOperatorSettings(sign);
  updateOperand2('');
}

function deleteSecondOperandCharacter() {
  updateOperand2(deleteLastCharacter(operand2));
}

//__________________float numbers functions_________________//

function canCreateFloatSecondOperand() {
  const isSignBefore = hasAnyMathOperator();
  return (!operand2 || operand2 === '-') && isSignBefore;
}
function canAddDotInFirstOperand() {
  const isDotSeparatorInFirstNumber =
    operand1 && String(operand1).includes('.');
  const isRootFirstOnDisplay = displayStartsWithRootSign();

  if (isRootFirstOnDisplay && !operand1) {
    updateOperand1('0');
    return true;
  }

  const hasNotFirstRootSignOnDisplay = checkIfNotRootOperationStarted();

  return (
    !isDotSeparatorInFirstNumber && !operand2 && !hasNotFirstRootSignOnDisplay
  );
}
function canAddDotInSecondOperand() {
  return !!(operand2 && !String(operand2).includes('.'));
}
function addDotInFirstOperand() {
  const dotValue = display.value !== '' ? '.' : '0.';
  const newDisplayValue = display.value + dotValue;
  updateDisplayResult(newDisplayValue);
  const updatedOperand = operand1 + '.';
  updateOperand1(updatedOperand);
}

function addDotInSecondOperand(dotValue) {
  const newDisplayValue = display.value + dotValue;
  updateDisplayResult(newDisplayValue);
  if (operand2 === '-') {
    dotValue = '-' + dotValue;
  }
  updateOperand2(dotValue);
}

//________________ DISPLAY functions_______________________

function updateDisplayResult(value) {
  display.value = value;
}

function resetDisplayValueIfNeed() {
  if (isErrorOnDisplay()) {
    updateDisplayResult('');
    return;
  }
  if (isOperatorLastPressed) {
    isOperatorLastPressed = false;
  }
}

function isErrorOnDisplay() {
  return display.value === 'ERROR';
}
function isEmptyDisplay() {
  return display.value === '0';
}

//____________update OPERATOR settings _______________________

function resetOperatorSettings() {
  isOperatorLastPressed = false;
  operator = '';
}

function updateOperatorSettings(clickedSign) {
  if (operator === '^' && clickedSign === '-') {
    updatePowerSettings(true);
  } else if (
    operator !== '' &&
    clickedSign === '√' &&
    operator !== clickedSign
  ) {
    isOperatorLastPressed = true;
  } else {
    isOperatorLastPressed = true;
    operator = clickedSign;
  }
}

//______________accumulate digits functions________________//

function accumulateDigits(digit) {
  if (isEmptyDisplay()) {
    addFirstDigitOnDisplay(digit);
    return;
  }
  const isOperatorOnDisplay = hasAnyMathOperator();
  const isRootFirstOnDisplay = displayStartsWithRootSign();
  const hasNotFirstRootSignOnDisplay = checkIfNotRootOperationStarted();
  if (isOperatorOnDisplay) {
    if (isRootFirstOnDisplay && !hasNotFirstRootSignOnDisplay) {
      accumulateWithNoOperator(digit);
    } else {
      accumulateWithOperator(digit);
    }
  } else {
    accumulateWithNoOperator(digit);
  }
}

function addFirstDigitOnDisplay(digit) {
  updateOperand1(digit);
  updateDisplayResult(digit);
}

function accumulateWithOperator(digit) {
  const acc = operand2 + digit;
  const result = processWithinLimits(acc);
  updateOperand2(result);
  updateDisplayResult(`${display.value}${digit}`);
}

function accumulateWithNoOperator(digit) {
  const isRootFirstOnDisplay = displayStartsWithRootSign();
  if (isRootFirstOnDisplay) {
    accumulateWithRootFirst(digit);
  } else {
    accumulateWithNonRootFirst(digit);
  }
}

function accumulateWithRootFirst(digit) {
  const firstCharacter = getFirstCharacter(display.value);
  const acc = operand1 + digit;
  const result = processWithinLimits(acc);
  updateOperand1(result);
  updateDisplayResult(`${firstCharacter}${result}`);
}

function accumulateWithNonRootFirst(digit) {
  const firstDisplayElement = getFirstCharacter(display.value);
  let acc, result;
  if (firstDisplayElement === '(') {
    acc = deleteFirstCharacter(display.value) + digit;
    result = processWithinLimits(acc);
    updateOperand1(result);
    updateDisplayResult(`(${result}`);
  } else {
    acc = display.value + digit;
    result = processWithinLimits(acc);
    updateOperand1(result);

    updateDisplayResult(`${result}`);
  }
}

// ________________________________________UNIQUE MATH CASES FUNCTIONS ________________//
function isInvalidPercentOrPowerOperation(clickedSign) {
  return operator !== '' && (clickedSign === '%' || clickedSign === '^');
}

function isActionWithoutFirstOperand(clickedSign) {
  return operator === '' && clickedSign !== '√' && !operand1;
}

function isActionWithoutSecondOperand() {
  return standardOperationsList.includes(operator) && isOperatorLastPressed;
}

function isSquareRootOperation(clickedSign) {
  return operator && clickedSign === '√' && operator !== clickedSign;
}

function displayStartsWithRootSign() {
  return getFirstCharacter(display.value) === '√';
}

//_____________________________________________________________
function hasAnyMathOperator() {
  let firstDisplayElement = getFirstCharacter(display.value);
  if (firstDisplayElement === '(') {
    return hasOperatorAfterBracket();
  } else {
    return hasOperatorWithoutBracket();
  }
}

function hasOperatorAfterBracket() {
  const firstDisplayElement = getSecondCharacter(display.value);
  if (firstDisplayElement === '√') {
    return true;
  } else {
    checkForOperation();
  }
}

function hasOperatorWithoutBracket() {
  const firstDisplayElement = getFirstCharacter(display.value);
  if (firstDisplayElement === '√') {
    return true;
  } else {
    return checkForOperation();
  }
}

function checkForOperation() {
  const value = display.value;
  const startIndex = value.startsWith('(') ? 2 : 1;
  return value
    .slice(startIndex)
    .split('')
    .some(char => fullOperationsList.includes(char));
}

function checkIfNotRootOperationStarted() {
  let isSignBefore = false;
  const value = display.value;
  for (let i = 1; i < value.length; i++) {
    if (fullOperationsList.includes(value[i])) {
      isSignBefore = true;
      break;
    }
  }
  return isSignBefore;
}

function hasRootSignInFirstOperand() {
  return display.value.includes('√') && operator !== '√';
}

function checkForInvalidRootOperation() {
  const displayLength = display.value.length;
  if (displayLength === 2) {
    for (let i = 1; i < displayLength; i++) {
      if (fullOperationsList.includes(display.value[i])) {
        updateDisplayResult(`${deleteLastCharacter(display.value)}`);
        resetOperatorSettings();
        showInvalidOperAfterRootSignNotification();
        return false;
      }
    }
  }
  return true;
}
