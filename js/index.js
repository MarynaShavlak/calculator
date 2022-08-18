// We need to find all elements which we can use during calculations//
let displayEl = document.getElementById('main-calc-display');                   // we find the dispaly whee we can see all our actions with calculator
let digitBtns = document.getElementsByClassName('digit-btn');                   // we find all buttons which are digits
let mathOperationBtns = document.getElementsByClassName('math-operation-btn');  // we find all buttons which make mathematical operation (/,*,+,-,^,%,square root)
let resultOperationBtn = document.getElementById('result-btn');                 // we find the button "="
let clearAllBtn = document.getElementById('clearAll-btn');                      // we find the button "AC", which resets all from the display
let deleteBtn = document.getElementById('delete-btn');                          // we find the button "d", which resets all from the display
let decimalBtn = document.getElementById('decimal-btn');                        // we find the button which add the decimal separator on display
let switchSignBtn = document.getElementById('switch-sign-btn');                 // we find the button which switches the signs "+" and "-"
let mathOperationCode = '';                                                     // we need this variable to save the kind of mathemetical operation which last clicked mathematical operation button need to do exactly  
let mathOperationBtnIsLastPressed = false;                                      // it becomes true already after we click on some math operation button (/,*,+,-,^,%,square root)

resultOperationBtn.addEventListener('click', onResultBtnPress); // add event listener to button "="
clearAllBtn.addEventListener('click', onClearAllBtnPress);      // add event listener to button "AC"
deleteBtn.addEventListener('click', onDelBtnPress);          // add event listener to button "delete"
decimalBtn.addEventListener('click', onDecimalBtnPress);        // add event listener to decimal button 
switchSignBtn.addEventListener('click', onSwitchSignBtnPress);  // add event listener to button "switch sign"

// we need to add event listeners to all calculator digit buttons
for (let i = 0; i < digitBtns.length; i++) {
    digitBtns[i].addEventListener('click', onDigitPress);
};

// we need to add event listeners to all calculator math operation buttons
for (let i = 0; i < mathOperationBtns.length; i++) {
    mathOperationBtns[i].addEventListener('click', onMathematicalOperationButnPress);
};

function onClearAllBtnPress() {         // event handler on click button "AC"
    displayEl.value = 0;                // we need to delete all the digits and decimal separator from the display
};

function onDelBtnPress() {              // event handler on click button "delete"
    displayEl.value = displayEl.value.slice(0, -1);   // we need to delete last digit in display
};

function onDecimalBtnPress() {          // event handler on click button "decimal separator"
    let isDecimalSeparatorIncludedOnDisplay = displayEl.value.includes('.');
    if (isDecimalSeparatorIncludedOnDisplay === false) {
        // accumulateDigitsOnDisplay(this.value);
        displayEl.value += this.value;
    } else {
        return
    };
};

function onSwitchSignBtnPress() {       // event handler on click button "+/-"
    if (displayEl.value == 0) {                     // digit zero doesn't have sign, we can not switch it 
        return;
    } else {
        const result = displayEl.value * (-1);      // sign of any other numbers on display can be changed
        displayEl.value = result;
    };
};

function onDigitPress() {               // event handler on click buttons which are digits
    resetDisplayValueIfNeed();
    accumulateDigitsOnDisplay(this.value);
};

function onMathematicalOperationButnPress() {     // event handler on click buttons which make mathematical operations//
    saveFirstNumber();
    changePressedMathOperationButnFlag();
    saveMathOperationName(this.value);
};

function onResultBtnPress() {                    // event handler on click button "="
    let value1 = getNumber1();
    let value2 = getNumber2();
    let operation = getOperation();

    let result = calculateResult(value1, value2, operation);
    showResultOnDisplay(result);
};

function resetDisplayValueIfNeed() {
    if (mathOperationBtnIsLastPressed) {        // if the last button on which user have clicked before was math operation button
        displayEl.value = '';                   // we need to delete all the digits from display
        mathOperationBtnIsLastPressed = false;  // now math operation button is not the last  pressed button anymore, so we need to reset variable flag to origin state 
    }
};




function accumulateDigitsOnDisplay(digitValue) {
    if (displayEl.value === "0") {             //if it is only digit-zero on display now
        displayEl.value = digitValue;         // we need to delete this digit from display
        return;
    };

    const MAX_QUANTITY_OF_DIGITS_IN_INTEGER_PART_POSITIVE_NUMBER = 15; // integer part of positive number can include no more than 15 digits;
    const MAX_QUANTITY_OF_DIGITS_IN_INTEGER_PART_NEGATIVE_NUMBER = 16; // integer part of negative number can include no more than 16 elements(15 digits and sign minus);
    const MAX_QUANTITY_OF_DIGITS_IN_DECIMAL_PART = 6;                 // decimal part of number can include no more than 6 digits;

    const result = displayEl.value + digitValue;                      // we need to accumulate digits on display, every new pressed digit is added in the end of display
    const matchInPositiveNumber = result.match(/(\d*)\.(\d*)/);      // we need to check whether number on display has decimal separator 
    const matchInNegativeNumber = result.match(/(-)(\d*)\.(\d*)/);   // we need to check whether number with decimal separator is positive or negative

    if (result >= 0) {     // number is positive 
        if (!matchInPositiveNumber) {      // positive number is a whole number                              // if there is no separator on display we can continue adding digits on display until the quantity of digits in integer part of number doesn't exceed the max limit 
            displayEl.value = result.length > MAX_QUANTITY_OF_DIGITS_IN_INTEGER_PART_POSITIVE_NUMBER ? result.slice(0, MAX_QUANTITY_OF_DIGITS_IN_INTEGER_PART_POSITIVE_NUMBER) : result;
        } else {   // positive number is Not a whole number and has fractional part

            const integerPartString = matchInPositiveNumber[1];
            const decimalPartString = matchInPositiveNumber[2];

            const integerPart = integerPartString?.length > MAX_QUANTITY_OF_DIGITS_IN_INTEGER_PART_POSITIVE_NUMBER ? integerPartString.slice(0, MAX_QUANTITY_OF_DIGITS_IN_INTEGER_PART_POSITIVE_NUMBER) : integerPartString; // It is not possible to enter the quantity of digits in the integer part of the number more than max limit
            const decimalPart = decimalPartString?.length > MAX_QUANTITY_OF_DIGITS_IN_DECIMAL_PART ? decimalPartString.slice(0, MAX_QUANTITY_OF_DIGITS_IN_DECIMAL_PART) : decimalPartString;                                 // It is not possible to enter the quantity of digits in the decimal part of the number more than max limit

            displayEl.value = `${integerPart}.${decimalPart}`

        }
    } else { // number is negative 
        if (!matchInNegativeNumber) {  //negative number is a whole number   
            displayEl.value = result.length > MAX_QUANTITY_OF_DIGITS_IN_INTEGER_PART_NEGATIVE_NUMBER ? result.slice(0, MAX_QUANTITY_OF_DIGITS_IN_INTEGER_PART_NEGATIVE_NUMBER) : result;
        } else {                        // negative number is Not a whole number and has fractional part
            const signMinusPartString = matchInNegativeNumber[1];
            const integerPartString = matchInNegativeNumber[2];
            const decimalPartString = matchInNegativeNumber[3];

            const integerPart = integerPartString?.length > MAX_QUANTITY_OF_DIGITS_IN_INTEGER_PART_NEGATIVE_NUMBER ? integerPartString.slice(0, MAX_QUANTITY_OF_DIGITS_IN_INTEGER_PART_NEGATIVE_NUMBER) : integerPartString;
            const decimalPart = decimalPartString?.length > MAX_QUANTITY_OF_DIGITS_IN_DECIMAL_PART ? decimalPartString.slice(0, MAX_QUANTITY_OF_DIGITS_IN_DECIMAL_PART) : decimalPartString;

            displayEl.value = `${signMinusPartString ?? ""}${integerPart}.${decimalPart}`

        };
    };
};

function saveFirstNumber() {                      // we need to save the number(set of accumulated digits) which we see on display  
    savedNumber = displayEl.value;
};

function changePressedMathOperationButnFlag() {  // now math operation button is the last pressed button
    mathOperationBtnIsLastPressed = true;
};

function saveMathOperationName(mathOperationCodeValue) { // we need to save information which tell us what kind of mathemetical operation last clicked mathematical operation button need to do exactly
    mathOperationCode = mathOperationCodeValue;
}

function getNumber1() {                 // we take the value of first saved number (it was saved after clicking math operation button) not like a string but like a Number.
    return Number(savedNumber);
};

function getNumber2() {                 // we take the value of second number which will take part in calculations (we take it from display). It is not like a string but a Number.
    return Number(displayEl.value);
};

function getOperation() {               // we take the type of mathematical operation which we need to do
    return mathOperationCode;
};

function calculateResult(number1, number2, operation) {
    const ADDITIONAL_NUMBER_FOR_ROUNDING = Math.pow(10, 6);   // we want to round decimal part of our result on display to 6 digits 
    if (operation === '+') {
        const numbersSum = number1 + number2;
        result = Math.round(numbersSum * ADDITIONAL_NUMBER_FOR_ROUNDING) / ADDITIONAL_NUMBER_FOR_ROUNDING;
        return result;
    } else if (operation === '-') {
        const numbersSubstraction = number1 - number2;
        result = Math.round(numbersSubstraction * ADDITIONAL_NUMBER_FOR_ROUNDING) / ADDITIONAL_NUMBER_FOR_ROUNDING;
        return result;

    } else if (operation === '*') {
        const numbersMyltiplication = number1 * number2;

        result = Math.round(numbersMyltiplication * ADDITIONAL_NUMBER_FOR_ROUNDING) / ADDITIONAL_NUMBER_FOR_ROUNDING;
        return result;

    } else if (operation === '/') {
        if (number2 === 0) {
            return displayEl.value = 'ERROR';   // zero division is not possible, so it will be errors
        } else {
            const numbersDevision = number1 / number2;

            result = Math.round(numbersDevision * ADDITIONAL_NUMBER_FOR_ROUNDING) / ADDITIONAL_NUMBER_FOR_ROUNDING;
            return result;
        }
    } else if (operation === '%') {
        if (number1 < 0) {
            return displayEl.value = 'ERROR'; // % can not be negative
        } else {
            const numberPercent = number1 * number2 / 100;

            result = Math.round(numberPercent * ADDITIONAL_NUMBER_FOR_ROUNDING) / ADDITIONAL_NUMBER_FOR_ROUNDING;
            return result;
        };

    } else if (operation === '^') {
        const numberInPOwer = Math.pow(number1, number2);

        result = Math.round(numberInPOwer * ADDITIONAL_NUMBER_FOR_ROUNDING) / ADDITIONAL_NUMBER_FOR_ROUNDING;
        return result;
    } else if (operation === 'square-root') {
        if (number1 <= 0) {
            return displayEl.value = 'ERROR';   // square root can be calculated only for positive numbers
        } else {
            const numberSquareRoot = Math.sqrt(number1);
            result = Math.round(numberSquareRoot * ADDITIONAL_NUMBER_FOR_ROUNDING) / ADDITIONAL_NUMBER_FOR_ROUNDING;
            return result;
        };
    };
};

function showResultOnDisplay(result) {
    displayEl.value = result;
};



