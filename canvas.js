var canvas = document.getElementById("canvas");

canvas.width = window.innerWidth;
canvas.height = canvas.width/2.2;

var c = canvas.getContext("2d");
var x = 0;

let mouseX = 0;
let meteorSpawnRate = 800;
let passedTime = 0;

const projectiles = [];
const meteors = [];
class Meteor {
  rotation = 0
  rotationSpeed = 5
  constructor(posX, posY,image) {
    this.posX = posX;
    this.posY = posY;
    this.image = image;
    this.speed = Math.random() *5+2;
    this.rotationSpeed = Math.round(Math.random() * 10)-5;
  }
  update() {
    this.posY += this.speed;
    this.draw();
    this.rotation += this.rotationSpeed;
  }
  draw() {
    c.save();
    c.translate(this.posX, this.posY);
    c.rotate(this.rotation*Math.PI/360);
    drawImage(0, 0, 100, 100, this.image);
    c.restore();
  }
}
class Projectile {
  speed = 10
  exploded = false
  constructor(posX, posY) {
    this.posX = posX;
    this.posY = posY;
  }
  destroy() {
    projectiles.remove(this);
  }
  collision(){

  }
  update(){
    if (this.posY<-100||this.exploded){
      return;
    }
    this.posY -= this.speed;
    this.draw();
  }
  draw(){
    drawRect(this.posX, this.posY, 5, 60, "#880000");
  }
}
const plane = {
  loaded: 200,
  speed: 15,
  posX : canvas.width/2,
  posY : canvas.height/2,
  draw : function(){
    drawImage(this.posX,this.posY, 300, 300, "fplane.png");
  },
  update : function(){
    if(mouseX > this.posX +this.speed){
      this.posX += this.speed;
    }
    if(mouseX < this.posX -this.speed){
      this.posX -= this.speed;
    }
    this.loaded -= 20;
  },
  shoot : function(){
    if(this.loaded>0){
      return;
    }
    if(projectiles.length>10){
      projectiles.shift();
    }
    projectiles.push(new Projectile(this.posX,this.posY-50));
    this.loaded=200;
  }
};
function spawnMeteor(){
  if (meteors.length > 15 ) {
    meteors.shift();
    }
  meteors.push(new Meteor(Math.random()*canvas.width-canvas.width/2,
    -100, (Math.random()<0.5) ? "meteor2.png" : "meteor.png" ));
  passedTime = 0;

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
  c.fillStyle = "#222222";
  c.fillRect(0,0,canvas.width,canvas.height);
}
function start(){
  setInterval(update,20);
}
function update(){
  clear();
  for(var i=0;i<projectiles.length;i++){
    projectiles[i].update();
  };
  plane.update();
  plane.draw();
  for(var i=0;i<meteors.length;i++){
    meteors[i].update();
  };
  passedTime += 20;
  if(passedTime > meteorSpawnRate){
    spawnMeteor();
    console.log(meteors.length);
  }

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
