const notificationEl = document.querySelector('.error-notification-modal');
const messageEl = document.querySelector('.error-notification-message');
notificationEl.addEventListener('click', onNotificationClick);
const NOTIFICATION_DELAY = 3000;
let timeoutID = null;

//______________Nitification functions ______________________________________
export function onNotificationClick() {
  hideNotification();
  clearTimeout(timeoutID);
}

function showNotification(message) {
  notificationEl.classList.add('isVisible');
  messageEl.textContent = message;
  timeoutID = setTimeout(() => {
    hideNotification();
  }, NOTIFICATION_DELAY);
}

function hideNotification() {
  notificationEl.classList.remove('isVisible');
}

export function showInvalidPercentOrPowerOperNotification() {
  const message = 'Некоректне використання знаків "%" та "^"';
  console.log(
    '%cнедопустимий формат: після знаків математичних операцій на можна ставити % та ^',
    'color:red',
  );
  showNotification(message);
}

export function showOperWithoutFirstOperandNotification() {
  const message = 'Відсутній перший операнд';
  console.log(
    '%cнедопустимий формат: не можна проводити додавання, віднімання, множення, ділення, розрахунок відсотка та підняття до степеня, не маючи першого операнда',
    'color:red',
  );
  showNotification(message);
}

export function showOperWithoutSecondOperandNotification() {
  const message = 'Відсутній другий операнд';
  console.log(
    '%cнедопустимий формат: немає другого числа для проведення розрахунків',
    'color:red',
  );
  showNotification(message);
}

export function showInvalidOperAfterRootSignNotification() {
  const message = 'Помилка квадратного кореня';
  console.log(
    '%cнедопустимий формат: після знаку кореня не можна використовувати знаки : +, -, *, /, %, ^',
    'color:red',
  );
  showNotification(message);
}
