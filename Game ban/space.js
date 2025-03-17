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
let gameMode = "single"; // "single" or "versus"

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

// AI ship
let aiShip = {
    x: shipX + boardWidth/3,
    y: shipY,
    width: shipWidth,
    height: shipHeight,
    active: false,
    score: 0,
    lives: 3,
    shield: 100,
    isShieldActive: false,
    bulletCount: 1,
    difficulty: "medium", // "easy", "medium", "hard"
    shootCooldown: 0,
    moveDirection: 1
};

let aiShipImg;
let aiEnabled = false;
let difficultySettings = {
    easy: {
        shootInterval: 30,
        moveSpeed: 3,
        reactionTime: 0.9,
        accuracy: 0.9
    },
    medium: {
        shootInterval: 30,
        moveSpeed: 3,
        reactionTime: 0.95,
        accuracy: 0.95,
        predictiveAiming: true
    },
    hard: {
        shootInterval: 30,
        moveSpeed: 4,
        reactionTime: 1,
        accuracy: 1,
        predictiveAiming: true,
        seekPowerUps: true
    }
};

let aiBulletArray = [];

// Khởi tạo highScores
let highScores = JSON.parse(localStorage.getItem("highScores")) || [];

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

    aiShipImg = new Image();
    aiShipImg.src = "./ship-ai.png"; // Sử dụng hình ảnh khác cho tàu AI nếu có
    aiShipImg.onerror = function() {
        aiShipImg.src = "./ship.png"; // Fallback nếu không có hình ảnh riêng
    };

    createStars();
    createAliens();
    setupGameMenu();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keydown", shoot);
}

function setupGameMenu() {
    // Xóa menu cũ nếu đã tồn tại
    let existingMenu = document.getElementById("game-menu");
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // Tạo menu chọn chế độ chơi và độ khó
    let menuDiv = document.createElement("div");
    menuDiv.id = "game-menu";
    menuDiv.style.position = "absolute";
    menuDiv.style.top = "10px";
    menuDiv.style.right = "10px";
    menuDiv.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    menuDiv.style.padding = "10px";
    menuDiv.style.borderRadius = "5px";
    menuDiv.style.color = "white";
    menuDiv.style.fontFamily = "courier";
    menuDiv.style.zIndex = "1000";
    
    // Chọn chế độ chơi
    let modeLabel = document.createElement("div");
    modeLabel.textContent = "Game Mode:";
    menuDiv.appendChild(modeLabel);
    
    let modeSelect = document.createElement("select");
    modeSelect.id = "game-mode";
    modeSelect.style.margin = "5px 0";
    modeSelect.style.padding = "3px";
    modeSelect.style.width = "100%";
    
    let singleOption = document.createElement("option");
    singleOption.value = "single";
    singleOption.textContent = "Single Player";
    modeSelect.appendChild(singleOption);
    
    let versusOption = document.createElement("option");
    versusOption.value = "versus";
    versusOption.textContent = "Versus AI";
    modeSelect.appendChild(versusOption);
    
    menuDiv.appendChild(modeSelect);
    
    // Chọn độ khó
    let diffLabel = document.createElement("div");
    diffLabel.textContent = "AI Difficulty:";
    menuDiv.appendChild(diffLabel);
    
    let diffSelect = document.createElement("select");
    diffSelect.id = "ai-difficulty";
    diffSelect.style.margin = "5px 0";
    diffSelect.style.padding = "3px";
    diffSelect.style.width = "100%";
    
    let easyOption = document.createElement("option");
    easyOption.value = "easy";
    easyOption.textContent = "Easy";
    diffSelect.appendChild(easyOption);
    
    let mediumOption = document.createElement("option");
    mediumOption.value = "medium";
    mediumOption.textContent = "Medium";
    diffSelect.appendChild(mediumOption);
    
    let hardOption = document.createElement("option");
    hardOption.value = "hard";
    hardOption.textContent = "Hard";
    diffSelect.appendChild(hardOption);
    
    menuDiv.appendChild(diffSelect);
    
    // Nút áp dụng
    let applyButton = document.createElement("button");
    applyButton.textContent = "Apply";
    applyButton.style.margin = "5px 0";
    applyButton.style.padding = "5px 10px";
    applyButton.style.width = "100%";
    applyButton.style.cursor = "pointer";
    applyButton.addEventListener("click", function() {
        gameMode = modeSelect.value;
        aiShip.difficulty = diffSelect.value;
        aiEnabled = (gameMode === "versus");
        
        // Reset game khi thay đổi chế độ
        resetGame();
        
        if (aiEnabled) {
            aiShip.active = true;
            console.log("AI enabled with difficulty: " + aiShip.difficulty);
        } else {
            aiShip.active = false;
            console.log("AI disabled");
        }
    });
    menuDiv.appendChild(applyButton);
    
    document.body.appendChild(menuDiv);
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

    // Vẽ tàu AI nếu đang ở chế độ versus
    if (aiEnabled && aiShip.active) {
        context.drawImage(aiShipImg, aiShip.x, aiShip.y, aiShip.width, aiShip.height);
        
        // Vẽ shield cho AI nếu active
        if (aiShip.isShieldActive) {
            context.strokeStyle = "rgba(255, 0, 0, 0.5)";
            context.lineWidth = 2;
            context.beginPath();
            context.arc(aiShip.x + aiShip.width/2, aiShip.y + aiShip.height/2, aiShip.width/1.5, 0, 2 * Math.PI);
            context.stroke();
        }
        
        // Cập nhật AI
        updateAI();
    }

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
    
    // Hồi shield cho AI
    if (aiEnabled && aiShip.shield < 100) {
        aiShip.shield = Math.min(100, aiShip.shield + shieldRegenRate);
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
                    gainExperience(alien.type.points / 10);
                    
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
    
    // Update và vẽ đạn của AI
    if (aiEnabled) {
        for (let i = 0; i < aiBulletArray.length; i++) {
            let bullet = aiBulletArray[i];
            bullet.x += bullet.velocityX;
            bullet.y += bullet.velocityY;
            context.fillStyle = "red";
            context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

            // Kiểm tra va chạm với aliens
            for (let j = 0; j < alienArray.length; j++) {
                let alien = alienArray[j];
                if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                    alien.health--;
                    if (alien.health <= 0) {
                        bullet.used = true;
                        alien.alive = false;
                        alienCount--;
                        aiShip.score += alien.type.points;
                        
                        // Tạo hiệu ứng nổ
                        explosions.push({
                            x: alien.x,
                            y: alien.y,
                            frame: 0,
                            duration: explosionDuration
                        });
                    }
                    if (!bullet.piercing) bullet.used = true;
                }
            }
        }
        
        // Xóa đạn AI đã sử dụng
        while (aiBulletArray.length > 0 && (aiBulletArray[0].used || aiBulletArray[0].y < 0)) {
            aiBulletArray.shift();
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
        } 
        // Kiểm tra va chạm với tàu AI
        else if (aiEnabled && aiShip.active && detectCollision(bullet, aiShip)) {
            if (aiShip.isShieldActive) {
                aiShip.shield -= 20;
                if (aiShip.shield <= 0) {
                    aiShip.isShieldActive = false;
                }
            } else {
                aiShip.lives--;
                if (aiShip.lives <= 0) {
                    aiShip.active = false;
                }
            }
            alienBullets.splice(i, 1);
        }
        else if (bullet.y > boardHeight) {
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

        // Kiểm tra va chạm với tàu người chơi
        if (detectCollision(ship, buff)) {
            activateBuff(ship);
        }
        // Kiểm tra va chạm với tàu AI
        else if (aiEnabled && aiShip.active && detectCollision(aiShip, buff)) {
            activateBuff(aiShip);
        }

        if (buff.y > boardHeight) {
            buff = null;
            buffExists = false;
        }
    }

    //tạo wave mới khi hết alien
    if (alienCount == 0) {
        score += alienColumns * alienRows * 100;
        if (aiEnabled && aiShip.active) {
            aiShip.score += alienColumns * alienRows * 50; // AI được ít điểm hơn khi clear wave
        }
        
        alienColumns = Math.min(alienColumns + 1, columns/2 - 2);
        alienRows = Math.min(alienRows + 1, rows - 4);
        alienVelocityX += alienVelocityX > 0 ? 0.5 : -0.5;
        alienArray = [];
        bulletArray = [];
        aiBulletArray = [];
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

    // Vẽ thông tin AI nếu đang ở chế độ versus
    if (aiEnabled) {
        context.fillStyle = "white";
        context.fillText("AI Score: " + aiShip.score, boardWidth - 150, 20);
        context.fillText("AI Lives: " + aiShip.lives, boardWidth - 150, 40);
        context.fillText("AI Shield: " + Math.floor(aiShip.shield) + "%", boardWidth - 150, 60);
        context.fillText("AI Difficulty: " + aiShip.difficulty, boardWidth - 150, 80);
        
        // Hiển thị người dẫn trước
        let leadingText = "";
        if (score > aiShip.score) {
            leadingText = "Player leading: +" + (score - aiShip.score);
            context.fillStyle = "lightgreen";
        } else if (aiShip.score > score) {
            leadingText = "AI leading: +" + (aiShip.score - score);
            context.fillStyle = "pink";
        } else {
            leadingText = "Scores tied!";
            context.fillStyle = "yellow";
        }
        context.fillText(leadingText, boardWidth/2 - 80, 20);
    } else {
        //vẽ high scores
        context.fillStyle = "white";
        context.fillText("High Scores:", boardWidth - 150, 20);
        for (let i = 0; i < Math.min(5, highScores.length); i++) {
            context.fillText(highScores[i], boardWidth - 150, 40 + i * 20);
        }
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
                        piercing: false,
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
                    piercing: false,
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

function activateBuff(targetShip) {
    buffExists = false;
    buffActive = true;
    buffType = buff.type;
    
    // Xác định xem đây là tàu người chơi hay AI
    const isPlayerShip = (targetShip === ship);
    
    buff = null;

    let originalAlienVelocity = alienVelocityX; // Lưu tốc độ gốc của alien

    switch(buffType) {
        case "shield":
            if (isPlayerShip) {
                isShieldActive = true;
                shield = 100;
                setTimeout(() => {
                    isShieldActive = false;
                    if (isPlayerShip) buffActive = false;
                }, powerUpTypes.shield.duration);
            } else {
                targetShip.isShieldActive = true;
                targetShip.shield = 100;
                setTimeout(() => {
                    targetShip.isShieldActive = false;
                }, powerUpTypes.shield.duration);
            }
            break;
        
        case "rapidFire":
            let originalVelocity = bulletVelocityY;
            bulletVelocityY *= 2;
            setTimeout(() => {
                bulletVelocityY = originalVelocity;
                if (isPlayerShip) buffActive = false;
            }, powerUpTypes.rapidFire.duration);
            break;
        
        case "piercingShot":
            if (isPlayerShip) {
                bulletArray.forEach(bullet => bullet.piercing = true);
                setTimeout(() => {
                    bulletArray.forEach(bullet => bullet.piercing = false);
                    buffActive = false;
                }, powerUpTypes.piercingShot.duration);
            } else {
                aiBulletArray.forEach(bullet => bullet.piercing = true);
                setTimeout(() => {
                    aiBulletArray.forEach(bullet => bullet.piercing = false);
                }, powerUpTypes.piercingShot.duration);
            }
            break;
        
        case "multiShot":
            if (isPlayerShip) {
                setTimeout(() => {
                    buffActive = false;
                }, powerUpTypes.multiShot.duration);
            }
            break;
        
        case "bomb":
            alienArray.forEach(alien => {
                if (alien.alive) {
                    alien.alive = false;
                    alienCount--;
                    if (isPlayerShip) {
                        score += alien.type.points;
                        gainExperience(50);
                    } else {
                        targetShip.score += alien.type.points;
                    }
                    explosions.push({
                        x: alien.x,
                        y: alien.y,
                        frame: 0,
                        duration: explosionDuration
                    });
                }
            });
            if (isPlayerShip) buffActive = false;
            break;
        
        case "permanentBulletUp":
            if (isPlayerShip) {
                permanentBulletCount++;
                buffActive = false;
            } else {
                targetShip.bulletCount++;
            }
            break;
        
        case "slowAliens":
            alienVelocityX *= 0.5; // Giảm một nửa tốc độ
            setTimeout(() => {
                alienVelocityX = originalAlienVelocity;
                if (isPlayerShip) buffActive = false;
            }, powerUpTypes.slowAliens.duration);
            break;
    }
}

function updateAI() {
    const settings = difficultySettings[aiShip.difficulty];
    
    // Di chuyển AI
    aiShip.shootCooldown--;
    
    // Kiểm tra xem có buff để nhặt không (chỉ ở mức độ khó)
    if (settings.seekPowerUps && buff && !buffExists) {
        const shouldSeekBuff = Math.random() < 0.8; // 80% cơ hội đi lấy buff
        if (shouldSeekBuff) {
            const targetX = buff.x;
            // Di chuyển đến vị trí của buff
        }
    }
    
    // Tìm alien gần nhất để nhắm bắn
    let targetAlien = findBestTarget(settings);
    
    if (targetAlien) {
        let targetX = targetAlien.x + targetAlien.width/2 - aiShip.width/2;
        
        // Dự đoán vị trí cho mức độ trung bình và khó
        if (settings.predictiveAiming) {
            const bulletTravelTime = Math.abs(targetAlien.y - aiShip.y) / Math.abs(bulletVelocityY);
            const predictedX = targetAlien.x + (alienVelocityX * bulletTravelTime);
            targetX = predictedX + targetAlien.width/2 - aiShip.width/2;
            
            // Kiểm tra xem alien có đổi hướng không
            if (predictedX + targetAlien.width >= boardWidth || predictedX <= 0) {
                targetX = targetAlien.x + targetAlien.width/2 - aiShip.width/2;
            }
        }
        
        // Thêm độ chính xác dựa trên độ khó
        const accuracy = settings.accuracy;
        const targetWithError = targetX + (Math.random() * 2 - 1) * (1 - accuracy) * 100;
        
        // Di chuyển tàu AI
        if (Math.abs(aiShip.x - targetWithError) > settings.moveSpeed) {
            if (aiShip.x < targetWithError) {
                aiShip.x += settings.moveSpeed;
            } else {
                aiShip.x -= settings.moveSpeed;
            }
        }
        
        // Giới hạn không cho tàu đi ra ngoài màn hình
        aiShip.x = Math.max(0, Math.min(boardWidth - aiShip.width, aiShip.x));
        
        // Bắn đạn nếu hết thời gian cooldown và có xác suất bắn dựa trên độ khó
        if (aiShip.shootCooldown <= 0 && Math.random() < settings.reactionTime) {
            aiShoot();
            aiShip.shootCooldown = settings.shootInterval;
        }
    } else {
        // Nếu không có alien, di chuyển qua lại
        aiShip.x += settings.moveSpeed * aiShip.moveDirection;
        
        // Đổi hướng nếu chạm biên
        if (aiShip.x <= 0 || aiShip.x + aiShip.width >= boardWidth) {
            aiShip.moveDirection *= -1;
        }
    }
    
    // Né tránh đạn của alien
    if (aiShip.difficulty !== "easy") {
        for (let i = 0; i < alienBullets.length; i++) {
            let bullet = alienBullets[i];
            // Nếu đạn đang đi xuống và gần tàu AI
            if (Math.abs(bullet.x - (aiShip.x + aiShip.width/2)) < aiShip.width && 
                bullet.y < aiShip.y && bullet.y > aiShip.y - 100) {
                // Né sang trái hoặc phải tùy thuộc vào vị trí hiện tại
                const dodgeDirection = (aiShip.x > boardWidth/2) ? -1 : 1;
                aiShip.x += settings.moveSpeed * 2 * dodgeDirection;
                break;
            }
        }
    }
}

function findBestTarget(settings) {
    let bestTarget = null;
    let bestScore = -Infinity;
    
    for (let i = 0; i < alienArray.length; i++) {
        if (alienArray[i].alive) {
            const alien = alienArray[i];
            let score = 0;
            
            // Tính điểm dựa trên khoảng cách
            const dx = alien.x + alien.width/2 - (aiShip.x + aiShip.width/2);
            const dy = alien.y - aiShip.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            score -= distance * 0.5; // Ưu tiên alien gần hơn
            
            // Ưu tiên alien nguy hiểm (shooter) ở mức độ trung bình và khó
            if (settings.predictiveAiming && alien.type === alienTypes.shooter) {
                score += 300;
            }
            
            // Ưu tiên alien có nhiều máu ở mức độ khó
            if (settings.seekPowerUps && alien.health > 1) {
                score += alien.health * 100;
            }
            
            // Ưu tiên alien gần với buff (nếu có) ở mức độ khó
            if (settings.seekPowerUps && buff) {
                const distanceToBuff = Math.sqrt(
                    Math.pow(alien.x - buff.x, 2) + 
                    Math.pow(alien.y - buff.y, 2)
                );
                if (distanceToBuff < 200) {
                    score += (200 - distanceToBuff);
                }
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestTarget = alien;
            }
        }
    }
    
    return bestTarget;
}

function aiShoot() {
    if (!aiShip.active) return;
    
    // Bắn đạn dựa trên số lượng đạn của AI
    for(let i = 0; i < aiShip.bulletCount; i++) {
        let spreadAngle = (i - (aiShip.bulletCount-1)/2) * 0.15;
        let bullet = {
            x: aiShip.x + aiShip.width/2,
            y: aiShip.y,
            width: tileSize/8,
            height: tileSize/2,
            used: false,
            piercing: false,
            velocityX: Math.sin(spreadAngle) * 10,
            velocityY: bulletVelocityY * Math.cos(spreadAngle)
        };
        aiBulletArray.push(bullet);
    }
}

function resetAiShip() {
    aiShip.x = shipX + boardWidth/3;
    aiShip.y = shipY;
    aiShip.lives = 3;
    aiShip.shield = 100;
    aiShip.isShieldActive = false;
    aiShip.score = 0;
    aiShip.bulletCount = 1;
    aiShip.shootCooldown = 0;
    aiShip.moveDirection = 1;
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
    aiBulletArray = [];
    alienBullets = [];
    explosions = [];
    buff = null;
    buffExists = false;
    alienColumns = 3;
    alienRows = 2;
    alienVelocityX = 0.5;
    ship.x = shipX;
    ship.y = shipY;
    
    if (aiEnabled) {
        resetAiShip();
        aiShip.active = true;
    } else {
        aiShip.active = false;
    }
    
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

// Ngăn chặn hành vi mặc định của phím Space
window.addEventListener("keydown", function(e) {
    if(e.code === "Space") {
        e.preventDefault();
    }
});
