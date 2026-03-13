class AI {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.maxDepth = this.getMaxDepth(difficulty);
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.maxDepth = this.getMaxDepth(difficulty);
    }

    getMaxDepth(difficulty) {
        const depthMap = {
            'easy': 2,
            'medium': 4,
            'hard': 6
        };
        return depthMap[difficulty] || 4;
    }

    getBestMove(board) {
        const moves = this.getAllMoves(board, 'ai');
        if (moves.length === 0) return null;

        let bestMove = moves[0];
        let bestScore = -Infinity;

        for (const move of moves) {
            const [fromRow, fromCol, toRow, toCol] = move;
            const newBoard = this.applyMove(board, fromRow, fromCol, toRow, toCol);
            const score = this.minimax(newBoard, this.maxDepth - 1, false);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    getAllMoves(board, player) {
        const moves = [];
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                if (board[row][col] === player) {
                    const validMoves = this.getValidMovesForPosition(board, row, col);
                    for (const [toRow, toCol] of validMoves) {
                        moves.push([row, col, toRow, toCol]);
                    }
                }
            }
        }
        return moves;
    }

    getValidMovesForPosition(board, row, col) {
        const moves = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (this.isInBounds(newRow, newCol) && !board[newRow][newCol]) {
                moves.push([newRow, newCol]);
            }

            const captureRow = row + dRow * 2;
            const captureCol = col + dCol * 2;
            if (
                this.isInBounds(captureRow, captureCol) &&
                !board[captureRow][captureCol] &&
                board[newRow][newCol] &&
                board[newRow][newCol] !== board[row][col]
            ) {
                moves.push([captureRow, captureCol]);
            }
        }

        return moves;
    }

    minimax(board, depth, isAITurn) {
        const aiMoves = this.getAllMoves(board, 'ai').length;
        const humanMoves = this.getAllMoves(board, 'human').length;

        // Terminal node evaluation
        if (depth === 0 || aiMoves === 0 || humanMoves === 0) {
            return this.evaluateBoard(board);
        }

        if (isAITurn) {
            let maxScore = -Infinity;
            const moves = this.getAllMoves(board, 'ai');
            for (const [fromRow, fromCol, toRow, toCol] of moves) {
                const newBoard = this.applyMove(board, fromRow, fromCol, toRow, toCol);
                const score = this.minimax(newBoard, depth - 1, false);
                maxScore = Math.max(maxScore, score);
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            const moves = this.getAllMoves(board, 'human');
            for (const [fromRow, fromCol, toRow, toCol] of moves) {
                const newBoard = this.applyMove(board, fromRow, fromCol, toRow, toCol);
                const score = this.minimax(newBoard, depth - 1, true);
                minScore = Math.min(minScore, score);
            }
            return minScore;
        }
    }

    evaluateBoard(board) {
        let aiScore = 0;
        let humanScore = 0;

        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 6; col++) {
                if (board[row][col] === 'ai') {
                    aiScore += this.getPositionValue(row, col, 'ai');
                } else if (board[row][col] === 'human') {
                    humanScore += this.getPositionValue(row, col, 'human');
                }
            }
        }

        // Count remaining moves
        const aiMoves = this.getAllMoves(board, 'ai').length;
        const humanMoves = this.getAllMoves(board, 'human').length;

        return (aiScore - humanScore) + (aiMoves - humanMoves) * 0.5;
    }

    getPositionValue(row, col, player) {
        // Value pieces based on position
        // Center and advanced positions are more valuable
        const distanceFromStart = player === 'ai' ? row : (5 - row);
        const centerBonus = 3 - Math.abs(col - 2.5);
        return 10 + distanceFromStart * 2 + centerBonus;
    }

    applyMove(board, fromRow, fromCol, toRow, toCol) {
        const newBoard = board.map(row => [...row]);
        newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = null;

        // Handle capture
        const midRow = (fromRow + toRow) / 2;
        const midCol = (fromCol + toCol) / 2;
        if (Number.isInteger(midRow) && Number.isInteger(midCol)) {
            if (newBoard[midRow][midCol] && newBoard[midRow][midCol] !== newBoard[toRow][toCol]) {
                newBoard[midRow][midCol] = null;
            }
        }

        return newBoard;
    }

    isInBounds(row, col) {
        return row >= 0 && row < 6 && col >= 0 && col < 6;
    }
}
