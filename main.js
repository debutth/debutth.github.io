// Morpion JS
const board = document.getElementById('morpion-board');
const status = document.getElementById('morpion-status');
const resetBtn = document.getElementById('morpion-reset');
let cells = [];
let currentPlayer = "X";
let gameActive = true;

function checkWin() {
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (let pattern of winPatterns) {
        const [a,b,c] = pattern;
        if (
            cells[a] && cells[a].textContent &&
            cells[a].textContent === cells[b].textContent &&
            cells[a].textContent === cells[c].textContent
        ) {
            return cells[a].textContent;
        }
    }
    return cells.length === 9 && cells.every(cell => cell.textContent) ? "draw" : null;
}

function handleClick(e) {
    if (!gameActive || e.target.textContent) return;
    e.target.textContent = currentPlayer;
    e.target.style.color = currentPlayer === "X" ? "#4f8cff" : "#6a5af9";
    let result = checkWin();
    if (result === "X" || result === "O") {
        status.textContent = `Le joueur ${result} a gagné !`;
        gameActive = false;
    } else if (result === "draw") {
        status.textContent = "Match nul !";
        gameActive = false;
    } else {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        status.textContent = `Au tour de ${currentPlayer}`;
    }
}

function resetGame() {
    cells.forEach(cell => {
        cell.textContent = "";
        cell.style.color = "#222";
    });
    currentPlayer = "X";
    gameActive = true;
    status.textContent = "À toi de jouer !";
}

if (board) {
    board.innerHTML = "";
    cells = [];
    for (let i = 0; i < 9; i++) {
        let cell = document.createElement('div');
        cell.style.cssText = "background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(80,80,160,0.10);display:flex;align-items:center;justify-content:center;font-size:2em;cursor:pointer;height:70px;width:70px;transition:background 0.2s;";
        cell.addEventListener('mouseenter', () => cell.style.background = "#e3e7ed");
        cell.addEventListener('mouseleave', () => cell.style.background = "#fff");
        cell.addEventListener('click', handleClick);
        board.appendChild(cell);
        cells.push(cell);
    }
}
if (resetBtn) {
    resetBtn.addEventListener('click', resetGame);
}

// Démineur JS
document.addEventListener('DOMContentLoaded', function() {
    const diffSelect = document.getElementById('demineur-diff');
    const resetBtn = document.getElementById('demineur-reset');
    const boardDiv = document.getElementById('demineur-board');
    const statusDiv = document.getElementById('demineur-status');

    let rows = 8, cols = 8, mines = 6;
    let board = [];
    let revealed = [];
    let flagged = [];
    let gameOver = false;

    function setDifficulty() {
        const diff = diffSelect.value;
        if (diff === "facile") { rows = 8; cols = 8; mines = 6; }
        else if (diff === "moyen") { rows = 10; cols = 10; mines = 12; }
        else { rows = 12; cols = 12; mines = 18; }
    }

    function initBoard() {
        board = Array(rows * cols).fill(0);
        revealed = Array(rows * cols).fill(false);
        flagged = Array(rows * cols).fill(false);
        gameOver = false;
        statusDiv.textContent = "";

        // Place mines
        let minePositions = [];
        while (minePositions.length < mines) {
            let pos = Math.floor(Math.random() * board.length);
            if (!minePositions.includes(pos)) minePositions.push(pos);
        }
        minePositions.forEach(pos => board[pos] = "M");

        // Set numbers
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "M") continue;
            let count = 0;
            let r = Math.floor(i / cols), c = i % cols;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    let nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        if (board[nr * cols + nc] === "M") count++;
                    }
                }
            }
            board[i] = count;
        }
    }

    function renderBoard() {
        boardDiv.innerHTML = "";
        boardDiv.style.display = "grid";
        boardDiv.style.gridTemplateColumns = `repeat(${cols}, 32px)`;
        boardDiv.style.gridTemplateRows = `repeat(${rows}, 32px)`;
        boardDiv.style.gap = "4px";
        for (let i = 0; i < board.length; i++) {
            let cell = document.createElement('div');
            cell.className = "demineur-cell";
            cell.style.cssText = "background:#fff;border-radius:6px;box-shadow:0 2px 8px rgba(80,80,160,0.10);display:flex;align-items:center;justify-content:center;font-size:1.1em;cursor:pointer;height:32px;width:32px;user-select:none;transition:background 0.2s;";
            cell.dataset.idx = i;
            if (revealed[i]) {
                cell.style.background = "#e3e7ed";
                cell.style.cursor = "default";
                if (board[i] === "M") {
                    cell.textContent = "💣";
                    cell.style.color = "#e74c3c";
                } else if (board[i] > 0) {
                    cell.textContent = board[i];
                    cell.style.color = "#4f8cff";
                }
            } else if (flagged[i]) {
                cell.textContent = "🚩";
                cell.style.color = "#f39c12";
            }
            cell.addEventListener('click', function(e) {
                if (gameOver || revealed[i]) return;
                revealCell(i);
            });
            cell.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                if (gameOver || revealed[i]) return;
                flagged[i] = !flagged[i];
                renderBoard();
            });
            boardDiv.appendChild(cell);
        }
    }

    function revealCell(idx) {
        if (flagged[idx] || revealed[idx]) return;
        revealed[idx] = true;
        if (board[idx] === "M") {
            gameOver = true;
            statusDiv.textContent = "💥 Perdu ! Une mine a explosé.";
            revealAll();
            return;
        }
        // Si case vide, révèle les voisines
        if (board[idx] === 0) {
            let r = Math.floor(idx / cols), c = idx % cols;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    let nr = r + dr, nc = c + dc;
                    let nidx = nr * cols + nc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !revealed[nidx]) {
                        revealCell(nidx);
                    }
                }
            }
        }
        renderBoard();
        checkWin();
    }

    function revealAll() {
        for (let i = 0; i < board.length; i++) {
            revealed[i] = true;
        }
        renderBoard();
    }

    function checkWin() {
        let safeCells = board.filter(x => x !== "M").length;
        let revealedSafe = revealed.filter((v, i) => v && board[i] !== "M").length;
        if (revealedSafe === safeCells) {
            gameOver = true;
            statusDiv.textContent = "🎉 Bravo ! Tu as gagné !";
            revealAll();
        }
    }

    function startGame() {
        setDifficulty();
        initBoard();
        renderBoard();
        statusDiv.textContent = "Clique pour révéler, clic droit pour poser un drapeau.";
    }

    if (diffSelect && resetBtn) {
        diffSelect.addEventListener('change', startGame);
        resetBtn.addEventListener('click', startGame);
        startGame();
    }
});

// Sudoku JS
document.addEventListener('DOMContentLoaded', function() {
    const sudokuDiff = document.getElementById('sudoku-diff');
    const sudokuReset = document.getElementById('sudoku-reset');
    const sudokuBoard = document.getElementById('sudoku-board');
    const sudokuStatus = document.getElementById('sudoku-status');

    // Quelques grilles de départ (facile, moyen, difficile)
    const puzzles = {
        easy: [
            "530070000600195000098000060800060003400803001700020006060000280000419005000080079"
        ],
        medium: [
            "000000907000420180000705026100904000050000040000507009920108000034059000507000000"
        ],
        hard: [
            "300200000000107000706030500070009080900020004010800050009040301000702000000008006"
        ]
    };

    let solution = [];
    let initial = [];
    let cells = [];

    function generatePuzzle() {
        let diff = sudokuDiff.value;
        let puzzleStr = puzzles[diff][Math.floor(Math.random() * puzzles[diff].length)];
        initial = puzzleStr.split('').map(n => n === "0" ? "" : n);
        solution = solveSudoku(puzzleStr.split('').map(n => n === "0" ? "" : n));
    }

    function renderBoard() {
        sudokuBoard.innerHTML = "";
        cells = [];
        sudokuBoard.style.display = "grid";
        sudokuBoard.style.gridTemplateColumns = "repeat(9, 36px)";
        sudokuBoard.style.gridTemplateRows = "repeat(9, 36px)";
        sudokuBoard.style.gap = "2px";
        for (let i = 0; i < 81; i++) {
            let cell = document.createElement('input');
            cell.type = "text";
            cell.maxLength = 1;
            cell.className = "sudoku-cell";
            cell.style.cssText = "background:#fff;border-radius:6px;box-shadow:0 2px 8px rgba(80,80,160,0.10);display:flex;align-items:center;justify-content:center;font-size:1.2em;text-align:center;height:36px;width:36px;border:1px solid #e3e7ed;outline:none;transition:background 0.2s;";
            if (initial[i]) {
                cell.value = initial[i];
                cell.disabled = true;
                cell.style.background = "#e3e7ed";
                cell.style.fontWeight = "bold";
                cell.style.color = "#4f8cff";
            } else {
                cell.value = "";
                cell.style.color = "#222";
                cell.addEventListener('input', function() {
                    cell.value = cell.value.replace(/[^1-9]/g, "");
                    checkSudoku();
                });
            }
            // Bordures pour le style Sudoku
            if (i % 9 === 2 || i % 9 === 5) cell.style.borderRight = "2px solid #4f8cff";
            if (i % 9 === 3 || i % 9 === 6) cell.style.borderLeft = "2px solid #4f8cff";
            if (Math.floor(i / 9) === 2 || Math.floor(i / 9) === 5) cell.style.borderBottom = "2px solid #4f8cff";
            if (Math.floor(i / 9) === 3 || Math.floor(i / 9) === 6) cell.style.borderTop = "2px solid #4f8cff";
            sudokuBoard.appendChild(cell);
            cells.push(cell);
        }
        sudokuStatus.textContent = "Remplis la grille et valide !";
    }

    function checkSudoku() {
        let userGrid = cells.map(cell => cell.value || "");
        for (let i = 0; i < 81; i++) {
            if (userGrid[i] !== solution[i]) {
                sudokuStatus.textContent = "Il y a des erreurs ou la grille n'est pas complète.";
                return;
            }
        }
        sudokuStatus.textContent = "🎉 Bravo ! Sudoku résolu !";
    }

    function startSudoku() {
        generatePuzzle();
        renderBoard();
    }

    if (sudokuDiff && sudokuReset) {
        sudokuDiff.addEventListener('change', startSudoku);
        sudokuReset.addEventListener('click', startSudoku);
        startSudoku();
    }

    // Solveur simple (backtracking)
    function solveSudoku(grid) {
        function isValid(grid, row, col, num) {
            for (let x = 0; x < 9; x++) {
                if (grid[row * 9 + x] == num) return false;
                if (grid[x * 9 + col] == num) return false;
            }
            let startRow = Math.floor(row / 3) * 3;
            let startCol = Math.floor(col / 3) * 3;
            for (let r = startRow; r < startRow + 3; r++) {
                for (let c = startCol; c < startCol + 3; c++) {
                    if (grid[r * 9 + c] == num) return false;
                }
            }
            return true;
        }
        function solve(grid) {
            for (let i = 0; i < 81; i++) {
                if (!grid[i]) {
                    let row = Math.floor(i / 9), col = i % 9;
                    for (let num = 1; num <= 9; num++) {
                        if (isValid(grid, row, col, String(num))) {
                            grid[i] = String(num);
                            if (solve(grid)) return true;
                            grid[i] = "";
                        }
                    }
                    return false;
                }
            }
            return true;
        }
        let gridCopy = grid.slice();
        solve(gridCopy);
        return gridCopy;
    }
});

// SNAKE
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const status = document.getElementById('snake-status');
    const resetBtn = document.getElementById('snake-reset');
    const size = 20;
    let snake, direction, food, score, gameOver, interval;

    function startSnake() {
        snake = [{x: 8, y: 8}];
        direction = 'right';
        food = {x: Math.floor(Math.random()*16), y: Math.floor(Math.random()*16)};
        score = 0;
        gameOver = false;
        status.textContent = "Utilise les flèches pour jouer !";
        clearInterval(interval);
        interval = setInterval(updateSnake, 180); // ralentit le serpent
        drawSnake();
    }

    function drawSnake() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        // Draw food
        ctx.fillStyle = "#e74c3c";
        ctx.fillRect(food.x*size, food.y*size, size, size);
        // Draw snake
        ctx.fillStyle = "#4f8cff";
        snake.forEach((s, i) => {
            ctx.fillRect(s.x*size, s.y*size, size, size);
        });
        // Draw score
        ctx.fillStyle = "#222";
        ctx.font = "16px Segoe UI";
        ctx.fillText("Score : " + score, 10, 20);
    }

    function updateSnake() {
        if (gameOver) return;
        let head = {...snake[0]};
        if (direction === "right") head.x++;
        if (direction === "left") head.x--;
        if (direction === "up") head.y--;
        if (direction === "down") head.y++;
        // Check collision
        if (head.x < 0 || head.x > 15 || head.y < 0 || head.y > 15 || snake.some(s => s.x === head.x && s.y === head.y)) {
            status.textContent = "💥 Perdu ! Score : " + score;
            gameOver = true;
            clearInterval(interval);
            return;
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score++;
            food = {x: Math.floor(Math.random()*16), y: Math.floor(Math.random()*16)};
        } else {
            snake.pop();
        }
        drawSnake();
    }

    document.addEventListener('keydown', function(e) {
        if (!canvas || gameOver) return;
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault(); // empêche le scroll de la page
        }
        if (e.key === "ArrowUp" && direction !== "down") direction = "up";
        if (e.key === "ArrowDown" && direction !== "up") direction = "down";
        if (e.key === "ArrowLeft" && direction !== "right") direction = "left";
        if (e.key === "ArrowRight" && direction !== "left") direction = "right";
    });

    if (resetBtn) resetBtn.addEventListener('click', startSnake);
    if (canvas) startSnake();
});

// 2048
document.addEventListener('DOMContentLoaded', function() {
    const boardDiv = document.getElementById('game2048-board');
    const statusDiv = document.getElementById('game2048-status');
    const resetBtn = document.getElementById('game2048-reset');
    let board, score, gameOver;

    function start2048() {
        board = Array(16).fill(0);
        score = 0;
        gameOver = false;
        addTile();
        addTile();
        render2048();
        statusDiv.textContent = "Utilise les flèches pour jouer !";
    }

    function addTile() {
        let empty = board.map((v,i) => v===0?i:null).filter(v=>v!==null);
        if (empty.length === 0) return;
        let idx = empty[Math.floor(Math.random()*empty.length)];
        board[idx] = Math.random() < 0.9 ? 2 : 4;
    }

    function render2048() {
        boardDiv.innerHTML = "";
        boardDiv.style.display = "grid";
        boardDiv.style.gridTemplateColumns = "repeat(4, 60px)";
        boardDiv.style.gridTemplateRows = "repeat(4, 60px)";
        boardDiv.style.gap = "6px";
        for (let i = 0; i < 16; i++) {
            let cell = document.createElement('div');
            cell.className = "game2048-cell";
            cell.style.cssText = "background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(80,80,160,0.10);display:flex;align-items:center;justify-content:center;font-size:1.3em;font-weight:600;height:60px;width:60px;transition:background 0.2s;";
            if (board[i]) {
                cell.textContent = board[i];
                cell.style.background = "#e3e7ed";
                cell.style.color = "#4f8cff";
            }
            boardDiv.appendChild(cell);
        }
        statusDiv.textContent = "Score : " + score;
    }

    function move2048(dir) {
        if (gameOver) return;
        let moved = false;
        let merge = Array(16).fill(false);
        function getIdx(r,c) { return r*4+c; }
        for (let times=0; times<4; times++) {
            for (let r=0; r<4; r++) {
                for (let c=0; c<4; c++) {
                    let i = getIdx(r,c);
                    if (!board[i]) continue;
                    let nr = r, nc = c;
                    if (dir==="left" && c>0) nc--;
                    if (dir==="right" && c<3) nc++;
                    if (dir==="up" && r>0) nr--;
                    if (dir==="down" && r<3) nr++;
                    let ni = getIdx(nr,nc);
                    if (ni!==i && board[ni]===0) {
                        board[ni]=board[i]; board[i]=0; moved=true;
                    } else if (ni!==i && board[ni]===board[i] && !merge[ni] && !merge[i]) {
                        board[ni]*=2; board[i]=0; score+=board[ni]; merge[ni]=true; moved=true;
                    }
                }
            }
        }
        if (moved) addTile();
        render2048();
        if (!canMove()) {
            statusDiv.textContent = "💥 Perdu ! Score : " + score;
            gameOver = true;
        }
        if (board.some(v=>v===2048)) {
            statusDiv.textContent = "🎉 Bravo ! Tu as atteint 2048 !";
            gameOver = true;
        }
    }

    function canMove() {
        for (let r=0;r<4;r++) for (let c=0;c<4;c++) {
            let i=getIdx(r,c);
            if (board[i]===0) return true;
            for (let [dr,dc] of [[0,1],[1,0]]) {
                let nr=r+dr,nc=c+dc;
                if (nr<4 && nc<4 && board[getIdx(nr,nc)]===board[i]) return true;
            }
        }
        return false;
    }

    document.addEventListener('keydown', function(e) {
        if (!boardDiv || gameOver) return;
        if (e.key==="ArrowUp") move2048("up");
        if (e.key==="ArrowDown") move2048("down");
        if (e.key==="ArrowLeft") move2048("left");
        if (e.key==="ArrowRight") move2048("right");
    });

    if (resetBtn) resetBtn.addEventListener('click', start2048);
    if (boardDiv) start2048();
});

