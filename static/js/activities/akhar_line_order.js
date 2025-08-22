// Game constants
const NUM_ROUNDS = 10;
const AKHAR_LINES = [
    ["ੳ", "ਅ", "ੲ", "ਸ", "ਹ"],
    ["ਕ", "ਖ", "ਗ", "ਘ", "ਙ"],
    ["ਚ", "ਛ", "ਜ", "ਝ", "ਞ"],
    ["ਟ", "ਠ", "ਡ", "ਢ", "ਣ"],
    ["ਤ", "ਥ", "ਦ", "ਧ", "ਨ"],
    ["ਪ", "ਫ", "ਬ", "ਭ", "ਮ"],
    ["ਯ", "ਰ", "ਲ", "ਵ", "ੜ"],
];

// Game state
let roundIndex = 0;
let score = 0;
let currentLine = [];
let selectedAkhars = [];
let correctOrder = [];
let akharMistakes = [];
let akharCorrect = [];
let answerRevealed = false;
let shuffledOptions = []; // Store shuffled options

// DOM elements
const startView = document.getElementById('start-view');
const gameView = document.getElementById('game-view');
const endView = document.getElementById('end-view');
const progressText = document.getElementById('progress-text');
const progressBar = document.getElementById('progress-bar');
const scoreDisplay = document.getElementById('score');
const finalScore = document.getElementById('final-score');
const lineSection = document.getElementById('line-section');
const optionsSection = document.getElementById('options-section');
const checkButton = document.getElementById('check-answer');
const nextButton = document.querySelector('button[onclick="nextRound()"]');
const removeButton = document.getElementById('remove-akhar');

// Initialize game
function initGame() {
    roundIndex = 0;
    score = 0;
    akharMistakes = [];
    akharCorrect = [];
    updateDisplay();
    showView(startView);
    nextButton.classList.add('d-none');
    answerRevealed = false;
}

// Start a new round
function startRound() {
    // Get a random line
    currentLine = AKHAR_LINES[Math.floor(Math.random() * AKHAR_LINES.length)];
    correctOrder = [...currentLine];
    
    // Shuffle the line for options
    selectedAkhars = [];
    shuffledOptions = [...currentLine].sort(() => Math.random() - 0.5);
    
    // Reset any previous feedback colors
    for (let i = 1; i <= 5; i++) {
        const containerElement = document.getElementById(`akhar-container-${i}`);
        containerElement.classList.remove('bg-success-light', 'bg-failure-light');
    }
    
    // Update the display
    updateLineDisplay();
    updateOptionsDisplay(shuffledOptions);
    updateProgress();
    
    // Reset answer revealed
    answerRevealed = false;
    
    // Show game view
    showView(gameView);
    nextButton.classList.add('d-none');
}

// Update the line display
function updateLineDisplay() {
    for (let i = 1; i <= 5; i++) {
        const lineElement = document.getElementById(`akhar-line-${i}`);
        lineElement.textContent = selectedAkhars[i - 1] || '';
    }
}

// Update the options display
function updateOptionsDisplay(options) {
    for (let i = 1; i <= 5; i++) {
        const optionButton = document.getElementById(`akhar-option-${i}`);
        optionButton.textContent = options[i - 1] || '';
        optionButton.onclick = () => selectAkhar(options[i - 1], optionButton);
        optionButton.disabled = !options[i - 1];
    }
}

// Select an akhar
function selectAkhar(akhar, button) {
    if (selectedAkhars.length < 5) {
        selectedAkhars.push(akhar);
        button.disabled = true;
        updateLineDisplay();
    }
}

// Remove last selected akhar
function removeLastAkhar() {
    if (selectedAkhars.length > 0) {
        selectedAkhars.pop();
        updateLineDisplay();
        updateOptionsDisplay(shuffledOptions);
    }
}

// Check the answer
function checkAnswer() {
    // Only process if all 5 akhars have been selected
    if (selectedAkhars.length !== 5) {
        return;
    }

    // Set answer revealed to true if it is not already
    if (answerRevealed) {
        return;
    } else {
        answerRevealed = true;
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let delay = 0;
    
    for (let i = 0; i < 5; i++) {
        const containerElement = document.getElementById(`akhar-container-${i + 1}`);
        if (selectedAkhars[i] === correctOrder[i]) {
            correctCount++;
            containerElement.classList.add('bg-success-light');
            containerElement.classList.remove('bg-failure-light');
            setTimeout(() => bounceElement(`akhar-container-${i + 1}`), delay);
            akharCorrect.push(selectedAkhars[i]);
        } else {
            incorrectCount++;
            containerElement.classList.add('bg-failure-light');
            containerElement.classList.remove('bg-success-light');
            setTimeout(() => shakeElement(`akhar-container-${i + 1}`), delay);
            akharMistakes.push(selectedAkhars[i]);
        }
        delay += 100; // Increase delay for each iteration
    }
    
    // Update score: correct - incorrect
    setTimeout(() => {
        score += (correctCount - incorrectCount);
        updateDisplay();
        nextButton.classList.remove('d-none');
    }, delay);
}

// Move to next round
function nextRound() {
    roundIndex++;
    if (roundIndex < NUM_ROUNDS) {
        startRound();
    } else {
        endGame();
    }
}

// End the game
function endGame() {
    finalScore.textContent = score;
    nextButton.classList.add('d-none');
    showView(endView);

    // Register activity
    registerActivity(
        "akhar line order",
        score,
        ["order"],
        {
            "akhar_mistakes": akharMistakes,
            "akhar_correct": akharCorrect
        }
    );
}

// Update the display
function updateDisplay() {
    scoreDisplay.textContent = score;
    updateProgress();
}

// Update progress
function updateProgress() {
    const progress = (roundIndex / NUM_ROUNDS) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${roundIndex + 1}/${NUM_ROUNDS}`;
}

// Show a specific view
function showView(view) {
    startView.classList.add('d-none');
    gameView.classList.add('d-none');
    endView.classList.add('d-none');
    view.classList.remove('d-none');
}

// Event listeners
checkButton.onclick = checkAnswer;
removeButton.onclick = removeLastAkhar;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);