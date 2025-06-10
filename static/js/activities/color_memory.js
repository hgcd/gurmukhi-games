// Game constants
const COLORS = {
    '#FFFFFF': {
        "punjabi_gurmukhi": "ਚਿੱਟਾ",
        "punjabi_roman": "chiṭṭā",
        "audio": "https://storage.googleapis.com/punjabi-app-2023.appspot.com/words/f_%E0%A8%9A%E0%A8%BF%E0%A9%B1%E0%A8%9F%E0%A8%BE.m4a",
        "english": "white",
        "text_color": "black",
    },
    '#666666': {
        "punjabi_gurmukhi": "ਸਲੇਟੀ",
        "punjabi_roman": "salēṭī",
        "audio": "https://storage.googleapis.com/punjabi-app-2023.appspot.com/words/f_%E0%A8%B8%E0%A8%B2%E0%A9%87%E0%A8%9F%E0%A9%80.m4a",
        "english": "grey",
        "text_color": "white",
    },
    '#000000': {
        "punjabi_gurmukhi": "ਕਾਲ਼ਾ",
        "punjabi_roman": "kāḷā",
        "audio": "https://storage.googleapis.com/punjabi-app-2023.appspot.com/words/f_%E0%A8%95%E0%A8%BE%E0%A8%B3%E0%A8%BE.m4a",
        "english": "black",
        "text_color": "white",
    },
    '#FF2222': {
        "punjabi_gurmukhi": "ਲਾਲ",
        "punjabi_roman": "lāl",
        "audio": "https://storage.googleapis.com/punjabi-app-2023.appspot.com/words/f_%E0%A8%B2%E0%A8%BE%E0%A8%B2.m4a",
        "english": "red",
        "text_color": "white",
    },
    '#FFA522': {
        "punjabi_gurmukhi": "ਸੰਤਰੀ",
        "punjabi_roman": "santtarī",
        "audio": "https://storage.googleapis.com/punjabi-app-2023.appspot.com/words/f_%E0%A8%B8%E0%A9%B0%E0%A8%A4%E0%A8%B0%E0%A9%80.m4a",
        "english": "orange",
        "text_color": "black",
    },
    '#FFFF22': {
        "punjabi_gurmukhi": "ਪੀਲ਼ਾ",
        "punjabi_roman": "pīḷā",
        "audio": "https://storage.googleapis.com/punjabi-app-2023.appspot.com/words/f_%E0%A8%AA%E0%A9%80%E0%A8%B3%E0%A8%BE.m4a",
        "english": "yellow",
        "text_color": "black",
    },
    '#228222': {
        "punjabi_gurmukhi": "ਹਰਾ",
        "punjabi_roman": "harā",
        "audio": "https://storage.googleapis.com/punjabi-app-2023.appspot.com/words/f_%E0%A8%B9%E0%A8%B0%E0%A8%BE.m4a",
        "english": "green",
        "text_color": "black",
    },
    '#2222FF': {
        "punjabi_gurmukhi": "ਨੀਲਾ",
        "punjabi_roman": "nīlā",
        "audio": "https://storage.googleapis.com/punjabi-app-2023.appspot.com/words/f_%E0%A8%A8%E0%A9%80%E0%A8%B2%E0%A8%BE.m4a",
        "english": "blue",
        "text_color": "white",
    },
    '#822282': {
        "punjabi_gurmukhi": "ਜਾਮਨੀ",
        "punjabi_roman": "jāmanī",
        "audio": "https://storage.googleapis.com/punjabi-app-2023.appspot.com/words/f_%E0%A8%9C%E0%A8%BE%E0%A8%AE%E0%A8%A8%E0%A9%80.m4a",
        "english": "purple",
        "text_color": "white",
    },
    '#FFC2CB': {
        "punjabi_gurmukhi": "ਗੁਲਾਬੀ",
        "punjabi_roman": "gulābī",
        "audio": "https://storage.googleapis.com/punjabi-app-2023.appspot.com/words/f_%E0%A8%97%E0%A9%81%E0%A8%B2%E0%A8%BE%E0%A8%AC%E0%A9%80.m4a",
        "english": "pink",
        "text_color": "black",
    },
    '#8B4422': {
        "punjabi_gurmukhi": "ਭੂਰਾ",
        "punjabi_roman": "bhūrā",
        "audio": "https://storage.googleapis.com/punjabi-app-2023.appspot.com/words/f_%E0%A8%AD%E0%A9%82%E0%A8%B0%E0%A8%BE.m4a",
        "english": "brown",
        "text_color": "white",
    }
};

const MAX_ROUNDS = 10;
const SEQUENCE_DISPLAY_TIME = 5000; // 5 seconds
const INITIAL_SEQUENCE_LENGTH = 3;
const SEQUENCE_INCREMENT = 1;
const INCREMENT_EVERY = 3;

// Game state
let roundIndex = 0;
let score = 0;
let currentSequence = [];
let playerSequence = [];
let sequenceLength = INITIAL_SEQUENCE_LENGTH;

function initGame() {
    roundIndex = 0;
    score = 0;
    sequenceLength = INITIAL_SEQUENCE_LENGTH;
    showView("game-view");
    
    // Hide next round button
    document.getElementById("next-button").classList.add("d-none");
    
    // Show sequence display
    document.getElementById("sequence-display").classList.remove("d-none");
    
    startRound();
}

function startRound() {
    // Generate new sequence
    currentSequence = generateSequence(sequenceLength);
    playerSequence = [];
    
    // Update display
    updateDisplay();
    
    // Show sequence
    showSequence();
}

function generateSequence(length) {
    const colors = Object.keys(COLORS);
    const sequence = [];
    for (let i = 0; i < length; i++) {
        sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    return sequence;
}

function showSequence() {
    // Hide color selection
    document.getElementById("color-selection").classList.add("d-none");
    
    // Clear and populate sequence display
    const sequenceDisplay = document.getElementById("color-sequence");
    sequenceDisplay.innerHTML = "";
    
    // Remove any existing countdown timer
    const existingTimer = document.getElementById("countdown-timer");
    if (existingTimer) {
        existingTimer.remove();
    }
    
    // Add countdown timer
    const timerDiv = document.createElement("div");
    timerDiv.id = "countdown-timer";
    timerDiv.className = "text-center mb-3";
    timerDiv.innerHTML = '<h2><span id="time-left">5</span> seconds left</h2>';
    sequenceDisplay.parentElement.insertBefore(timerDiv, sequenceDisplay);
    
    currentSequence.forEach(color => {
        const square = document.createElement("div");
        square.className = "color-square";
        square.style.backgroundColor = color;
        square.style.width = "100px";
        square.style.height = "100px";
        square.style.borderRadius = "10px";
        sequenceDisplay.appendChild(square);
    });
    
    // Start countdown
    let timeLeft = SEQUENCE_DISPLAY_TIME / 1000;
    const timeLeftElement = document.getElementById("time-left");
    
    const countdownInterval = setInterval(() => {
        timeLeft--;
        timeLeftElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            document.getElementById("sequence-display").classList.add("d-none");
            showColorSelection();
        }
    }, 1000);
    
    // After display time, hide sequence and show color selection
    setTimeout(() => {
        clearInterval(countdownInterval);
        document.getElementById("sequence-display").classList.add("d-none");
        showColorSelection();
    }, SEQUENCE_DISPLAY_TIME);
}

function showColorSelection() {
    // Show color selection
    document.getElementById("color-selection").classList.remove("d-none");
    
    // Clear selected sequence display
    const selectedSequence = document.getElementById("selected-sequence");
    selectedSequence.innerHTML = "";
    
    // Create empty spaces for the required number of colors
    for (let i = 0; i < currentSequence.length; i++) {
        const square = document.createElement("div");
        square.className = "color-square";
        square.id = `sequence-square-${i}`;
        square.style.width = "100px";
        square.style.height = "100px";
        square.style.borderRadius = "10px";
        square.style.border = "2px dashed #ccc";
        square.style.backgroundColor = "#f8f9fa";
        selectedSequence.appendChild(square);
    }
    
    // Hide check button initially
    document.getElementById("submit-button").classList.add("d-none");
    
    // Populate color options
    const colorOptions = document.getElementById("color-options");
    colorOptions.innerHTML = "";
    
    Object.entries(COLORS).forEach(([color, data]) => {
        const option = document.createElement("div");
        option.className = "color-option";
        option.innerHTML = `
            <div class="btn-press-flat bg-gray-light text-center border border-2 border-dark rounded-3">
                <button class="btn-press-blank m-1" onclick="selectColor('${color}')">
                    <h2>${data.punjabi_gurmukhi}</h2>
                </button>
                <button class="btn-press bg-blue-dark m-1" onclick="playAudio('${data.audio}')">
                    <h2><i class="bi bi-volume-up-fill"></i></h2>
                </button>
            </div>
        `;
        colorOptions.appendChild(option);
    });
}

function selectColor(color) {
    if (playerSequence.length < currentSequence.length) {
        playerSequence.push(color);
        updateDisplay();
        
        // Update the empty space with the selected color name
        const selectedSequence = document.getElementById("selected-sequence");
        const currentSquare = selectedSequence.children[playerSequence.length - 1];
        currentSquare.style.backgroundColor = "#f8f9fa";
        currentSquare.style.border = "2px solid #ccc";
        currentSquare.innerHTML = `<div class="d-flex align-items-center justify-content-center h-100"><h3>${COLORS[color].punjabi_gurmukhi}</h3></div>`;
        
        // Add dip animation
        currentSquare.style.transform = "scale(0.95)";
        currentSquare.style.transition = "transform 0.1s ease-out";
        setTimeout(() => {
            currentSquare.style.transform = "scale(1)";
        }, 100);
        
        // Show/hide backspace button based on whether there are colors to remove
        document.getElementById("backspace-button").style.display = playerSequence.length > 0 ? "block" : "none";
        
        // Show check button when all colors are selected
        if (playerSequence.length === currentSequence.length) {
            document.getElementById("submit-button").classList.remove("d-none");
        }
    }
}

function removeLastColor() {
    if (playerSequence.length > 0) {
        // Remove last color from sequence
        playerSequence.pop();
        
        // Reset the last square to empty state
        const selectedSequence = document.getElementById("selected-sequence");
        const lastSquare = selectedSequence.children[playerSequence.length];
        lastSquare.style.backgroundColor = "#f8f9fa";
        lastSquare.style.border = "2px dashed #ccc";
        lastSquare.innerHTML = ""; // Clear the color name
        
        // Hide backspace button if no colors left
        //document.getElementById("backspace-button").style.display = playerSequence.length > 0 ? "block" : "none";
        
        // Hide check button when not all colors are selected
        document.getElementById("submit-button").classList.add("d-none");
        
        updateDisplay();
    }
}

function checkAnswer() {
    let correct = 0;
    const selectedSquares = document.getElementById("selected-sequence").children;
    
    // Reset all squares to default style
    for (let i = 0; i < selectedSquares.length; i++) {
        selectedSquares[i].style.border = "none";
        selectedSquares[i].style.boxShadow = "none";
    }
    
    // Check each color and highlight accordingly
    for (let i = 0; i < currentSequence.length; i++) {
        const square = selectedSquares[i];
        const color = playerSequence[i];
        
        // Set the background color
        square.style.backgroundColor = color;
        
        if (playerSequence[i] === currentSequence[i]) {
            correct++;
            // Highlight correct answers in green
            square.style.border = "4px solid #28a745";
            square.style.boxShadow = "0 0 10px #28a745";
        } else {
            // Highlight incorrect answers in red and shake them
            square.style.border = "4px solid #dc3545";
            square.style.boxShadow = "0 0 10px #dc3545";
            shakeElement(square.id);
        }
        
        // Update text color based on the color's text_color property
        square.querySelector('h3').classList.remove('text-white', 'text-black');
        square.querySelector('h3').classList.add(`text-${COLORS[color].text_color}`);
    }
    
    // Update score
    score += correct;
    updateDisplay();
    
    // Show feedback message
    const feedbackDiv = document.createElement("div");
    feedbackDiv.className = "mb-3";
    feedbackDiv.innerHTML = `
        <h3 class="${correct === currentSequence.length ? 'text-success' : 'text-danger'}">
            ${correct === currentSequence.length ? '✅ Perfect!' : `You got ${correct} out of ${currentSequence.length} correct`}
        </h3>
    `;
    
    // Remove any existing feedback
    const existingFeedback = document.querySelector(".feedback-message");
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    // Add new feedback at the top of the sequence section
    feedbackDiv.classList.add("feedback-message");
    const sequenceSection = document.querySelector("#color-selection .text-center.my-4");
    sequenceSection.insertBefore(feedbackDiv, sequenceSection.firstChild);
    
    // Show next button
    document.getElementById("submit-button").classList.add("d-none");
    document.getElementById("next-button").classList.remove("d-none");
}

function nextRound() {
    roundIndex++;
    
    // Check if game is over
    if (roundIndex >= MAX_ROUNDS) {
        endGame();
        return;
    }
    
    // Increase sequence length every INCREMENT_EVERY rounds
    if (roundIndex % INCREMENT_EVERY === 0) {
        sequenceLength += SEQUENCE_INCREMENT;
    }
    
    // Reset buttons
    document.getElementById("submit-button").classList.remove("d-none");
    document.getElementById("next-button").classList.add("d-none");
    
    // Remove feedback message
    const existingFeedback = document.querySelector(".feedback-message");
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    // Show sequence display
    document.getElementById("sequence-display").classList.remove("d-none");
    
    // Start new round
    startRound();
}

function endGame() {
    document.getElementById("final-score").textContent = score;
    showView("end-view");
}

function updateDisplay() {
    // Update progress bar
    const progressPercentage = ((roundIndex + 1) / MAX_ROUNDS) * 100;
    const progressBar = document.getElementById("progress-bar");
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.setAttribute('aria-valuenow', progressPercentage);
    
    // Update score
    document.getElementById("score").textContent = score;
    
    // Update round number
    document.getElementById("round-number").textContent = roundIndex + 1;
    document.getElementById("max-rounds").textContent = MAX_ROUNDS;
}

function showView(viewId) {
    document.getElementById("start-view").classList.add("d-none");
    document.getElementById("game-view").classList.add("d-none");
    document.getElementById("end-view").classList.add("d-none");
    document.getElementById(viewId).classList.remove("d-none");
}

function playAudio(audioFile) {
    const audio = new Audio(`/static/audio/${audioFile}`);
    audio.play();
}

// Initialize game when page loads
document.addEventListener("DOMContentLoaded", () => {
    // Show start view initially
    showView("start-view");
    
    // Set max rounds in the display
    document.getElementById("max-rounds").textContent = MAX_ROUNDS;
}); 