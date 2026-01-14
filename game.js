const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Jogadores
const paddleWidth = 10;
const paddleHeight = 80;

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

// Bola
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 7,
  speedX: 4,
  speedY: 4
};

// Controles
const keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Atualização
function update() {
  // Player 1 (W / S)
  if (keys["w"] && player1.y > 0) player1.y -= player1.speed;
  if (keys["s"] && player1.y < canvas.height - paddleHeight) player1.y += player1.speed;

  // Player 2 (↑ / ↓)
  if (keys["ArrowUp"] && player2.y > 0) player2.y -= player2.speed;
  if (keys["ArrowDown"] && player2.y < canvas.height - paddleHeight) player2.y += player2.speed;

  // Movimento da bola
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // Colisão com topo e fundo
  if (ball.y <= 0 || ball.y >= canvas.height) {
    ball.speedY *= -1;
  }

  // Colisão com jogadores
  if (
    ball.x - ball.radius < player1.x + paddleWidth &&
    ball.y > player1.y &&
    ball.y < player1.y + paddleHeight
  ) {
    ball.speedX *= -1;
  }

  if (
    ball.x + ball.radius > player2.x &&
    ball.y > player2.y &&
    ball.y < player2.y + paddleHeight
  ) {
    ball.speedX *= -1;
  }

  // Reset se sair da tela
  if (ball.x < 0 || ball.x > canvas.width) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
  }
}

// Desenho
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Jogadores
  ctx.fillStyle = "#fff";
  ctx.fillRect(player1.x, player1.y, paddleWidth, paddleHeight);
  ctx.fillRect(player2.x, player2.y, paddleWidth, paddleHeight);

  // Bola
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

// Loop do jogo
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
