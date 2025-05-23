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
const standardOperationsList = ['-', '+', '*', '/', '√'];
let mathOperationBtnIsLastPressed = false;
let savedNumber1;
let savedNumber2;
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
  const el = e.target;
  const isDecimalSeparatorIncludedOnDisplay = displayEl.value.includes('.');
  if (!isDecimalSeparatorIncludedOnDisplay) {
    displayEl.value += el.value;
  }
}

function onSwitchSignBtnPress() {
  if (displayEl.value === '0') return;
  displayEl.value *= -1;
}

function onDigitPress(el) {
  resetDisplayValueIfNeed();
  accumulateDigitsOnDisplay(el.value);
}

function onMathOperationBtnPress(el) {
  console.log('mathOperationCode: ', mathOperationCode);
  console.log('el.value: ', el.value);
  const isError = displayEl.value === 'ERROR';
  if (isError) {
    updateDisplayResult('');
    return;
  }
  saveFirstNumber();
  updateMathOperationOptions(el.value);
}

function onResultBtnPress() {
  const value1 = getNumber1();
  const value2 = getNumber2();
  console.log('value1: ', value1);
  console.log('value2 : ', value2);
  console.log('mathOperationCode: ', mathOperationCode);
  console.log('mathOperationBtnIsLastPressed: ', mathOperationBtnIsLastPressed);
  if (
    standardOperationsList.includes(mathOperationCode) &&
    mathOperationBtnIsLastPressed
  ) {
    console.log('використано недопустимий формат');
    return;
  }
  if (mathOperationCode !== '') {
    const result = calculateResult(value1, value2, mathOperationCode);
    updateDisplayResult(result);
  }
}

function resetDisplayValueIfNeed() {
  const isError = displayEl.value === 'ERROR';
  if (isError) {
    updateDisplayResult('');
  }
  if (mathOperationBtnIsLastPressed) {
    // if the last button on which user have clicked before was math operation button
    updateDisplayResult(''); // we need to delete all the digits from display
    mathOperationBtnIsLastPressed = false; // now math operation button is not the last  pressed button anymore, so we need to reset variable flag to origin state
  }
}

function accumulateDigitsOnDisplay(digitValue) {
  if (displayEl.value === '0') {
    //if it is only digit-zero on display now
    updateDisplayResult(digitValue); // we need to delete this digit from display
    return;
  }

  const result = displayEl.value + digitValue; // we need to accumulate digits on display, every new pressed digit is added in the end of display
  const isPositiveNumber = result >= 0;
  let res;
  if (isPositiveNumber >= 0) {
    res = handlePositiveNumber(result);
  } else {
    res = handleNegativeNumber(result, matchInNegativeNumber);
  }
  updateDisplayResult(res);
}

function saveFirstNumber() {
  // we need to save the number(set of accumulated digits) which we see on display
  savedNumber1 = displayEl.value;
}

function updateMathOperationOptions(mathOperationCodeValue) {
  console.log('mathOperationCodeValue: ', mathOperationCodeValue);
  console.log('mathOperationCode: ', mathOperationCode);
  if (mathOperationCode === '^' && mathOperationCodeValue === '-') {
    isNegativePower = true;
    console.log('треба взяти выдэмний степынь');
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
    num = Number(displayEl.value);
  }
  return num;
}

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

function roundResult(value) {
  return Math.round(value * ROUNDING_PRECISION) / ROUNDING_PRECISION;
}

function add(number1, number2) {
  const numbersSum = number1 + number2;
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
    const number = number1 === 0 ? number2 : number1;
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
