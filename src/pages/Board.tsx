import React, { useState } from 'react';
import './Board.css';
import Modal from '../components/Modal';

const createEmptyGrid = (size: number) => {
    return Array.from({ length: size }, () => Array(size).fill(null));
};

export const Board: React.FC = () => {
    const [gridSize, setGridSize] = useState(10);
    const [grid, setGrid] = useState(createEmptyGrid(gridSize));
    const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
    const [winner, setWinner] = useState<string | null>(null);
    const [winningLine, setWinningLine] = useState<number[][]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [history, setHistory] = useState([createEmptyGrid(gridSize)]);
    const [stepNumber, setStepNumber] = useState(0);

    const handleClick = (row: number, col: number) => {
        if (grid[row][col] || winner) return;
        const newGrid = grid.map((r, rowIndex) =>
            r.map((cell, colIndex) =>
                rowIndex === row && colIndex === col ? currentPlayer : cell
            )
        );
        const newHistory = history.slice(0, stepNumber + 1);
        setGrid(newGrid);
        setHistory([...newHistory, newGrid]);
        setStepNumber(newHistory.length);
        checkWinner(newGrid, row, col);
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    };

    const checkWinner = (grid: string[][], row: number, col: number) => {
        const player = grid[row][col];
        const directions = [
            [[-1, 0], [1, 0]],    // vertical
            [[0, -1], [0, 1]],    // horizontal
            [[-1, -1], [1, 1]],   // diagonal from top-left to bottom-right
            [[-1, 1], [1, -1]]    // diagonal from top-right to bottom-left
        ];

        for (const direction of directions) {
            let count = 1;
            const cells = [[row, col]];
            for (const [dx, dy] of direction) {
                let r = row + dx;
                let c = col + dy;
                while (r >= 0 && r < grid.length && c >= 0 && c < grid.length && grid[r][c] === player) {
                    count++;
                    cells.push([r, c]);
                    r += dx;
                    c += dy;
                }
            }
            if (count >= 5) {
                setWinner(player);
                setWinningLine(cells);
                setIsModalOpen(true);
                return;
            }
        }
    };

    const resetGame = () => {
        const newGrid = createEmptyGrid(gridSize);
        setGrid(newGrid);
        setHistory([newGrid]);
        setCurrentPlayer('X');
        setStepNumber(0);
        setWinner(null);
        setWinningLine([]);
    };

    const undoMove = () => {
        if (stepNumber > 0) {
            setStepNumber(stepNumber - 1);
            setGrid(history[stepNumber - 1]);
            setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
        }
    };

    const redoMove = () => {
        if (stepNumber < history.length - 1) {
            setStepNumber(stepNumber + 1);
            setGrid(history[stepNumber + 1]);
            setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
        }
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        <div className={`container`}>
            <div className='actions-board'>
                <select 
                    onChange={(e) => {
                        const size = parseInt(e.target.value);
                        setGridSize(size);
                        setGrid(createEmptyGrid(size));
                        setWinner(null);
                        setCurrentPlayer('X');
                        setWinningLine([]);
                    }}
                    className='selectsize'
                >
                    <option value={10}>10x10</option>
                    <option value={15}>15x15</option>
                    <option value={20}>20x20</option>
                    <option value={25}>25x25</option>
                    <option value={30}>30x30</option>
                </select> | 
                <button onClick={resetGame} className='button-reset'>Reset &#8635;</button> | 
                <button onClick={undoMove} className='button-undo'>Undo &#x21A9;</button> | 
                <button onClick={redoMove} className='button-redo'>Redo &#x21AA;</button> | 
                <span 
                    className={`current-turn ${currentPlayer === 'X' ? 'x-cell' : 'o-cell'}`}
                >
                    Current turn: {currentPlayer}
                </span>
                {winner && <span>| Winner: {winner}</span>}
            </div>
            <div className='board-main'>
                <div>
                    {grid.map((row, rowIndex) => (
                        <div key={rowIndex} style={{ display: 'flex' }}>
                            {row.map((cell, colIndex) => (
                                <div
                                    key={colIndex}
                                    onClick={() => handleClick(rowIndex, colIndex)}
                                    className={`cell ${winningLine.some(([r, c]) => r === rowIndex && c === colIndex) ? 'winning-cell' : ''} ${cell === 'X' ? 'x-cell' : cell === 'O' ? 'o-cell' : ''}`}
                                >
                                    {cell}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            {isModalOpen && winner && (
                <Modal message={`${winner} wins`} onClose={toggleModal} />
            )}
        </div>
    );
};
