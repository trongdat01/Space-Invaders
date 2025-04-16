// Các chức năng liên quan đến màn hình chọn chế độ chơi

/**
 * Hiển thị màn hình chọn chế độ chơi với giao diện đẹp
 */
function showGameModeSelection() {
    // Tạo lớp phủ nền
    let modalBackdrop = document.createElement("div");
    modalBackdrop.id = "game-mode-backdrop";
    modalBackdrop.style.position = "fixed";
    modalBackdrop.style.top = "0";
    modalBackdrop.style.left = "0";
    modalBackdrop.style.width = "100%";
    modalBackdrop.style.height = "100%";
    modalBackdrop.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    modalBackdrop.style.zIndex = "1001";
    modalBackdrop.style.display = "flex";
    modalBackdrop.style.justifyContent = "center";
    modalBackdrop.style.alignItems = "center";

    // Tạo hộp thoại
    let dialog = document.createElement("div");
    dialog.style.backgroundColor = "black";
    dialog.style.border = "2px solid #0088ff";
    dialog.style.padding = "30px";
    dialog.style.borderRadius = "10px";
    dialog.style.width = "500px";
    dialog.style.fontFamily = "courier";
    dialog.style.color = "white";
    dialog.style.textAlign = "center";

    // Tiêu đề
    let title = document.createElement("h2");
    title.textContent = "CHỌN CHẾ ĐỘ CHƠI";
    title.style.color = "#0088ff";
    title.style.marginBottom = "30px";
    title.style.fontSize = "28px";
    dialog.appendChild(title);

    // Tạo container cho các nút chế độ
    let modesContainer = document.createElement("div");
    modesContainer.style.display = "flex";
    modesContainer.style.flexDirection = "column";
    modesContainer.style.gap = "20px";
    modesContainer.style.marginBottom = "30px";

    // Tạo nút chế độ Single Player
    let singlePlayerButton = createModeButton(
        "SINGLE PLAYER",
        "Chơi một mình, đánh bại các alien và boss",
        "./ship.png",
        "#00ff00"
    );
    singlePlayerButton.onclick = function () {
        gameMode = "single";
        aiEnabled = false;
        document.body.removeChild(modalBackdrop);
        resetGame();
    };
    modesContainer.appendChild(singlePlayerButton);

    // Tạo container cho các nút chế độ Versus AI
    let versusContainer = document.createElement("div");
    versusContainer.style.display = "flex";
    versusContainer.style.flexDirection = "column";
    versusContainer.style.gap = "15px";
    versusContainer.style.marginBottom = "10px";

    // Tiêu đề Versus AI
    let versusTitle = document.createElement("h3");
    versusTitle.textContent = "VERSUS AI";
    versusTitle.style.color = "#ff3366";
    versusTitle.style.marginBottom = "10px";
    versusTitle.style.marginTop = "0";
    versusContainer.appendChild(versusTitle);

    // Mô tả chế độ Versus AI
    let versusDesc = document.createElement("p");
    versusDesc.textContent = "Cạnh tranh với AI, người nào đạt điểm số cao hơn sẽ thắng";
    versusDesc.style.fontSize = "14px";
    versusDesc.style.margin = "0 0 10px 0";
    versusContainer.appendChild(versusDesc);

    // Tạo container cho các nút độ khó
    let difficultyContainer = document.createElement("div");
    difficultyContainer.style.display = "flex";
    difficultyContainer.style.justifyContent = "space-between";
    difficultyContainer.style.gap = "15px";

    // Các nút độ khó
    let easyButton = createDifficultyButton("DỄ", "#32CD32");
    easyButton.onclick = function () {
        gameMode = "versus";
        aiEnabled = true;
        aiShip.difficulty = "easy";
        document.body.removeChild(modalBackdrop);
        resetGame();
    };
    difficultyContainer.appendChild(easyButton);

    let mediumButton = createDifficultyButton("TRUNG BÌNH", "#FFA500");
    mediumButton.onclick = function () {
        gameMode = "versus";
        aiEnabled = true;
        aiShip.difficulty = "medium";
        document.body.removeChild(modalBackdrop);
        resetGame();
    };
    difficultyContainer.appendChild(mediumButton);

    let hardButton = createDifficultyButton("KHÓ", "#FF4500");
    hardButton.onclick = function () {
        gameMode = "versus";
        aiEnabled = true;
        aiShip.difficulty = "hard";
        document.body.removeChild(modalBackdrop);
        resetGame();
    };
    difficultyContainer.appendChild(hardButton);

    versusContainer.appendChild(difficultyContainer);
    modesContainer.appendChild(versusContainer);

    dialog.appendChild(modesContainer);

    // Nút Quay Lại
    let backButton = document.createElement("button");
    backButton.textContent = "QUAY LẠI";
    backButton.style.backgroundColor = "#888";
    backButton.style.color = "white";
    backButton.style.border = "none";
    backButton.style.padding = "10px 20px";
    backButton.style.marginTop = "20px";
    backButton.style.cursor = "pointer";
    backButton.style.width = "150px";
    backButton.style.fontFamily = "courier";
    backButton.style.fontWeight = "bold";
    backButton.style.fontSize = "14px";
    backButton.style.borderRadius = "5px";
    backButton.style.margin = "0 auto";
    backButton.style.display = "block";

    // Hiệu ứng hover
    backButton.onmouseover = function () {
        backButton.style.backgroundColor = "#666";
    };
    backButton.onmouseout = function () {
        backButton.style.backgroundColor = "#888";
    };

    backButton.onclick = function () {
        document.body.removeChild(modalBackdrop);
        showPlayerNameDialog();
    };

    dialog.appendChild(backButton);

    // Thêm vào DOM
    modalBackdrop.appendChild(dialog);
    document.body.appendChild(modalBackdrop);
}

/**
 * Tạo nút chế độ chơi với hiệu ứng hover
 */
function createModeButton(title, description, iconSrc, color) {
    let button = document.createElement("div");
    button.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
    button.style.border = `2px solid ${color}`;
    button.style.borderRadius = "8px";
    button.style.padding = "15px";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.cursor = "pointer";
    button.style.transition = "all 0.2s ease";

    // Hiệu ứng hover
    button.onmouseover = function () {
        button.style.backgroundColor = "rgba(50, 50, 50, 0.8)";
        button.style.transform = "translateY(-2px)";
        button.style.boxShadow = `0 5px 15px rgba(${color === "#00ff00" ? "0, 255, 0" : "255, 51, 102"}, 0.3)`;
    };
    button.onmouseout = function () {
        button.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
        button.style.transform = "translateY(0)";
        button.style.boxShadow = "none";
    };

    // Icon
    let icon = document.createElement("img");
    icon.src = iconSrc;
    icon.style.width = "48px";
    icon.style.height = "48px";
    icon.style.marginRight = "15px";

    // Xử lý lỗi khi tải hình ảnh
    icon.onerror = function () {
        // Tạo fallback icon
        let fallbackIcon = document.createElement("div");
        fallbackIcon.style.width = "48px";
        fallbackIcon.style.height = "48px";
        fallbackIcon.style.backgroundColor = color;
        fallbackIcon.style.borderRadius = "5px";
        fallbackIcon.style.display = "flex";
        fallbackIcon.style.justifyContent = "center";
        fallbackIcon.style.alignItems = "center";
        fallbackIcon.style.color = "white";
        fallbackIcon.style.fontWeight = "bold";
        fallbackIcon.textContent = title.charAt(0);
        button.replaceChild(fallbackIcon, icon);
    };

    button.appendChild(icon);

    // Container cho text
    let textContainer = document.createElement("div");
    textContainer.style.textAlign = "left";

    // Tiêu đề
    let titleElement = document.createElement("h3");
    titleElement.textContent = title;
    titleElement.style.margin = "0 0 5px 0";
    titleElement.style.color = color;
    textContainer.appendChild(titleElement);

    // Mô tả
    let descElement = document.createElement("p");
    descElement.textContent = description;
    descElement.style.margin = "0";
    descElement.style.fontSize = "14px";
    descElement.style.color = "#ccc";
    textContainer.appendChild(descElement);

    button.appendChild(textContainer);

    return button;
}

/**
 * Tạo nút độ khó với hiệu ứng hover
 */
function createDifficultyButton(text, color) {
    let button = document.createElement("button");
    button.textContent = text;
    button.style.backgroundColor = color;
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.padding = "10px 15px";
    button.style.cursor = "pointer";
    button.style.fontFamily = "courier";
    button.style.fontWeight = "bold";
    button.style.fontSize = "14px";
    button.style.flex = "1";
    button.style.transition = "all 0.2s";

    // Hiệu ứng hover
    button.onmouseover = function () {
        button.style.transform = "scale(1.05)";
        button.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.5)";
    };
    button.onmouseout = function () {
        button.style.transform = "scale(1)";
        button.style.boxShadow = "none";
    };

    return button;
}

// Export hàm để sử dụng từ space.js
window.showGameModeSelection = showGameModeSelection;
window.createModeButton = createModeButton;
window.createDifficultyButton = createDifficultyButton;
