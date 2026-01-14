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
// MODO DE JOGO
// ===================
let gameMode = null; // "2P" ou "AI"
let gameStarted = false;

// ===================
// JOGADORES
// ===================
const player1 = {
  x: 10,
  y: canvas.height / 2 - paddleHeight / 2,
  speed: 5
};

const player2 = {
  x: canvas.width - 20,
  y: canvas.height / 2 - paddleHeight / 2,
  speed: 5
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
// ÁUDIO (LOCAL)
// ===================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// -------- Piano --------
let pianoInterval = null;

function playPianoNote(freq, time = 0.8) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + time
  );

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + time);
}

function startPianoMusic() {
  if (pianoInterval) return;

  const melody = [
    [261.6, 329.6, 392.0], // C
    [293.7, 369.9, 440.0], // Dm
    [329.6, 415.3, 493.9], // Em
    [261.6, 349.2, 392.0]  // F
  ];

  let i = 0;
  pianoInterval = setInterval(() => {
    melody[i].forEach(freq => playPianoNote(freq));
    i = (i + 1) % melody.length;
  }, 900);
}

// -------- Efeitos --------
function beep(freq, duration) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.frequency.value = freq;
  osc.type = "square";

  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + duration
  );

  osc.connect(gain);
  gain.connect(audioCtx.destination);

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
// BOTÕES DE MODO
// ===================
const btn2P = document.createElement("button");
btn2P.textContent = "Jogar 2P";

const btnAI = document.createElement("button");
btnAI.textContent = "Jogar contra IA";

[btn2P, btnAI].forEach(btn => {
  btn.style.position = "absolute";
  btn.style.top = "20px";
  btn.style.padding = "10px 20px";
  btn.style.fontSize = "16px";
  document.body.appendChild(btn);
});

btn2P.style.left = "20px";
btnAI.style.left = "140px";

btn2P.onclick = () => startGame("2P");
btnAI.onclick = () => startGame("AI");

// ===================
// FUNÇÕES
// ===================
function startGame(mode) {
  gameMode = mode;
  gameStarted = true;
  score1 = 0;
  score2 = 0;
  resetBall();
  startPianoMusic();

  btn2P.remove();
  btnAI.remove();
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;

  const dir = Math.random() > 0.5 ? 1 : -1;
  ball.speedX = initialBallSpeed * dir;
  ball.speedY = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
}

function increaseBallSpeed() {
  if (Math.abs(ball.speedX) < maxBallSpeed)
    ball.speedX += speedIncrease * Math.sign(ball.speedX);

  if (Math.abs(ball.speedY) < maxBallSpeed)
    ball.speedY += speedIncrease * Math.sign(ball.speedY);
}

function checkWinner() {
  if (score1 === 10 || score2 === 10) {
    beep(200, 0.6);

    let msg;
    if (gameMode === "AI") {
      msg = score1 === 10 ? "Você venceu!" : "A IA venceu!";
    } else {
      msg = score1 === 10 ? "Jogador 1 venceu!" : "Jogador 2 venceu!";
    }

    alert(msg);
    score1 = 0;
    score2 = 0;
    resetBall();
  }
}

// ===================
// UPDATE
// ===================
function update() {
  if (!gameStarted) return;

  // Player 1
  if (keys["w"] && player1.y > 0) player1.y -= player1.speed;
  if (keys["s"] && player1.y < canvas.height - paddleHeight)
    player1.y += player1.speed;

  // Player 2 ou IA
  if (gameMode === "2P") {
    if (keys["ArrowUp"] && player2.y > 0) player2.y -= player2.speed;
    if (keys["ArrowDown"] && player2.y < canvas.height - paddleHeight)
      player2.y += player2.speed;
  } else {
    const center = player2.y + paddleHeight / 2;
    if (center < ball.y - 10) player2.y += aiSpeed;
    else if (center > ball.y + 10) player2.y -= aiSpeed;

    player2.y = Math.max(
      0,
      Math.min(canvas.height - paddleHeight, player2.y)
    );
  }

  // Bola
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height)
    ball.speedY *= -1;

  // Colisões
  if (
    ball.x - ball.radius < player1.x + paddleWidth &&
    ball.y > player1.y &&
    ball.y < player1.y + paddleHeight
  ) {
    ball.speedX *= -1;
    increaseBallSpeed();
    beep(600, 0.05);
  }

  if (
    ball.x + ball.radius > player2.x &&
    ball.y > player2.y &&
    ball.y < player2.y + paddleHeight
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
  ctx.fillRect(player2.x, player2.y, paddleWidth, paddleHeight);

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  if (!gameStarted) {
    ctx.font = "24px Arial";
    ctx.fillText(
      "Escolha um modo de jogo",
      canvas.width / 2 - 140,
      canvas.height / 2
    );
  }
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
