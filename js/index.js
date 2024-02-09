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
let mathOperationCode = '';
const fullOperationsList = ['-', '+', '*', '/', '√', '%', '^'];
const standardOperationsList = ['-', '+', '*', '/', '√'];
let mathOperationBtnIsLastPressed = false;
let savedNumber1 = '';
let savedNumber2 = '';
let isNegativePower;

resultOperationBtn.addEventListener('click', onResultBtnPress);
clearAllBtn.addEventListener('click', () => updateDisplayResult(0));
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

function onDelBtnPress() {
  const isError = displayEl.value === 'ERROR';
  if (isError) {
    updateDisplayResult('');
    return;
  }
  const updatedValue = displayEl.value.slice(0, -1);
  updateDisplayResult(updatedValue);
}

function onDecimalBtnPress(e) {
  console.log('savedNumber1: ', savedNumber1);
  console.log(' savedNumber2: ', savedNumber2);
  const el = e.target;
  //   const isDecimalSeparatorIncludedOnDisplay = displayEl.value.includes('.');
  const isDecimalSeparatorInFirstNumber =
    savedNumber1 && String(savedNumber1).includes('.');
  const isDecimalSeparatorInSecondNumber =
    savedNumber2 && String(savedNumber2).includes('.');
  if (!isDecimalSeparatorInFirstNumber) {
    displayEl.value += el.value;
    savedNumber1 += el.value;
    console.log('savedNumber1: ', savedNumber1);
    console.log(' savedNumber2: ', savedNumber2);
    return;
  }
  if (!isDecimalSeparatorInSecondNumber) {
    displayEl.value += el.value;
    savedNumber2 += el.value;
    console.log('savedNumber1: ', savedNumber1);
    console.log(' savedNumber2: ', savedNumber2);
  }
}

function onSwitchSignBtnPress() {
  if (displayEl.value === '0') {
    console.log('використано недопустимий формат');
    showNotification();
    return;
  }
  displayEl.value *= -1;
  savedNumber1 *= -1;
  console.log('after SIGN SWITCH savedNumber1: ', savedNumber1);
}

function onDigitPress(el) {
  resetDisplayValueIfNeed();
  accumulateDigitsOnDisplay(el.value);
}

function onMathOperationBtnPress(el) {
  const clickedSign = el.value;
  console.log('clickedSign: ', clickedSign);
  if (mathOperationCode === clickedSign) {
    return;
  }

  const isError = displayEl.value === 'ERROR';
  if (isError) {
    updateDisplayResult('');
    return;
  }
  if (
    (mathOperationCode !== '' && clickedSign === '%') ||
    clickedSign === '^'
  ) {
    console.log(
      'недопустимий формат: після знаіків математичних операцій на можна ставити % та ^',
    );
    showNotification();
    return;
  }

  console.log('mathOperationCode: ', mathOperationCode);
  if (mathOperationCode === '' && clickedSign !== '√' && !savedNumber1) {
    console.log(
      'недопустимий формат: не можна проводити операції не маючи першого операнда',
    );
    showNotification();
    return;
  }

  if (
    mathOperationCode &&
    clickedSign === '√' &&
    mathOperationCode !== clickedSign
  ) {
    console.log(
      'тут треба зробити операцію із першим числом та результатом кореня другого',
    );
    console.log('savedNumber1: ', savedNumber1);
    console.log(' savedNumber2: ', savedNumber2);
    updateDisplayResult(`${savedNumber1}${mathOperationCode}${clickedSign}`); // !!!!!!!!!!!!!!!!add new
    // updateMathOperationOptions(clickedSign);
    return;
  }
  updateMathOperationOptions(clickedSign);

  //   saveFirstNumber();

  updateDisplayResult(`${savedNumber1}${mathOperationCode}`); // !!!!!!!!!!!!!!!!add new
}

function onResultBtnPress() {
  //   const value1 = getNumber1();
  //   const value2 = getNumber2();
  const value1 = savedNumber1;
  const value2 = savedNumber2;
  console.log('value1: ', value1);
  console.log('value2 : ', value2);
  console.log('mathOperationCode: ', mathOperationCode);
  console.log('mathOperationBtnIsLastPressed: ', mathOperationBtnIsLastPressed);
  if (
    standardOperationsList.includes(mathOperationCode) &&
    mathOperationBtnIsLastPressed
  ) {
    console.log(
      'недопустимий формат: немає другого числа для проведення розрахунків',
    );
    showNotification();
    return;
  }
  if (mathOperationCode !== '') {
    const isRootOnDispay = displayEl.value.includes('√');
    console.log('isRootonDispay: ', isRootOnDispay);
    if (isRootOnDispay) {
      console.log('clikc on = ', mathOperationCode);
      const number2 = calculateResult(0, value2, '√');
      console.log('number2: ', number2);
      const result = calculateResult(value1, number2, mathOperationCode);
      console.log('result: ', result);
      updateDisplayResult(result);
      savedNumber1 = result;
      savedNumber2 = '';
      return;
    }

    console.log('clikc on = ', mathOperationCode);
    const result = calculateResult(value1, value2, mathOperationCode);
    console.log('result: ', result);
    updateDisplayResult(result);
    savedNumber1 = result;
    savedNumber2 = '';
  }
  console.log('on =  click savedNumber1: ', savedNumber1);
  console.log(' on = clikc savedNumber2: ', savedNumber2);
}

function resetDisplayValueIfNeed() {
  const isError = displayEl.value === 'ERROR';
  if (isError) {
    updateDisplayResult('');
  }
  if (mathOperationBtnIsLastPressed) {
    // if the last button on which user have clicked before was math operation button
    // updateDisplayResult(''); // we need to delete all the digits from display
    // updateDisplayResult(`${savedNumber1}${mathOperationCode}`); // !!!!!!!!!!!!!!!!add new
    mathOperationBtnIsLastPressed = false; // now math operation button is not the last  pressed button anymore, so we need to reset variable flag to origin state
  }
}

function accumulateDigitsOnDisplay(digitValue) {
  console.log('aacamulate function');
  if (displayEl.value === '0') {
    //if it is only digit-zero on display now, we need to delete this digit from display
    savedNumber1 = digitValue;
    updateDisplayResult(digitValue);
    return;
  }

  console.log('displayEl.value: ', displayEl.value);
  const isFistNumberNegative = displayEl.value.startsWith('-');
  const isOperationOnDisplay = fullOperationsList.some(operation =>
    displayEl.value.includes(operation),
  );
  console.log('isOperationOnDisplay: ', isOperationOnDisplay);
  console.log('isFistNumberNegative: ', isFistNumberNegative);

  let accamulatedValue;
  if (isOperationOnDisplay) {
    // savedNumber2 = digitValue;
    accamulatedValue = savedNumber2 + digitValue;
    console.log('accamulatedValue : ', accamulatedValue);
    const isPositiveNumber = accamulatedValue >= 0;
    let res;
    if (isPositiveNumber) {
      res = handlePositiveNumber(accamulatedValue);
    } else {
      res = handleNegativeNumber(accamulatedValue);
    }
    console.log('res : ', res);
    savedNumber2 = res;
    console.log('savedNumber1: ', savedNumber1);
    console.log(' savedNumber2: ', savedNumber2);
    updateDisplayResult(`${displayEl.value}${digitValue}`);
  } else {
    accamulatedValue = displayEl.value + digitValue;
    console.log('accamulatedValue : ', accamulatedValue);
    const isPositiveNumber = accamulatedValue >= 0;
    console.log('isPositiveNumber: ', isPositiveNumber);
    let res;
    if (isPositiveNumber) {
      res = handlePositiveNumber(accamulatedValue);
    } else {
      res = handleNegativeNumber(accamulatedValue);
    }
    console.log('res : ', res);
    savedNumber1 = res;
    console.log('savedNumber1: ', savedNumber1);
    console.log(' savedNumber2: ', savedNumber2);
    updateDisplayResult(`${res}`);
  }
}

// function saveFirstNumber() {
//   // we need to save the number(set of accumulated digits) which we see on display
//   savedNumber1 = displayEl.value;
// }

function updateMathOperationOptions(mathOperationCodeValue) {
  if (mathOperationCode === '^' && mathOperationCodeValue === '-') {
    isNegativePower = true;
  } else {
    mathOperationBtnIsLastPressed = true;
    mathOperationCode = mathOperationCodeValue;
  }
}

function getNumber1() {
  return savedNumber1 ? Number(savedNumber1) : 0;
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

function updateDisplayResult(value) {
  displayEl.value = value;
}

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
