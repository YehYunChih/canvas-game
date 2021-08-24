const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector("#score");
const startGameBtn = document.querySelector("#startGame");
const toggleEl = document.querySelector("#toggle");
const showScoreEl = document.querySelector("#showScore");

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    c.fillStyle = this.color;
    c.fill();
  }
}

class Bullet extends Player {
  constructor(x, y, radius, color,velocity) {
    super(x, y, radius, color);
    this.velocity = velocity;
  }
  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Enemy extends Bullet {}

const friction = 0.98; 
class Particle extends Enemy {
  constructor(x, y, radius, color,velocity) {
    super(x, y, radius, color, velocity);
    this.alpha = 1;
  }
  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }
  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01;
  }
}

let halfW = canvas.width / 2;
let halfH = canvas.height / 2;

let player = new Player(halfW, halfH, 10, "white");
let bullets = [];
let enemies = [];
let particles = [];

function init() {
  player = new Player(canvas.width / 2, canvas.height / 2, 10, "white");
  bullets = [];
  enemies = [];
  particles = [];
  score = 0;
  scoreEl.innerHTML = score;
  showScoreEl.innerHTML = score;
}
let enemyInt;
function generateEnemies() {
 enemyInt = setInterval(() => {
  const radius = Math.random() * (30 - 4) + 4 ;
  let x;
  let y;
  if(Math.random() < 0.5) {
    x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
    y = Math.random() * canvas.height;
  } else {
    x = Math.random() * canvas.width;
    y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
  }
  const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
  const angle = Math.atan2(halfH - y, halfW - x)
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle)
  }
  enemies.push(new Enemy(x,y,radius,color,velocity))

 }, 1000);
 
}
let animationId;
let score = 0;
function animate() {
  animationId = requestAnimationFrame(animate);
  //c.clearRect(0,0,canvas.width,canvas.height); 
  c.fillStyle = "rgba(0,0,0,0.1)";
  c.fillRect(0,0,canvas.width,canvas.height);
  player.draw();
  particles.forEach((particle,pIndex) => {
    if(particle.alpha <= 0) {
      particles.splice(pIndex,1)
    } else {
      particle.update()
    } 
  });
  bullets.forEach((bullet, bIndex) => {
  bullet.update();
  
  if(
    bullet.x + bullet.radius < 0 || 
    bullet.x - bullet.radius > canvas.width ||
    bullet.y + bullet.radius < 0 ||
    bullet.y - bullet.radius > canvas.height
    ) {
    setTimeout(() => {
      bullets.splice(bIndex,1);
    }, 0);
  }
});
  enemies.forEach((enemy,eIndex) => {
    enemy.update();

    if(
      enemy.x + enemy.radius < 0 || 
      enemy.x - enemy.radius > canvas.width ||
      enemy.y + enemy.radius < 0 || 
      enemy.y - enemy.radius > canvas.height
      ) {
      setTimeout(() => {
        enemies.splice(eIndex,1);
      }, 0);
    }

    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    //endgame
    if(distance - player.radius - enemy.radius < 1) {
      clearInterval(enemyInt);
      cancelAnimationFrame(animationId);
      toggleEl.style.display = 'flex';
      showScoreEl.innerHTML = score;
    }

    //when bullet touch enemy
    bullets.forEach((bullet,bIndex) => {
      const distance = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
      if(distance - enemy.radius - bullet.radius < 1) {

        //exploration effect
        for(let i = 0; i < enemy.radius; i++) {
          particles.push(new Particle(bullet.x, bullet.y , Math.random() * 2,enemy.color,
          {
            x: (Math.random() - 0.5) * (Math.random() * 6),
            y: (Math.random() - 0.5) * (Math.random() * 6)
          }))
        }
        if(enemy.radius - 10 > 5) {
          //increse score
          score += 100;
          scoreEl.innerHTML = score;

          gsap.to(enemy, {
            radius: enemy.radius - 10
          })
          setTimeout(() => {
            bullets.splice(bIndex,1);
          }, 0);
        } else {
          //remove from scene altogether
          score += 250;
          scoreEl.innerHTML = score;
          setTimeout(() => {
            bullets.splice(bIndex,1);
            enemies.splice(eIndex,1);
          }, 0);
        }
      }
    })
});
}

window.addEventListener("click",(evt) => {
  const angle = Math.atan2(evt.clientY - halfH, evt.clientX - halfW)
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  }

  bullets.push(new Bullet(halfW, halfH, 5, "white", velocity));
  
});

startGameBtn.addEventListener("click", () => {
  init();
  animate();
  generateEnemies();
  toggleEl.style.display = 'none';
})


