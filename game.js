class Game {
    constructor() {
        this.board = [];
        this.currentPlayer = 'human'; // 'human' or 'ai'
        this.selectedCell = null;
        this.validMoves = [];
        this.humanScore = 0;
        this.aiScore = 0;
        this.gameHistory = [];
        this.gameActive = true;
        this.difficulty = 'medium';

        this.aiPlayer = new AI(this.difficulty);
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        // Create 6x6 board
        this.board = Array(6).fill(null).map(() => Array(6).fill(null));

        // Place initial pieces
        // Human pieces (red) - top rows
        this.board[0][0] = 'human';
        this.board[0][2] = 'human';
        this.board[0][4] = 'human';
        this.board[1][1] = 'human';
        this.board[1][3] = 'human';
        this.board[1][5] = 'human';

        // AI pieces (blue) - bottom rows
        this.board[4][0] = 'ai';
        this.board[4][2] = 'ai';
        this.board[4][4] = 'ai';
        this.board[5][1] = 'ai';
        this.board[5][3] = 'ai';
        this.board[5][5] = 'ai';

        this.currentPlayer = 'human';
        this.gameActive = true;
        this.renderBoard();
        this.log('Game started! Red (Human) goes first.', 'info');
    }

    setupEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetScore());
        document.getElementById('clearLogBtn').addEventListener('click', () => this.clearLog());
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.aiPlayer.setDifficulty(this.difficulty);
        });
    }

    renderBoard() {
        const boardElement = document.getElementById('gameBoard');
        boardElement.innerHTML = '';

        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                const piece = this.board[row][col];
                if (piece) {
                    cell.classList.add(piece);
                }

                if (this.selectedCell && this.selectedCell.row === row && this.selectedCell.col === col) {
                    cell.classList.add('selected');
                }

                if (this.isValidMove(row, col)) {
                    cell.classList.add('valid-move');
                }

                cell.addEventListener('click', () => this.handleCellClick(row, col));
                boardElement.appendChild(cell);
            }
        }

        this.updateScore();
    }

    handleCellClick(row, col) {
        if (!this.gameActive || this.currentPlayer !== 'human') {
            this.log('Not your turn or game is not active.', 'warning');
            return;
        }

        const piece = this.board[row][col];

        // If clicking on own piece, select it
        if (piece === 'human') {
            this.selectedCell = { row, col };
            this.validMoves = this.getValidMoves(row, col);
            this.renderBoard();
            this.log(`Selected piece at (${row}, ${col})`, 'human');
            return;
        }

        // If clicking on valid move, make the move
        if (this.isValidMove(row, col)) {
            const fromRow = this.selectedCell.row;
            const fromCol = this.selectedCell.col;
            this.makeMove(fromRow, fromCol, row, col, 'human');
            this.selectedCell = null;
            this.validMoves = [];

            // Check for game end
            if (!this.hasValidMoves('ai')) {
                this.endGame('human');
            } else {
                // AI's turn
                setTimeout(() => this.aiTurn(), 800);
            }
        }
    }

    makeMove(fromRow, fromCol, toRow, toCol, player) {
        const piece = this.board[fromRow][fromCol];
        if (piece !== player) return;

        this.board[fromRow][fromCol] = null;
        this.board[toRow][toCol] = player;

        // Check for capture
        const capturedRow = (fromRow + toRow) / 2;
        const capturedCol = (fromCol + toCol) / 2;
        if (Number.isInteger(capturedRow) && Number.isInteger(capturedCol)) {
            const captured = this.board[capturedRow][capturedCol];
            if (captured && captured !== player) {
                this.board[capturedRow][capturedCol] = null;
                this.log(`${player === 'human' ? 'Red' : 'Blue'} captured a piece at (${capturedRow}, ${capturedCol})`, player);
            }
        }

        this.log(`${player === 'human' ? 'Red' : 'Blue'} moved from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol})`, player);
        this.renderBoard();
    }

    getValidMoves(row, col) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonal moves
        ];

        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            // Regular move
            if (this.isInBounds(newRow, newCol) && !this.board[newRow][newCol]) {
                moves.push([newRow, newCol]);
            }

            // Capture move
            const captureRow = row + dRow * 2;
            const captureCol = col + dCol * 2;
            if (
                this.isInBounds(captureRow, captureCol) &&
                !this.board[captureRow][captureCol] &&
                this.board[newRow][newCol] &&
                this.board[newRow][newCol] !== this.board[row][col]
            ) {
                moves.push([captureRow, captureCol]);
            }
        }

        return moves;
    }

    isValidMove(row, col) {
        if (!this.selectedCell) return false;
        return this.validMoves.some(([r, c]) => r === row && c === col);
    }

    isInBounds(row, col) {
        return row >= 0 && row < 6 && col >= 0 && col < 6;
    }

    hasValidMoves(player) {
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                if (this.board[row][col] === player) {
                    if (this.getValidMoves(row, col).length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    aiTurn() {
        if (!this.gameActive) return;

        document.getElementById('aiStatus').textContent = 'Thinking...';

        const move = this.aiPlayer.getBestMove(this.board);
        if (!move) {
            this.endGame('human');
            return;
        }

        const [fromRow, fromCol, toRow, toCol] = move;
        this.makeMove(fromRow, fromCol, toRow, toCol, 'ai');
        this.currentPlayer = 'human';
        document.getElementById('humanStatus').textContent = 'Your Turn';
        document.getElementById('aiStatus').textContent = 'Waiting...';

        // Check for game end
        if (!this.hasValidMoves('human')) {
            this.endGame('ai');
        }
    }

    endGame(winner) {
        this.gameActive = false;
        if (winner === 'human') {
            this.humanScore++;
            this.log('Game Over! Red (Human) wins!', 'success');
            document.getElementById('humanStatus').textContent = 'Won!';
        } else {
            this.aiScore++;
            this.log('Game Over! Blue (AI) wins!', 'warning');
            document.getElementById('aiStatus').textContent = 'Won!';
        }
        this.updateScore();
    }

    updateScore() {
        document.getElementById('humanScore').textContent = this.humanScore;
        document.getElementById('aiScore').textContent = this.aiScore;
    }

    newGame() {
        this.initializeGame();
        document.getElementById('humanStatus').textContent = 'Your Turn';
        document.getElementById('aiStatus').textContent = 'Waiting...';
    }

    resetScore() {
        this.humanScore = 0;
        this.aiScore = 0;
        this.updateScore();
        this.newGame();
        this.clearLog();
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logElement = document.getElementById('gameLog');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${timestamp}] ${message}`;
        logElement.appendChild(entry);
        logElement.scrollTop = logElement.scrollHeight;
        this.gameHistory.push({ message, type, timestamp });
    }

    clearLog() {
        document.getElementById('gameLog').innerHTML = '';
        this.gameHistory = [];
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
