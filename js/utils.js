const ROUNDING_PRECISION = Math.pow(10, 6); // we want to round decimal part of our result on display to 6 digits

export function deleteLastCharacter(str) {
  return str.slice(0, -1);
}
export function deleteFirstCharacter(str) {
  return str.slice(1);
}

export function getLastCharacter(str) {
  return str.slice(-1);
}
export function getFirstCharacter(str) {
  return str.slice(0, 1);
}
export function getSecondCharacter(str) {
  return str.slice(1, 2);
}

export function roundResult(value) {
  return Math.round(value * ROUNDING_PRECISION) / ROUNDING_PRECISION;
}

export function countCharacter(str, char) {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === char) {
      count++;
    }
  }
  return count;
}
