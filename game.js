const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const lobby = document.getElementById("lobby");
const startBtn = document.getElementById("startBtn");
const controlsDiv = document.getElementById("controls");

let mode = "";         
let playerCount = 0;
let gameStarted = false;
let keys = {};

// Disable pinch/double-tap zoom
document.addEventListener('touchmove', function(event) {
  if(event.scale !== undefined && event.scale !== 1) event.preventDefault();
}, { passive: false });
document.addEventListener('gesturestart', e=>e.preventDefault());

// Keyboard input
document.addEventListener("keydown", e => keys[e.key]=true);
document.addEventListener("keyup", e => keys[e.key]=false);

// Set mode & playerCount
function setMode(m){
  mode = m;
  if(mode=="solo") playerCount=1;
  else if(mode=="vs") playerCount=2;
  else if(mode=="3p") playerCount=3;
  startBtn.disabled=false;
}

// START GAME
startBtn.onclick = ()=>{
  if(playerCount>0){
    lobby.style.display="none";
    canvas.style.display="block";
    controlsDiv.style.display="flex";
    setupControls();
    gameStarted=true;
  }
};

// Player data
const players = [
  {x:canvas.width/2 -150, y:canvas.height-70, w:40, h:40, color:"lime", score:0, life:3, left:"a", right:"d", shoot:"w"},
  {x:canvas.width/2, y:canvas.height-70, w:40, h:40, color:"cyan", score:0, life:3, left:"ArrowLeft", right:"ArrowRight", shoot:"ArrowUp"},
  {x:canvas.width/2 +150, y:canvas.height-70, w:40, h:40, color:"orange", score:0, life:3, left:"j", right:"l", shoot:"i"}
];

let bullets = [];
let enemies = [];

const btnMap = [
  {left:"p1Left", shoot:"p1Shoot", right:"p1Right"},
  {left:"p2Left", shoot:"p2Shoot", right:"p2Right"},
  {left:"p3Left", shoot:"p3Shoot", right:"p3Right"}
];

// Setup tombol HP sesuai playerCount
function setupControls(){
  for(let i=0;i<3;i++){
    const div = document.getElementById(`p${i+1}Controls`);
    if(i<playerCount){
      div.style.display="flex";
      const btns = btnMap[i];
      document.getElementById(btns.left).addEventListener("touchstart",()=>keys[players[i].left]=true);
      document.getElementById(btns.left).addEventListener("touchend",()=>keys[players[i].left]=false);
      document.getElementById(btns.right).addEventListener("touchstart",()=>keys[players[i].right]=true);
      document.getElementById(btns.right).addEventListener("touchend",()=>keys[players[i].right]=false);
      document.getElementById(btns.shoot).addEventListener("touchstart",()=>keys[players[i].shoot]=true);
      document.getElementById(btns.shoot).addEventListener("touchend",()=>keys[players[i].shoot]=false);
    } else {
      div.style.display="none";
    }
  }
}

// Spawn musuh
setInterval(()=>{
  if(gameStarted) enemies.push({x:Math.random()*(canvas.width-40),y:-40,w:40,h:40,speed:2+Math.random()*2});
},1000);

// Tembak
let lastShot=[0,0,0];
function shoot(p,owner){
  const now = Date.now();
  if(now-lastShot[owner-1]>300){
    bullets.push({x:p.x+p.w/2-5, y:p.y, w:10, h:20, owner});
    lastShot[owner-1]=now;
  }
}

// Update
function update(){
  for(let i=0;i<playerCount;i++){
    const p = players[i];
    if(keys[p.left]) p.x-=6;
    if(keys[p.right]) p.x+=6;
    if(keys[p.shoot]) shoot(p,i+1);
    p.x = Math.max(0,Math.min(canvas.width-p.w,p.x));
  }

  bullets.forEach(b=>b.y-=8);
  bullets = bullets.filter(b=>b.y>-20);

  enemies.forEach(e=>e.y+=e.speed);
  enemies = enemies.filter(e=>e.y<canvas.height+40);

  // Bullet hit enemy
  enemies.forEach((e,ei)=>{
    bullets.forEach((b,bi)=>{
      if(b.x<b.x+e.w && b.x+b.w>e.x && b.y<e.y+e.h && b.y+b.h>e.y){
        players[b.owner-1].score++;
        enemies.splice(ei,1);
        bullets.splice(bi,1);
      }
    });
  });

  // Enemy hit player
  enemies.forEach((e,ei)=>{
    for(let i=0;i<playerCount;i++){
      const p = players[i];
      if(p.life>0 && e.x<p.x+p.w && e.x+e.w>p.x && e.y<p.y+p.h && e.y+e.h>p.y){
        p.life--;
        enemies.splice(ei,1);
        break;
      }
    }
  });
}

// Draw
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  players.slice(0,playerCount).forEach(p=>{
    if(p.life>0){
      ctx.fillStyle=p.color;
      ctx.fillRect(p.x,p.y,p.w,p.h);
    }
  });

  bullets.forEach(b=>{ctx.fillStyle="yellow";ctx.fillRect(b.x,b.y,b.w,b.h);});
  enemies.forEach(e=>{ctx.fillStyle="red";ctx.fillRect(e.x,e.y,e.w,e.h);});

  ctx.fillStyle="white";
  ctx.font="18px Arial";
  players.slice(0,playerCount).forEach((p,i)=>{
    ctx.fillText(`P${i+1}: ${p.score} ❤️${p.life}`,20+i*120,30);
  });

  if(players.slice(0,playerCount).every(p=>p.life<=0)){
    ctx.fillStyle="white";
    ctx.font="50px Arial";
    ctx.fillText("GAME OVER",canvas.width/2-150,canvas.height/2);
    gameStarted=false;
  }
}

// Loop
function loop(){
  if(gameStarted) update();
  draw();
  requestAnimationFrame(loop);
}
loop();