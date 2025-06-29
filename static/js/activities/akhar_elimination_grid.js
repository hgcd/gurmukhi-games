// Game state
let score = 0;
let currentAkhar = "";
let grid = [];
let foundLetters = new Set();
let incorrectLetters = new Set();
let correctLetters = new Set();

function initGame() {
    score = 0;
    foundLetters.clear();
    incorrectLetters.clear();
    correctLetters.clear();
    showView("game-view");
    generateGrid();
    playNewAudio();
    updateDisplay();
}

function generateGrid() {
    // Get all akhars from PAINTI_AKHAR_AUDIO
    const akhars = Object.keys(PAINTI_AKHAR_AUDIO);
    
    // Create a shuffled array of 25 akhars
    grid = [];
    while (grid.length < 25) {
        const randomAkhar = akhars[Math.floor(Math.random() * akhars.length)];
        if (!grid.includes(randomAkhar)) {
            grid.push(randomAkhar);
        }
    }
    
    // Shuffle the grid
    grid = grid.sort(() => Math.random() - 0.5);
    
    // Populate grid
    const gridContainer = document.getElementById("akhar-grid");
    gridContainer.innerHTML = "";
    
    // Create 5 rows
    for (let row = 0; row < 5; row++) {
        const tr = document.createElement("tr");
        
        // Create 5 cells in each row
        for (let col = 0; col < 5; col++) {
            const index = row * 5 + col;
            const akhar = grid[index];
            
            const td = document.createElement("td");
            td.className = "p-1 bg-transparent";
            td.innerHTML = `
                <button id="grid-cell-${index}" class="btn-press text-center p-2 gurmukhi-braah-one w-100 h-100" onclick="selectAkhar('${akhar}', ${index})">
                    <h1>${akhar}</h1>
                </button>
            `;
            tr.appendChild(td);
        }
        
        gridContainer.appendChild(tr);
    }
}

function selectAkhar(akhar, index) {
    // Don't allow selection if already found or incorrect
    if (foundLetters.has(index) || incorrectLetters.has(index)) return;
    
    const isCorrect = akhar === currentAkhar;
    const button = document.getElementById(`grid-cell-${index}`);
    
    if (isCorrect) {
        // Correct selection
        button.classList.add("bg-success-light");
        button.classList.remove("bg-gray-light");
        foundLetters.add(index);
        correctLetters.add(akhar);
        score++;
        updateDisplay();
        bounceElement(button.id);
        
        // Check if game is over
        if (foundLetters.size + incorrectLetters.size === 25) {
            endGame();
            return;
        }
        
        // Play new audio after a short delay
        setTimeout(playNewAudio, 500);
    } else {
        // Incorrect selection
        button.classList.add("bg-failure-light");
        button.classList.remove("bg-gray-light");
        shakeElement(button.id);
        incorrectLetters.add(index);
        score--;
        
        // Find and highlight the correct answer
        const correctIndex = grid.indexOf(currentAkhar);
        const correctButton = document.getElementById(`grid-cell-${correctIndex}`);
        correctButton.classList.add("bg-success-light");
        correctButton.classList.remove("bg-gray-light");
        foundLetters.add(correctIndex);
        
        // Check if game is over
        if (foundLetters.size + incorrectLetters.size === 25) {
            endGame();
            return;
        }
        
        // Play new audio after a short delay
        setTimeout(playNewAudio, 1000);
    }
}

function playNewAudio() {
    // Get all available akhars (not found and not incorrect)
    const availableAkharIndices = grid.reduce((acc, akhar, index) => {
        if (!foundLetters.has(index) && !incorrectLetters.has(index)) acc.push(index);
        return acc;
    }, []);
    
    // If no more available akhars, end game
    if (availableAkharIndices.length === 0) {
        endGame();
        return;
    }
    
    // Select a random available akhar
    const randomIndex = availableAkharIndices[Math.floor(Math.random() * availableAkharIndices.length)];
    currentAkhar = grid[randomIndex];
    
    // Play the audio
    playCurrentAudio();
}

function playCurrentAudio() {
    const audio = PAINTI_AKHAR_AUDIO[currentAkhar];
    audio.play();
}

function endGame() {
    document.getElementById("final-score").textContent = score;
    showView("end-view");

    // Update final score
    document.getElementById("final-score").textContent = score;

    // Register activity
    registerActivity(
        "akhar elimination grid",
        score,
        ["listening", "recognition"],
        {
            "akhar_mistakes": Array.from(incorrectLetters),
            "akhar_correct": Array.from(correctLetters)
        }
    );
}

function updateDisplay() {
    // Update score
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
        scoreElement.textContent = score;
    }
}

function showView(viewId) {
    document.getElementById("start-view").classList.add("d-none");
    document.getElementById("game-view").classList.add("d-none");
    document.getElementById("end-view").classList.add("d-none");
    document.getElementById(viewId).classList.remove("d-none");
}

// Initialize game when page loads
document.addEventListener("DOMContentLoaded", () => {
    // Show start view initially
    showView("start-view");
}); 