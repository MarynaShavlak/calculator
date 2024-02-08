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
let mathOperationCode = '';
let mathOperationBtnIsLastPressed = false;
let savedNumber;

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
  console.log('on operation click');
  saveFirstNumber();
  changePressedMathOperationBtnFlag();
  saveMathOperationName(el.value);
}

function onResultBtnPress() {
  const value1 = getNumber1();
  const value2 = getNumber2();
  console.log('value1: ', value1);
  console.log('value2 : ', value2);
  console.log('mathOperationCode: ', mathOperationCode);

  if (mathOperationCode) {
    const result = calculateResult(value1, value2, mathOperationCode);
    updateDisplayResult(result);
  }
}

function resetDisplayValueIfNeed() {
  console.log('reset display');
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
  savedNumber = displayEl.value;
  console.log('savedNumber: ', savedNumber);
}

function changePressedMathOperationBtnFlag() {
  // now math operation button is the last pressed button
  mathOperationBtnIsLastPressed = true;
}

function saveMathOperationName(mathOperationCodeValue) {
  // we need to save information which tell us what kind of mathemetical operation last clicked mathematical operation button need to do exactly
  mathOperationCode = mathOperationCodeValue;
}

function getNumber1() {
  // we take the value of first saved number (it was saved after clicking math operation button) not like a string but like a Number.
  return savedNumber ? Number(savedNumber) : 0;
}

function getNumber2() {
  // we take the value of second number which will take part in calculations (we take it from display). It is not like a string but a Number.
  return Number(displayEl.value);
}

function calculateResult(number1, number2, operation) {
  const ADDITIONAL_NUMBER_FOR_ROUNDING = Math.pow(10, 6); // we want to round decimal part of our result on display to 6 digits
  if (operation === '+') {
    const numbersSum = number1 + number2;
    result =
      Math.round(numbersSum * ADDITIONAL_NUMBER_FOR_ROUNDING) /
      ADDITIONAL_NUMBER_FOR_ROUNDING;
    return result;
  } else if (operation === '-') {
    const numbersSubstraction = number1 - number2;
    result =
      Math.round(numbersSubstraction * ADDITIONAL_NUMBER_FOR_ROUNDING) /
      ADDITIONAL_NUMBER_FOR_ROUNDING;
    return result;
  } else if (operation === '*') {
    const numbersMyltiplication = number1 * number2;

    result =
      Math.round(numbersMyltiplication * ADDITIONAL_NUMBER_FOR_ROUNDING) /
      ADDITIONAL_NUMBER_FOR_ROUNDING;
    return result;
  } else if (operation === '/') {
    if (number2 === 0) {
      return (displayEl.value = 'ERROR'); // zero division is not possible, so it will be errors
    } else {
      const numbersDevision = number1 / number2;

      result =
        Math.round(numbersDevision * ADDITIONAL_NUMBER_FOR_ROUNDING) /
        ADDITIONAL_NUMBER_FOR_ROUNDING;
      return result;
    }
  } else if (operation === '%') {
    if (number1 < 0) {
      return (displayEl.value = 'ERROR'); // % can not be negative
    } else {
      const numberPercent = (number1 * number2) / 100;

      result =
        Math.round(numberPercent * ADDITIONAL_NUMBER_FOR_ROUNDING) /
        ADDITIONAL_NUMBER_FOR_ROUNDING;
      return result;
    }
  } else if (operation === '^') {
    const numberInPOwer = Math.pow(number1, number2);

    result =
      Math.round(numberInPOwer * ADDITIONAL_NUMBER_FOR_ROUNDING) /
      ADDITIONAL_NUMBER_FOR_ROUNDING;
    return result;
  } else if (operation === 'square-root') {
    if (number1 <= 0) {
      return (displayEl.value = 'ERROR'); // square root can be calculated only for positive numbers
    } else {
      const numberSquareRoot = Math.sqrt(number1);
      result =
        Math.round(numberSquareRoot * ADDITIONAL_NUMBER_FOR_ROUNDING) /
        ADDITIONAL_NUMBER_FOR_ROUNDING;
      return result;
    }
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
