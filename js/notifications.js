const notificationEl = document.querySelector('.error-notification-modal');
notificationEl.addEventListener('click', onNotificationClick);
const NOTIFICATION_DELAY = 3000;
let timeoutID = null;

//______________Nitification functions ______________________________________
export function onNotificationClick() {
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

export function showInvalidPercentOrPowerOperNotification() {
  console.log(
    '%cнедопустимий формат: після знаків математичних операцій на можна ставити % та ^',
    'color:red',
  );
  showNotification();
}

export function showOperWithoutFirstOperandNotification() {
  console.log(
    '%cнедопустимий формат: не можна проводити додавання, віднімання, множення, ділення, розрахунок відсотка та підняття до степеня, не маючи першого операнда',
    'color:red',
  );
  showNotification();
}

export function showOperWithoutSecondOperandNotification() {
  console.log(
    '%cнедопустимий формат: немає другого числа для проведення розрахунків',
    'color:red',
  );
  showNotification();
}

export function showInvalidOperAfterRootSignNotification() {
  console.log(
    '%cнедопустимий формат: після знаку кореня не можна використовувати знаки : +, -, *, /, %, ^',
    'color:red',
  );
  //   updateDisplayResult(`${displayEl.value.slice(0, -1)}`);
  showNotification();
}
