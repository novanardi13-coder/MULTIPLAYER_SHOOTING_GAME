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
let bgY = 0;

// Disable zoom
document.addEventListener('touchmove', e => { if(e.scale !== undefined && e.scale !== 1) e.preventDefault(); }, {passive:false});
document.addEventListener('gesturestart', e=>e.preventDefault());

// Keyboard input
document.addEventListener("keydown", e => keys[e.key]=true);
document.addEventListener("keyup", e => keys[e.key]=false);

// Set mode
function setMode(m){
  mode = m;
  playerCount = m=="solo"?1:(m=="vs"?2:3);
  startBtn.disabled=false;
}

// START GAME
startBtn.onclick = ()=>{
  if(playerCount>0){
    lobby.style.display="none";
    canvas.style.display="block";
    controlsDiv.style.display="flex";
    setupControls();  // pasang tombol HP
    gameStarted=true;
  }
};

// Player data
const players = [
  {x:canvas.width/2-150,y:canvas.height-70,w:40,h:40,color:"#0f0",score:0,life:3,left:"a",right:"d",shoot:"w"},
  {x:canvas.width/2,y:canvas.height-70,w:40,h:40,color:"#0ff",score:0,life:3,left:"ArrowLeft",right:"ArrowRight",shoot:"ArrowUp"},
  {x:canvas.width/2+150,y:canvas.height-70,w:40,h:40,color:"#f90",score:0,life:3,left:"j",right:"l",shoot:"i"}
];

let bullets = [];
let enemies = [];
let hitEffects = [];

const btnMap = [
  {left:"p1Left",shoot:"p1Shoot",right:"p1Right"},
  {left:"p2Left",shoot:"p2Shoot",right:"p2Right"},
  {left:"p3Left",shoot:"p3Shoot",right:"p3Right"}
];

// Setup tombol HP
function setupControls(){
  for(let i=0;i<3;i++){
    const div = document.getElementById(`p${i+1}Controls`);
    if(i<playerCount){
      div.style.display="flex";
      const btns = btnMap[i];

      const leftBtn = document.getElementById(btns.left);
      const rightBtn = document.getElementById(btns.right);
      const shootBtn = document.getElementById(btns.shoot);

      leftBtn.ontouchstart = ()=>keys[players[i].left]=true;
      leftBtn.ontouchend = ()=>keys[players[i].left]=false;
      rightBtn.ontouchstart = ()=>keys[players[i].right]=true;
      rightBtn.ontouchend = ()=>keys[players[i].right]=false;
      shootBtn.ontouchstart = ()=>keys[players[i].shoot]=true;
      shootBtn.ontouchend = ()=>keys[players[i].shoot]=false;
    } else {
      div.style.display="none";
    }
  }
}

// Spawn enemies
setInterval(()=>{
  if(gameStarted) enemies.push({x:Math.random()*(canvas.width-40),y:-40,w:40,h:40,speed:2+Math.random()*2});
},1000);

// Shoot
let lastShot=[0,0,0];
function shoot(p,owner){
  const now = Date.now();
  if(now-lastShot[owner-1]>300){
    bullets.push({x:p.x+p.w/2,y:p.y,w:10,h:20,owner});
    lastShot[owner-1]=now;
  }
}

// Hit effect
function addHitEffect(x,y){
  hitEffects.push({x,y,life:15,r:15});
}

// Update
function update(){
  bgY += 2;
  if(bgY>canvas.height) bgY=0;

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

  // Bullet hits enemy
  enemies.forEach((e,ei)=>{
    bullets.forEach((b,bi)=>{
      if(b.x<b.x+e.w && b.x+b.w>e.x && b.y<e.y+e.h && b.y+b.h>e.y){
        players[b.owner-1].score++;
        addHitEffect(e.x+e.w/2,e.y+e.h/2);
        enemies.splice(ei,1);
        bullets.splice(bi,1);
      }
    });
  });

  // Enemy hits player
  enemies.forEach((e,ei)=>{
    for(let i=0;i<playerCount;i++){
      const p = players[i];
      if(p.life>0 && e.x<p.x+p.w && e.x+e.w>p.x && e.y<p.y+p.h && e.y+e.h>p.y){
        p.life--;
        addHitEffect(p.x+p.w/2,p.y+p.h/2);
        enemies.splice(ei,1);
        break;
      }
    }
  });

  // Update hit effects
  hitEffects.forEach((h,i)=>{h.life--; h.r+=1;});
  hitEffects = hitEffects.filter(h=>h.life>0);
}

// Draw
function draw(){
  ctx.fillStyle="#111";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#222";
  for(let y=bgY;y<canvas.height;y+=50) ctx.fillRect(0,y,canvas.width,2);

  // Players
  players.slice(0,playerCount).forEach(p=>{
    if(p.life>0){
      ctx.fillStyle=p.color;
      ctx.fillRect(p.x,p.y,p.w,p.h);
    }
  });

  // Bullets
  bullets.forEach(b=>{
    ctx.fillStyle="yellow";
    ctx.beginPath();
    ctx.arc(b.x,b.y,5,0,2*Math.PI);
    ctx.fill();
  });

  // Enemies
  enemies.forEach(e=>{
    ctx.fillStyle="red";
    ctx.fillRect(e.x,e.y,e.w,e.h);
  });

  // Hit effects
  hitEffects.forEach(h=>{
    ctx.strokeStyle="white";
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.arc(h.x,h.y,h.r,0,2*Math.PI);
    ctx.stroke();
  });

  // HUD
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