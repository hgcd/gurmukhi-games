// Game constants
const POINTS_PER_CORRECT = 10;
const POINTS_PER_INCORRECT = -5;
const BALLOON_SPAWN_INTERVAL = 800; // milliseconds - much faster spawning
const BALLOON_FLOAT_DURATION = 45000; // milliseconds - slower movement
const MAX_BALLOONS_ON_SCREEN = 10; // more balloons on screen

// All Gurmukhi letters for the game (using PAINTI_AKHAR_AUDIO keys)
const ALL_LETTERS = Object.keys(PAINTI_AKHAR_AUDIO);

// Game state
let score = 0;
let correctCount = 0;
let incorrectCount = 0;
let lives = 3;
let currentTargetLetter = null;
let currentAudio = null;
let balloonSpawnInterval = null;
let activeBalloons = [];
let gameActive = false;
let letterMistakes = [];
let letterCorrect = [];

// DOM elements
const startView = document.getElementById('start-view');
const gameView = document.getElementById('game-view');
const endView = document.getElementById('end-view');
const progressText = document.getElementById('progress-text');
const scoreDisplay = document.getElementById('score');
const finalScore = document.getElementById('final-score');
const correctCountDisplay = document.getElementById('correct-count');
const incorrectCountDisplay = document.getElementById('incorrect-count');
const accuracyDisplay = document.getElementById('accuracy-percent');
const gameArea = document.getElementById('game-area');
const playAudioBtn = document.getElementById('play-audio');
const correctFeedback = document.getElementById('correct-feedback');
const incorrectFeedback = document.getElementById('incorrect-feedback');
const correctLetterSpan = document.getElementById('correct-letter');
const incorrectLetterSpan = document.getElementById('incorrect-letter');

// Initialize game
function initGame() {
    score = 0;
    correctCount = 0;
    incorrectCount = 0;
    lives = 3;
    letterMistakes = [];
    letterCorrect = [];
    activeBalloons = [];
    gameActive = false;
    updateDisplay();
    updateHearts();
    showView(startView);
}

// Start the game
function startGame() {
    score = 0;
    correctCount = 0;
    incorrectCount = 0;
    lives = 3;
    letterMistakes = [];
    letterCorrect = [];
    activeBalloons = [];
    gameActive = true;
    showView(gameView);
    
    // Show "Get ready..." message
    const getReadyMessage = document.getElementById('get-ready-message');
    getReadyMessage.classList.remove('d-none');
    
    // Start game after "Get ready..." animation
    setTimeout(() => {
        getReadyMessage.classList.add('d-none');
        startBalloonSpawning();
        // Spawn first few balloons immediately
        spawnBalloon();
        spawnBalloon();
        spawnBalloon();
        // Start spawning regular balloons immediately
        setTimeout(() => {
            playNewTargetLetter();
        }, 500); // Play first target letter after 0.5 seconds
    }, 2000);
}

// Start balloon spawning
function startBalloonSpawning() {
    balloonSpawnInterval = setInterval(() => {
        if (gameActive && activeBalloons.length < MAX_BALLOONS_ON_SCREEN) {
            spawnBalloon();
        }
    }, BALLOON_SPAWN_INTERVAL);
}

// Spawn a new balloon
function spawnBalloon() {
    const balloon = document.createElement('div');
    const letter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
    
    balloon.className = 'balloon';
    balloon.textContent = letter;
    balloon.dataset.letter = letter;
    
    // Random position at bottom
    const startX = Math.random() * (gameArea.offsetWidth - 120);
    balloon.style.left = startX + 'px';
    balloon.style.bottom = '-100px';
    
    // Lighter colors for better readability
    const colors = [
        'linear-gradient(45deg, #FFB3B3, #FFD6D6)',
        'linear-gradient(45deg, #B8E6E6, #D4F1F1)',
        'linear-gradient(45deg, #B8D4F1, #D4E6F1)',
        'linear-gradient(45deg, #F7E6B3, #F8F0D6)',
        'linear-gradient(45deg, #E6B8F1, #F0D6F8)',
        'linear-gradient(45deg, #B8F1E6, #D6F8F0)'
    ];
    balloon.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    // Add click handler
    balloon.onclick = () => handleBalloonClick(balloon, letter);
    
    gameArea.appendChild(balloon);
    activeBalloons.push(balloon);
    
    // Start floating animation
    setTimeout(() => {
        balloon.style.transition = `all ${BALLOON_FLOAT_DURATION}ms linear`;
        balloon.style.bottom = '100vh';
        
        // Remove balloon after animation
        setTimeout(() => {
            if (balloon.parentNode) {
                balloon.parentNode.removeChild(balloon);
                activeBalloons = activeBalloons.filter(b => b !== balloon);
                
                // Check if this was the target letter (missed)
                if (letter === currentTargetLetter && gameActive) {
                    handleMissedTarget(letter);
                }
            }
        }, BALLOON_FLOAT_DURATION);
    }, 100);
}

// Spawn target balloon
function spawnTargetBalloon() {
    if (!currentTargetLetter || !gameActive) return;
    
    const balloon = document.createElement('div');
    
    balloon.className = 'balloon';
    balloon.textContent = currentTargetLetter;
    balloon.dataset.letter = currentTargetLetter;
    
    // Position at bottom center
    const startX = (gameArea.offsetWidth - 120) / 2;
    balloon.style.left = startX + 'px';
    balloon.style.bottom = '-100px';
    
    // Use a distinctive color for target balloon
    balloon.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)'; // Gold color
    
    // Add click handler
    balloon.onclick = () => handleBalloonClick(balloon, currentTargetLetter);
    
    gameArea.appendChild(balloon);
    activeBalloons.push(balloon);
    
    // Start floating animation
    setTimeout(() => {
        balloon.style.transition = `all ${BALLOON_FLOAT_DURATION}ms linear`;
        balloon.style.bottom = '100vh';
        
        // Remove balloon after animation
        setTimeout(() => {
            if (balloon.parentNode) {
                balloon.parentNode.removeChild(balloon);
                activeBalloons = activeBalloons.filter(b => b !== balloon);
                
                // Check if this was the target letter (missed)
                if (currentTargetLetter && gameActive) {
                    handleMissedTarget(currentTargetLetter);
                }
            }
        }, BALLOON_FLOAT_DURATION);
    }, 100);
}

// Handle balloon click
function handleBalloonClick(balloon, letter) {
    if (!gameActive) return;
    
    if (letter === currentTargetLetter) {
        // Correct balloon popped
        correctCount++;
        score += POINTS_PER_CORRECT;
        letterCorrect.push(letter);
        
        // Visual feedback
        balloon.classList.add('correct');
        showCorrectFeedback(letter);
        
        // Remove balloon
        setTimeout(() => {
            if (balloon.parentNode) {
                balloon.parentNode.removeChild(balloon);
                activeBalloons = activeBalloons.filter(b => b !== balloon);
            }
        }, 600);
        
        // Play new target letter after delay
        setTimeout(() => {
            playNewTargetLetter();
        }, 1500);
        
    } else {
        // Wrong balloon popped
        incorrectCount++;
        score += POINTS_PER_INCORRECT;
        lives--;
        letterMistakes.push(letter);
        
        // Visual feedback
        balloon.classList.add('incorrect');
        showIncorrectFeedback(letter);
        
        // Remove balloon
        setTimeout(() => {
            if (balloon.parentNode) {
                balloon.parentNode.removeChild(balloon);
                activeBalloons = activeBalloons.filter(b => b !== balloon);
            }
        }, 600);
        
        updateHearts();
        
        // Check if game over
        if (lives <= 0) {
            endGame();
        }
    }
    
    updateDisplay();
}

// Handle missed target
function handleMissedTarget(letter) {
    incorrectCount++;
    score += POINTS_PER_INCORRECT;
    lives--;
    letterMistakes.push(letter);
    
    showIncorrectFeedback(letter);
    updateHearts();
    updateDisplay();
    
    // Check if game over
    if (lives <= 0) {
        endGame();
    } else {
        // Play new target letter after delay
        setTimeout(() => {
            playNewTargetLetter();
        }, 1500);
    }
}

// Play new target letter
function playNewTargetLetter() {
    if (!gameActive) return;
    
    // Select new target letter
    currentTargetLetter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
    
    // Play audio for the letter
    playLetterAudio(currentTargetLetter);
    
    // Immediately spawn the target balloon
    setTimeout(() => {
        if (gameActive && currentTargetLetter) {
            spawnTargetBalloon();
        }
    }, 500); // Small delay to let audio start playing
}

// Play letter audio
function playLetterAudio(letter) {
    // Use the proper audio from gurmukhi_utils.js
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    // Check if the letter has audio in PAINTI_AKHAR_AUDIO
    if (PAINTI_AKHAR_AUDIO[letter]) {
        currentAudio = PAINTI_AKHAR_AUDIO[letter];
        currentAudio.currentTime = 0; // Reset to beginning
        currentAudio.play().catch(e => {
            console.warn('Audio play failed:', e);
            showLetterName(letter);
        });
    } else {
        // Fallback: show letter name
        showLetterName(letter);
    }
}

// Show letter name (fallback)
function showLetterName(letter) {
    const letterNames = {
        "ੳ": "Oora", "ਅ": "Aira", "ੲ": "Eeri", "ਸ": "Sassa", "ਹ": "Haha",
        "ਕ": "Kakka", "ਖ": "Khakha", "ਗ": "Gagga", "ਘ": "Ghagha", "ਙ": "Ngannga",
        "ਚ": "Chacha", "ਛ": "Chhachha", "ਜ": "Jajja", "ਝ": "Jhajha", "ਞ": "Nyanja",
        "ਟ": "Tainka", "ਠ": "Thatha", "ਡ": "Dadda", "ਢ": "Dhadha", "ਣ": "Nahnha",
        "ਤ": "Tatta", "ਥ": "Thatha", "ਦ": "Dadda", "ਧ": "Dhadha", "ਨ": "Nanna",
        "ਪ": "Pappa", "ਫ": "Phapha", "ਬ": "Babba", "ਭ": "Bhabha", "ਮ": "Mamma",
        "ਯ": "Yayya", "ਰ": "Rara", "ਲ": "Lalla", "ਵ": "Vava", "ੜ": "Rharha"
    };
    
    // Show letter name as feedback
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 20px;
        border-radius: 10px;
        font-size: 1.5rem;
        z-index: 1000;
    `;
    feedback.textContent = `${letter} - ${letterNames[letter] || 'Unknown'}`;
    
    gameArea.appendChild(feedback);
    
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 2000);
}

// Play current audio again
function playCurrentAudio() {
    if (currentTargetLetter) {
        playLetterAudio(currentTargetLetter);
    }
}

// Show correct feedback
function showCorrectFeedback(letter) {
    correctLetterSpan.textContent = letter;
    correctFeedback.classList.remove('d-none');
    incorrectFeedback.classList.add('d-none');
    
    setTimeout(() => {
        correctFeedback.classList.add('d-none');
    }, 2000);
}

// Show incorrect feedback
function showIncorrectFeedback(letter) {
    incorrectLetterSpan.textContent = letter;
    incorrectFeedback.classList.remove('d-none');
    correctFeedback.classList.add('d-none');
    
    setTimeout(() => {
        incorrectFeedback.classList.add('d-none');
    }, 2000);
}

// Update hearts display
function updateHearts() {
    for (let i = 1; i <= 3; i++) {
        const heart = document.getElementById(`heart-${i}`);
        if (i <= lives) {
            heart.classList.remove('lost');
            heart.style.display = 'block';
        } else {
            heart.classList.add('lost');
        }
    }
}

// End the game
function endGame() {
    gameActive = false;
    
    if (balloonSpawnInterval) {
        clearInterval(balloonSpawnInterval);
        balloonSpawnInterval = null;
    }
    
    // Clear all balloons
    activeBalloons.forEach(balloon => {
        if (balloon.parentNode) {
            balloon.parentNode.removeChild(balloon);
        }
    });
    activeBalloons = [];
    
    // Stop audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    // Update final display
    finalScore.textContent = score;
    correctCountDisplay.textContent = correctCount;
    incorrectCountDisplay.textContent = incorrectCount;
    
    const accuracy = correctCount + incorrectCount > 0 
        ? Math.round((correctCount / (correctCount + incorrectCount)) * 100) 
        : 0;
    accuracyDisplay.textContent = `${accuracy}%`;
    
    showView(endView);

    // Register activity
    registerActivity(
        "balloon akhar recognition",
        score,
        ["recognition", "audio"],
        {
            "letter_mistakes": letterMistakes,
            "letter_correct": letterCorrect,
            "accuracy": accuracy
        }
    );
}

// Update the display
function updateDisplay() {
    scoreDisplay.textContent = score;
    // progressText is now static message, no need to update it
}

// Show a specific view
function showView(view) {
    startView.classList.add('d-none');
    gameView.classList.add('d-none');
    endView.classList.add('d-none');
    view.classList.remove('d-none');
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame); 