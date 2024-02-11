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
import { calculateResult } from './math-operation-funcs.js';

const display = document.querySelector('#main-calc-display');
const fullOperationsList = ['-', '+', '*', '/', '√', '%', '^'];
const standardOperationsList = ['-', '+', '*', '/', '√'];
let isOperatorLastPressed = false;
let operator = '';
let operand1 = '';
let operand2 = '';
let isNegativePower;

addBtsEventHandlers();

export function resetCalculator() {
  updateDisplayResult(0);
  isOperatorLastPressed = false;
  operator = '';
  updateOperand1('');
  updateOperand2('');
  isNegativePower = false;
}

export function onDelBtnPress() {
  if (isErrorOnDisplay()) {
    updateDisplayResult('');
    return;
  }
  const updatedValue = deleteLastCharacter(display.value);
  console.log(
    `%cнове значення яке бачимо на дісплеї ПІСЛЯ очищення одного елемента ${updatedValue}`,
    'color:#FF1493; font-weight:700',
  );
  const isSecondOperandTotallyDeleted =
    hasAnyMathOperator() && operand2.length < 2;
  updateDisplayResult(updatedValue);

  console.log(
    `%cзoperand1 ПЕРЕД очищенням одного елемента ${operand1}`,
    'color:#FF1493; font-weight:700',
  );
  console.log(
    `%coperand2 ПЕРЕД очищенням одного елемента ${operand2}`,
    'color:#FF1493; font-weight:700',
  );
  console.log(
    `%coperator ПЕРЕД очищенням одного елемента ${operator}`,
    'color:#FF1493; font-weight:700',
  );

  if (!operand2) {
    deleteFirstOperandCharacter(updatedValue);
  } else if (isSecondOperandTotallyDeleted) {
    deleteSecondOperandTotally();
  } else {
    deleteSecondOperandCharacter();
  }
  console.log(
    `%cзoperand1 ПІСЛЯ очищення одного елемента ${operand1}`,
    'color:#FF1493; font-weight:700',
  );
  console.log(
    `%coperand2 ПІСЛЯ очищення одного елемента ${operand2}`,
    'color:#FF1493; font-weight:700',
  );
  console.log(
    `%coperator ПІСЛЯ очищення одного елемента ${operator}`,
    'color:#FF1493; font-weight:700',
  );
}

export function onDecimalBtnPress() {
  const inFirst = canAddDotInFirstOperand();
  console.log('inFirst: ', inFirst);
  const inSecond = canAddDotInSecondOperand();
  console.log('inSecond: ', inSecond);
  const canCreateFloatSecond = canCreateFloatSecondOperand();
  console.log('canCreateFloatSecond: ', canCreateFloatSecond);
  if (canAddDotInFirstOperand()) {
    addDotInFirstOperand();
    return;
  } else if (canCreateFloatSecondOperand()) {
    console.log('FLOAT SECOND OPERAND CREATION');
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
    // console.log(
    //   '%cнедопустимий формат: спочатку треба ввечти число, а потім вже змінювати його знак',
    //   'color:red',
    // );
    // showNotification();
    // return;
  } else if (!isSignBefore) {
    updateDisplayResult(`${display.value * -1}`);
    updateOperand1(`${operand1 * -1}`);
  } else {
    updateOperand2('-');
    const updatedDisplayValue = display.value + '(-';
    updateDisplayResult(updatedDisplayValue);
  }

  console.log('after SIGN SWITCH operand1: ', operand1);
  console.log('after SIGN SWITCH operand2: ', operand2);
}

export function onDigitPress(el) {
  resetDisplayValueIfNeed();
  accumulateDigits(el.value);
}

export function onMathOperationBtnPress(el) {
  const clickedSign = el.value;

  console.log(
    `%coperand1 при кліці на мат.операцію:  ${operand1}`,

    'background-color: pink',
  );
  console.log(
    `%coperand1 при кліці на мат.операцію: ${operand2}`,

    'background-color: pink',
  );
  console.log(
    `%cякий знак був записаний перед кліком на інший знак?:  ${operator}`,

    'background-color: yellow',
  );
  console.log(
    `%cна який знак клікнула?: ${clickedSign}`,

    'background-color: yellow',
  );
  if (isErrorOnDisplay()) {
    updateDisplayResult('');
    return;
  }

  const areTwoOperandsExisted = !!(operand1 && operand2);
  console.log(
    `%cчИ Є ВЖЕ 2 ОПЕРАНДА ПРИ КЛІЦІ НА  мат.операцію:  ${areTwoOperandsExisted}`,

    'background-color: pink; font-weight:900',
  );
  if (areTwoOperandsExisted) {
    console.log(
      `%cтут треба зробити операцію розрахунку результату`,

      'background-color: pink; font-weight:900',
    );
  }
  if (isInvalidPercentOrPowerOperation(clickedSign)) {
    showInvalidPercentOrPowerOperNotification();
    console.log(
      `%cякий знак був ТЕПЕР записаний в КІНЦІ кліку?:  ${operator}`,
      'font-size: larger; font-weight: 900; background-color: yellow',
    );
    return;
  }

  if (isActionWithoutFirstOperand(clickedSign)) {
    showOperWithoutFirstOperandNotification();
    console.log(
      `%cякий знак був ТЕПЕР записаний в КІНЦІ кліку?:  ${operator}`,
      'font-size: larger; font-weight: 900; background-color: yellow',
    );
    return;
  }

  if (displayStartsWithRootSign(clickedSign)) {
    const isRootFirstOnDisplay = displayStartsWithRootSign(clickedSign);
    console.log(
      `%cчи є корінь на початку дісплея?:  ${isRootFirstOnDisplay}`,
      'font-size: larger; font-weight: 900; background-color: yellow',
    );
    updateDisplayResult(`${display.value}${clickedSign}`);
    const isValidRoot = checkForInvalidRootOperation();
    if (isValidRoot) {
      updateOperatorSettings(clickedSign);
    }
    console.log(
      `%cякий знак був ТЕПЕР записаний в КІНЦІ кліку?:  ${operator}`,
      'font-size: larger; font-weight: 900; background-color: yellow',
    );
    return;
  }

  if (isSquareRootOperation(clickedSign)) {
    const isRoot = isSquareRootOperation(clickedSign);
    console.log(
      `%cчи почалась  операція із коренем?:  ${isRoot}`,
      'font-size: larger; font-weight: 900; background-color: yellow',
    );
    updateOperatorSettings(clickedSign);
    updateDisplayResult(`${operand1}${operator}${clickedSign}`);
    console.log(
      `%cякий знак був ТЕПЕР записаний в КІНЦІ кліку на мат.опер.?:  ${operator}`,
      'font-size: larger; font-weight: 900; background-color: yellow',
    );
    return;
  }

  updateOperatorSettings(clickedSign);
  updateDisplayResult(`${operand1}${operator}`);
  console.log(
    `%cякий знак був ТЕПЕР записаний в КІНЦІ кліку на мат.опер.?:  ${operator}`,
    'font-size: larger; font-weight: 900; background-color: yellow',
  );
}

export function onResultBtnPress() {
  const value1 = getNumber1();
  const value2 = getNumber2();
  console.log('value1: ', value1);
  console.log('value2 : ', value2);
  console.log('operator: ', operator);
  if (isActionWithoutSecondOperand()) {
    console.log('коли тисне а "=", то Є 1 operand');
    showOperWithoutSecondOperandNotification();
  } else {
    console.log('коли тисне а "=", то Є 2 operands');
    makeOperWithTwoOperands(value1, value2);
    resetOperatorSettings();
  }

  console.log('після настискання на  =  operand1: ', operand1);
  console.log(' після настискання на   = operand2: ', operand2);
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
  console.log('in getNumber2 operand2: ', operand2);
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
  console.log('Знак коли тисну "=": ', operator);
  if (operator !== '') {
    const isRootOnDispay = hasRootSignInFirstOperand();
    console.log('є корінь коли тисну "="? ', isRootOnDispay);
    if (isRootOnDispay) {
      makeSqrRootOperation(value1, value2);
    } else {
      makeNotRootOperation(value1, value2);
    }
  }
}
function makeSqrRootOperation(value1, value2) {
  console.log(
    `%cin makeSqrRootOperation operand1 :${value1}`,
    'background-color: #7ECCEC; font-weight:700',
  );
  console.log(
    `%cin makeSqrRootOperation operand2 :${value2}`,
    'background-color: #7ECCEC; font-weight:700',
  );
  console.log(
    `%cin makeSqrRootOperation АКТИВНА ОПЕРАЦІЯ :${operator}`,
    'background-color: #7ECCEC; font-weight:700',
  );

  let result;
  const isRootFirstOnDisplay = displayStartsWithRootSign();
  if (isRootFirstOnDisplay) {
    const number1 = calculateResult(0, value1, '√');
    console.log(
      `%cрозрахований корінь ПЕРШОГО операнда:${number1}`,
      'background-color: #7ECCEC; font-weight:500',
    );
    result = calculateResult(number1, value2, operator);
    updateOperand1(result);
  } else {
    const number2 = calculateResult(0, value2, '√');
    console.log(
      `%cрозрахований корінь ДРУГОГО операнда:${number2}`,
      'background-color: #7ECCEC; font-weight:500',
    );
    if (number2 === 'ERROR') {
      result = 'ERROR';
      updateOperand1('');
    } else {
      result = calculateResult(value1, number2, operator);
      updateOperand1(result);
    }
  }
  console.log(
    `%cрезультат розрахунку, коли на екрані є корінь:${result}`,
    'background-color: #7ECCEC; font-weight:900',
  );

  updateDisplayResult(result);
  updateOperand2('');
}

function makeNotRootOperation(value1, value2) {
  console.log(
    `%cin makeNotRootOperation operand1 :${value1}`,
    'background-color: #CC99FF; font-weight:700',
  );
  console.log(
    `%cin makeNotRootOperation operand2 :${value2}`,
    'background-color: #CC99FF; font-weight:700',
  );
  console.log(
    `%cin makeNotRootOperation АКТИВНА ОПЕРАЦІЯ :${operator}`,
    'background-color: #CC99FF; font-weight:700',
  );
  const result = calculateResult(value1, value2, operator);

  console.log(
    `%cрезультат розрахунку, коли на екрані НЕМАЄ кореня:${result}`,
    'background-color: #CC99FF; font-weight:900',
  );
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
  console.log(
    `%cin canCreateFloatSecondOperandisSignBefore: , ${isSignBefore}`,
    'background-color: black; color: white;',
  );
  console.log(
    `%cin canCreateFloatSecondOperand operand2 : , ${operand2}`,
    'background-color: black; color: white;',
  );
  return (!operand2 || operand2 === '-') && isSignBefore;
}
function canAddDotInFirstOperand() {
  const isDotSeparatorInFirstNumber =
    operand1 && String(operand1).includes('.');
  const isRootFirstOnDisplay = displayStartsWithRootSign();
  console.log(
    'кОЛИ КЛЫКАЮ НА КРАПКУ, ЧИ починаэться вираз із кореня isRootFirstOnDisplay: ',
    isRootFirstOnDisplay,
  );
  if (isRootFirstOnDisplay && !operand1) {
    updateOperand1('0');
    return true;
  }

  const hasNotFirstRootSignOnDisplay = checkIfNotRootOperationStarted();
  console.log(
    'Чи є інші оператори(окрім,кореня на початку) при кліці на КРАПКУ  ',
    hasNotFirstRootSignOnDisplay,
  );
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
  console.log(
    `%cin c addDotInSecondOperand operand2 : , ${operand2}`,
    'background-color: red; color: white;',
  );

  const newDisplayValue = display.value + dotValue;
  updateDisplayResult(newDisplayValue);
  if (operand2 === '-') {
    dotValue = '-' + dotValue;
  }
  updateOperand2(dotValue);
}

//________________ DISPLAY functions_______________________

function updateDisplayResult(value) {
  console.log(
    `%c Це треба показати на дісплеї', ${value}`,
    'color:white; background-color: green; font-weight:700',
  );
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
  console.log(
    `%cclickedSign ПЕРЕД ОБНОВЛЕННЯМ :${clickedSign} `,

    'background-color: orange',
  );
  console.log(
    `%coperator ПЕРЕД ОБНОВЛЕННЯМ: ${operator}`,

    'background-color: orange',
  );
  if (operator === '^' && clickedSign === '-') {
    isNegativePower = true;
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

  console.log(
    `'%coperator ПІСЛЯ ОБНОВЛЕННЯ: ${operator}`,

    'background-color: orange; font-weight: 900',
  );
}

//______________accumulate digits functions________________//

function accumulateDigits(digit) {
  if (isEmptyDisplay()) {
    addFirstDigitOnDisplay(digit);
    return;
  }
  const isOperatorOnDisplay = hasAnyMathOperator();
  console.log(
    `%cЧи почата вже мат.операція при кліці на цифру?: ${isOperatorOnDisplay}`,
    'background-color: #BADA55',
  );
  const isRootFirstOnDisplay = displayStartsWithRootSign();
  const hasNotFirstRootSignOnDisplay = checkIfNotRootOperationStarted();
  console.log(
    `%cЧи є на початку дісплея корінь при кліці на цифру?: ${isRootFirstOnDisplay}`,
    'background-color: #BADA55',
  );
  console.log(
    `%cЧи є інші оператори(окрім,кореня на початку) при кліці на цифру?: ${hasNotFirstRootSignOnDisplay}`,
    'background-color: #BADA55',
  );
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
  console.log('АКАМУЛЮЭМО ЦИФРЫ В ЧИСЛО НОМЕР 2 ');
  console.log(
    `%cзначення 'operand1' ПЕРЕД накопиченям у ДРУГИЙ операнд:${operand1}`,
    'background-color: #BADA55;font-weight: 700',
  );
  console.log(
    `%cзначення 'operand2' ПЕРЕД накопиченям у ДРУГИЙ операнд:${operand2}`,
    'background-color: #BADA55;font-weight: 700',
  );
  const acc = operand2 + digit;
  const result = processWithinLimits(acc);
  updateOperand2(result);
  console.log(
    `%cзначення 'operand1' після накопиченя у ДРУГИЙ операнд:${operand1}`,
    'background-color: #BADA55;font-weight: 700',
  );
  console.log(
    `%cзначення 'operand2' після накопиченя у ДРУГИЙ операнд:${operand2}`,
    'background-color: #BADA55;font-weight: 700',
  );

  updateDisplayResult(`${display.value}${digit}`);
}

function accumulateWithNoOperator(digit) {
  const isRootFirstOnDisplay = displayStartsWithRootSign();
  if (isRootFirstOnDisplay) {
    accumulateWithRootFirst(digit);
  } else {
    accumulateWithNonRootFirst(digit);
  }

  console.log(
    `%cзначення 'operand1' після накопиченя у ПЕРШИЙ операнд:${operand1}`,
    'background-color: #BADA55;font-weight: 700',
  );
  console.log(
    `%cзначення 'operand2' після накопиченя у ПЕРШИЙ операнд:${operand2}`,
    'background-color: #BADA55;font-weight: 700',
  );
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
