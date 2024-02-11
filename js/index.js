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
  roundResult,
} from './utils.js';
import {
  handlePositiveNumber,
  handleNegativeNumber,
} from './digits-limits-functions.js';

const displayEl = document.querySelector('#main-calc-display');
const buttonsTablo = document.querySelector('.buttons-tablo');
const resultOperationBtn = document.querySelector('#result-btn');
const clearAllBtn = document.querySelector('#clearAll-btn');
const deleteBtn = document.querySelector('#delete-btn');
const decimalBtn = document.querySelector('#decimal-btn');
const switchSignBtn = document.querySelector('#switch-sign-btn');
const copyIcon = document.querySelector('.copy-icon');
const fullOperationsList = ['-', '+', '*', '/', '√', '%', '^'];
const standardOperationsList = ['-', '+', '*', '/', '√'];
let mathOperationBtnIsLastPressed = false;
let operator = '';
let savedNumber1 = '';
let savedNumber2 = '';
let isNegativePower;

resultOperationBtn.addEventListener('click', onResultBtnPress);
clearAllBtn.addEventListener('click', resetCalculator);
deleteBtn.addEventListener('click', onDelBtnPress);
decimalBtn.addEventListener('click', onDecimalBtnPress);
switchSignBtn.addEventListener('click', onSwitchSignBtnPress);
copyIcon.addEventListener('click', copyDisplayValueToClipboard);

buttonsTablo.addEventListener('click', function (e) {
  const clickedEl = e.target;
  if (clickedEl.classList.contains('buttons-tablo')) return;
  if (clickedEl.classList.contains('digit-btn')) {
    onDigitPress(clickedEl);
  }
  if (clickedEl.classList.contains('math-operation-btn')) {
    onMathOperationBtnPress(clickedEl);
  }
});

function resetCalculator() {
  updateDisplayResult(0);
  mathOperationBtnIsLastPressed = false;
  operator = '';
  savedNumber1 = '';
  savedNumber2 = '';
  isNegativePower = false;
}

//_____________________Delete button functions________________________//
function onDelBtnPress() {
  if (isError()) {
    clearDisplay();
    return;
  }
  const updatedValue = deleteLastCharacter(displayEl.value);
  console.log(
    `%cнове значення яке бачимо на дісплеї ПІСЛЯ очищення одного елемента ${updatedValue}`,
    'color:#FF1493; font-weight:700',
  );
  const isSecondOperandTotallyDeleted =
    checkIfMathOperationStarted() && savedNumber2.length < 2;
  updateDisplayResult(updatedValue);

  console.log(
    `%cзsavedNumber1 ПЕРЕД очищенням одного елемента ${savedNumber1}`,
    'color:#FF1493; font-weight:700',
  );
  console.log(
    `%csavedNumber2 ПЕРЕД очищенням одного елемента ${savedNumber2}`,
    'color:#FF1493; font-weight:700',
  );
  console.log(
    `%coperator ПЕРЕД очищенням одного елемента ${operator}`,
    'color:#FF1493; font-weight:700',
  );

  if (!savedNumber2) {
    deleteFirstOperandCharacter(updatedValue);
  } else if (isSecondOperandTotallyDeleted) {
    deleteSecondOperandTotally();
  } else {
    deleteSecondOperandCharacter();
  }
  console.log(
    `%cзsavedNumber1 ПІСЛЯ очищення одного елемента ${savedNumber1}`,
    'color:#FF1493; font-weight:700',
  );
  console.log(
    `%csavedNumber2 ПІСЛЯ очищення одного елемента ${savedNumber2}`,
    'color:#FF1493; font-weight:700',
  );
  console.log(
    `%coperator ПІСЛЯ очищення одного елемента ${operator}`,
    'color:#FF1493; font-weight:700',
  );
}

function deleteFirstOperandCharacter(updatedValue) {
  savedNumber1 = updatedValue;
  resetOperationState();
}
function deleteSecondOperandTotally() {
  let sign = getLastCharacter(displayEl.value);
  if (sign === '(') {
    const updatedValue = deleteLastCharacter(displayEl.value);
    updateDisplayResult(updatedValue);
    sign = getLastCharacter(displayEl.value);
  }
  updateMathOperationOptions(sign);
  savedNumber2 = '';
}

function deleteSecondOperandCharacter() {
  savedNumber2 = deleteLastCharacter(savedNumber2);
}

//__________________float numbers functins_________________//
function onDecimalBtnPress() {
  if (canAddDotInFirstOperand()) {
    addDotInFirstOperand();
    return;
  } else if (canCreateFloatSecondOperand()) {
    addDotAfterOperator();
  } else if (canAddDotInSecondOperand()) {
    addDotInSecondOperand();
  }
}

function canCreateFloatSecondOperand() {
  const isSignBefore = checkIfMathOperationStarted();
  return !savedNumber2 && isSignBefore;
}
function canAddDotInFirstOperand() {
  console.log('значення на дісплеї', displayEl.value);
  const isDotSeparatorInFirstNumber =
    savedNumber1 && String(savedNumber1).includes('.');
  const isRootFirstonDisplay = isRootTheFirstOnDisplay();
  console.log(
    'кОЛИ КЛЫКАЮ НА КРАПКУ, ЧИ починаэться вираз із кореня isRootFirstonDisplay: ',
    isRootFirstonDisplay,
  );
  if (isRootFirstonDisplay) {
    savedNumber1 = '0';
    return true;
  }
  const isSignBefore = checkIfMathOperationStarted();
  console.log(
    'кОЛИ КЛЫКАЮ НА КРАПКУ, ЧИ Є ЯКИЙСЬ ЗНАК ПОПЕРЕДУ isSignBefore: ',
    isSignBefore,
  );
  return !isDotSeparatorInFirstNumber && !savedNumber2 && !isSignBefore;
}

function canAddDotInSecondOperand() {
  return savedNumber2 && !String(savedNumber2).includes('.');
}

function addDotInFirstOperand() {
  displayEl.value += '0.';
  savedNumber1 += '.';
}

function addDotAfterOperator() {
  displayEl.value += '0.';
  savedNumber2 = '0.';
}

function addDotInSecondOperand() {
  displayEl.value += '.';
  savedNumber2 += '.';
}

//_____________________________________________________________
function checkIfMathOperationStarted() {
  let firstDisplayElement = getFirstCharacter(displayEl.value);
  console.log('firstDisplayElement : ', firstDisplayElement);
  if (firstDisplayElement === '(') {
    console.log('перевырка операції: тут ДУЖКА');
    return checkMathOperationAfterBracket();
  } else {
    console.log('перевырка операції: тут ДУЖКИ НЕМАЄ');
    return checkMathOperationWithoutBracket();
  }
}

function checkMathOperationAfterBracket() {
  const firstDisplayElement = getSecondCharacter(displayEl.value);
  if (firstDisplayElement === '√') {
    return true;
  } else {
    checkForOperation();
  }
}

function checkMathOperationWithoutBracket() {
  const firstDisplayElement = getFirstCharacter(displayEl.value);
  if (firstDisplayElement === '√') {
    return true;
  } else {
    return checkForOperation();
  }
}

function checkForOperation() {
  const value = displayEl.value;
  const startIndex = value.startsWith('(') ? 2 : 1;
  return value
    .slice(startIndex)
    .split('')
    .some(char => fullOperationsList.includes(char));
}

function checkIfNotRootOperationStarted() {
  let isSignBefore = false;
  const value = displayEl.value;
  for (let i = 1; i < value.length; i++) {
    if (fullOperationsList.includes(value[i])) {
      isSignBefore = true;
      break;
    }
  }
  return isSignBefore;
}

function checkIfRootOperationStarted() {
  return displayEl.value.includes('√') && operator !== '√';
}

function isError() {
  return displayEl.value === 'ERROR';
}

function onSwitchSignBtnPress() {
  const isSignBefore = checkIfMathOperationStarted();
  console.log('isSignBefore: ', isSignBefore);
  if (displayEl.value === '0') {
    console.log('перше число буде выдэмне');
    savedNumber1 = '-';
    const updatedDisplayValue = '(-';
    console.log('updatedDisplayValue : ', updatedDisplayValue);
    updateDisplayResult(updatedDisplayValue);
    // console.log(
    //   '%cнедопустимий формат: спочатку треба ввечти число, а потім вже змінювати його знак',
    //   'color:red',
    // );
    // showNotification();
    // return;
  } else if (!isSignBefore) {
    displayEl.value *= -1;
    savedNumber1 *= -1;
  } else {
    console.log('тут треба поставити дужки');
    savedNumber2 = '-';
    const updatedDisplayValue = displayEl.value + '(-';
    console.log('updatedDisplayValue : ', updatedDisplayValue);
    updateDisplayResult(updatedDisplayValue);
  }

  console.log('after SIGN SWITCH savedNumber1: ', savedNumber1);
  console.log('after SIGN SWITCH savedNumber2: ', savedNumber2);
}

function onDigitPress(el) {
  resetDisplayValueIfNeed();
  accumulateDigitsOnDisplay(el.value);
}

function onMathOperationBtnPress(el) {
  const clickedSign = el.value;

  console.log(
    `%csavedNumber1 при кліці на мат.операцію:  ${savedNumber1}`,

    'background-color: pink',
  );
  console.log(
    `%csavedNumber1 при кліці на мат.операцію: ${savedNumber2}`,

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
  if (isError()) {
    clearDisplay();
    return;
  }

  const areTwoOperandsExisted = !!(savedNumber1 && savedNumber2);
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

  if (isOperationWithoutFirstOperand(clickedSign)) {
    showOperWithoutFirstOperandNotification();
    console.log(
      `%cякий знак був ТЕПЕР записаний в КІНЦІ кліку?:  ${operator}`,
      'font-size: larger; font-weight: 900; background-color: yellow',
    );
    return;
  }

  if (isRootTheFirstOnDisplay(clickedSign)) {
    const isRootFirstOnDisplay = isRootTheFirstOnDisplay(clickedSign);
    console.log(
      `%cчи є корінь на початку дісплея?:  ${isRootFirstOnDisplay}`,
      'font-size: larger; font-weight: 900; background-color: yellow',
    );
    updateDisplayResult(`${displayEl.value}${clickedSign}`);
    const isValidRoot = checkForInvalidRootOperation();
    if (isValidRoot) {
      updateMathOperationOptions(clickedSign);
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
    updateMathOperationOptions(clickedSign);
    updateDisplayResult(`${savedNumber1}${operator}${clickedSign}`);
    console.log(
      `%cякий знак був ТЕПЕР записаний в КІНЦІ кліку на мат.опер.?:  ${operator}`,
      'font-size: larger; font-weight: 900; background-color: yellow',
    );
    return;
  }

  updateMathOperationOptions(clickedSign);
  updateDisplayResult(`${savedNumber1}${operator}`);
  console.log(
    `%cякий знак був ТЕПЕР записаний в КІНЦІ кліку на мат.опер.?:  ${operator}`,
    'font-size: larger; font-weight: 900; background-color: yellow',
  );
}

function checkForInvalidRootOperation() {
  const displayLength = displayEl.value.length;
  if (displayLength === 2) {
    for (let i = 1; i < displayLength; i++) {
      if (fullOperationsList.includes(displayEl.value[i])) {
        updateDisplayResult(`${deleteLastCharacter(displayEl.value)}`);
        resetOperationState();
        showInvalidOperAfterRootSignNotification();
        return false;
      }
    }
  }
  return true;
}

function onResultBtnPress() {
  const value1 = getNumber1();
  const value2 = getNumber2();
  console.log('value1: ', value1);
  console.log('value2 : ', value2);
  console.log('operator: ', operator);
  if (isOperationWithoutSecondOperand()) {
    console.log('коли тисне а "=", то Є 1 operand');
    showOperWithoutSecondOperandNotification();
  } else {
    console.log('коли тисне а "=", то Є 2 operands');
    makeOperWithTwoOperands(value1, value2);
    resetOperationState();
  }

  console.log('після настискання на  =  savedNumber1: ', savedNumber1);
  console.log(' після настискання на   = savedNumber2: ', savedNumber2);
}

function updateDisplayResult(value) {
  console.log(
    `%c Це треба показати на дісплеї', ${value}`,
    'color:white; background-color: green; font-weight:700',
  );
  displayEl.value = value;
}

function resetDisplayValueIfNeed() {
  if (isError()) {
    clearDisplay();
    return;
  }
  if (mathOperationBtnIsLastPressed) {
    mathOperationBtnIsLastPressed = false;
  }
}

function clearDisplay() {
  updateDisplayResult('');
}

function resetOperationState() {
  mathOperationBtnIsLastPressed = false;
  operator = '';
}

function accumulateDigitsOnDisplay(digitValue) {
  if (displayEl.value === '0') {
    handleFirstDigitClick(digitValue);
    return;
  }
  const isOperationOnDisplay = checkIfMathOperationStarted();
  console.log('ON DIGIT CLICK: isOperationOnDisplay: ', isOperationOnDisplay);
  const isRootFirstonDisplay = isRootTheFirstOnDisplay();
  const hasNotFirstRootSignOnDisplay = checkIfNotRootOperationStarted();
  console.log('ON DIGIT CLICK: isRootFirstonDisplay: ', isRootFirstonDisplay);
  console.log('hasNotFirstRootSognOnDisplay : ', hasNotFirstRootSignOnDisplay);
  if (isOperationOnDisplay) {
    if (isRootFirstonDisplay && !hasNotFirstRootSignOnDisplay) {
      accululateWithoutOperSign(digitValue);
    } else {
      accululateWithOperSign(digitValue);
    }
  } else {
    accululateWithoutOperSign(digitValue);
  }
}

function accululateWithOperSign(digitValue) {
  console.log('АКАМУЛЮЭМО ЦИФРЫ В ЧИСЛО НОМЕР 2 ');
  let accamulatedValue;
  accamulatedValue = savedNumber2 + digitValue;
  const res = processAccumulatedValue(accamulatedValue);
  savedNumber2 = res;
  console.log('АКАМУЛЮЭМО ЦИФРЫ savedNumber1: ', savedNumber1);
  console.log(' АКАМУЛЮЭМО ЦИФРЫ savedNumber2: ', savedNumber2);
  updateDisplayResult(`${displayEl.value}${digitValue}`);
}

function accululateWithoutOperSign(digitValue) {
  console.log('АКАМУЛЮЭМО ЦИФРЫ В ЧИСЛО НОМЕР 1 ');
  const isRootFirstonDisplay = isRootTheFirstOnDisplay();
  console.log('isRootFirstonDisplay: ', isRootFirstonDisplay);
  let accamulatedValue;
  let res;
  console.log('mathOperationBtnIsLastPressed: ', mathOperationBtnIsLastPressed);
  if (isRootFirstonDisplay) {
    // accamulatedValue = displayEl.value.slice(1) + digitValue;
    console.log('HERE!!!!!!!!!!!!');
    accamulatedValue = savedNumber1 + digitValue;
    res = processAccumulatedValue(accamulatedValue);
    savedNumber1 = res;
    updateDisplayResult(`${getFirstCharacter(displayEl.value)}${res}`);
  } else {
    let firstDisplayElement = getFirstCharacter(displayEl.value);
    console.log('firstDisplayElement : ', firstDisplayElement);
    if (firstDisplayElement === '(') {
      accamulatedValue = deleteFirstCharacter(displayEl.value) + digitValue;
      res = processAccumulatedValue(accamulatedValue);
      savedNumber1 = res;
      updateDisplayResult(`(${res}`);
    } else {
      accamulatedValue = displayEl.value + digitValue;
      res = processAccumulatedValue(accamulatedValue);
      savedNumber1 = res;
      updateDisplayResult(`${res}`);
    }
    // accamulatedValue = displayEl.value + digitValue;
    // res = processAccumulatedValue(accamulatedValue);
    // savedNumber1 = res;
    // updateDisplayResult(`${res}`);
  }
  //   const res = processAccumulatedValue(accamulatedValue);
  //   savedNumber1 = res;
  console.log('АКАМУЛЮЭМО ЦИФРЫ savedNumber1: ', savedNumber1);
  console.log('АКАМУЛЮЭМО ЦИФРЫ  savedNumber2: ', savedNumber2);
  //   updateDisplayResult(`${res}`);
}

function processAccumulatedValue(value) {
  const isPositiveNumber = value >= 0;
  let result;
  if (isPositiveNumber) {
    result = handlePositiveNumber(value);
  } else {
    result = handleNegativeNumber(value);
  }
  return result;
}

function updateMathOperationOptions(clickedSign) {
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
    mathOperationBtnIsLastPressed = true;
  } else {
    mathOperationBtnIsLastPressed = true;
    operator = clickedSign;
  }

  console.log(
    `'%coperator ПІСЛЯ ОБНОВЛЕННЯ: ${operator}`,

    'background-color: orange; font-weight: 900',
  );
}

function getNumber1() {
  //   return savedNumber1 ? Number(savedNumber1) : 0;
  return savedNumber1;
}

function getNumber2() {
  console.log('in getNumber2 savedNumber2: ', savedNumber2);
  let num;
  if (operator === '%' && !savedNumber2) {
    num = 1;
  } else {
    num = Number(savedNumber2);
  }
  return num;
}

//__________________Mathematical calculation functions_____________________________

function calculateResult(number1, number2, operation) {
  let result;

  switch (operation) {
    case '+':
      result = add(number1, number2);
      break;
    case '-':
      result = subtract(number1, number2);
      break;
    case '*':
      result = multiply(number1, number2);
      break;
    case '/':
      result = divide(number1, number2);
      break;
    case '%':
      result = calculatePercentage(number1, number2);
      break;
    case '^':
      result = power(number1, number2);
      break;
    case '√':
      result = squareRoot(number1, number2);
      break;
    default:
      result = 'Invalid operation';
  }

  return result;
}

function add(number1, number2) {
  const numbersSum = Number(number1) + Number(number2);
  return roundResult(numbersSum);
}

function subtract(number1, number2) {
  const numbersSubtraction = number1 - number2;
  return roundResult(numbersSubtraction);
}

function multiply(number1, number2) {
  const numbersMultiplication = number1 * number2;
  return roundResult(numbersMultiplication);
}

function divide(number1, number2) {
  if (number2 === 0) {
    return 'ERROR';
  } else {
    const numbersDivision = number1 / number2;
    return roundResult(numbersDivision);
  }
}

function calculatePercentage(number1, number2) {
  const percentage = (number1 * number2) / 100;
  return roundResult(percentage);
  //   if (number1 < 0) {
  //     return 'ERROR';
  //   } else {
  //     const percentage = (number1 * number2) / 100;
  //     return roundResult(percentage);
  //   }
}

function power(number1, number2) {
  let powerDegree = number2;
  let result;
  if (isNegativePower) {
    powerDegree = number2 * -1;
    isNegativePower = false;
  }
  if (powerDegree >= 0) {
    result = Math.pow(number1, powerDegree);
  } else {
    result = 1 / Math.pow(number1, Math.abs(powerDegree));
  }
  return roundResult(result);
}

function squareRoot(number1, number2) {
  if (number2 < 0) {
    return 'ERROR';
  } else if (number1 > 0 && number2 > 0) {
    const squareRootValue = Math.sqrt(number2);
    return roundResult(multiply(number1, squareRootValue));
  } else if (number1 < 0 && number2 > 0) {
    const squareRootValue = Math.sqrt(number2);
    return roundResult(multiply(number1, squareRootValue));
  } else {
    const number = number1 === 0 || number1 === '' ? number2 : number1;
    const squareRootValue = Math.sqrt(number);
    return roundResult(squareRootValue);
  }
}

// ________________________________________UNIQUE MATH CASES FUNCTIONS ________________//
function isInvalidPercentOrPowerOperation(clickedSign) {
  return operator !== '' && (clickedSign === '%' || clickedSign === '^');
}

function isOperationWithoutFirstOperand(clickedSign) {
  return operator === '' && clickedSign !== '√' && !savedNumber1;
}

function isOperationWithoutSecondOperand() {
  return (
    standardOperationsList.includes(operator) && mathOperationBtnIsLastPressed
  );
}

function isSquareRootOperation(clickedSign) {
  return operator && clickedSign === '√' && operator !== clickedSign;
}

function isRootTheFirstOnDisplay(clickedSign) {
  console.log('iS ROOT FIRST on: clickedSign: ', clickedSign);
  console.log('iS ROOT FIRST  on: operator: ', operator);
  return getFirstCharacter(displayEl.value) === '√';
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
  const isRootFirstonDisplay = isRootTheFirstOnDisplay();
  if (isRootFirstonDisplay) {
    const number1 = calculateResult(0, value1, '√');
    console.log(
      `%cрозрахований корінь ПЕРШОГО операнда:${number1}`,
      'background-color: #7ECCEC; font-weight:500',
    );
    result = calculateResult(number1, value2, operator);
    savedNumber1 = result;
  } else {
    const number2 = calculateResult(0, value2, '√');
    console.log(
      `%cрозрахований корінь ДРУГОГО операнда:${number2}`,
      'background-color: #7ECCEC; font-weight:500',
    );
    if (number2 === 'ERROR') {
      result = 'ERROR';
      savedNumber1 = '';
    } else {
      result = calculateResult(value1, number2, operator);
      savedNumber1 = result;
    }
  }
  console.log(
    `%cрезультат розрахунку, коли на екрані є корінь:${result}`,
    'background-color: #7ECCEC; font-weight:900',
  );

  updateDisplayResult(result);
  savedNumber2 = '';
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
  savedNumber1 = result;
  savedNumber2 = '';
}

// function handleDisplayIfRootIsFirst(clickedSign) {
//   console.log(
//     'тут треба зробити операцію із результатом кореня першого числа та другим числом',
//   );
//   console.log('if √ - FIRST  savedNumber1: ', savedNumber1);
//   console.log(' if √ - FIRST savedNumber2: ', savedNumber2);
//   updateDisplayResult(`${displayEl.value}${clickedSign}`);
// }

function handleFirstDigitClick(digitValue) {
  savedNumber1 = digitValue;
  updateDisplayResult(digitValue);
}

function makeOperWithTwoOperands(value1, value2) {
  console.log('Знак коли тисну "=": ', operator);
  if (operator !== '') {
    const isRootOnDispay = checkIfRootOperationStarted();
    console.log('є корінь коли тисну "="? ', isRootOnDispay);
    if (isRootOnDispay) {
      makeSqrRootOperation(value1, value2);
    } else {
      makeNotRootOperation(value1, value2);
    }
  }
}

// ______Copy value to clipboard from display ______//

function copyDisplayValueToClipboard() {
  const text = displayEl.value;
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
}
