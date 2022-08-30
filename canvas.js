var canvas = document.getElementById("canvas");
var restartButton = document.getElementById("restartButton");
var prompt = document.getElementById("prompt");

var Scores;
canvas.width = window.innerWidth;
canvas.height = canvas.width/2.2;

var c = canvas.getContext("2d");

let mouseX = 0;
let score = 0;
let meteorSpawnRate = 800;
let meteorSpeed = 2;
let passedTime = 0;
const cannonSound = new sound("sounds/laser.mp3");
const explosionSound = new sound("sounds/explosion.mp3");
const crashSound = new sound("sounds/crash.mp3");
const projectiles = [];
const meteors = [];
const stars = [];
class Meteor {
  rotation = 0
  rotationSpeed = 5
  destroyed = false
  constructor(posX, posY,image) {
    this.posX = posX;
    this.posY = posY;
    this.image = image;
    this.speed = (Math.random() *5+meteorSpeed)/2000*canvas.width;
    this.rotationSpeed = Math.round(Math.random() * 10)-5;
  }
  update() {
    if (this.destroyed||this.posY>canvas.width+50)return;
    this.posY += this.speed;
    this.draw();
    this.rotation += this.rotationSpeed;
  }
  draw() {
    c.save();
    c.translate(this.posX, this.posY);
    c.rotate(this.rotation*Math.PI/360);
    drawImage(0, 0, 100/2000*canvas.width, 100/2000*canvas.width, this.image);
    c.restore();
  }
}
class Projectile {
  speed = 10/2000*canvas.width
  exploded = false
  constructor(posX, posY) {
    this.posX = posX;
    this.posY = posY;
  }
  destroy() {
    projectiles.remove(this);
  }
  collision(meteor){
    if(meteor.destroyed)return;
    if(Math.sqrt(Math.pow(Math.abs(this.posX-meteor.posX),2)
      +Math.pow(Math.abs(this.posY-meteor.posY),2))<50){
        meteor.destroyed = true;
        this.exploded = true;
        score+=100;
        explosionSound.stop();
        explosionSound.play();
        if(score%1000==1){
          meteorSpawnRate *0.8;
          meteorSpeed+2;
        }
    }

  }
  update(){
    if (this.posY<-50||this.exploded){
      return;
    }

    this.posY -= this.speed;
    for(var i = 0;i<meteors.length;i++){
      this.collision(meteors[i]);
    }
    this.draw();
  }
  draw(){
    drawRect(this.posX, this.posY, 5, 40/2000*canvas.width, "#880000");
  }
}
class Star{
  constructor(posX, posY){
    this.posX = posX;
    this.posY = posY;
  }
  update() {
    if (this.posY>canvas.height){
      this.posY = 0;
      this.posX = Math.round(Math.random()*canvas.width);
    }
    this.posY += 1;
    this.draw();
  }
  draw() {
    drawRect(this.posX, this.posY, 2,2,"white");
  }
}
const plane = {
  loaded: 200,
  speed: 15/2000*canvas.width,
  posX : canvas.width/2,
  posY : canvas.height+canvas.height/2,
  draw : function(){
    drawImage(this.posX,this.posY, 300/2000*canvas.width, 300/2000*canvas.width, "fplane.png");
  },
  update : function(){
    if(mouseX > this.posX +this.speed){
      this.posX += this.speed;
    }
    if(mouseX < this.posX -this.speed){
      this.posX -= this.speed;
    }
    this.loaded -= 20;
    this.draw();
  },
  shoot : function(){
    if(this.loaded>0){
      return;
    }
    if(projectiles.length>10){
      projectiles.shift();
    }
    projectiles.push(new Projectile(this.posX,this.posY-130/2000*canvas.width));
    cannonSound.play();
    this.loaded=200;
  },
  checkCollision : function(meteor){
    if(meteor.destroyed)return;
    var xDist = Math.abs(this.posX-meteor.posX);
    var yDist = Math.abs((this.posY)-meteor.posY);
    if(yDist > 200/2000*canvas.width||xDist > 200/2000*canvas.width)return;
    if(yDist+xDist<180/2000*canvas.width){
      console.log("ouch");
      meteor.destroyed= true;
      this.crash();
    }
  },
  crash : function(){
    crashSound.play();
    stop();
  }
};

function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
}
function spawnMeteor(){
  if (meteors.length > 25 ) {
    meteors.shift();
  }
  meteors.push(new Meteor(Math.random()*canvas.width,
    -100, (Math.random()<0.5) ? "meteor2.png" : "meteor.png" ));
  passedTime = 0;

}
function spawnStars(){
  for(var s=0;s<50;s++){
    stars.push(new Star(Math.round(Math.random()*canvas.width),
    Math.round(Math.random()*canvas.height)));
  }

}
function drawRect(posx, posy, width, height, color){
  c.fillStyle = color;
  c.fillRect(posx-width/2,posy-height/2,width,height);
}
function drawImage(posx, posy, width, height, src){
  image = new Image();
  image.src = src;
  c.drawImage(image, posx-width/2,posy-height/2,width,height);
}

function clear(){
  c.fillStyle = "#0a0a0a";
  c.fillRect(0,0,canvas.width,canvas.height);
}
function start(){
  spawnStars();
  this.interval = setInterval(update,20);
}
function restart(){
  meteorSpawnRate = 800;
  meteorSpeed = 2;
  prompt.style.display = "none";
  score = 0;
  for(var i=0;i<meteors.length;i++){
    meteors[i].destroyed = true;
  }
  for(var i=0;i<projectiles.length;i++){
    projectiles[i].exploded = true;
  }
  start();
}
function stop(){
  clearInterval(this.interval);
  prompt.style.display = "block";
  var message = "Ouuups! You crashed! Your score was " + score + "!";
  document.getElementById("message").innerHTML = message;

}
function update(){
  clear();
  for(var i=0;i<stars.length;i++){
    stars[i].update();
  }


  for(var i=0;i<projectiles.length;i++){
    projectiles[i].update();
  }
  plane.update();
  for(var i=0;i<meteors.length;i++){
    meteors[i].update();
    plane.checkCollision(meteors[i]);
  }
  passedTime += 20;
  if(passedTime > meteorSpawnRate){
    spawnMeteor();
  }
  updateScore();

}
function updateScore(){
    c.font = 40/2000*canvas.width + "px Verdana";
    c.fillStyle = "yellow";
    c.fillText("Score: "+score, 1600/2000*canvas.width, 50/2000*canvas.width);
}
function shoot(){
  plane.shoot();
  console.log(projectiles.length);
}
function move(event){
  var rect = canvas.getBoundingClientRect();

  mouseX = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
}

function draw(){
  drawImage(event.clientX,canvas.height/2, 200, 200, "fplane.png");
  /*drawRect(200,canvas.height/2, 200, 200, "#111111");*/
  x+=5;
}
start();
