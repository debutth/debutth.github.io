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

    let rows = 6, cols = 6, mines = 6;
    let board = [];
    let revealed = [];
    let flagged = [];
    let gameOver = false;

    function setDifficulty() {
        const diff = diffSelect.value;
        if (diff === "facile") { rows = 6; cols = 6; mines = 6; }
        else if (diff === "moyen") { rows = 8; cols = 8; mines = 12; }
        else { rows = 10; cols = 10; mines = 20; }
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