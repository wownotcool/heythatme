// 1. 自動更新網頁底部年份
const yearElement = document.getElementById('year');
const currentYear = new Date().getFullYear(); 
if (yearElement) yearElement.textContent = currentYear; 

// 2. 瀏覽器網頁音效產生器
function playSound(type) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'click') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } else if (type === 'success') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); 
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }
}

// 3. 幫導覽列按鈕綁定點擊音效
const navLinks = document.querySelectorAll('.sound-btn');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    const soundType = link.getAttribute('data-type');
    playSound(soundType);
  });
});

// ================= 🎲 2048 核心小遊戲邏輯 =================
const gridContainer = document.getElementById('grid-container');
const scoreDisplay = document.getElementById('game-score');
const restartBtn = document.getElementById('restart-game-btn');
let board = [];
let gameScore = 0;

function initGame() {
    gameScore = 0;
    scoreDisplay.innerText = gameScore;
    board = Array(16).fill(0);
    gridContainer.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        let tile = document.createElement('div');
        tile.classList.add('tile2048');
        tile.id = 'tile-' + i;
        gridContainer.appendChild(tile);
    }
    generateTile();
    generateTile();
    updateBoard();
}

function generateTile() {
    let emptyTiles = [];
    board.forEach((val, index) => { if (val === 0) emptyTiles.push(index); });
    if (emptyTiles.length > 0) {
        let randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        board[randomTile] = Math.random() < 0.9 ? 2 : 4;
    }
}

function updateBoard() {
    board.forEach((val, index) => {
        let tile = document.getElementById('tile-' + index);
        tile.innerText = val > 0 ? val : '';
        tile.className = 'tile2048'; // reset
        if (val > 0) tile.classList.add('tile-' + val);
    });
}

// 滑動邏輯的一維陣列合併算法
function slide(row) {
    let arr = row.filter(val => val);
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            gameScore += arr[i];
            arr[i + 1] = 0;
        }
    }
    arr = arr.filter(val => val);
    while (arr.length < 4) arr.push(0);
    return arr;
}

function moveLeft() {
    let changed = false;
    for (let i = 0; i < 4; i++) {
        let start = i * 4;
        let row = board.slice(start, start + 4);
        let newRow = slide(row);
        for (let j = 0; j < 4; j++) {
            if (board[start + j] !== newRow[j]) changed = true;
            board[start + j] = newRow[j];
        }
    }
    return changed;
}

function moveRight() {
    let changed = false;
    for (let i = 0; i < 4; i++) {
        let start = i * 4;
        let row = board.slice(start, start + 4).reverse();
        let newRow = slide(row).reverse();
        for (let j = 0; j < 4; j++) {
            if (board[start + j] !== newRow[j]) changed = true;
            board[start + j] = newRow[j];
        }
    }
    return changed;
}

function moveUp() {
    let changed = false;
    for (let i = 0; i < 4; i++) {
        let row = [board[i], board[i + 4], board[i + 8], board[i + 12]];
        let newRow = slide(row);
        for (let j = 0; j < 4; j++) {
            if (board[i + j * 4] !== newRow[j]) changed = true;
            board[i + j * 4] = newRow[j];
        }
    }
    return changed;
}

function moveDown() {
    let changed = false;
    for (let i = 0; i < 4; i++) {
        let row = [board[i], board[i + 4], board[i + 8], board[i + 12]].reverse();
        let newRow = slide(row).reverse();
        for (let j = 0; j < 4; j++) {
            if (board[i + j * 4] !== newRow[j]) changed = true;
            board[i + j * 4] = newRow[j];
        }
    }
    return changed;
}

// 監聽鍵盤事件
window.addEventListener('keydown', (e) => {
    // 當使用者在玩遊戲時，防止方向鍵捲動網頁頁面
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
    
    let moved = false;
    if (e.key === 'ArrowLeft') moved = moveLeft();
    else if (e.key === 'ArrowRight') moved = moveRight();
    else if (e.key === 'ArrowUp') moved = moveUp();
    else if (e.key === 'ArrowDown') moved = moveDown();

    if (moved) {
        generateTile();
        updateBoard();
        scoreDisplay.innerText = gameScore;
    }
});

restartBtn.addEventListener('click', initGame);
initGame(); // 網頁載入時初始化遊戲