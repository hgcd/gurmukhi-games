// Game constants
const NUM_ROUNDS = 10;
const POINTS_PER_CORRECT = 5;
const POINTS_PER_INCORRECT = -2;

// Allowed topics - only these will be available for selection
const ALLOWED_TOPICS = [
    "common_animals",
    "common_fruits", 
    "common_vegetables",
    "common_colors"
];

// Game state
let roundIndex = 0;
let score = 0;
let selectedTopic = '';
let currentVocabData = [];
let currentQuestion = null;
let currentOptions = [];
let selectedAnswer = null;
let correctAnswer = null;
let vocabMistakes = [];
let vocabCorrect = [];
let answerRevealed = false;

// DOM elements
const startView = document.getElementById('start-view');
const gameView = document.getElementById('game-view');
const endView = document.getElementById('end-view');
const progressText = document.getElementById('progress-text');
const progressBar = document.getElementById('progress-bar');
const scoreDisplay = document.getElementById('score');
const finalScore = document.getElementById('final-score');
const topicSelect = document.getElementById('topic-select');
const startButton = document.getElementById('start-button');
const imageQuestion = document.getElementById('image-question');
const punjabiQuestion = document.getElementById('punjabi-question');
const questionImage = document.getElementById('question-image');
const questionEnglish = document.getElementById('question-english');
const questionPunjabi = document.getElementById('question-punjabi');
const nextButton = document.querySelector('button[onclick="nextRound()"]');

// Initialize game
function initGame() {
    roundIndex = 0;
    score = 0;
    vocabMistakes = [];
    vocabCorrect = [];
    selectedTopic = '';
    currentVocabData = [];
    updateDisplay();
    showView(startView);
    nextButton.classList.add('d-none');
    answerRevealed = false;
    
    // Reset topic selection
    topicSelect.value = '';
    startButton.disabled = true;
    
    // Populate topic options dynamically from WORD_DATA
    populateTopicOptions();
}

// Populate topic options from WORD_DATA
function populateTopicOptions() {
    // Clear existing options except the first placeholder
    topicSelect.innerHTML = '<option value="">Choose a topic...</option>';
    
    // Add options based on ALLOWED_TOPICS only
    ALLOWED_TOPICS.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic.charAt(0).toUpperCase() + topic.slice(1).replace('_', ' '); // Capitalize first letter and replace underscores
        topicSelect.appendChild(option);
    });
}

// Handle topic selection
function handleTopicChange() {
    const topic = topicSelect.value;
    startButton.disabled = !topic;
    
    if (topic && ALLOWED_TOPICS.includes(topic)) {
        selectedTopic = topic;
        getVocabData(topic);
    }
}

function getVocabData(topic) {
    fetch('/get-vocab?topic=' + topic)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentVocabData = data.data;
            startButton.disabled = false;
        }
    });
}

// Start a new round
function startRound() {
    if (!selectedTopic || currentVocabData.length === 0) {
        alert('Please select a topic first!');
        return;
    }
    
    // Get a random vocab item
    const randomIndex = Math.floor(Math.random() * currentVocabData.length);
    currentQuestion = currentVocabData[randomIndex];
    
    // Determine question type based on round (even = image/english, odd = punjabi)
    const isEvenRound = roundIndex % 2 === 0;
    
    if (isEvenRound) {
        // Show image + english, options are punjabi
        showImageQuestion();
        generatePunjabiOptions();
    } else {
        // Show punjabi, options are image + english
        showPunjabiQuestion();
        generateEnglishOptions();
    }
    
    // Reset answer state
    selectedAnswer = null;
    answerRevealed = false;
    
    // Update display
    updateProgress();
    
    // Show game view
    showView(gameView);
    nextButton.classList.add('d-none');
}

// Show image question
function showImageQuestion() {
    imageQuestion.classList.remove('d-none');
    punjabiQuestion.classList.add('d-none');
    
    questionImage.src = currentQuestion.image;
    questionImage.alt = currentQuestion.english;
    questionEnglish.textContent = currentQuestion.english;
    
    correctAnswer = currentQuestion.punjabi_gurmukhi;
}

// Show punjabi question
function showPunjabiQuestion() {
    punjabiQuestion.classList.remove('d-none');
    imageQuestion.classList.add('d-none');
    
    questionPunjabi.textContent = currentQuestion.punjabi_gurmukhi;
    
    correctAnswer = currentQuestion.english;
}

// Generate punjabi options
function generatePunjabiOptions() {
    const allPunjabiWords = currentVocabData.map(item => item.punjabi_gurmukhi);
    const correctAnswer = currentQuestion.punjabi_gurmukhi;
    
    // Remove correct answer from pool
    const otherWords = allPunjabiWords.filter(word => word !== correctAnswer);
    
    // Shuffle and take 4 random words
    const shuffledOthers = otherWords.sort(() => Math.random() - 0.5).slice(0, 4);
    
    // Add correct answer and shuffle all options
    currentOptions = [...shuffledOthers, correctAnswer].sort(() => Math.random() - 0.5);
    
    updateOptionsDisplay();
}

// Generate english options
function generateEnglishOptions() {
    const allEnglishWords = currentVocabData.map(item => item.english);
    const correctAnswer = currentQuestion.english;
    
    // Remove correct answer from pool
    const otherWords = allEnglishWords.filter(word => word !== correctAnswer);
    
    // Shuffle and take 4 random words
    const shuffledOthers = otherWords.sort(() => Math.random() - 0.5).slice(0, 4);
    
    // Add correct answer and shuffle all options
    currentOptions = [...shuffledOthers, correctAnswer].sort(() => Math.random() - 0.5);
    
    updateOptionsDisplay(true); // true indicates image options
}

// Update options display
function updateOptionsDisplay(isImageOptions = false) {
    for (let i = 1; i <= 5; i++) {
        const optionButton = document.getElementById(`option-${i}`);
        const optionImage = document.getElementById(`option-${i}-image`);
        const optionText = document.getElementById(`option-${i}-text`);
        const option = currentOptions[i - 1];
        
        // Safety check - ensure elements exist
        if (!optionButton || !optionImage || !optionText) {
            console.warn(`Missing elements for option ${i}`);
            continue;
        }
        
        if (option) {
            if (isImageOptions) {
                // Find the vocab item for this English word
                const vocabItem = currentVocabData.find(item => item.english === option);
                if (vocabItem) {
                    // Update image
                    optionImage.src = vocabItem.image;
                    optionImage.alt = vocabItem.english;
                    optionImage.style.display = 'block';
                    
                    // Update text
                    optionText.textContent = vocabItem.english;
                    optionText.style.display = 'block';
                }
            } else {
                // Text-only options (Punjabi words)
                optionImage.style.display = 'none';
                optionText.textContent = option;
                optionText.style.display = 'block';
            }
            
            optionButton.onclick = () => selectAnswer(option, optionButton);
            optionButton.disabled = false;
            optionButton.classList.remove('bg-success-light', 'bg-failure-light');
        } else {
            optionImage.style.display = 'none';
            optionText.textContent = '';
            optionText.style.display = 'none';
            optionButton.disabled = true;
        }
    }
}

// Select an answer
function selectAnswer(answer, button) {
    if (answerRevealed) {
        return; // Don't allow selection after answer is revealed
    }
    
    selectedAnswer = answer;
    answerRevealed = true;
    
    const isCorrect = selectedAnswer === correctAnswer;
    
    // Update score
    if (isCorrect) {
        score += POINTS_PER_CORRECT;
        vocabCorrect.push(currentQuestion.punjabi_gurmukhi);
    } else {
        score += POINTS_PER_INCORRECT;
        vocabMistakes.push(currentQuestion.punjabi_gurmukhi);
    }
    
    // Show visual feedback
    for (let i = 1; i <= 5; i++) {
        const optionButton = document.getElementById(`option-${i}`);
        const option = currentOptions[i - 1];
        
        if (option === correctAnswer) {
            optionButton.classList.add('bg-success-light');
            setTimeout(() => bounceElement(`option-${i}`), 100);
        } else if (option === selectedAnswer && !isCorrect) {
            optionButton.classList.add('bg-failure-light');
            setTimeout(() => shakeElement(`option-${i}`), 100);
        }
        
        // Disable all buttons after selection
        optionButton.disabled = true;
    }
    
    // Update display and show next button
    setTimeout(() => {
        updateDisplay();
        nextButton.classList.remove('d-none');
    }, 500);
}

// Remove selected answer - no longer needed
function removeAnswer() {
    // This function is no longer used
}

// Check the answer - no longer needed
function checkAnswer() {
    // This function is no longer used
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
        "vocab matching",
        score,
        ["vocabulary"],
        {
            "vocab_mistakes": vocabMistakes,
            "vocab_correct": vocabCorrect,
            "topic": selectedTopic
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
topicSelect.addEventListener('change', handleTopicChange);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);
