const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const crm = 4; // 4x res
const cw = 600;
const ch = 600;
const w = (ctx.canvas.width = cw * crm);
const h = (ctx.canvas.height = ch * crm);
canvas.style.width = '100vw';
canvas.style.height = '100vh';

let field, fieldSize, columns, rows, noiseZ, particles, hue;
hue, (noiseZ = 0);

let dff = false; // Show Flow-Field?
let sORp = false; // true=simplex / false=perlin
let fieldColor = 'rgb(70,70,70)'; // Flowfield Color
let particleColor = 'rgba(255,255,255,1)'; // Fixed Particle Color
let colorful = true; // Colorful Mode
let bgCol = 'rgba(0,0,0,1)'; // Background Color

let config = {
  particleCount: {
    cur: 5000,
    min: 2000,
    max: 8000,
  },
  particleSize: {
    cur: 1,
    min: 0.75,
    max: 2,
  },
  fieldSize: {
    cur: 40,
    min: 10,
    max: 100,
  },
  fieldForce: {
    cur: 0.5,
    min: 0.1,
    max: 1,
  },
  noiseSpeed: {
    cur: 0.001,
    min: 0.0002,
    max: 0.01,
  },
  hueBase: {
    cur: 250,
    min: 0,
    max: 360,
    // cur: 164,
    // min: 0,
    // max: 180,
  },
  maxSpeed: {
    cur: 2,
    min: 1,
    max: 3,
  },
};

class Particle {
  constructor(x, y) {
    this.pos = new Vector(x, y);
    this.vel = new Vector(Math.random() - 0.5, Math.random() - 0.5);
    this.acc = new Vector(0, 0);
    this.fieldSize = config.particleSize.cur;
  }

  move(acc) {
    if (acc) {
      this.acc.addTo(acc);
    }
    this.vel.addTo(this.acc);
    this.pos.addTo(this.vel);
    if (this.vel.getLength() > config.maxSpeed.cur) {
      this.vel.setLength(config.maxSpeed.cur);
    }
    this.acc.setLength(0);
  }

  draw() {
    ctx.fillRect(this.pos.x, this.pos.y, this.fieldSize, this.fieldSize);
  }

  wrap() {
    if (this.pos.x > w) {
      this.pos.x = 0;
    } else if (this.pos.x < -this.fieldSize) {
      this.pos.x = w - 1;
    }
    if (this.pos.y > h) {
      this.pos.y = 0;
    } else if (this.pos.y < -this.fieldSize) {
      this.pos.y = h - 1;
    }
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < config.particleCount.cur; i++) {
    let particle = new Particle(Math.random() * w, Math.random() * h);
    particles.push(particle);
  }
}

function initField() {
  field = new Array(columns);
  for (let x = 0; x < columns; x++) {
    field[x] = new Array(rows);
    for (let y = 0; y < rows; y++) {
      let v = new Vector(0, 0);
      field[x][y] = v;
    }
  }
}

function calcField() {
  if (sORp) {
    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        let angle = noise.simplex3(x / 20, y / 20, noiseZ) * Math.PI * 2;
        let length =
          noise.simplex3(x / 40 + 40000, y / 40 + 40000, noiseZ) *
          config.fieldForce.cur;
        field[x][y].setLength(length);
        field[x][y].setAngle(angle);
      }
    }
  } else {
    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        let angle = noise.perlin3(x / 20, y / 20, noiseZ) * Math.PI * 2;
        let length =
          noise.perlin3(x / 40 + 40000, y / 40 + 40000, noiseZ) *
          config.fieldForce.cur;
        field[x][y].setLength(length);
        field[x][y].setAngle(angle);
      }
    }
  }
}

function reset() {
  clear();
  noise.seed(Math.random());
  columns = Math.round(w / config.fieldSize.cur) + 1;
  rows = Math.round(h / config.fieldSize.cur) + 1;
  initParticles();
  initField();
}

function render() {
  calcField();
  noiseZ += config.noiseSpeed.cur;
  dff ? drawFlowField() : 0;
  drawParticles();
  requestAnimationFrame(render);
}

function drawParticles() {
  particles.forEach((p, index) => {
    colorful
      ? (ctx.fillStyle =
          'hsla(' +
          (config.hueBase.cur + (p.vel.x + p.vel.y) * 10) +
          ', 100%, 50%, 0.1)')
      : (ctx.fillStyle = particleColor);

    p.draw();
    let pos = p.pos.div(config.fieldSize.cur);
    let v;
    if (pos.x >= 0 && pos.x < columns && pos.y >= 0 && pos.y < rows) {
      v = field[Math.floor(pos.x)][Math.floor(pos.y)];
    }
    p.move(v);
    p.wrap();
  });
}

function drawFlowField() {
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      ctx.beginPath();
      ctx.strokeStyle = fieldColor;
      let x1 = x * config.fieldSize.cur;
      let y1 = y * config.fieldSize.cur;
      ctx.moveTo(x1, y1);
      ctx.lineTo(
        x1 + field[x][y].x * config.fieldSize.cur * 2,
        y1 + field[x][y].y * config.fieldSize.cur * 2,
      );
      ctx.stroke();
    }
  }
}

function clear() {
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = bgCol;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'lighter';
}

function randomize() {
  for (const conf in config) {
    const confCur = config[conf];
    let newCur =
      Math.random() * (config[conf].max - config[conf].min) + config[conf].min;
    config[conf].cur = newCur;
  }

  sORp = Math.random() < 0.5;
}

document.getElementById('canvas').addEventListener('click', function () {
  console.log('click');
  clear();
  randomize();
  reset();
});

ctx.globalCompositeOperation = 'lighter';
reset();
render();
