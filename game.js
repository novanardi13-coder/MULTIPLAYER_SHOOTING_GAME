const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const lobby = document.getElementById("lobby");
const startBtn = document.getElementById("startBtn");

let playerCount = 0;
let gameStarted = false;
let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function setPlayers(n) {
  playerCount = n;
  startBtn.disabled = false;
}

startBtn.onclick = () => {
  lobby.style.display = "none";
  canvas.style.display = "block";
  gameStarted = true;
};

// PLAYER DATA
const players = [
  { x: canvas.width/2 - 150, y: canvas.height-60, w:40, h:40, color:"lime",   left:"a", right:"d", shoot:"w", score:0 },
  { x: canvas.width/2,       y: canvas.height-60, w:40, h:40, color:"cyan",   left:"ArrowLeft", right:"ArrowRight", shoot:"ArrowUp", score:0 },
  { x: canvas.width/2 + 150, y: canvas.height-60, w:40, h:40, color:"orange", left:"j", right:"l", shoot:"i", score:0 }
];

let bullets = [];
let enemies = [];

// Spawn musuh
setInterval(() => {
  if (gameStarted) {
    enemies.push({
      x: Math.random() * (canvas.width - 40),
      y: -40,
      w: 40,
      h: 40,
      speed: 2 + Math.random() * 2
    });
  }
}, 1000);

// TEMBAK
let lastShot = [0,0,0];
function shoot(p, owner) {
  const now = Date.now();
  if (now - lastShot[owner-1] > 300) {
    bullets.push({
      x: p.x + p.w/2 - 5,
      y: p.y,
      w: 10,
      h: 20,
      owner
    });
    lastShot[owner-1] = now;
  }
}

// UPDATE
function update() {
  for (let i = 0; i < playerCount; i++) {
    const p = players[i];
    if (keys[p.left])  p.x -= 6;
    if (keys[p.right]) p.x += 6;
    if (keys[p.shoot]) shoot(p, i+1);
    p.x = Math.max(0, Math.min(canvas.width - p.w, p.x));
  }

  bullets.forEach(b => b.y -= 8);
  bullets = bullets.filter(b => b.y > -20);

  enemies.forEach(e => e.y += e.speed);
  enemies = enemies.filter(e => e.y < canvas.height + 40);

  enemies.forEach((e, ei) => {
    bullets.forEach((b, bi) => {
      if (
        b.x < e.x + e.w &&
        b.x + b.w > e.x &&
        b.y < e.y + e.h &&
        b.y + b.h > e.y
      ) {
        players[b.owner-1].score++;
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
      }
    });
  });
}

// DRAW
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  players.slice(0, playerCount).forEach(p => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.w, p.h);
  });

  ctx.fillStyle = "yellow";
  bullets.forEach(b => ctx.fillRect(b.x,b.y,b.w,b.h));

  ctx.fillStyle = "red";
  enemies.forEach(e => ctx.fillRect(e.x,e.y,e.w,e.h));

  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  players.slice(0, playerCount).forEach((p,i)=>{
    ctx.fillText(`P${i+1}: ${p.score}`, 20 + i*100, 30);
  });
}

// LOOP
function loop() {
  if (gameStarted) {
    update();
    draw();
  }
  requestAnimationFrame(loop);
}
loop();