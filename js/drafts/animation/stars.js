var canvas = document.getElementById('canvas'),
  ctx = canvas.getContext('2d'),
  w = (canvas.width = window.innerWidth),
  h = (canvas.height = window.innerHeight),
  hue = 217,
  stars = [],
  count = 0,
  maxStars = 1500;

// START CANVAS CACHED GRADIENT
var canvas2 = document.createElement('canvas');
var w2 = (canvas2.width = 100);
var h2 = (canvas2.height = 100);
var ctx2 = canvas2.getContext('2d');
// draw a big beefy gradient in the center of the dummy canvas
var gradientCache = ctx2.createRadialGradient(
  w2 / 2,
  h2 / 2,
  0,
  w2 / 2,
  h2 / 2,
  w2 / 2,
);
gradientCache.addColorStop(0.025, '#fff');
gradientCache.addColorStop(0.1, 'hsl(' + hue + ', 61%, 33%)');
gradientCache.addColorStop(0.25, 'hsl(' + hue + ', 64%, 6%)');
gradientCache.addColorStop(1, 'transparent');
ctx2.fillStyle = gradientCache;
ctx2.beginPath();
ctx2.arc(w2 / 2, h2 / 2, w2 / 2, 0, Math.PI * 2);
ctx2.fill();
// END CANVAS CACHED GRADIENT

function random(min, max) {
  if (arguments.length < 2) {
    max = min;
    min = 0;
  }

  if (min > max) {
    var hold = max;
    max = min;
    min = hold;
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function maxOrbit(x, y) {
  var max = Math.max(x, y),
    diameter = Math.round(Math.sqrt(max * max + max * max));
  return diameter / 2;
}

var Star = function () {
  this.orbitRadius = random(maxOrbit(w, h));
  this.radius = random(60, this.orbitRadius) / 10;
  this.orbitX = w / 2;
  this.orbitY = h / 2;
  this.timePassed = random(0, maxStars);
  this.speed = random(this.orbitRadius) / 30000;
  this.alpha = random(2, 10) / 10;

  count++;
  stars[count] = this;
};

Star.prototype.draw = function () {
  var x = Math.sin(this.timePassed) * this.orbitRadius + this.orbitX,
    y = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY,
    twinkle = random(10);

  if (twinkle === 1 && this.alpha > 0) {
    this.alpha -= 0.05;
  } else if (twinkle === 2 && this.alpha < 1) {
    this.alpha += 0.05;
  }

  ctx.globalAlpha = this.alpha;
  // draw the cached gradient canvas image
  ctx.drawImage(
    canvas2,
    x - this.radius / 2,
    y - this.radius / 2,
    this.radius,
    this.radius,
  );
  this.timePassed += this.speed;
};

for (var i = 0; i < maxStars; i++) {
  new Star();
}

function animation() {
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = 'hsla(' + hue + ', 64%, 6%, 0.5)';
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = 'lighter';
  for (var i = 1, l = stars.length; i < l; i++) {
    stars[i].draw();
  }
  window.requestAnimationFrame(animation);
}

animation();
