let backgroundImg;

let player1, player2;
let player1Sprite, player2Sprite;
let GROUND_Y; // 地面高度

function preload() {
  // 載入精靈圖     
  backgroundImg = loadImage('background.png');
  player1Sprite = loadImage('pose1.png');
  player2Sprite = loadImage('pose_2.png');
 
  

  
}


class Fighter {
  constructor(x, y, sprite, controls, facingRight) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.controls = controls;
    this.facingRight = facingRight;
    
    // 角色狀態
    this.health = 100;
    this.speed = 10; // 增加速度以適應更大的畫面
    this.attacking = false;
    this.attackCooldown = 0;
    this.hitCooldown = 0;
    
    // 動畫相關
    this.frameWidth = 128;  // 增加角色大小
    this.frameHeight = 128; // 增加角色大小
    this.currentAnimation = 'idle';
    this.frameIndex = 1;
    this.animationDelay = 5;
    this.animationCounter = 1;
    
    // 動畫幀數
    this.animations = {
      idle: 6,
      walk: 4,
      attack: 4,
      hurt: 4
    };
    
    // 動畫在精靈圖中的Y位置
    this.animationRows = {
      idle: 0,
      walk: 1,
      attack: 2,
      hurt: 3
    };
  }
  
  
  update() {
    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.hitCooldown > 0) this.hitCooldown--;
    
    let moving = false;
    
    if (!this.attacking && this.hitCooldown === 0) {
      if (keyIsDown(this.controls.left)) {
        this.x -= this.speed;
        this.currentAnimation = 'walk';
        this.facingRight = false;
        moving = true;
      }
      if (keyIsDown(this.controls.right)) {
        this.x += this.speed;
        this.currentAnimation = 'walk';
        this.facingRight = true;
        moving = true;
      }
      
      if (keyIsDown(this.controls.attack) && this.attackCooldown === 0) {
        this.attacking = true;
        this.currentAnimation = 'attack';
        this.frameIndex = 0;
        this.attackCooldown = 30;
      }
    }
    
    this.animationCounter++;
    if (this.animationCounter >= this.animationDelay) {
      this.animationCounter = 0;
      this.frameIndex = (this.frameIndex + 1) % this.animations[this.currentAnimation];
      
      if (this.attacking && this.frameIndex === 0) {
        this.attacking = false;
      }
    }
    
    if (this.hitCooldown > 0) {
      this.currentAnimation = 'hurt';
    } else if (!this.attacking && !moving) {
      this.currentAnimation = 'idle';
    }
    
    // 確保角色不會超出畫面
    this.x = constrain(this.x, 0, width - this.frameWidth);
  }
  
  draw() {
    push();
    if (!this.facingRight) {
      translate(this.x + this.frameWidth, this.y);
      scale(-1, 1);
    } else {
      translate(this.x, this.y);
    }
    
    let sourceY = this.animationRows[this.currentAnimation] * this.frameHeight;
    let sourceX = this.frameIndex * this.frameWidth;
    
    image(this.sprite, 
          0, 0, 
          this.frameWidth, this.frameHeight,
          sourceX, sourceY,
          this.frameWidth, this.frameHeight);
    pop();
    
    this.drawHealthBar();
  }
  
  drawHealthBar() {
    let barWidth = width * 0.2; // 血量條寬度為螢幕寬度的20%
    let barHeight = height * 0.02; // 血量條高度為螢幕高度的2%
    let x = this.facingRight ? this.x : this.x - barWidth + this.frameWidth;
    
    // 血量條背景
    fill(100);
    rect(x, this.y - 40, barWidth, barHeight);
    
    // 血量條
    fill(255, 0, 0);
    rect(x, this.y - 40, barWidth, barHeight);
    fill(0, 255, 0);
    rect(x, this.y - 40, barWidth * (this.health/100), barHeight);
  }
  
  getAttackBox() {
    if (this.attacking) {
      let attackWidth = this.frameWidth * 0.6;
      if (this.facingRight) {
        return {
          x: this.x + this.frameWidth - 20,
          y: this.y,
          w: attackWidth,
          h: this.frameHeight
        };
      } else {
        return {
          x: this.x - attackWidth + 20,
          y: this.y,
          w: attackWidth,
          h: this.frameHeight
        };
      }
    }
    return null;
  }
  
  takeDamage(damage) {
    if (this.hitCooldown === 0) {
      this.health -= damage;
      this.hitCooldown = 20;
    }
  }
}


function setup() {
  // 創建全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 設定地面高度
  GROUND_Y = height * 0.7;
  
  const player1Controls = {
    left: 65,  // A
    right: 68, // D
    attack: 87 // W
  };
  
  const player2Controls = {
    left: LEFT_ARROW,
    right: RIGHT_ARROW,
    attack: UP_ARROW
  };
  
  // 根據螢幕大小調整玩家位置
  player1 = new Fighter(
    width * 0.2, // 左側20%位置
    GROUND_Y - 128, // 地面上方
    player1Sprite, 
    player1Controls, 
    true
  );
  
  player2 = new Fighter(
    width * 0.6, // 右側60%位置
    GROUND_Y - 128, 
    player2Sprite, 
    player2Controls, 
    false
  );
}

function draw() {
  // 繪製背景
  background(backgroundImg);
  
  // 繪製地面
 
 
  // 更新玩家
  player1.update();
  player2.update();
  
  // 檢測攻擊碰撞
  let p1Attack = player1.getAttackBox();
  let p2Attack = player2.getAttackBox();
  
  if (p1Attack && checkCollision(p1Attack, player2)) {
    player2.takeDamage(10);
  }
  if (p2Attack && checkCollision(p2Attack, player1)) {
    player1.takeDamage(10);
  }
  
  // 繪製玩家
  player1.draw();
  player2.draw();
  
  // 檢查遊戲結束
  if (player1.health <= 0 || player2.health <= 0) {
    textSize(height * 0.1); // 文字大小為螢幕高度的10%
    textAlign(CENTER, CENTER);
    fill(255, 0, 0);
    text('Game Over!', width/2, height/2);
    noLoop();
  }
}

function checkCollision(box1, player) {
  return box1.x < player.x + player.frameWidth &&
         box1.x + box1.w > player.x &&
         box1.y < player.y + player.frameHeight &&
         box1.y + box1.h > player.y;
}

// 視窗大小改變時調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  GROUND_Y = height * 0.7;
  
  // 重新調整玩家位置
  player1.y = GROUND_Y - 128;
  player2.y = GROUND_Y - 128;
}
