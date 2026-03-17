// ── GAME STATE ──────────────────────────────────────────
let gameRunning = false;
let grid = [];
let player, ai, goal;
let walls = [], energy = [], portals = [];
let score = 0;
let gameInterval = null;

// ── START SCREEN ────────────────────────────────────────
function startGameScreen() {
    document.getElementById("intro").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");
    resetGame();
    startGame();
}

// ── GO BACK ─────────────────────────────────────────────
function goBack() {
    clearInterval(gameInterval);
    gameInterval = null;
    gameRunning = false;
    document.getElementById("game").classList.add("hidden");
    document.getElementById("intro").classList.remove("hidden");
}

// ── RANDOM POSITION ─────────────────────────────────────
function rand() {
    return Math.floor(Math.random() * 10) + "," + Math.floor(Math.random() * 10);
}

// ── GENERATE MAP ────────────────────────────────────────
function generateMap() {
    walls = []; energy = []; portals = [];

    // Reserved positions: player start, ai start, goal
    const reserved = new Set(["0,0", "9,9", "5,5"]);

    while (walls.length < 12) {
        let r = rand();
        if (!reserved.has(r)) { walls.push(r); reserved.add(r); }
    }
    while (energy.length < 4) {
        let r = rand();
        if (!reserved.has(r)) { energy.push(r); reserved.add(r); }
    }
    while (portals.length < 2) {
        let r = rand();
        if (!reserved.has(r)) { portals.push(r); reserved.add(r); }
    }
}

// ── CREATE GRID ─────────────────────────────────────────
function createGrid() {
    const g = document.getElementById("grid");
    g.innerHTML = "";
    grid = [];

    for (let i = 0; i < 10; i++) {
        let row = [];
        for (let j = 0; j < 10; j++) {
            let c = document.createElement("div");
            c.className = "cell";
            g.appendChild(c);
            row.push(c);
        }
        grid.push(row);
    }

    draw();
}

// ── DRAW ────────────────────────────────────────────────
function draw() {
    document.querySelectorAll(".cell").forEach(c => c.className = "cell");

    walls.forEach(w => {
        let [x, y] = w.split(",").map(Number);
        grid[x][y].classList.add("wall");
    });
    energy.forEach(e => {
        let [x, y] = e.split(",").map(Number);
        grid[x][y].classList.add("energy");
    });
    portals.forEach(p => {
        let [x, y] = p.split(",").map(Number);
        grid[x][y].classList.add("portal");
    });

    grid[goal.x][goal.y].classList.add("goal");
    grid[ai.x][ai.y].classList.add("ai");
    grid[player.x][player.y].classList.add("player");
}

// ── MOVE PLAYER ─────────────────────────────────────────
function movePlayer(dir) {
    if (!gameRunning) return;

    let nx = player.x;
    let ny = player.y;

    if (dir === "up")    nx--;
    if (dir === "down")  nx++;
    if (dir === "left")  ny--;
    if (dir === "right") ny++;

    // Bounds + wall check
    if (nx >= 0 && ny >= 0 && nx < 10 && ny < 10 && !walls.includes(nx + "," + ny)) {
        player.x = nx;
        player.y = ny;
    }

    // Caught by AI
    if (player.x === ai.x && player.y === ai.y) {
        endGame("💀 AI caught you!");
        return;
    }

    const key = player.x + "," + player.y;

    // Energy pickup
    if (energy.includes(key)) {
        energy = energy.filter(e => e !== key);
        score++;
        document.getElementById("score").innerText = score;
    }

    // Portal teleport
    if (portals.includes(key)) {
        const dest = portals[Math.floor(Math.random() * portals.length)];
        const [x, y] = dest.split(",").map(Number);
        player.x = x;
        player.y = y;
    }

    // Win check
    if (player.x === goal.x && player.y === goal.y) {
        endGame("🎉 You Win!  Score: " + score);
        return;
    }

    draw();
}

// ── MOVE AI ─────────────────────────────────────────────
function moveAI() {
    if (!gameRunning) return;

    const diff = document.getElementById("difficulty").value;
    let nx = ai.x;
    let ny = ai.y;

    if (diff === "easy") {
        // Random direction
        if (Math.random() > 0.5) nx += (Math.random() > 0.5 ? 1 : -1);
        else                     ny += (Math.random() > 0.5 ? 1 : -1);
    }
    else if (diff === "medium") {
        // Chase on one axis at a time
        if (player.x !== ai.x) nx += (player.x > ai.x ? 1 : -1);
        else                    ny += (player.y > ai.y ? 1 : -1);
    }
    else {
        // Hard: chase on both axes
        if (player.x > ai.x) nx++;
        if (player.x < ai.x) nx--;
        if (player.y > ai.y) ny++;
        if (player.y < ai.y) ny--;
    }

    // Bounds + wall check
    if (nx >= 0 && ny >= 0 && nx < 10 && ny < 10 && !walls.includes(nx + "," + ny)) {
        ai.x = nx;
        ai.y = ny;
    }

    if (ai.x === player.x && ai.y === player.y) {
        endGame("💀 AI caught you!");
        return;
    }

    draw();
}

// ── START GAME ──────────────────────────────────────────
function startGame() {
    clearInterval(gameInterval);
    gameRunning = true;

    const diff = document.getElementById("difficulty").value;
    const speed = diff === "hard" ? 300 : diff === "medium" ? 500 : 800;

    gameInterval = setInterval(moveAI, speed);
}

// ── RESET ───────────────────────────────────────────────
function resetGame() {
    clearInterval(gameInterval);
    gameInterval = null;
    gameRunning = false;

    player = { x: 0, y: 0 };
    ai     = { x: 9, y: 9 };
    goal   = { x: 5, y: 5 };

    score = 0;
    document.getElementById("score").innerText = 0;
    document.getElementById("popup").classList.add("hidden");

    generateMap();
    createGrid();
}

// ── END GAME ────────────────────────────────────────────
function endGame(msg) {
    gameRunning = false;
    clearInterval(gameInterval);
    gameInterval = null;

    document.getElementById("popupText").innerText = msg;
    document.getElementById("popup").classList.remove("hidden");
}

// ── PLAY AGAIN ──────────────────────────────────────────
function playAgain() {
    resetGame();
    startGame();
}

// ── KEYBOARD ────────────────────────────────────────────
document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp")    { e.preventDefault(); movePlayer("up"); }
    if (e.key === "ArrowDown")  { e.preventDefault(); movePlayer("down"); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); movePlayer("left"); }
    if (e.key === "ArrowRight") { e.preventDefault(); movePlayer("right"); }
});

// ── INIT ────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
    resetGame();
});
