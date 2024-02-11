export function typeEffect() {
  const speed = 200;
  const title = document.querySelector('.title');
  const text = title.innerHTML;
  title.innerHTML = '';

  let i = 0;
  const timer = setInterval(function () {
    if (i < text.length) {
      title.append(text.charAt(i));
      i++;
    } else {
      clearInterval(timer);
    }
  }, speed);
}
