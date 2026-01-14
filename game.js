const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ===================
// CONFIGURAÇÕES
// ===================
const paddleWidth = 10;
const paddleHeight = 80;

const initialBallSpeed = 4;
const maxBallSpeed = 10;
const speedIncrease = 0.4;

const aiSpeed = 4;

// ===================
// JOGADOR HUMANO
// ===================
const player1 = {
  x: 10,
  y: canvas.height / 2 - paddleHeight / 2,
  speed: 5
};

// ===================
// IA
// ===================
const ai = {
  x: canvas.width - 20,
  y: canvas.height / 2 - paddleHeight / 2
};

// ===================
// BOLA
// ===================
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 7,
  speedX: initialBallSpeed,
  speedY: initialBallSpeed
};

// ===================
// PONTUAÇÃO
// ===================
let score1 = 0;
let score2 = 0;

// ===================
// SOM (LOCAL)
// ===================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function beep(freq, duration) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.frequency.value = freq;
  osc.type = "square";

  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + duration
  );

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

// ===================
// CONTROLES
// ===================
const keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (audioCtx.state === "suspended") audioCtx.resume();
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// ===================
// FUNÇÕES
// ===================
function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;

  const direction = Math.random() > 0.5 ? 1 : -1;
  ball.speedX = initialBallSpeed * direction;
  ball.speedY = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
}

function increaseBallSpeed() {
  if (Math.abs(ball.speedX) < maxBallSpeed) {
    ball.speedX += speedIncrease * Math.sign(ball.speedX);
  }
  if (Math.abs(ball.speedY) < maxBallSpeed) {
    ball.speedY += speedIncrease * Math.sign(ball.speedY);
  }
}

function checkWinner() {
  if (score1 === 10 || score2 === 10) {
    beep(200, 0.6);

    alert(score1 === 10 ? "Você venceu!" : "A IA venceu!");

    score1 = 0;
    score2 = 0;
    resetBall();
  }
}

// ===================
// UPDATE
// ===================
function update() {
  // Jogador humano
  if (keys["w"] && player1.y > 0) player1.y -= player1.speed;
  if (keys["s"] && player1.y < canvas.height - paddleHeight)
    player1.y += player1.speed;

  // IA
  const aiCenter = ai.y + paddleHeight / 2;
  if (aiCenter < ball.y - 10) ai.y += aiSpeed;
  else if (aiCenter > ball.y + 10) ai.y -= aiSpeed;

  ai.y = Math.max(0, Math.min(canvas.height - paddleHeight, ai.y));

  // Movimento da bola
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // Colisão topo / fundo
  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
    ball.speedY *= -1;
  }

  // Colisão jogador
  if (
    ball.x - ball.radius < player1.x + paddleWidth &&
    ball.y > player1.y &&
    ball.y < player1.y + paddleHeight
  ) {
    ball.speedX *= -1;
    increaseBallSpeed();
    beep(600, 0.05);
  }

  // Colisão IA
  if (
    ball.x + ball.radius > ai.x &&
    ball.y > ai.y &&
    ball.y < ai.y + paddleHeight
  ) {
    ball.speedX *= -1;
    increaseBallSpeed();
    beep(600, 0.05);
  }

  // Pontuação
  if (ball.x < 0) {
    score2++;
    beep(400, 0.15);
    resetBall();
    checkWinner();
  }

  if (ball.x > canvas.width) {
    score1++;
    beep(400, 0.15);
    resetBall();
    checkWinner();
  }
}

// ===================
// DRAW
// ===================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = "30px Arial";
  ctx.fillText(score1, canvas.width / 4, 40);
  ctx.fillText(score2, canvas.width * 3 / 4, 40);

  ctx.fillRect(player1.x, player1.y, paddleWidth, paddleHeight);
  ctx.fillRect(ai.x, ai.y, paddleWidth, paddleHeight);

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

// ===================
// LOOP
// ===================
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
