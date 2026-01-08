// The provided rulekeys array
const rulekeys = [
    "", "c", "e", "a", "c", "c", "a", "i",
    "e", "k", "e", "j", "a", "n", "a", "a",
    "c", "n", "k", "q", "c", "c", "n", "n",
    "a", "q", "j", "w", "i", "n", "a", "a",
    "e", "k", "i", "r", "k", "y", "r", "t",
    "e", "k", "e", "j", "j", "k", "r", "n",
    "a", "q", "r", "z", "n", "y", "i", "r",
    "a", "q", "r", "q", "a", "j", "i", "a",
    "c", "c", "k", "n", "n", "c", "q", "n",
    "k", "y", "k", "k", "q", "y", "q", "j",
    "c", "c", "y", "y", "c", "c", "y", "e",
    "n", "y", "k", "k", "n", "e", "j", "e",
    "a", "n", "r", "i", "q", "y", "z", "r",
    "j", "k", "j", "y", "w", "k", "q", "k",
    "i", "n", "t", "r", "n", "e", "r", "i",
    "a", "j", "n", "k", "a", "e", "a", "e",
    "e", "a", "e", "a", "k", "n", "j", "a",
    "i", "r", "e", "r", "r", "i", "r", "i",
    "k", "q", "k", "q", "y", "y", "k", "j",
    "r", "z", "j", "q", "t", "r", "n", "a",
    "e", "j", "e", "r", "k", "k", "j", "n",
    "e", "j", "e", "c", "j", "y", "c", "c",
    "j", "w", "j", "q", "k", "k", "y", "k",
    "r", "q", "c", "n", "n", "k", "c", "c",
    "a", "i", "j", "a", "q", "n", "w", "a",
    "r", "t", "j", "n", "z", "r", "q", "a",
    "n", "n", "k", "j", "y", "e", "k", "e",
    "i", "r", "y", "k", "r", "i", "k", "e",
    "a", "a", "r", "i", "q", "j", "q", "a",
    "r", "n", "c", "c", "q", "k", "n", "c",
    "a", "a", "n", "a", "j", "e", "k", "e",
    "i", "a", "c", "c", "a", "e", "c", "8"
]

// Game state variables
let grid = []
let revealed = []
let flagged = []
let gameOver = false
let firstClick = true
let width = 10
let height = 10
let mines = 15
let time = 0
let tick = false
let timer
let mineCount

// DOM elements
const boardElement = document.getElementById('board')
const widthInput = document.getElementById('width')
const heightInput = document.getElementById('height')
const minesInput = document.getElementById('mines')
const smiley = document.getElementById('smiley')
const gameContainer = document.getElementById('container')
const timeDisplay = document.getElementById('time')
const mineDisplay = document.getElementById('mine-count')
const customGame = document.getElementById('custom-game')
const gameMenu = document.getElementById('game-menu')
let gameMenuPop = false

// Initialize UI
window.onload = () => {
    customGame.style.display = "none"
    gameMenu.style.display = "none"
    gameMenu.style.left = "10px"
    gameMenu.style.top = "10px"
    const gameMenuButton = document.getElementById('game')
    container.addEventListener("click", () => {
        if (gameMenuPop) {
            gameMenu.style.display = "none"
            gameMenuPop = false
        }
    })
    gameMenuButton.addEventListener("click", () => {
        gameMenu.style.display = ""
        setTimeout(() => {gameMenuPop = true}, 100)
    })
}

// Initialize the game
window.initGame = function (targetWidth, targetHeight, targetMines) {
    width = targetWidth || (parseInt(widthInput.value) || 10)
    height = targetHeight || (parseInt(heightInput.value) || 10)
    mines = targetMines || (parseInt(minesInput.value) || 15)
    
    // Validate input
    if (width < 1) width = 1
    if (height < 1) height = 1
    const maxMines = width * height - 1
    if (mines < 1) mines = 1
    if (mines > maxMines) mines = maxMines
    
    // Update input values
    widthInput.value = width
    heightInput.value = height
    minesInput.value = mines
    
    mineCount = mines
    
    // Reset game state
    grid = Array(height).fill().map(() => Array(width).fill(0))
    revealed = Array(height).fill().map(() => Array(width).fill(false))
    flagged = Array(height).fill().map(() => Array(width).fill(false))
    gameOver = false
    firstClick = true
    time = 0
    tick = false
    timeDisplay.innerHTML = "000"
    mineDisplay.innerHTML = "010"
    clearInterval(timer)
    chgStatus("🙂")
    
    // Render the board
    renderBoard()

    // Resize the game board
    gameContainer.style.width = `${width * 30 + 48}px`
}

// Place mines after first click to ensure first cell is safe
function placeMines(firstRow, firstCol) {
    let minesPlaced = 0
    
    while (minesPlaced < mines) {
        const row = Math.floor(Math.random() * height)
        const col = Math.floor(Math.random() * width)
        
        // Skip if it's the first clicked cell or adjacent cells
        if (Math.abs(row - firstRow) <= 1 && Math.abs(col - firstCol) <= 1) {
            continue
        }
        
        // Skip if there's already a mine
        if (grid[row][col] === -1) {
            continue
        }
        
        // Place mine
        grid[row][col] = -1
        minesPlaced++
    }
    
    // Calculate numbers for non-mine cells
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            if (grid[row][col] !== -1) {
                grid[row][col] = calculateRuleIndex(row, col)
            }
        }
    }
}

// Calculate the rule index for a cell
function calculateRuleIndex(row, col) {
    let index = 0
    let weight = 1
    
    // Check all 8 neighbors in the specified order
    const neighbors = [
        [row-1, col-1], [row-1, col], [row-1, col+1],
        [row, col+1], [row+1, col+1], [row+1, col],
        [row+1, col-1], [row, col-1]
    ]
    
    for (let i = 0; i < neighbors.length; i++) {
        const [r, c] = neighbors[i]
        // Check if the neighbor is within bounds and is a mine
        if (r >= 0 && r < height && c >= 0 && c < width && grid[r][c] === -1) {
            index += weight
        }
        weight *= 2
    }
    
    return index
}

// Change expression of status (smiley)
function chgStatus(expr, override) {
    if (!gameOver ^ override) {
        smiley.innerHTML = expr
    }
}

// Reveal a cell
function revealCell(row, col) {
    if (gameOver || revealed[row][col] || flagged[row][col]) {
        return
    }
    
    // First click - place mines and ensure safety
    if (firstClick) {
        firstClick = false
        tick = true
        timer = setInterval(() => {
            time++
            timeDisplay.innerHTML = "0".repeat(3 - `${time}`.length) + time
        }, 1000)
        placeMines(row, col)
        // Recalculate the rule index for the first cell after mines are placed
        grid[row][col] = calculateRuleIndex(row, col)
    }
    
    revealed[row][col] = true
    
    // Check if it's a mine
    if (grid[row][col] === -1) {
        gameOver = true
        revealAllMines()
        return
    }
    
    // If it's a zero, reveal adjacent cells
    if (grid[row][col] === 0) {
        revealAdjacentCells(row, col)
    }
    
    // Check for win
    if (checkWin()) {
        chgStatus("😎")
        gameOver = true
        clearInterval(timer)
        renderBoard()
        return
    }
    
    renderBoard()
}

// Reveal adjacent cells for zeros
function revealAdjacentCells(row, col) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ]
    
    for (const [dr, dc] of directions) {
        const newRow = row + dr
        const newCol = col + dc
        
        if (newRow >= 0 && newRow < height && newCol >= 0 && newCol < width) {
            if (!revealed[newRow][newCol] && !flagged[newRow][newCol]) {
                revealed[newRow][newCol] = true
                
                if (grid[newRow][newCol] === 0) {
                    revealAdjacentCells(newRow, newCol)
                }
            }
        }
    }
}

// Toggle flag on a cell
function toggleFlag(row, col) {
    if (gameOver || revealed[row][col] || (mineCount < 1 && !flagged[row][col])) {
        return
    }
    
    flagged[row][col] = !flagged[row][col]
    if (flagged[row][col]) {
        mineCount--
    } else {
        mineCount++
    }
    mineDisplay.innerHTML = "0".repeat(3 - `${mineCount}`.length) + mineCount
    renderBoard()
}

// Check if the player has won
function checkWin() {
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            // If there's a non-mine cell that hasn't been revealed, game is not won
            if (grid[row][col] !== -1 && !revealed[row][col]) {
                return false
            }
        }
    }
    return true
}

// Reveal all mines when game is lost
function revealAllMines() {
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            if (grid[row][col] === -1) {
                revealed[row][col] = true
            }
        }
    }
    clearInterval(timer)
    renderBoard()
    chgStatus("😵", true)
}

// Render the game board
function renderBoard() {
    // Clear the board
    boardElement.innerHTML = ''
    
    // Set grid template
    boardElement.style.gridTemplateColumns = `repeat(${width}, 30px)`
    boardElement.style.gridTemplateRows = `repeat(${height}, 30px)`
    
    // Create cells
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const cell = document.createElement('div')
            cell.className = 'cell'
            cell.dataset.row = row
            cell.dataset.col = col
            
            if (revealed[row][col]) {
                cell.classList.add('revealed')
                
                if (grid[row][col] === -1) {
                    cell.classList.add('mine')
                    cell.textContent = "💣"
                } else {
                    const ruleIndex = grid[row][col]
                    cell.textContent = rulekeys[ruleIndex] || ''
                }
            } else if (flagged[row][col]) {
                cell.classList.add('flagged')
            }
            
            // Add click events
            cell.addEventListener('click', () => {
                revealCell(row, col)
            })

            cell.addEventListener('mousedown', (e) => {
                if (e.button === 0) {
                    chgStatus("😮")
                }
            })

            cell.addEventListener('mouseup', () => {
                chgStatus("🙂")
            })
            
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault()
                toggleFlag(row, col)
            })
            
            boardElement.appendChild(cell)
        }
    }
}

window.setBoard = function (targetWidth, targetHeight, targetMines) {
    initGame(targetWidth, targetHeight, targetMines)
}

// Event listeners
smiley.addEventListener('click', initGame)

// Initialize the game
initGame()
