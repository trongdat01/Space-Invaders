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

// Thêm biến buff riêng cho shipAI
let buffAI = null;
let buffAIVelocityY = 2;
let buffAIActive = false;
let buffAIExists = false;
let buffAIType = null;

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
        img: null,
        draw: function(context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback vẽ shield nếu không tải được hình ảnh
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
        }
    },
    rapidFire: { 
        color: "red", 
        duration: 10000,
        img: null,
        draw: function(context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
                context.beginPath();
                context.moveTo(x + width/2, y + height/4);
                context.lineTo(x + width*3/4, y + height/2);
                context.lineTo(x + width/2, y + height/2);
                context.lineTo(x + width*3/4, y + height*3/4);
                context.strokeStyle = "yellow";
                context.lineWidth = 2;
                context.stroke();
            }
        }
    },
    piercingShot: { 
        color: "purple", 
        duration: 12000,
        img: null,
        draw: function(context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
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
        }
    },
    bomb: { 
        color: "orange", 
        duration: 0,
        img: null,
        draw: function(context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.beginPath();
                context.arc(x + width/2, y + height/2, width/2, 0, Math.PI * 2);
                context.fill();
                context.beginPath();
                context.moveTo(x + width/2, y + height/4);
                context.lineTo(x + width/2, y + height*3/4);
                context.moveTo(x + width/4, y + height/2);
                context.lineTo(x + width*3/4, y + height/2);
                context.strokeStyle = "black";
                context.lineWidth = 3;
                context.stroke();
            }
        }
    },
    multiShot: {
        color: "green",
        duration: 8000,
        img: null,
        draw: function(context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
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
        }
    },
    permanentBulletUp: {
        color: "cyan",
        duration: 0, // Vĩnh viễn
        img: null,
        draw: function(context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
                context.fillStyle = "white";
                context.font = "20px courier";
                context.fillText("+1", x + width/4, y + height*2/3);
                context.fillStyle = "yellow";
                context.fillRect(x + width/4, y + height/4, width/2, height/3);
            }
        }
    },
    slowAliens: {
        color: "lightblue",
        duration: 15000,
        img: null,
        draw: function(context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
                context.beginPath();
                context.arc(x + width/2, y + height/2, width/3, 0, Math.PI * 2);
                context.strokeStyle = "white";
                context.lineWidth = 2;
                context.stroke();
                context.beginPath();
                context.moveTo(x + width/2, y + height/2);
                context.lineTo(x + width/2, y + height/3);
                context.strokeStyle = "white";
                context.stroke();
            }
        }
    }
};

// Power-up riêng cho AI
let powerUpAITypes = {
    shield: { 
        color: "blue", 
        duration: 8000,
        img: null,
        draw: function(context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback vẽ shield nếu không tải được hình ảnh
                context.fillStyle = this.color;
                context.beginPath();
                context.arc(x + width/2, y + height/2, width/2, 0, Math.PI * 2);
                context.fill();
                context.strokeStyle = "red"; // Màu đỏ để phân biệt với buff người chơi
                context.lineWidth = 2;
                context.stroke();
                
                // Vẽ biểu tượng shield
                context.beginPath();
                context.moveTo(x + width/2, y + height/4);
                context.lineTo(x + width*3/4, y + height/2);
                context.lineTo(x + width/2, y + height*3/4);
                context.lineTo(x + width/4, y + height/2);
                context.closePath();
                context.strokeStyle = "red";
                context.stroke();
            }
        }
    },
    rapidFire: { 
        color: "red", 
        duration: 10000,
        img: null,
        draw: function(context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
                context.beginPath();
                context.moveTo(x + width/2, y + height/4);
                context.lineTo(x + width*3/4, y + height/2);
                context.lineTo(x + width/2, y + height/2);
                context.lineTo(x + width*3/4, y + height*3/4);
                context.strokeStyle = "red";
                context.lineWidth = 2;
                context.stroke();
            }
        }
    },
    piercingShot: { 
        color: "purple", 
        duration: 12000,
        img: null,
        draw: function(context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
                context.beginPath();
                context.moveTo(x + width/4, y + height/2);
                context.lineTo(x + width*3/4, y + height/2);
                context.moveTo(x + width*2/3, y + height/3);
                context.lineTo(x + width*3/4, y + height/2);
                context.lineTo(x + width*2/3, y + height*2/3);
                context.strokeStyle = "red";
                context.lineWidth = 2;
                context.stroke();
            }
        }
    },
    bomb: { 
        color: "orange", 
        duration: 0,
        img: null,
        draw: function(context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.beginPath();
                context.arc(x + width/2, y + height/2, width/2, 0, Math.PI * 2);
                context.fill();
                context.beginPath();
                context.moveTo(x + width/2, y + height/4);
                context.lineTo(x + width/2, y + height*3/4);
                context.moveTo(x + width/4, y + height/2);
                context.lineTo(x + width*3/4, y + height/2);
                context.strokeStyle = "red";
                context.lineWidth = 3;
                context.stroke();
            }
        }
    },
    multiShot: {
        color: "green",
        duration: 8000,
        img: null,
        draw: function(context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
                for(let i = 0; i < 3; i++) {
                    context.beginPath();
                    context.moveTo(x + width*(i+1)/4, y + height*3/4);
                    context.lineTo(x + width*(i+1)/4, y + height/4);
                    context.lineTo(x + width*(i+0.7)/4, y + height/3);
                    context.moveTo(x + width*(i+1)/4, y + height/4);
                    context.lineTo(x + width*(i+1.3)/4, y + height/3);
                    context.strokeStyle = "red";
                    context.lineWidth = 2;
                    context.stroke();
                }
            }
        }
    },
    permanentBulletUp: {
        color: "cyan",
        duration: 0, // Vĩnh viễn
        img: null,
        draw: function(context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
                context.fillStyle = "red";
                context.font = "20px courier";
                context.fillText("+1", x + width/4, y + height*2/3);
                context.fillStyle = "red";
                context.fillRect(x + width/4, y + height/4, width/2, height/3);
            }
        }
    },
    slowAliens: {
        color: "lightblue",
        duration: 15000,
        img: null,
        draw: function(context, x, y, width, height) {
            if (this.img) {
                // Vẽ với kích thước cố định bằng tileSize
                context.drawImage(this.img, x, y, tileSize, tileSize);
            } else {
                // Fallback drawing
                context.fillStyle = this.color;
                context.fillRect(x, y, width, height);
                context.beginPath();
                context.arc(x + width/2, y + height/2, width/3, 0, Math.PI * 2);
                context.strokeStyle = "red";
                context.lineWidth = 2;
                context.stroke();
                context.beginPath();
                context.moveTo(x + width/2, y + height/2);
                context.lineTo(x + width/2, y + height/3);
                context.strokeStyle = "red";
                context.stroke();
            }
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

// Thêm biến playerName 
let playerName = "Player";

// Thêm hàm hiển thị hộp thoại nhập tên người chơi
function showPlayerNameDialog() {
    // Tạo lớp phủ nền
    let modalBackdrop = document.createElement("div");
    modalBackdrop.id = "name-modal-backdrop";
    modalBackdrop.style.position = "fixed";
    modalBackdrop.style.top = "0";
    modalBackdrop.style.left = "0";
    modalBackdrop.style.width = "100%";
    modalBackdrop.style.height = "100%";
    modalBackdrop.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    modalBackdrop.style.zIndex = "1001";
    modalBackdrop.style.display = "flex";
    modalBackdrop.style.justifyContent = "center";
    modalBackdrop.style.alignItems = "center";

    // Tạo hộp thoại
    let dialog = document.createElement("div");
    dialog.style.backgroundColor = "black";
    dialog.style.border = "2px solid white";
    dialog.style.padding = "20px";
    dialog.style.borderRadius = "10px";
    dialog.style.width = "300px";
    dialog.style.fontFamily = "courier";
    dialog.style.color = "white";
    dialog.style.textAlign = "center";

    // Tiêu đề
    let title = document.createElement("h2");
    title.textContent = "SPACE INVADERS";
    title.style.color = "#00ff00";
    title.style.marginBottom = "20px";
    dialog.appendChild(title);

    // Hướng dẫn
    let instructions = document.createElement("p");
    instructions.textContent = "Nhập tên của bạn:";
    dialog.appendChild(instructions);

    // Ô nhập liệu
    let nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Tên của bạn";
    nameInput.maxLength = 10;
    nameInput.style.width = "90%";
    nameInput.style.padding = "8px";
    nameInput.style.margin = "10px 0";
    nameInput.style.backgroundColor = "black";
    nameInput.style.color = "white";
    nameInput.style.border = "1px solid #00ff00";
    dialog.appendChild(nameInput);

    // Nút bắt đầu
    let startButton = document.createElement("button");
    startButton.textContent = "BẮT ĐẦU CHƠI";
    startButton.style.backgroundColor = "#00ff00";
    startButton.style.color = "black";
    startButton.style.border = "none";
    startButton.style.padding = "10px 20px";
    startButton.style.marginTop = "10px";
    startButton.style.cursor = "pointer";
    startButton.style.width = "90%";
    startButton.style.fontFamily = "courier";
    startButton.style.fontWeight = "bold";
    dialog.appendChild(startButton);
    
    // Nút xem điểm cao thay vì hiển thị điểm cao trực tiếp
    let highScoresButton = document.createElement("button");
    highScoresButton.textContent = "ĐIỂM CAO NHẤT";
    highScoresButton.style.backgroundColor = "#f0c808"; // Màu vàng
    highScoresButton.style.color = "black";
    highScoresButton.style.border = "none";
    highScoresButton.style.padding = "10px 20px";
    highScoresButton.style.marginTop = "10px";
    highScoresButton.style.cursor = "pointer";
    highScoresButton.style.width = "90%";
    highScoresButton.style.fontFamily = "courier";
    highScoresButton.style.fontWeight = "bold";
    dialog.appendChild(highScoresButton);

    // Thêm sự kiện
    nameInput.focus();
    startButton.onclick = function() {
        if (nameInput.value.trim() !== "") {
            playerName = nameInput.value.trim();
        }
        document.body.removeChild(modalBackdrop);
        resetGame();
    };

    highScoresButton.onclick = function() {
        document.body.removeChild(modalBackdrop);
        showHighScoresScreen();
    };

    nameInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            startButton.click();
        }
    });

    // Thêm vào DOM
    modalBackdrop.appendChild(dialog);
    document.body.appendChild(modalBackdrop);
}

// Thêm hàm mới hiển thị màn hình điểm cao
function showHighScoresScreen() {
    // Tạo lớp phủ nền
    let modalBackdrop = document.createElement("div");
    modalBackdrop.id = "highscores-modal-backdrop";
    modalBackdrop.style.position = "fixed";
    modalBackdrop.style.top = "0";
    modalBackdrop.style.left = "0";
    modalBackdrop.style.width = "100%";
    modalBackdrop.style.height = "100%";
    modalBackdrop.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    modalBackdrop.style.zIndex = "1001";
    modalBackdrop.style.display = "flex";
    modalBackdrop.style.justifyContent = "center";
    modalBackdrop.style.alignItems = "center";

    // Tạo hộp thoại
    let dialog = document.createElement("div");
    dialog.style.backgroundColor = "black";
    dialog.style.border = "2px solid #00ff00";
    dialog.style.padding = "20px";
    dialog.style.borderRadius = "10px";
    dialog.style.width = "400px";
    dialog.style.fontFamily = "courier";
    dialog.style.color = "white";
    dialog.style.textAlign = "center";

    // Tiêu đề
    let title = document.createElement("h2");
    title.textContent = "ĐIỂM CAO NHẤT";
    title.style.color = "#00ff00";
    title.style.marginBottom = "20px";
    dialog.appendChild(title);

    // Hiển thị danh sách điểm cao
    if (highScores && highScores.length > 0) {
        let tableContainer = document.createElement("div");
        tableContainer.style.marginBottom = "20px";
        tableContainer.style.maxHeight = "300px";
        tableContainer.style.overflowY = "auto";
        
        let table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        
        // Tạo header cho bảng
        let thead = document.createElement("thead");
        let headerRow = document.createElement("tr");
        
        let rankHeader = document.createElement("th");
        rankHeader.textContent = "Xếp hạng";
        rankHeader.style.padding = "8px";
        rankHeader.style.textAlign = "center";
        rankHeader.style.borderBottom = "1px solid #00ff00";
        
        let nameHeader = document.createElement("th");
        nameHeader.textContent = "Tên";
        nameHeader.style.padding = "8px";
        nameHeader.style.textAlign = "left";
        nameHeader.style.borderBottom = "1px solid #00ff00";
        
        let scoreHeader = document.createElement("th");
        scoreHeader.textContent = "Điểm";
        scoreHeader.style.padding = "8px";
        scoreHeader.style.textAlign = "right";
        scoreHeader.style.borderBottom = "1px solid #00ff00";
        
        headerRow.appendChild(rankHeader);
        headerRow.appendChild(nameHeader);
        headerRow.appendChild(scoreHeader);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Tạo body cho bảng
        let tbody = document.createElement("tbody");
        
        for (let i = 0; i < highScores.length; i++) {
            let row = document.createElement("tr");
            
            let rankCell = document.createElement("td");
            rankCell.textContent = (i + 1);
            rankCell.style.padding = "8px";
            rankCell.style.textAlign = "center";
            rankCell.style.color = i < 3 ? "#ffd700" : "white"; // Màu gold cho top 3
            
            let nameCell = document.createElement("td");
            nameCell.style.padding = "8px";
            nameCell.style.textAlign = "left";
            
            let scoreCell = document.createElement("td");
            scoreCell.style.padding = "8px";
            scoreCell.style.textAlign = "right";
            
            if (typeof highScores[i] === "number") {
                nameCell.textContent = "Không tên";
                scoreCell.textContent = highScores[i];
            } else {
                nameCell.textContent = highScores[i].name || "Không tên";
                scoreCell.textContent = highScores[i].score;
            }
            
            row.appendChild(rankCell);
            row.appendChild(nameCell);
            row.appendChild(scoreCell);
            tbody.appendChild(row);
        }
        
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        dialog.appendChild(tableContainer);
    } else {
        let noScoresMsg = document.createElement("p");
        noScoresMsg.textContent = "Chưa có điểm cao nào được ghi nhận.";
        noScoresMsg.style.marginBottom = "20px";
        dialog.appendChild(noScoresMsg);
    }

    // Nút Quay Lại
    let backButton = document.createElement("button");
    backButton.textContent = "QUAY LẠI";
    backButton.style.backgroundColor = "#00bfff"; // Màu xanh dương
    backButton.style.color = "black";
    backButton.style.border = "none";
    backButton.style.padding = "10px 20px";
    backButton.style.marginTop = "10px";
    backButton.style.cursor = "pointer";
    backButton.style.width = "90%";
    backButton.style.fontFamily = "courier";
    backButton.style.fontWeight = "bold";
    dialog.appendChild(backButton);

    // Thêm sự kiện
    backButton.onclick = function() {
        document.body.removeChild(modalBackdrop);
        showPlayerNameDialog();
    };

    // Thêm vào DOM
    modalBackdrop.appendChild(dialog);
    document.body.appendChild(modalBackdrop);
}

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

// Boss và laze
let boss = null;
let bossWidth = tileSize * 4;
let bossHeight = tileSize * 4;
let bossHealth = 100;
let bossMaxHealth = 100;
let bossVelocityX = 2;
let bossLasers = [];
let bossLaserWidth = tileSize * 2;
let bossLaserTimer = 0;
let bossLaserInterval = 300; // 5 seconds (60 frames per second * 5)
let bossLaserCount = 2; // Bắt đầu với 2 đường laser
let isBossFight = false;
let bossDefeated = false;

window.onload = function() {
    try {
        board = document.getElementById("board");
        if (!board) {
            console.error("Canvas element 'board' not found!");
            return;
        }
        
        board.width = boardWidth;
        board.height = boardHeight;
        context = board.getContext("2d");
        
        if (!context) {
            console.error("Could not get 2D context from canvas!");
            return;
        }

        //load tất cả hình ảnh alien
        for (let type in alienTypes) {
            let img = new Image();
            img.src = alienTypes[type].img;
            img.onload = function() {
                console.log(`Loaded alien image: ${type}`);
                alienTypes[type].imgObject = img;
            };
            img.onerror = function() {
                console.error(`Failed to load alien image: ${type} from ${alienTypes[type].img}`);
            };
        }

        shipImg = new Image();
        shipImg.src = "./ship.png";
        shipImg.onload = function() {
            context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
        }

        aiShipImg = new Image();
        aiShipImg.src = "./shipAI.png"; // Cập nhật đường dẫn ảnh cho tàu AI
        aiShipImg.onerror = function() {
            aiShipImg.src = "./ship.png"; // Fallback nếu không có hình ảnh riêng
        };

        // Khởi tạo giá trị mặc định cho các thuộc tính của aiShip
        aiShip.bulletSpeedMultiplier = 1;
        aiShip.hasMultiShot = false;

        createStars();
        createAliens();
        setupGameMenu();
        
        // Tải điểm cao từ localStorage và chuyển đổi định dạng cũ nếu cần
        highScores = JSON.parse(localStorage.getItem("highScores")) || [];
        // Chuyển đổi định dạng cũ (chỉ số điểm) sang định dạng mới (đối tượng với tên và điểm)
        highScores = highScores.map(item => {
            if (typeof item === "number") {
                return { name: "Không tên", score: item };
            }
            return item;
        });
        
        // Tải tất cả hình ảnh cho buff
        loadAllBuffImages();
        
        // Hiển thị hộp thoại nhập tên
        showPlayerNameDialog();
        
        console.log("Game initialized successfully");
        
        // Vòng lặp game sẽ bắt đầu sau khi người chơi nhập tên
        requestAnimationFrame(update);
        document.addEventListener("keydown", moveShip);
        document.addEventListener("keydown", shoot);
        
        // Khởi tạo biến boss fight
        boss = null;
        bossHealth = bossMaxHealth;
        bossLasers = [];
        bossLaserTimer = 0;
        bossLaserCount = 2;
        isBossFight = false;
        bossDefeated = false;
    } catch (error) {
        console.error("Error in initialization:", error);
        alert("Có lỗi xảy ra khi khởi tạo game. Vui lòng kiểm tra console để biết thêm chi tiết.");
    }
}


// Thêm event listener cho phím Enter để bắt đầu lại game giống với nút "Bắt đầu lại"
window.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && (gameOver || bossDefeated)) {
        // Hiển thị hộp thoại xác nhận
        if (confirm("Bạn có chắc muốn bắt đầu lại trò chơi? Điểm hiện tại sẽ bị mất.")) {
            showPlayerNameDialog();
        }
    }
});

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
    
    // Thêm nút bắt đầu lại mới luôn hiển thị trong menu
    let restartGameButton = document.createElement("button");
    restartGameButton.textContent = "BẮT ĐẦU LẠI";
    restartGameButton.style.margin = "5px 0";
    restartGameButton.style.padding = "5px 10px";
    restartGameButton.style.width = "100%";
    restartGameButton.style.backgroundColor = "#ff4500";  // Màu cam đậm để nổi bật
    restartGameButton.style.color = "white";
    restartGameButton.style.border = "none";
    restartGameButton.style.borderRadius = "3px";
    restartGameButton.style.cursor = "pointer";
    restartGameButton.style.fontWeight = "bold";
    
    // Thêm hiệu ứng hover
    restartGameButton.onmouseover = function() {
        restartGameButton.style.backgroundColor = "#cc3700";
    };
    restartGameButton.onmouseout = function() {
        restartGameButton.style.backgroundColor = "#ff4500";
    };
    
    // Thêm sự kiện click
    restartGameButton.addEventListener("click", function() {
        // Hiển thị hộp thoại xác nhận
        if (confirm("Bạn có chắc muốn bắt đầu lại trò chơi? Điểm hiện tại sẽ bị mất.")) {
            showPlayerNameDialog();
        }
    });
    menuDiv.appendChild(restartGameButton);
    
    // Thêm nút trợ giúp debug vào menu game
    if (window.location.search.includes('debug=true')) {
        let debugButton = document.createElement("button");
        debugButton.textContent = "Debug: Start Boss";
        debugButton.style.margin = "5px 0";
        debugButton.style.padding = "5px 10px";
        debugButton.style.width = "100%";
        debugButton.style.backgroundColor = "#ff00ff";
        debugButton.style.color = "white";
        debugButton.style.border = "none";
        debugButton.style.cursor = "pointer";
        
        debugButton.onclick = function() {
            console.log("Debug: Manual boss fight activation");
            alienColumns = 7; // Đủ để kích hoạt boss fight
            alienCount = 0; // Giả vờ rằng tất cả alien đã bị tiêu diệt
        };
        
        menuDiv.appendChild(debugButton);
    }
    
    document.body.appendChild(menuDiv);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        context.fillStyle = "black";
        context.fillRect(0, 0, boardWidth, boardHeight);
        
        // Vẽ các ngôi sao làm nền cho màn hình game over
        stars.forEach(star => {
            context.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
            context.beginPath();
            context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            context.fill();
            
            // Di chuyển sao chậm hơn khi game over
            star.y += star.speed * 0.3;
            if(star.y > boardHeight) {
                star.y = 0;
                star.x = Math.random() * boardWidth;
            }
        });
        
        context.fillStyle = "white";
        context.font = "32px courier";
        context.fillText("GAME OVER", boardWidth/2 - 80, boardHeight/2 - 80);
        
        context.font = "16px courier";
        // Hiển thị điểm và tên người chơi
        context.fillText(playerName + ": " + score + " điểm", boardWidth/2 - 70, boardHeight/2 - 40);
        
        // Hiển thị top 5 điểm cao
        context.fillText("High Scores:", boardWidth/2 - 70, boardHeight/2);
        for (let i = 0; i < Math.min(5, highScores.length); i++) {
            let displayText;
            if (typeof highScores[i] === "number") {
                displayText = "Không tên: " + highScores[i];
            } else {
                displayText = (i+1) + ". " + highScores[i].name + ": " + highScores[i].score;
            }
            context.fillText(displayText, boardWidth/2 - 70, boardHeight/2 + 30 + i * 20);
        }
        
        // Hiển thị thông báo về nút restart và phím Enter
        context.fillStyle = "yellow";
        context.fillText("Nhấn vào nút 'BẮT ĐẦU LẠI' hoặc phím Enter để chơi lại", boardWidth/2 - 230, boardHeight/2 + 140);
        
        return;
    }

    // Hiển thị màn hình victory khi boss bị đánh bại
    if (bossDefeated) {
        context.fillStyle = "black";
        context.fillRect(0, 0, boardWidth, boardHeight);
        
        // Vẽ các ngôi sao làm nền cho màn hình victory
        stars.forEach(star => {
            context.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
            context.beginPath();
            context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            context.fill();
            
            // Di chuyển sao chậm hơn khi victory
            star.y += star.speed * 0.3;
            if(star.y > boardHeight) {
                star.y = 0;
                star.x = Math.random() * boardWidth;
            }
        });
        
        context.fillStyle = "#00ff00"; // Màu xanh lá cho victory
        context.font = "48px courier bold";
        context.fillText("VICTORY!", boardWidth/2 - 120, boardHeight/2 - 50);
        
        context.fillStyle = "white";
        context.font = "20px courier";
        context.fillText("Điểm của bạn: " + score, boardWidth/2 - 100, boardHeight/2);
        
        // Hiển thị thông báo về nút restart và phím Enter
        context.fillStyle = "yellow";
        context.font = "16px courier";
        context.fillText("Nhấn vào nút 'BẮT ĐẦU LẠI' hoặc phím Enter để chơi lại", boardWidth/2 - 230, boardHeight/2 + 50);
        
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
            updateHighScores();
        }
    }

    // Xử lý boss fight
    if (isBossFight && boss) {
        // Di chuyển boss
        boss.x += bossVelocityX;
        if (boss.x <= 0 || boss.x + boss.width >= boardWidth) {
            bossVelocityX *= -1;
        }
        
        // Vẽ boss
        try {
            if (boss.img && boss.img.complete) {
                context.drawImage(boss.img, boss.x, boss.y, boss.width, boss.height);
            } else {
                // Fallback nếu hình ảnh không được tải
                context.fillStyle = "red";
                context.fillRect(boss.x, boss.y, boss.width, boss.height);
                context.fillStyle = "white";
                context.font = "20px courier";
                context.textAlign = "center";
                context.fillText("BOSS", boss.x + boss.width/2, boss.y + boss.height/2);
                context.textAlign = "start"; // Reset text align
            }
        } catch (e) {
            console.error("Error drawing boss:", e);
            // Fallback đơn giản
            context.fillStyle = "red";
            context.fillRect(boss.x, boss.y, boss.width, boss.height);
        }
        
        // Tăng bộ đếm thời gian để bắn laser
        bossLaserTimer++;
        if (bossLaserTimer >= bossLaserInterval) {
            bossLaserTimer = 0;
            createBossLasers();
        }
        
        // Cập nhật và vẽ các laser
        updateBossLasers();
        
        // Vẽ thanh máu
        drawBossHealthBar();
    } 
    // Xử lý alien bình thường
    else {
        // Tạo wave mới khi hết alien
        if (alienCount == 0) {
            score += alienColumns * alienRows * 100;
            if (aiEnabled && aiShip.active) {
                aiShip.score += alienColumns * alienRows * 50;
            }
            
            // Sửa điều kiện bắt đầu boss fight
            if (alienColumns >= 6 || level >= 5) { // Giảm số cột xuống 6 hoặc khi đạt cấp độ 5
                console.log("Starting boss fight, alienColumns =", alienColumns, "level =", level);
                startBossFight();
            } else {
                alienColumns = Math.min(alienColumns + 1, columns/2 - 2);
                alienRows = Math.min(alienRows + 1, rows - 4);
                alienVelocityX += alienVelocityX > 0 ? 0.5 : -0.5;
                alienArray = [];
                bulletArray = [];
                aiBulletArray = [];
                createAliens();
            }
        }
    }

    //update và vẽ đạn của người chơi
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Kiểm tra va chạm với aliens
        if (!isBossFight) {
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
        // Kiểm tra va chạm với boss
        else if (boss && !bullet.used && detectCollision(bullet, boss)) {
            bossHealth -= 1; // Mỗi đạn gây 1 damage
            bullet.used = true;
            
            // Thêm 1000 điểm khi bắn trúng boss
            score += 1000;
            
            // Hiệu ứng nổ nhỏ khi đạn trúng boss
            explosions.push({
                x: bullet.x,
                y: bullet.y,
                frame: 0,
                duration: explosionDuration / 2,
                size: 0.5  // Kích thước nhỏ hơn
            });
            
            // Kiểm tra nếu boss bị tiêu diệt
            if (bossHealth <= 0) {
                // Boss bị đánh bại
                score += 100000; // Cộng điểm khi đánh bại boss
                createBossExplosion(); // Tạo hiệu ứng nổ lớn
                boss = null;
                bossDefeated = true;
                updateHighScores();
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

            // Kiểm tra va chạm với aliens khi không phải boss fight
            if (!isBossFight) {
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
                            
                            // Rơi buff cho AI với xác suất 20%
                            if (Math.random() < 0.2 && !buffAIExists) {
                                spawnBuff(alien.x, alien.y, true); // true = dành cho AI
                            }
                        }
                        if (!bullet.piercing) bullet.used = true;
                    }
                }
            } 
            // Kiểm tra va chạm với boss
            else if (boss && !bullet.used && detectCollision(bullet, boss)) {
                bossHealth -= 1; // Mỗi đạn gây 1 damage
                bullet.used = true;
                
                // Thưởng điểm cho AI khi bắn trúng boss
                aiShip.score += 1000;
                
                // Hiệu ứng nổ nhỏ khi đạn trúng boss
                explosions.push({
                    x: bullet.x,
                    y: bullet.y,
                    frame: 0,
                    duration: explosionDuration / 2,
                    size: 0.5  // Kích thước nhỏ hơn
                });
                
                // Kiểm tra nếu boss bị tiêu diệt
                if (bossHealth <= 0) {
                    // Boss bị đánh bại
                    score += 50000; // Player được một nửa điểm
                    aiShip.score += 50000; // AI được một nửa điểm
                    createBossExplosion(); // Tạo hiệu ứng nổ lớn
                    boss = null;
                    bossDefeated = true;
                    updateHighScores();
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
    updateExplosions();

    //xóa đạn đã sử dụng
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift();
    }

    //update và vẽ power-up
    if (buff) {
        buff.y += buffVelocityY;
        powerUpTypes[buff.type].draw(context, buff.x, buff.y, buff.width, buff.height);

        // Chỉ cho phép tàu người chơi nhận buff người chơi
        if (detectCollision(ship, buff)) {
            activateBuff(ship);
        }

        if (buff.y > boardHeight) {
            buff = null;
            buffExists = false;
        }
    }
    
    // Vẽ và xử lý buff AI
    if (buffAI && aiEnabled) {
        buffAI.y += buffAIVelocityY;
        powerUpAITypes[buffAI.type].draw(context, buffAI.x, buffAI.y, buffAI.width, buffAI.height);

        // Chỉ cho phép AI nhận buff AI
        if (aiShip.active && detectCollision(aiShip, buffAI)) {
            activateAIBuff();
        }

        if (buffAI.y > boardHeight) {
            buffAI = null;
            buffAIExists = false;
        }
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
        // Loại bỏ việc hiển thị điểm cao trong gameplay
        // Không hiển thị gì thay vì điểm cao
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

function spawnBuff(x, y, forAI = false) {
    // Tăng tỉ lệ rơi vật phẩm tăng đạn
    let rand = Math.random();
    let type;
    
    if (rand < 0.4) { // 40% cơ hội rơi vật phẩm tăng đạn
        type = "permanentBulletUp";
    } else {
        // 60% còn lại chia đều cho các vật phẩm khác
        let otherTypes = forAI ?
            Object.keys(powerUpAITypes).filter(t => t !== "permanentBulletUp") :
            Object.keys(powerUpTypes).filter(t => t !== "permanentBulletUp");
        type = otherTypes[Math.floor(Math.random() * otherTypes.length)];
    }
    
    if (forAI) {
        // Tạo buff cho AI
        buffAI = { 
            x: x,
            y: y,
            width: tileSize,
            height: tileSize,
            type: type,
            forAI: true
        };
        buffAIExists = true;
    } else {
        // Tạo buff cho người chơi
        buff = { 
            x: x,
            y: y,
            width: tileSize,
            height: tileSize,
            type: type,
            forAI: false
        };
        buffExists = true;
    }
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

function activateAIBuff() {
    buffAIExists = false;
    buffAIActive = true;
    buffAIType = buffAI.type;
    
    let originalAlienVelocity = alienVelocityX; // Lưu tốc độ gốc của alien
    
    switch(buffAIType) {
        case "shield":
            aiShip.isShieldActive = true;
            aiShip.shield = 100;
            setTimeout(() => {
                aiShip.isShieldActive = false;
                buffAIActive = false;
            }, powerUpAITypes.shield.duration);
            break;
        
        case "rapidFire":
            aiShip.bulletSpeedMultiplier = 2;
            setTimeout(() => {
                aiShip.bulletSpeedMultiplier = 1;
                buffAIActive = false;
            }, powerUpAITypes.rapidFire.duration);
            break;
        
        case "piercingShot":
            aiBulletArray.forEach(bullet => bullet.piercing = true);
            setTimeout(() => {
                aiBulletArray.forEach(bullet => bullet.piercing = false);
                buffAIActive = false;
            }, powerUpAITypes.piercingShot.duration);
            break;
        
        case "multiShot":
            aiShip.hasMultiShot = true;
            setTimeout(() => {
                aiShip.hasMultiShot = false;
                buffAIActive = false;
            }, powerUpAITypes.multiShot.duration);
            break;
        
        case "bomb":
            alienArray.forEach(alien => {
                if (alien.alive) {
                    alien.alive = false;
                    alienCount--;
                    aiShip.score += alien.type.points;
                    explosions.push({
                        x: alien.x,
                        y: alien.y,
                        frame: 0,
                        duration: explosionDuration
                    });
                }
            });
            buffAIActive = false;
            break;
        
        case "permanentBulletUp":
            aiShip.bulletCount++;
            buffAIActive = false;
            break;
        
        case "slowAliens":
            alienVelocityX *= 0.5; // Giảm một nửa tốc độ
            setTimeout(() => {
                alienVelocityX = originalAlienVelocity;
                buffAIActive = false;
            }, powerUpAITypes.slowAliens.duration);
            break;
    }
    
    buffAI = null;
}

function updateAI() {
    const settings = difficultySettings[aiShip.difficulty];
    
    // Di chuyển AI
    aiShip.shootCooldown--;
    
    // AI tìm buff AI dựa theo độ khó
    if (buffAI && buffAIExists && aiShip.difficulty !== "easy") {
        // Chỉ ở mức độ medium và hard AI mới đi lấy buff
        // Ưu tiên đi lấy buff cao nhất
        const targetX = buffAI.x + buffAI.width/2 - aiShip.width/2;
        
        // Di chuyển tàu AI tới vị trí buff
        if (Math.abs(aiShip.x - targetX) > settings.moveSpeed) {
            if (aiShip.x < targetX) {
                aiShip.x += settings.moveSpeed * 1.5; // Tăng tốc độ di chuyển đến buff
            } else {
                aiShip.x -= settings.moveSpeed * 1.5;
            }
            
            // Giới hạn không cho tàu đi ra ngoài màn hình
            aiShip.x = Math.max(0, Math.min(boardWidth - aiShip.width, aiShip.x));
            
            // Nếu đang đi lấy buff, không thực hiện hành động khác
            return;
        }
    }
    
    // Xử lý trường hợp đang đánh boss
    if (isBossFight && boss) {
        // Nhắm vào boss
        const targetX = boss.x + boss.width/2 - aiShip.width/2;
        
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
        
        // Né tránh laser của boss
        avoidBossLasers(settings);
        
        // Giới hạn không cho tàu đi ra ngoài màn hình
        aiShip.x = Math.max(0, Math.min(boardWidth - aiShip.width, aiShip.x));
        
        // Bắn đạn vào boss nếu hết thời gian cooldown
        if (aiShip.shootCooldown <= 0 && Math.random() < settings.reactionTime) {
            aiShoot();
            aiShip.shootCooldown = settings.shootInterval;
        }
    }
    // Nếu không phải boss fight, sử dụng AI thông thường
    else {
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
    }
    
    // Né tránh đạn của alien (nhưng ưu tiên thấp hơn di chuyển lấy buff)
    if (aiShip.difficulty !== "easy") {
        for (let i = 0; i < alienBullets.length; i++) {
            let bullet = alienBullets[i];
            // Nếu đạn đang đi xuống và gần tàu AI
            if (Math.abs(bullet.x - (aiShip.x + aiShip.width/2)) < aiShip.width && 
                bullet.y < aiShip.y && bullet.y > aiShip.y - 100) {
                // Né sang trái hoặc phải tùy thuộc vào vị trí hiện tại
                const dodgeDirection = (aiShip.x > boardWidth/2) ? -1 : 1;
                aiShip.x += settings.moveSpeed * dodgeDirection; // Giảm tốc độ né tránh so với ban đầu
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
    
    try {
        // Đảm bảo aiShip.bulletSpeedMultiplier có giá trị
        if (!aiShip.bulletSpeedMultiplier) aiShip.bulletSpeedMultiplier = 1;
        
        // Đảm bảo aiShip.bulletCount có giá trị
        if (!aiShip.bulletCount || aiShip.bulletCount < 1) aiShip.bulletCount = 1;
        
        if (aiShip.hasMultiShot) {
            // Khi có multiShot, bắn 3 hướng chính
            let angles = [-0.3, 0, 0.3];
            angles.forEach(mainAngle => {
                // Với mỗi hướng chính, bắn số đạn theo aiShip.bulletCount
                for(let i = 0; i < aiShip.bulletCount; i++) {
                    let spreadAngle = mainAngle + (i - (aiShip.bulletCount-1)/2) * 0.15;
                    let bullet = {
                        x: aiShip.x + aiShip.width/2,
                        y: aiShip.y,
                        width: tileSize/8,
                        height: tileSize/2,
                        used: false,
                        piercing: false,
                        velocityX: Math.sin(spreadAngle) * 10,
                        velocityY: bulletVelocityY * Math.cos(spreadAngle) * aiShip.bulletSpeedMultiplier
                    };
                    aiBulletArray.push(bullet);
                }
            });
        } else {
            // Bắn thường theo dạng quạt
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
                    velocityY: bulletVelocityY * Math.cos(spreadAngle) * aiShip.bulletSpeedMultiplier
                };
                aiBulletArray.push(bullet);
            }
        }
    } catch (error) {
        console.error("Error in aiShoot:", error);
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
        // Tạo điểm số mới với tên người chơi
        let newScore = {
            name: playerName,
            score: score
        };
        
        // Kiểm tra xem điểm số này đã có trong bảng xếp hạng chưa
        let isDuplicate = false;
        for (let i = 0; i < highScores.length; i++) {
            // Nếu cùng tên người chơi và điểm số cao hơn hoặc bằng điểm hiện tại, bỏ qua
            if (highScores[i].name === playerName && highScores[i].score >= score) {
                isDuplicate = true;
                break;
            }
            
            // Nếu cùng tên người chơi nhưng điểm số thấp hơn, xóa điểm cũ
            if (highScores[i].name === playerName && highScores[i].score < score) {
                highScores.splice(i, 1);
                i--;
                // Không đánh dấu trùng lặp vì chúng ta muốn thêm điểm mới cao hơn
            }
        }
        
        // Nếu không trùng lặp, thêm điểm mới vào danh sách
        if (!isDuplicate) {
            highScores.push(newScore);
            
            // Sắp xếp lại theo điểm số giảm dần
            highScores.sort((a, b) => b.score - a.score);
            
            // Chỉ giữ 5 điểm cao nhất
            if (highScores.length > 5) {
                highScores = highScores.slice(0, 5);
            }
            
            // Lưu vào localStorage
            localStorage.setItem("highScores", JSON.stringify(highScores));
            
            console.log("Đã cập nhật điểm cao:", highScores);
        }
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
    buffActive = false;
    buffType = null;
    
    buffAI = null;
    buffAIExists = false;
    buffAIActive = false;
    buffAIType = null;
    
    alienColumns = 3;
    alienRows = 2;
    alienVelocityX = 0.5;
    ship.x = shipX;
    ship.y = shipY;
    
    if (aiEnabled) {
        resetAiShip();
        aiShip.active = true;
        aiShip.hasMultiShot = false;
        aiShip.bulletSpeedMultiplier = 1;
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
    
    // Reset Boss
    boss = null;
    bossHealth = bossMaxHealth;
    bossLasers = [];
    bossLaserTimer = 0;
    bossLaserCount = 2; // Reset lại số lượng laser ban đầu
    isBossFight = false;
    bossDefeated = false;
}

//thêm event listener cho phím R để restart game
document.addEventListener("keydown", function(e) {
    if (e.code === "KeyR" && gameOver) {
        // Hiển thị hộp thoại nhập tên khi khởi động lại sau khi game over
        showPlayerNameDialog();
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

// Hàm khởi tạo boss fight
function startBossFight() {
    console.log("Boss fight initialization started");
    
    // Đặt cờ boss fight
    isBossFight = true;
    
    // Xóa tất cả alien và đạn 
    alienArray = [];
    alienBullets = [];
    alienCount = 0;
    
    // Tạo boss
    let bossImg = new Image();
    bossImg.src = "./boss.png";
    
    // Xử lý sự kiện tải hình ảnh
    bossImg.onload = function() {
        console.log("Boss image loaded successfully");
    };
    
    bossImg.onerror = function() {
        console.error("Failed to load boss image");
        
        // Tạo một canvas để vẽ boss thay thế
        let canvas = document.createElement('canvas');
        canvas.width = bossWidth;
        canvas.height = bossHeight;
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, bossWidth, bossHeight);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('BOSS', bossWidth/3, bossHeight/2);
        
        // Chuyển canvas thành data URL
        bossImg.src = canvas.toDataURL();
    };
    
    // Khởi tạo boss với các thuộc tính
    boss = {
        x: boardWidth / 2 - bossWidth / 2,
        y: tileSize * 3,
        width: bossWidth,
        height: bossHeight,
        img: bossImg
    };
    
    // Thiết lập các thuộc tính khác cho boss fight
    bossHealth = bossMaxHealth;
    bossLaserTimer = 0;
    bossLaserCount = 2;
    bossLasers = [];
    
    // Tạo laser đầu tiên ngay lập tức
    setTimeout(createBossLasers, 2000);
    
    console.log("Boss fight initialized:", boss);
}

// Tạo laser của boss - sửa để bắt đầu với 2 đường laser và tăng dần
function createBossLasers() {
    console.log("Creating boss lasers");
    
    if (!isBossFight || !boss) {
        console.log("Cannot create lasers - no active boss fight");
        return;
    }
    
    // Xóa laser cũ
    bossLasers = [];
    
    // Tạo laser mới dựa trên bossLaserCount
    for (let i = 0; i < bossLaserCount; i++) {
        // Phân bổ vị trí laser đều trên màn hình
        let laserX;
        
        if (bossLaserCount > 1) {
            // Chia đều khoảng cách
            const totalWidth = boardWidth - bossLaserWidth;
            const segment = totalWidth / (bossLaserCount - 1);
            laserX = i * segment;
        } else {
            // Nếu chỉ có 1 laser, đặt ở giữa màn hình
            laserX = (boardWidth - bossLaserWidth) / 2;
        }
        
        // Thêm một chút ngẫu nhiên
        laserX += (Math.random() - 0.5) * 30;
        
        // Giới hạn trong màn hình
        laserX = Math.max(0, Math.min(boardWidth - bossLaserWidth, laserX));
        
        // Tạo laser mới
        bossLasers.push({
            x: laserX,
            y: 0,
            width: bossLaserWidth,
            height: tileSize,
            growing: true
        });
    }
    
    // Tăng số lượng laser cho lần sau
    bossLaserCount = Math.min(bossLaserCount + 1, 10); // Tối đa 10 laser
    
    // Hiệu ứng cảnh báo
    flashWarning();
    
    console.log("Created", bossLasers.length, "boss lasers");
}

// Sửa lại hàm avoidBossLasers để xử lý đúng
function avoidBossLasers(settings) {
    if (!aiShip.active || aiShip.difficulty === "easy") return;
    
    // Kiểm tra xem bossLasers có tồn tại và không trống
    if (!bossLasers || bossLasers.length === 0) return;
    
    // Né tránh laser ở độ khó medium và hard
    for (let i = 0; i < bossLasers.length; i++) {
        const laser = bossLasers[i];
        // Nếu laser sắp va chạm với AI (khoảng cách gần hơn)
        const laserCenterX = laser.x + laser.width/2;
        const shipCenterX = aiShip.x + aiShip.width/2;
        const distanceX = Math.abs(laserCenterX - shipCenterX);
        
        if (distanceX < aiShip.width * 1.2) { // Tăng phạm vi né tránh
            // Di chuyển tránh xa laser
            const moveDirection = (laserCenterX > shipCenterX) ? -1 : 1;
            aiShip.x += settings.moveSpeed * 3 * moveDirection; // Tăng tốc độ né tránh
            
            // Giới hạn không cho đi ra ngoài màn hình
            aiShip.x = Math.max(0, Math.min(boardWidth - aiShip.width, aiShip.x));
            console.log("AI avoiding laser at", laserCenterX, "moving", moveDirection > 0 ? "right" : "left");
            break;
        }
    }
}

// Sửa lại hàm updateBossLasers để hiển thị và hoạt động đúng
function updateBossLasers() {
    if (!bossLasers || bossLasers.length === 0) return;
    
    for (let i = bossLasers.length - 1; i >= 0; i--) {
        let laser = bossLasers[i];
        
        // Kiểm tra xem laser có hợp lệ không
        if (!laser) {
            bossLasers.splice(i, 1);
            continue;
        }
        
        // Nếu đang phát triển
        if (laser.growing) {
            laser.height += 10; // Tăng tốc độ phát triển
            
            // Nếu laser đạt đến cuối màn hình
            if (laser.height >= boardHeight) {
                // Giữ ở chiều cao tối đa trong một thời gian trước khi biến mất
                laser.growing = false;
                laser.duration = 30; // Duy trì đủ lâu để người chơi thấy
            }
        } else {
            // Giảm thời gian tồn tại
            laser.duration--;
            
            // Nếu hết thời gian, xóa laser
            if (laser.duration <= 0) {
                bossLasers.splice(i, 1);
                continue;
            }
        }
        
        // Vẽ laser với hiệu ứng gradient
        let gradient = context.createLinearGradient(0, laser.y, 0, laser.y + laser.height);
        gradient.addColorStop(0, "rgba(255, 0, 0, 0.8)");
        gradient.addColorStop(0.5, "rgba(255, 255, 0, 0.9)");
        gradient.addColorStop(1, "rgba(255, 0, 0, 0.8)");
        
        context.fillStyle = gradient;
        context.fillRect(laser.x, laser.y, laser.width, laser.height);
        
        // Hiệu ứng phát sáng ở giữa
        context.fillStyle = "rgba(255, 255, 255, 0.8)";
        context.fillRect(laser.x + laser.width/4, laser.y, laser.width/2, laser.height);
        
        // Kiểm tra va chạm với người chơi và AI
        if (ship && detectLaserCollision(laser, ship)) {
            if (isShieldActive) {
                shield -= 50; // Laser gây nhiều sát thương hơn
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
        }
        
        if (aiEnabled && aiShip.active && detectLaserCollision(laser, aiShip)) {
            if (aiShip.isShieldActive) {
                aiShip.shield -= 50;
                if (aiShip.shield <= 0) {
                    aiShip.isShieldActive = false;
                }
            } else {
                aiShip.lives--;
                if (aiShip.lives <= 0) {
                    aiShip.active = false;
                }
            }
        }
    }
}

// Phát hiện va chạm với laser, xem xét toàn bộ độ dài của laser
function detectLaserCollision(laser, target) {
    return (
        target.x < laser.x + laser.width &&
        target.x + target.width > laser.x &&
        target.y < laser.y + laser.height &&
        target.y + target.height > laser.y
    );
}

// Vẽ thanh máu của boss
function drawBossHealthBar() {
    const barWidth = boardWidth * 0.6;
    const barHeight = 15;
    const barX = (boardWidth - barWidth) / 2;
    const barY = 20;
    
    // Vẽ nền của thanh máu
    context.fillStyle = "#333";
    context.fillRect(barX, barY, barWidth, barHeight);
    
    // Vẽ máu hiện tại
    const healthPercent = bossHealth / bossMaxHealth;
    let healthColor;
    
    if (healthPercent > 0.6) {
        healthColor = "#00ff00"; // Xanh lá khi máu > 60%
    } else if (healthPercent > 0.3) {
        healthColor = "#ffff00"; // Vàng khi máu > 30%
    } else {
        healthColor = "#ff0000"; // Đỏ khi máu <= 30%
    }
    
    context.fillStyle = healthColor;
    context.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    
    // Vẽ viền cho thanh máu
    context.strokeStyle = "white";
    context.lineWidth = 2;
    context.strokeRect(barX, barY, barWidth, barHeight);
    
    // Hiển thị text BOSS và máu hiện tại
    context.fillStyle = "white";
    context.font = "bold 12px courier";
    context.fillText("BOSS: " + bossHealth + "/" + bossMaxHealth, barX + barWidth/2 - 50, barY + barHeight - 2);
}

// Tạo hiệu ứng nổ lớn khi boss bị tiêu diệt
function createBossExplosion() {
    const explosionCount = 15;
    
    // Tạo nhiều vụ nổ ở vị trí khác nhau trên boss
    for (let i = 0; i < explosionCount; i++) {
        setTimeout(() => {
            const offsetX = Math.random() * bossWidth;
            const offsetY = Math.random() * bossHeight;
            
            explosions.push({
                x: boss.x + offsetX - alienWidth/2,
                y: boss.y + offsetY - alienHeight/2,
                frame: 0,
                duration: explosionDuration,
                size: 1 + Math.random() * 2 // Kích thước ngẫu nhiên
            });
        }, i * 150); // Các vụ nổ xảy ra theo trình tự
    }
    
    // Cũng xóa tất cả laser của boss
    bossLasers = [];
}

// Chỉnh sửa hàm update explosion để hỗ trợ kích thước khác nhau
function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        let explosion = explosions[i];
        let size = explosion.size || 1; // Default size là 1 nếu không được định nghĩa
        
        context.fillStyle = "orange";
        context.beginPath();
        context.arc(
            explosion.x + alienWidth/2,
            explosion.y + alienHeight/2,
            (explosion.frame / explosionFrames) * alienWidth/2 * size,
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
}

// Thêm hàm để tải tất cả hình ảnh buff
function loadAllBuffImages() {
    // Danh sách các loại buff cần tải
    const buffTypes = [
        'shield',
        'rapidFire',
        'piercingShot',
        'multiShot',
        'bomb',
        'permanentBulletUp',
        'slowAliens'
    ];
    
    // Tải buff cho người chơi
    buffTypes.forEach(type => {
        const img = new Image();
        img.src = `./buffship/${type}.png`;
        
        img.onload = function() {
            console.log(`Loaded player buff image: ${type}`);
            powerUpTypes[type].img = img;
        };
        
        img.onerror = function() {
            console.error(`Failed to load player buff image: ${type}`);
            
            // Thử lại với tên file viết thường
            const retryImg = new Image();
            retryImg.src = `./buffship/${type.toLowerCase()}.png`;
            
            retryImg.onload = function() {
                console.log(`Loaded player buff image (lowercase): ${type}`);
                powerUpTypes[type].img = retryImg;
            };
            
            retryImg.onerror = function() {
                console.error(`Failed to load player buff image with all attempts: ${type}`);
            };
        };
    });
    
    // Tải buff cho AI
    buffTypes.forEach(type => {
        const img = new Image();
        img.src = `./buffshipAI/${type}.png`;
        
        img.onload = function() {
            console.log(`Loaded AI buff image: ${type}`);
            powerUpAITypes[type].img = img;
        };
        
        img.onerror = function() {
            console.error(`Failed to load AI buff image: ${type}`);
            
            // Thử lại với tên file viết thường
            const retryImg = new Image();
            retryImg.src = `./buffshipAI/${type.toLowerCase()}.png`;
            
            retryImg.onload = function() {
                console.log(`Loaded AI buff image (lowercase): ${type}`);
                powerUpAITypes[type].img = retryImg;
            };
            
            retryImg.onerror = function() {
                console.error(`Failed to load AI buff image with all attempts: ${type}`);
            };
        };
    });
}