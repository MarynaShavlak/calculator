const NOTIFICATION_DELAY = 3000;
let timeoutID = null;
const notificationEl = document.querySelector('.error-notification-modal');
const displayEl = document.querySelector('#main-calc-display');
const buttonsTablo = document.querySelector('.buttons-tablo');
const resultOperationBtn = document.querySelector('#result-btn');
const clearAllBtn = document.querySelector('#clearAll-btn');
const deleteBtn = document.querySelector('#delete-btn');
const decimalBtn = document.querySelector('#decimal-btn');
const switchSignBtn = document.querySelector('#switch-sign-btn');
const MAX_INT_DIGITS_POS = 15; // integer part of positive number can include no more than 15 digits;
const MAX_INT_DIGITS_NEG = 16; // integer part of negative number can include no more than 16 elements(15 digits and sign minus);
const MAX_DECIMAL_DIGITS = 6; // decimal part of number can include no more than 6 digits;
const ROUNDING_PRECISION = Math.pow(10, 6); // we want to round decimal part of our result on display to 6 digits
const fullOperationsList = ['-', '+', '*', '/', '√', '%', '^'];
const standardOperationsList = ['-', '+', '*', '/', '√'];
let mathOperationBtnIsLastPressed = false;
let mathOperationCode = '';
let savedNumber1 = '';
let savedNumber2 = '';
let isNegativePower;

resultOperationBtn.addEventListener('click', onResultBtnPress);
clearAllBtn.addEventListener('click', resetCalculator);
deleteBtn.addEventListener('click', onDelBtnPress);
decimalBtn.addEventListener('click', onDecimalBtnPress);
switchSignBtn.addEventListener('click', onSwitchSignBtnPress);

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

notificationEl.addEventListener('click', onNotificationClick);

function resetCalculator() {
  updateDisplayResult(0);
  mathOperationBtnIsLastPressed = false;
  mathOperationCode = '';
  savedNumber1 = '';
  savedNumber2 = '';
  isNegativePower = false;
}

function onDelBtnPress() {
  if (isError()) {
    updateDisplayResult('');
    return;
  }
  const updatedValue = displayEl.value.slice(0, -1);
  console.log('updatedValue: ', updatedValue);
  updateDisplayResult(updatedValue);

  console.log('mathOperationCode: ', mathOperationCode);
  console.log('savedNumber1: ', savedNumber1);
  console.log('savedNumber2: ', savedNumber2);
  if (!savedNumber2) {
    console.log('другого операнда немаэ');
    savedNumber1 = updatedValue;
    resetOperationState();
  } else {
    console.log('є другий операнд');
    const isSignBefore = checkIfMathOperationStarted();
    console.log('в кінці тільки знак ', isSignBefore);
    if (isSignBefore && savedNumber2.length < 2) {
      const sign = displayEl.value.slice(-1);
      updateMathOperationOptions(sign);

      console.log('sign: ', sign);
      savedNumber2 = '';
    } else {
      savedNumber2 = savedNumber2.slice(0, savedNumber2.length - 1);
    }
  }
  console.log('AFTER DELETION savedNumber1: ', savedNumber1);
  console.log('AFTER DELETION savedNumber2: ', savedNumber2);
  console.log('AFTER DELETION mathOperationCode: ', mathOperationCode);
}

//__________________float numbers functins_________________//
function onDecimalBtnPress() {
  if (canAddDotInFirstOperand()) {
    handleDecimalInFirstOperand();
    return;
  } else if (canCreateFloatSecondOperand()) {
    handleDecimalClickWithSignBefore();
  } else if (canAddDotInSecondOperand()) {
    handleDecimalInSecondOperand();
  }
}

function canCreateFloatSecondOperand() {
  const isSignBefore = checkIfMathOperationStarted();
  return !savedNumber2 && isSignBefore;
}
function canAddDotInFirstOperand() {
  const isDotSeparatorInFirstNumber =
    savedNumber1 && String(savedNumber1).includes('.');
  const isSignBefore = checkIfMathOperationStarted();
  return !isDotSeparatorInFirstNumber && !savedNumber2 && !isSignBefore;
}

function canAddDotInSecondOperand() {
  return savedNumber2 && !String(savedNumber2).includes('.');
}

function handleDecimalInFirstOperand() {
  displayEl.value += '.';
  savedNumber1 += '.';
}

function handleDecimalClickWithSignBefore() {
  displayEl.value += '0.';
  savedNumber2 = '0.';
}

function handleDecimalInSecondOperand() {
  displayEl.value += '.';
  savedNumber2 += '.';
}

//_____________________________________________________________
function checkIfMathOperationStarted() {
  let isSignBefore = false;
  const value = displayEl.value;
  console.log('value: ', value);

  for (let i = 1; i < value.length; i++) {
    if (fullOperationsList.includes(value[i])) {
      isSignBefore = true;
      break;
    }
  }
  return isSignBefore;
}

function checkIfRootOperationStarted() {
  return displayEl.value.includes('√') && mathOperationCode !== '√';
}

function isError() {
  return displayEl.value === 'ERROR';
}

function onSwitchSignBtnPress() {
  const isSignBefore = checkIfMathOperationStarted();
  console.log('isSignBefore: ', isSignBefore);
  if (displayEl.value === '0') {
    // displayEl.value = '-';
    // savedNumber1 = '-';
    console.log(
      'недопустимий формат: спочатку треба ввечти число, а потім вже змінювати його знак',
    );
    showNotification();
    return;
  } else if (!isSignBefore) {
    displayEl.value *= -1;
    savedNumber1 *= -1;
  } else {
    console.log('тут треба поставити дужки');
  }

  console.log('after SIGN SWITCH savedNumber1: ', savedNumber1);
}

function onDigitPress(el) {
  resetDisplayValueIfNeed();
  accumulateDigitsOnDisplay(el.value);
}

function onMathOperationBtnPress(el) {
  const clickedSign = el.value;
  console.log('clickedSign: ', clickedSign);
  console.log('mathOperationCode: ', mathOperationCode);
  if (isError()) {
    updateDisplayResult('');
    return;
  }

  if (isInvalidPercentOrPowerOperation(clickedSign)) {
    handleInvalidPercentOrPowerOperation();
    return;
  }

  if (isOperationWithoutFirstOperand(clickedSign)) {
    handleOperationWithoutFirstOperand();
    return;
  }

  if (isSquareRootOperation(clickedSign)) {
    handleSquareRootDisplay(clickedSign);
    return;
  }
  updateMathOperationOptions(clickedSign);
  updateDisplayResult(`${savedNumber1}${mathOperationCode}`);
}

function onResultBtnPress() {
  const value1 = getNumber1();
  const value2 = getNumber2();
  console.log('value1: ', value1);
  console.log('value2 : ', value2);
  console.log('mathOperationCode: ', mathOperationCode);
  console.log('mathOperationBtnIsLastPressed: ', mathOperationBtnIsLastPressed);
  if (isOperationWithoutSecondOperand()) {
    handleOperationWithoutSecondOperand();
  } else {
    handleOperationWithTwoOperands(value1, value2);
  }

  console.log('on =  click savedNumber1: ', savedNumber1);
  console.log(' on = clikc savedNumber2: ', savedNumber2);
  resetOperationState();
}

function updateDisplayResult(value) {
  console.log('UPDATE DISPLAY value: ', value);
  displayEl.value = value;
}

function resetDisplayValueIfNeed() {
  if (isError()) {
    updateDisplayResult('');
    return;
  }
  if (mathOperationBtnIsLastPressed) {
    // if the last button on which user have clicked before was math operation button
    // updateDisplayResult(''); // we need to delete all the digits from display
    // updateDisplayResult(`${savedNumber1}${mathOperationCode}`); // !!!!!!!!!!!!!!!!add new
    mathOperationBtnIsLastPressed = false;
    // now math operation button is not the last  pressed button anymore, so we need to reset variable flag to origin state
  }
}

function resetOperationState() {
  mathOperationBtnIsLastPressed = false;
  mathOperationCode = '';
}

function accumulateDigitsOnDisplay(digitValue) {
  console.log('START ACCUMULATE');
  if (displayEl.value === '0') {
    handleFirstDigitClick(digitValue);
    return;
  }
  const isOperationOnDisplay = checkIfMathOperationStarted();
  console.log('isOperationOnDisplay: ', isOperationOnDisplay);
  if (isOperationOnDisplay) {
    accululateWithOperSign(digitValue);
  } else {
    accululateWithoutOperSign(digitValue);
  }
}

function accululateWithOperSign(digitValue) {
  accamulatedValue = savedNumber2 + digitValue;
  const res = processAccumulatedValue(accamulatedValue);
  console.log('second operand if first is POSITIVE: ', res);
  savedNumber2 = res;

  updateDisplayResult(`${displayEl.value}${digitValue}`);
  console.log('first OPERAND: ', savedNumber1);
  console.log(' second OPERAND: ', savedNumber2);
}

function accululateWithoutOperSign(digitValue) {
  accamulatedValue = displayEl.value + digitValue;
  const res = processAccumulatedValue(accamulatedValue);
  console.log('accumulated first operand : ', res);
  savedNumber1 = res;
  updateDisplayResult(`${res}`);
  console.log('first OPERAND: ', savedNumber1);
  console.log('second OPERAND: ', savedNumber2);
}

function processAccumulatedValue(value) {
  console.log('accamulatedValue : ', value);
  const isPositiveNumber = value >= 0;
  console.log('isPositiveNumber: ', isPositiveNumber);
  let result;
  if (isPositiveNumber) {
    result = handlePositiveNumber(value);
  } else {
    result = handleNegativeNumber(value);
  }
  return result;
}

function updateMathOperationOptions(mathOperationCodeValue) {
  if (mathOperationCode === '^' && mathOperationCodeValue === '-') {
    isNegativePower = true;
  } else {
    mathOperationBtnIsLastPressed = true;
    mathOperationCode = mathOperationCodeValue;
  }
}

function getNumber1() {
  //   return savedNumber1 ? Number(savedNumber1) : 0;
  return savedNumber1;
}

function getNumber2() {
  let num;
  if (mathOperationCode === '%') {
    num = 1;
  } else {
    num = Number(savedNumber2);
  }
  return num;
}

//__________________Mathematical calculation functions_____________________________

function calculateResult(number1, number2, operation) {
  console.log('typeof number2: ', typeof number2);
  console.log('typeof number1: ', typeof number1);
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

function roundResult(value) {
  return Math.round(value * ROUNDING_PRECISION) / ROUNDING_PRECISION;
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
  if (number1 < 0) {
    return 'ERROR';
  } else {
    const percentage = (number1 * number2) / 100;
    return roundResult(percentage);
  }
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
  if (number1 < 0 || number2 < 0) {
    return 'ERROR';
  } else if (number1 > 0 && number2 > 0) {
    const squareRootValue = Math.sqrt(number2);
    return roundResult(multiply(number1, squareRootValue));
  } else {
    const number = number1 === 0 || number1 === '' ? number2 : number1;
    const squareRootValue = Math.sqrt(number);
    return roundResult(squareRootValue);
  }
}

//____________________________DIGITS ACCUMULATION FUNCTIONS ______________________________________//

function handlePositiveNumber(result) {
  const matchInPositiveNumber = result.match(/(\d*)\.(\d*)/); // we need to check whether number on display has decimal separator

  if (!matchInPositiveNumber) {
    return handlePositiveWholeNumber(result);
  } else {
    return handlePositiveNonWholeNumber(matchInPositiveNumber);
  }
}

function handlePositiveWholeNumber(result) {
  const integerPart =
    result.length > MAX_INT_DIGITS_POS
      ? result.slice(0, MAX_INT_DIGITS_POS)
      : result;
  return integerPart;
}

function handlePositiveNonWholeNumber(matchInPositiveNumber) {
  const integerPartString = matchInPositiveNumber[1];
  const decimalPartString = matchInPositiveNumber[2];

  const integerPart =
    integerPartString?.length > MAX_INT_DIGITS_POS
      ? integerPartString.slice(0, MAX_INT_DIGITS_POS)
      : integerPartString;
  const decimalPart =
    decimalPartString?.length > MAX_DECIMAL_DIGITS
      ? decimalPartString.slice(0, MAX_DECIMAL_DIGITS)
      : decimalPartString;

  return `${integerPart}.${decimalPart}`;
}

function handleNegativeNumber(result) {
  const matchInNegativeNumber = result.match(/(-)(\d*)\.(\d*)/); // we need to check whether number with decimal separator is positive or negative

  if (!matchInNegativeNumber) {
    return handleNegativeWholeNumber(result);
  } else {
    return handleNegativeNonWholeNumber(matchInNegativeNumber);
  }
}

function handleNegativeWholeNumber(result) {
  const integerPart =
    result.length > MAX_INT_DIGITS_NEG
      ? result.slice(0, MAX_INT_DIGITS_NEG)
      : result;
  return integerPart;
}

function handleNegativeNonWholeNumber(matchInNegativeNumber) {
  const signMinusPartString = matchInNegativeNumber[1];
  const integerPartString = matchInNegativeNumber[2];
  const decimalPartString = matchInNegativeNumber[3];

  const integerPart =
    integerPartString?.length > MAX_INT_DIGITS_NEG
      ? integerPartString.slice(0, MAX_INT_DIGITS_NEG)
      : integerPartString;
  const decimalPart =
    decimalPartString?.length > MAX_DECIMAL_DIGITS
      ? decimalPartString.slice(0, MAX_DECIMAL_DIGITS)
      : decimalPartString;

  return `${signMinusPartString ?? ''}${integerPart}.${decimalPart}`;
}

// ________________________________________UNIQUE MATH CASES FUNCTIONS ________________//
function isInvalidPercentOrPowerOperation(clickedSign) {
  return (
    mathOperationCode !== '' && (clickedSign === '%' || clickedSign === '^')
  );
}

function handleInvalidPercentOrPowerOperation() {
  console.log(
    'недопустимий формат: після знаків математичних операцій на можна ставити % та ^',
  );
  showNotification();
}

function isOperationWithoutFirstOperand(clickedSign) {
  return mathOperationCode === '' && clickedSign !== '√' && !savedNumber1;
}

function handleOperationWithoutFirstOperand() {
  console.log(
    'недопустимий формат: не можна проводити додавання, віднімання, множення, ділення, розрахунок відсотка та підняття до степеня, не маючи першого операнда',
  );
  showNotification();
}

function isOperationWithoutSecondOperand() {
  return (
    standardOperationsList.includes(mathOperationCode) &&
    mathOperationBtnIsLastPressed
  );
}

function handleOperationWithoutSecondOperand() {
  console.log(
    'недопустимий формат: немає другого числа для проведення розрахунків',
  );
  showNotification();
}

function isSquareRootOperation(clickedSign) {
  return (
    mathOperationCode &&
    clickedSign === '√' &&
    mathOperationCode !== clickedSign
  );
}

function handleSquareRootDisplay(clickedSign) {
  console.log(
    'тут треба зробити операцію із першим числом та результатом кореня другого',
  );
  console.log('savedNumber1: ', savedNumber1);
  console.log(' savedNumber2: ', savedNumber2);
  updateDisplayResult(`${savedNumber1}${mathOperationCode}${clickedSign}`);
}

function handleRootOperation(value1, value2) {
  console.log(
    'when click on "=" and IS ROOT, the sign of operation is',
    mathOperationCode,
  );
  const number2 = calculateResult(0, value2, '√');
  console.log('IT IS SQUARE ROOT: ', number2);
  const result = calculateResult(value1, number2, mathOperationCode);
  console.log(
    'when click on "=" and IS ROOT, the result of operation is ',
    result,
  );
  updateDisplayResult(result);
  savedNumber1 = result;
  savedNumber2 = '';
}

function handleRegularOperation(value1, value2) {
  console.log('IN handleRegularOperation value1: ', value1);
  console.log('IN handleRegularOperation value2: ', value2);
  console.log(
    'when click on "=" and NO ROOT, the sign of operation is',
    mathOperationCode,
  );
  const result = calculateResult(value1, value2, mathOperationCode);
  console.log(
    'when click on "=" and NO ROOT, the result of operation is ',
    result,
  );
  updateDisplayResult(result);
  savedNumber1 = result;
  savedNumber2 = '';
}

function handleFirstDigitClick(digitValue) {
  savedNumber1 = digitValue;
  updateDisplayResult(digitValue);
}

function handleOperationWithTwoOperands(value1, value2) {
  if (mathOperationCode !== '') {
    const isRootOnDispay = checkIfRootOperationStarted();
    console.log('isRootonDispay: ', isRootOnDispay);
    if (isRootOnDispay) {
      handleRootOperation(value1, value2);
    } else {
      handleRegularOperation(value1, value2);
    }
  }
}

//______________Nitification functions ______________________________________
function onNotificationClick() {
  hideNotification();
  clearTimeout(timeoutID);
}

function showNotification() {
  notificationEl.classList.add('isVisible');
  timeoutID = setTimeout(() => {
    hideNotification();
  }, NOTIFICATION_DELAY);
}

function hideNotification() {
  notificationEl.classList.remove('isVisible');
}
