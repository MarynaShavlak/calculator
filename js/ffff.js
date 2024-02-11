function accumulateWithNoOperator(digit) {
  const isRootFirstOnDisplay = displayStartsWithRootSign();

  let acc;
  let result;
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
  operand1 = result;
  updateDisplayResult(`${firstCharacter}${result}`);
}

function accumulateWithNonRootFirst(digit) {
  const firstDisplayElement = getFirstCharacter(display.value);
  let acc, result;
  console.log('firstDisplayElement : ', firstDisplayElement);
  if (firstDisplayElement === '(') {
    acc = deleteFirstCharacter(display.value) + digit;
    result = processWithinLimits(acc);
    operand1 = result;
    updateDisplayResult(`(${result}`);
  } else {
    acc = display.value + digit;
    result = processWithinLimits(acc);
    operand1 = result;
    updateDisplayResult(`${result}`);
  }
}
