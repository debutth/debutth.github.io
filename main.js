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
            "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
            "000260701680070090190004500820100040004602900050083026009300074040050036703018000"
        ],
        medium: [
            "005300000800000020070010500400005300010070006003200080060500009004000030000009700",
            "100920000524010000000000070050008102000000000402700090060000000000030945000071006"
        ],
        hard: [
            "000000907000420180000705026100904000050000040000507009920108000034059000507000000",
            "030050040008010500460000012070502080000000000040109030250000098001020600080060020"
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

