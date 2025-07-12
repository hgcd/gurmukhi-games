// Game state variables
let currentRound = 0;
let totalRounds = 5;
let score = 0;
let selectedAkhars = [];
let availableOptions = [];
let correctOrder = [];
let akharMistakes = [];
let akharCorrect = [];

CORRECT_GURMUKHI_AKHAR_GRID = [
    ["ੳ", "ਅ", "ੲ", "ਸ", "ਹ"],
    ["ਕ", "ਖ", "ਗ", "ਘ", "ਙ"],
    ["ਚ", "ਛ", "ਜ", "ਝ", "ਞ"],
    ["ਟ", "ਠ", "ਡ", "ਢ", "ਣ"],
    ["ਤ", "ਥ", "ਦ", "ਧ", "ਨ"],
    ["ਪ", "ਫ", "ਬ", "ਭ", "ਮ"],
    ["ਯ", "ਰ", "ਲ", "ਵ", "ੜ"]
]

// Initialize the game
function initGame() {
    currentRound = 0;
    score = 0;
    selectedAkhars = [];
    availableOptions = [];
    correctOrder = [];
    akharMistakes = [];
    akharCorrect = [];
    
    document.getElementById('start-view').classList.remove('d-none');
    document.getElementById('game-view').classList.add('d-none');
    document.getElementById('end-view').classList.add('d-none');
}

// Start a new round
function startRound() {
    document.getElementById('start-view').classList.add('d-none');
    document.getElementById('game-view').classList.remove('d-none');
    
    // Reset round state
    selectedAkhars = [];
    availableOptions = [];
    correctOrder = [];
    
    // Generate the correct order from the 5x7 grid (read row by row for 7x5 display)
    correctOrder = [];
    for (let row = 0; row < CORRECT_GURMUKHI_AKHAR_GRID.length; row++) {
        for (let col = 0; col < CORRECT_GURMUKHI_AKHAR_GRID[row].length; col++) {
            correctOrder.push(CORRECT_GURMUKHI_AKHAR_GRID[row][col]);
        }
    }
    
    // Create shuffled options from the same source
    availableOptions = [...correctOrder];
    shuffle(availableOptions);
    
    // Create the grid
    createGrid();
    
    // Create the options
    createOptions();
    
    // Update progress
    updateProgress();
}

// Create the 7x5 grid
function createGrid() {
    const gridContainer = document.getElementById('akhar-grid');
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';
    
    for (let i = 0; i < 35; i++) {
        const cell = document.createElement('div');
        cell.id = `grid-cell-${i}`;
        cell.className = 'text-center rounded-3 p-2 border border-dark gurmukhi-braah-one';
        cell.style.width = '60px';
        cell.style.height = '60px';
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.backgroundColor = '#f8f9fa';
        
        const text = document.createElement('h3');
        text.id = `grid-text-${i}`;
        text.textContent = '';
        cell.appendChild(text);
        
        gridContainer.appendChild(cell);
    }
}

// Create the options at the bottom
function createOptions() {
    const optionsContainer = document.getElementById('options-section');
    optionsContainer.innerHTML = '';
    
    // Create rows of options (7 per row)
    for (let i = 0; i < availableOptions.length; i += 7) {
        const row = document.createElement('div');
        row.className = 'mb-2';
        
        for (let j = 0; j < 7 && i + j < availableOptions.length; j++) {
            const akhar = availableOptions[i + j];
            const button = document.createElement('button');
            button.id = `option-${i + j}`;
            button.className = 'btn-press bg-blue-dark m-1';
            button.style.width = '60px';
            button.style.height = '60px';
            button.onclick = () => selectAkhar(akhar, i + j);
            
            const text = document.createElement('h3');
            text.textContent = akhar;
            button.appendChild(text);
            
            row.appendChild(button);
        }
        
        optionsContainer.appendChild(row);
    }
}

// Select an akhar from options
function selectAkhar(akhar, optionIndex) {
    if (selectedAkhars.length < 35) {
        selectedAkhars.push(akhar);
        
        // Update grid
        const gridIndex = selectedAkhars.length - 1;
        const gridText = document.getElementById(`grid-text-${gridIndex}`);
        gridText.textContent = akhar;
        
        // Hide the option
        const optionButton = document.getElementById(`option-${optionIndex}`);
        optionButton.style.display = 'none';
        
        // Update progress
        updateProgress();
    }
}

// Remove last selected akhar
function removeLastAkhar() {
    if (selectedAkhars.length > 0) {
        const removedAkhar = selectedAkhars.pop();
        
        // Clear the last grid cell
        const gridIndex = selectedAkhars.length;
        const gridText = document.getElementById(`grid-text-${gridIndex}`);
        gridText.textContent = '';
        
        // Show the option again
        const optionIndex = availableOptions.indexOf(removedAkhar);
        const optionButton = document.getElementById(`option-${optionIndex}`);
        optionButton.style.display = 'inline-block';
        
        // Update progress
        updateProgress();
    }
}

// Check the answer
function checkAnswer() {
    if (selectedAkhars.length !== 35) {
        alert('Please fill all 35 positions before submitting!');
        return;
    }
    
    // Calculate score
    let correctCount = 0;
    let incorrectCount = 0;
    
    // Process each position with delays
    for (let i = 0; i < 35; i++) {
        setTimeout(() => {
            const gridCell = document.getElementById(`grid-cell-${i}`);
            const gridText = document.getElementById(`grid-text-${i}`);
            
            if (selectedAkhars[i] === correctOrder[i]) {
                correctCount++;
                gridCell.style.backgroundColor = '#d4edda'; // Green for correct
                gridText.style.color = '#155724';
                akharCorrect.push(selectedAkhars[i]);
                
                // Add bounce animation for correct letters
                bounceElement(`grid-cell-${i}`);
            } else {
                incorrectCount++;
                gridCell.style.backgroundColor = '#f8d7da'; // Red for incorrect
                gridText.style.color = '#721c24';
                akharMistakes.push(selectedAkhars[i]);
            }
            
            // Update progress during reveal
            const progress = ((i + 1) / 35) * 100;
            document.getElementById('progress-bar').style.width = progress + '%';
            
            // If this is the last position, show end view
            if (i === 34) {
                // Calculate points (correct - incorrect, minimum 0)
                const roundPoints = Math.max(0, correctCount - incorrectCount);
                score += roundPoints;
                
                // Update score display
                document.getElementById('score').textContent = score;
                
                // Show end view after a delay
                setTimeout(() => {
                    document.getElementById('game-view').classList.add('d-none');
                    document.getElementById('end-view').classList.remove('d-none');
                    document.getElementById('final-score').textContent = roundPoints;
                    
                    // Debug
                    console.log("akharCorrect", akharCorrect);
                    console.log("akharMistakes", akharMistakes);
                    console.log("score", akharCorrect.length - akharMistakes.length);

                    // Register activity
                    registerActivity(
                        "akhar full order",
                        akharCorrect.length - akharMistakes.length,
                        ["listening", "reading", "vocabulary"],
                        {
                            "akhar_mistakes": akharMistakes,
                            "akhar_correct": akharCorrect
                        }
                    );
                }, 2000);
            }
        }, i * 100); // 100ms delay between each position
    }
}

// Update progress
function updateProgress() {
    const progress = (selectedAkhars.length / 35) * 100;
    document.getElementById('progress-bar').style.width = progress + '%';
    document.getElementById('progress-text').textContent = `${selectedAkhars.length}/35`;
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initGame();
});
