//board
let tileSize = 32;
let rows = 20;
let columns = 32;

let board;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;
let context;

//ship
let shipWidth = tileSize*2;
let shipHeight = tileSize;
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize*2;

let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
}

let shipImg;
let shipVelocityX = tileSize;

//aliens
let alienArray = [];
let alienWidth = tileSize*2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;
let alienVelocityX = 0.5;

//bullets
let bulletArray = [];
let bulletVelocityY = -10;

//buff
let buff = null;
let buffVelocityY = 2;
let buffActive = false;
let buffExists = false;
let buffType = null;

let score = 0;
let gameOver = false;

//player stats
let lives = 3;
let shield = 100;
let shieldRegenRate = 0.1;
let isShieldActive = false;

//explosion effects
let explosions = [];
let explosionFrames = 5;
let explosionDuration = 10;

//different alien types
let alienTypes = {
    normal: { health: 1, points: 100, img: "./alien.png", shootRate: 0 },
    shooter: { health: 2, points: 200, img: "./alien-magenta.png", shootRate: 0.002 },
    tank: { health: 3, points: 300, img: "./alien-yellow.png", shootRate: 0 }
};

//alien bullets
let alienBullets = [];
let alienBulletVelocityY = 5;

// Background stars
let stars = [];
let starSpeed = 3;

//game stats
let level = 1;
let experiencePoints = 0;
let experienceToNextLevel = 1000;
let permanentBulletCount = 1; // Số lượng đạn cơ bản

//power ups
let powerUpTypes = {
    shield: { 
        color: "blue", 
        duration: 8000,
        draw: function(context, x, y, width, height) {
            context.fillStyle = this.color;
            context.beginPath();
            context.arc(x + width/2, y + height/2, width/2, 0, Math.PI * 2);
            context.fill();
            context.strokeStyle = "white";
            context.lineWidth = 2;
            context.stroke();
            
            // Vẽ biểu tượng shield
            context.beginPath();
            context.moveTo(x + width/2, y + height/4);
            context.lineTo(x + width*3/4, y + height/2);
            context.lineTo(x + width/2, y + height*3/4);
            context.lineTo(x + width/4, y + height/2);
            context.closePath();
            context.strokeStyle = "white";
            context.stroke();
        }
    },
    rapidFire: { 
        color: "red", 
        duration: 10000,
        draw: function(context, x, y, width, height) {
            context.fillStyle = this.color;
            context.fillRect(x, y, width, height);

            // Vẽ biểu tượng lightning
            context.beginPath();
            context.moveTo(x + width/2, y + height/4);
            context.lineTo(x + width*3/4, y + height/2);
            context.lineTo(x + width/2, y + height/2);
            context.lineTo(x + width*3/4, y + height*3/4);
            context.strokeStyle = "yellow";
            context.lineWidth = 2;
            context.stroke();
        }
    },
    piercingShot: { 
        color: "purple", 
        duration: 12000,
        draw: function(context, x, y, width, height) {
            context.fillStyle = this.color;
            context.fillRect(x, y, width, height);
            
            // Vẽ biểu tượng mũi tên xuyên
            context.beginPath();
            context.moveTo(x + width/4, y + height/2);
            context.lineTo(x + width*3/4, y + height/2);
            context.moveTo(x + width*2/3, y + height/3);
            context.lineTo(x + width*3/4, y + height/2);
            context.lineTo(x + width*2/3, y + height*2/3);
            context.strokeStyle = "white";
            context.lineWidth = 2;
            context.stroke();
        }
    },
    bomb: { 
        color: "orange", 
        duration: 0,
        draw: function(context, x, y, width, height) {
            context.fillStyle = this.color;
            context.beginPath();
            context.arc(x + width/2, y + height/2, width/2, 0, Math.PI * 2);
            context.fill();
            
            // Vẽ biểu tượng bom
            context.beginPath();
            context.moveTo(x + width/2, y + height/4);
            context.lineTo(x + width/2, y + height*3/4);
            context.moveTo(x + width/4, y + height/2);
            context.lineTo(x + width*3/4, y + height/2);
            context.strokeStyle = "black";
            context.lineWidth = 3;
            context.stroke();
        }
    },
    multiShot: {
        color: "green",
        duration: 8000,
        draw: function(context, x, y, width, height) {
            context.fillStyle = this.color;
            context.fillRect(x, y, width, height);
            
            // Vẽ biểu tượng 3 mũi tên
            for(let i = 0; i < 3; i++) {
                context.beginPath();
                context.moveTo(x + width*(i+1)/4, y + height*3/4);
                context.lineTo(x + width*(i+1)/4, y + height/4);
                context.lineTo(x + width*(i+0.7)/4, y + height/3);
                context.moveTo(x + width*(i+1)/4, y + height/4);
                context.lineTo(x + width*(i+1.3)/4, y + height/3);
                context.strokeStyle = "white";
                context.lineWidth = 2;
                context.stroke();
            }
        }
    },
    permanentBulletUp: {
        color: "cyan",
        duration: 0, // Vĩnh viễn
        draw: function(context, x, y, width, height) {
            context.fillStyle = this.color;
            context.fillRect(x, y, width, height);
            
            // Vẽ biểu tượng +1
            context.fillStyle = "white";
            context.font = "20px courier";
            context.fillText("+1", x + width/4, y + height*2/3);
            
            // Vẽ viên đạn
            context.fillStyle = "yellow";
            context.fillRect(x + width/4, y + height/4, width/2, height/3);
        }
    },
    slowAliens: {
        color: "lightblue",
        duration: 15000,
        draw: function(context, x, y, width, height) {
            context.fillStyle = this.color;
            context.fillRect(x, y, width, height);
            
            // Vẽ biểu tượng đồng hồ
            context.beginPath();
            context.arc(x + width/2, y + height/2, width/3, 0, Math.PI * 2);
            context.strokeStyle = "white";
            context.lineWidth = 2;
            context.stroke();
            
            // Vẽ kim đồng hồ
            context.beginPath();
            context.moveTo(x + width/2, y + height/2);
            context.lineTo(x + width/2, y + height/3);
            context.strokeStyle = "white";
            context.stroke();
        }
    }
};

function createStars() {
    for(let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * boardWidth,
            y: Math.random() * boardHeight,
            size: Math.random() * 3,
            speed: 1 + Math.random() * 2
        });
    }
}

function drawBackground() {
    // Vẽ nền đen
    context.fillStyle = "black";
    context.fillRect(0, 0, boardWidth, boardHeight);

    // Vẽ các ngôi sao
    stars.forEach(star => {
        context.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();

        // Di chuyển sao xuống dưới
        star.y += star.speed;

        // Nếu sao đi ra khỏi màn hình phía dưới, đặt lại vị trí ở trên
        if(star.y > boardHeight) {
            star.y = 0;
            star.x = Math.random() * boardWidth;
        }
    });
}

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    //load tất cả hình ảnh alien
    for (let type in alienTypes) {
        let img = new Image();
        img.src = alienTypes[type].img;
        alienTypes[type].imgObject = img;
    }

    shipImg = new Image();
    shipImg.src = "./ship.png";
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    createStars();
    createAliens();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        context.fillStyle = "white";
        context.font = "32px courier";
        context.fillText("GAME OVER", boardWidth/2 - 80, boardHeight/2);
        context.font = "16px courier";
        context.fillText("Press R to restart", boardWidth/2 - 70, boardHeight/2 + 30);
        return;
    }

    context.clearRect(0, 0, board.width, board.height);
    
    // Vẽ background với hiệu ứng sao
    drawBackground();

    //vẽ tàu
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    //vẽ shield nếu active
    if (isShieldActive) {
        context.strokeStyle = "rgba(0, 255, 255, 0.5)";
        context.lineWidth = 2;
        context.beginPath();
        context.arc(ship.x + ship.width/2, ship.y + ship.height/2, ship.width/1.5, 0, 2 * Math.PI);
        context.stroke();
    }

    //hồi shield
    if (shield < 100) {
        shield = Math.min(100, shield + shieldRegenRate);
    }

    //vẽ aliens
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            //di chuyển aliens
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX * 2;
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }

            //vẽ alien với hình ảnh tương ứng
            context.drawImage(alien.type.imgObject, alien.x, alien.y, alien.width, alien.height);

            //alien bắn đạn
            if (alien.type.shootRate > 0 && Math.random() < alien.type.shootRate) {
                alienBullets.push({
                    x: alien.x + alien.width/2,
                    y: alien.y + alien.height,
                    width: tileSize/8,
                    height: tileSize/2
                });
            }

            if (alien.y >= ship.y) gameOver = true;
        }
    }

    //update và vẽ đạn của người chơi
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        //kiểm tra va chạm với aliens
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                alien.health--;
                if (alien.health <= 0) {
                    bullet.used = true;
                    alien.alive = false;
                    alienCount--;
                    score += alien.type.points;
                    
                    //tạo hiệu ứng nổ
                    explosions.push({
                        x: alien.x,
                        y: alien.y,
                        frame: 0,
                        duration: explosionDuration
                    });

                    if (Math.random() < 0.2 && !buffExists) spawnBuff(alien.x, alien.y);
                }
                if (!bullet.piercing) bullet.used = true;
            }
        }
    }

    //update và vẽ đạn của alien
    for (let i = alienBullets.length - 1; i >= 0; i--) {
        let bullet = alienBullets[i];
        bullet.y += alienBulletVelocityY;
        context.fillStyle = "red";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        //kiểm tra va chạm với tàu
        if (detectCollision(bullet, ship)) {
            if (isShieldActive) {
                shield -= 20;
                if (shield <= 0) {
                    isShieldActive = false;
                }
            } else {
                lives--;
                if (lives <= 0) {
                    gameOver = true;
                    updateHighScores();
                }
            }
            alienBullets.splice(i, 1);
        } else if (bullet.y > boardHeight) {
            alienBullets.splice(i, 1);
        }
    }

    //update và vẽ hiệu ứng nổ
    for (let i = explosions.length - 1; i >= 0; i--) {
        let explosion = explosions[i];
        context.fillStyle = "orange";
        context.beginPath();
        context.arc(
            explosion.x + alienWidth/2,
            explosion.y + alienHeight/2,
            (explosion.frame / explosionFrames) * alienWidth/2,
            0,
            2 * Math.PI
        );
        context.fill();

        explosion.duration--;
        if (explosion.duration <= 0) {
            explosion.frame++;
            explosion.duration = explosionDuration;
            if (explosion.frame >= explosionFrames) {
                explosions.splice(i, 1);
            }
        }
    }

    //xóa đạn đã sử dụng
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift();
    }

    //update và vẽ power-up
    if (buff) {
        buff.y += buffVelocityY;
        powerUpTypes[buff.type].draw(context, buff.x, buff.y, buff.width, buff.height);

        if (detectCollision(ship, buff)) {
            activateBuff();
        }

        if (buff.y > boardHeight) {
            buff = null;
            buffExists = false;
        }
    }

    //tạo wave mới khi hết alien
    if (alienCount == 0) {
        score += alienColumns * alienRows * 100;
        alienColumns = Math.min(alienColumns + 1, columns/2 - 2);
        alienRows = Math.min(alienRows + 1, rows - 4);
        alienVelocityX += alienVelocityX > 0 ? 0.5 : -0.5;
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    //vẽ UI
    context.fillStyle = "white";
    context.font = "16px courier";
    context.fillText("Score: " + score, 5, 20);
    context.fillText("Lives: " + lives, 5, 40);
    context.fillText("Shield: " + Math.floor(shield) + "%", 5, 60);
    context.fillText("Level: " + level, 5, 80);
    context.fillText("Bullets: " + permanentBulletCount, 5, 110);
    
    // Vẽ thanh kinh nghiệm
    context.fillStyle = "gray";
    context.fillRect(5, 130, 150, 10);
    context.fillStyle = "yellow";
    context.fillRect(5, 130, (experiencePoints/experienceToNextLevel) * 150, 10);

    //vẽ high scores
    context.fillText("High Scores:", boardWidth - 150, 20);
    for (let i = 0; i < Math.min(5, highScores.length); i++) {
        context.fillText(highScores[i], boardWidth - 150, 40 + i * 20);
    }
}

function moveShip(e) {
    if (gameOver) return;

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX;
    } else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX;
    }
}

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            //chọn loại alien ngẫu nhiên, với xác suất khác nhau
            let rand = Math.random();
            let type;
            if (rand < 0.6) {
                type = alienTypes.normal;
            } else if (rand < 0.8) {
                type = alienTypes.shooter;
            } else {
                type = alienTypes.tank;
            }

            let alien = {
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true,
                health: type.health,
                type: type
            };
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if (gameOver) return;

    if (e.code == "Space") {
        if (buffActive && buffType === "multiShot") {
            // Khi có multiShot, bắn 3 hướng chính
            let angles = [-0.3, 0, 0.3];
            angles.forEach(mainAngle => {
                // Với mỗi hướng chính, bắn số đạn theo permanentBulletCount
                for(let i = 0; i < permanentBulletCount; i++) {
                    let spreadAngle = mainAngle + (i - (permanentBulletCount-1)/2) * 0.15;
                    let bullet = {
                        x: ship.x + shipWidth * 15/32,
                        y: ship.y,
                        width: tileSize/8,
                        height: tileSize/2,
                        used: false,
                        velocityX: Math.sin(spreadAngle) * 10,
                        velocityY: bulletVelocityY * Math.cos(spreadAngle)
                    };
                    bulletArray.push(bullet);
                }
            });
        } else {
            // Bắn thường theo dạng quạt
            for(let i = 0; i < permanentBulletCount; i++) {
                let spreadAngle = (i - (permanentBulletCount-1)/2) * 0.15;
                let bullet = {
                    x: ship.x + shipWidth * 15/32,
                    y: ship.y,
                    width: tileSize/8,
                    height: tileSize/2,
                    used: false,
                    velocityX: Math.sin(spreadAngle) * 10,
                    velocityY: bulletVelocityY * Math.cos(spreadAngle)
                };
                bulletArray.push(bullet);
            }
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function spawnBuff(x, y) {
    // Tăng tỉ lệ rơi vật phẩm tăng đạn
    let rand = Math.random();
    let type;
    
    if (rand < 0.4) { // 40% cơ hội rơi vật phẩm tăng đạn
        type = "permanentBulletUp";
    } else {
        // 60% còn lại chia đều cho các vật phẩm khác
        let otherTypes = Object.keys(powerUpTypes).filter(t => t !== "permanentBulletUp");
        type = otherTypes[Math.floor(Math.random() * otherTypes.length)];
    }
    
    buff = { 
        x: x,
        y: y,
        width: tileSize,
        height: tileSize,
        type: type
    };
    buffExists = true;
}

function activateBuff() {
    buffExists = false;
    buffActive = true;
    buffType = buff.type;
    buff = null;

    let originalAlienVelocity = alienVelocityX; // Lưu tốc độ gốc của alien

    switch(buffType) {
        case "shield":
            isShieldActive = true;
            shield = 100;
            setTimeout(() => {
                isShieldActive = false;
                buffActive = false;
            }, powerUpTypes.shield.duration);
            break;
        
        case "rapidFire":
            let originalVelocity = bulletVelocityY;
            bulletVelocityY *= 2;
            setTimeout(() => {
                bulletVelocityY = originalVelocity;
                buffActive = false;
            }, powerUpTypes.rapidFire.duration);
            break;
        
        case "piercingShot":
            bulletArray.forEach(bullet => bullet.piercing = true);
            setTimeout(() => {
                bulletArray.forEach(bullet => bullet.piercing = false);
                buffActive = false;
            }, powerUpTypes.piercingShot.duration);
            break;
        
        case "multiShot":
            setTimeout(() => {
                buffActive = false;
            }, powerUpTypes.multiShot.duration);
            break;
        
        case "bomb":
            alienArray.forEach(alien => {
                if (alien.alive) {
                    alien.alive = false;
                    alienCount--;
                    score += alien.type.points;
                    gainExperience(50);
                    explosions.push({
                        x: alien.x,
                        y: alien.y,
                        frame: 0,
                        duration: explosionDuration
                    });
                }
            });
            buffActive = false;
            break;
        
        case "permanentBulletUp":
            permanentBulletCount++;
            buffActive = false;
            break;
        
        case "slowAliens":
            alienVelocityX *= 0.5; // Giảm một nửa tốc độ
            setTimeout(() => {
                alienVelocityX = originalAlienVelocity;
                buffActive = false;
            }, powerUpTypes.slowAliens.duration);
            break;
    }
}

function updateHighScores() {
    if (score > 0) {
        highScores.push(score);
        highScores.sort((a, b) => b - a);
        if (highScores.length > 5) {
            highScores.length = 5;
        }
        localStorage.setItem("highScores", JSON.stringify(highScores));
    }
}

function resetGame() {
    lives = 3;
    shield = 100;
    isShieldActive = false;
    score = 0;
    gameOver = false;
    alienArray = [];
    bulletArray = [];
    alienBullets = [];
    explosions = [];
    buff = null;
    buffExists = false;
    alienColumns = 3;
    alienRows = 2;
    alienVelocityX = 0.5;
    ship.x = shipX;
    ship.y = shipY;
    createAliens();
    level = 1;
    experiencePoints = 0;
    experienceToNextLevel = 1000;
    bulletVelocityY = -10;
    shieldRegenRate = 0.1;
    permanentBulletCount = 1;
}

//thêm event listener cho phím R để restart game
document.addEventListener("keydown", function(e) {
    if (e.code === "KeyR" && gameOver) {
        resetGame();
    }
});

function gainExperience(points) {
    experiencePoints += points;
    if (experiencePoints >= experienceToNextLevel) {
        levelUp();
    }
}

function levelUp() {
    level++;
    experiencePoints -= experienceToNextLevel;
    experienceToNextLevel *= 1.5;
    
    // Tăng sức mạnh theo level
    bulletVelocityY -= 0.5;
    shieldRegenRate += 0.05;
    
    // Hiệu ứng level up
    context.fillStyle = "yellow";
    context.font = "32px courier";
    context.fillText("LEVEL UP!", boardWidth/2 - 80, boardHeight/2);
}
