let OPTION_AUDIO = PAINTI_AKHAR_AUDIO;

// Game constants
const MAX_ROUNDS = 10;

// Game state
let roundIndex = 0;
let score = 0;
let currentAkhar = "";
let selectedAkhar = "";
let options = [];
let answerChecked = false;
let akhar_mistakes = [];
let akhar_correct = [];

function initGame() {
    roundIndex = 0;
    score = 0;
    akhar_mistakes = [];
    akhar_correct = [];

    updateDisplay(); // Update display before showing game view
    showView("game-view");
    startRound();
}

function setOptions(option) {
    if (option === "all") {
        OPTION_AUDIO = { ...PAINTI_AKHAR_AUDIO, ...IMPORTED_AKHAR_AUDIO, ...LAGA_MATRA_AUDIO };
    } else if (option === "all_akhar") {
        OPTION_AUDIO = { ...PAINTI_AKHAR_AUDIO, ...IMPORTED_AKHAR_AUDIO };
    } else if (option === "painti") {
        OPTION_AUDIO = PAINTI_AKHAR_AUDIO;
    } else if (option === "lagamatra") {
        OPTION_AUDIO = LAGA_MATRA_AUDIO;
    }
}

function startRound() {
    // Generate new round
    generateRound();
    
    // Reset answer checked state
    answerChecked = false;
    
    // Hide next button
    document.getElementById("next-button").classList.add("d-none");
    
    // Play the audio for the current akhar
    playCurrentAudio();
}

function generateRound() {
    // Get all akhars
    const akhars = Object.keys(OPTION_AUDIO);
    
    // Select random akhar
    currentAkhar = akhars[Math.floor(Math.random() * akhars.length)];
    
    // Generate options
    options = [currentAkhar];
    while (options.length < 5) {
        const randomAkhar = akhars[Math.floor(Math.random() * akhars.length)];
        if (!options.includes(randomAkhar)) {
            options.push(randomAkhar);
        }
    }
    
    // Shuffle options
    options = options.sort(() => Math.random() - 0.5);
    
    // Reset selected akhar
    selectedAkhar = "";
    
    // Populate options
    const optionsContainer = document.getElementById("akhar-options");
    optionsContainer.innerHTML = "";
    
    options.forEach((akhar, index) => {
        const option = document.createElement("div");
        option.className = "col-auto";
        option.innerHTML = `
            <button id="akhar-option-${index}" class="btn-press-flat text-center border border-2 border-dark rounded-3 p-4 gurmukhi-braah-one" onclick="selectAkhar('${akhar}')">
                <h1>${akhar}</h1>
            </button>
        `;
        optionsContainer.appendChild(option);
    });
}

function selectAkhar(akhar) {
    if (answerChecked) return; // Don't allow selection after answer is checked
    
    selectedAkhar = akhar;
    answerChecked = true;
    
    // Check if answer is correct
    const isCorrect = selectedAkhar === currentAkhar;
    
    // Update score
    if (isCorrect) {
        score++;
        updateDisplay(); // Update display after score changes
        akhar_correct.push(currentAkhar);
    } else {
        akhar_mistakes.push(currentAkhar);
        akhar_mistakes.push(selectedAkhar);
    }
    
    // Show feedback
    const options = document.querySelectorAll("#akhar-options button");
    options.forEach(option => {
        const optionAkhar = option.textContent.trim();
        
        if (optionAkhar === currentAkhar) {
            option.classList.add("bg-success-light");
            option.classList.remove("bg-gray-light");
            // Apply bounce animation to correct selection
            bounceElement(option.id);
        } else if (optionAkhar === selectedAkhar && !isCorrect) {
            option.classList.add("bg-failure-light");
            option.classList.remove("bg-gray-light");
            // Apply shake animation to incorrect selection
            shakeElement(option.id);
        }
    });

    // Show akhar images
    showAkharImages(currentAkhar);
    
    // Show next button
    document.getElementById("next-button").classList.remove("d-none");
}

function playCurrentAudio() {
    const audio = OPTION_AUDIO[currentAkhar];
    audio.play();
}

function nextRound() {
    roundIndex++;
    
    // Check if game is over
    if (roundIndex >= MAX_ROUNDS) {
        endGame();
        return;
    }
    
    updateDisplay(); // Update display before starting new round
    startRound();
}

function endGame() {
    document.getElementById("final-score").textContent = score;
    showView("end-view");

    // Register activity
    registerActivity(
        "akhar recognition",
        score,
        ["listening", "recognition"],
        {
            "akhar_mistakes": akhar_mistakes,
            "akhar_correct": akhar_correct
        }
    );
}

function updateDisplay() {
    // Update progress bar
    const progressBar = document.getElementById("progress-bar");
    if (progressBar) {
        const progressPercentage = ((roundIndex + 1) / MAX_ROUNDS) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.setAttribute('aria-valuenow', progressPercentage);
    }
    
    // Update score
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
        scoreElement.textContent = score;
    }
    
    // Update round number
    const roundNumberElement = document.getElementById("round-number");
    if (roundNumberElement) {
        roundNumberElement.textContent = roundIndex + 1;
    }

    // Update progress text
    const progressText = document.getElementById("progress-text");
    if (progressText) {
        progressText.textContent = `${roundIndex + 1} / ${MAX_ROUNDS}`;
    }

    // Update image section
    const imageSection = document.getElementById("image-section");
    imageSection.innerHTML = "";
}

function showAkharImages(akhar) {
    const imageSection = document.getElementById("image-section");
    imageSection.innerHTML = "";

    const akharImages = getAkharImages(akhar);
    const imageElement = document.createElement("div");
    imageElement.className = "d-flex flex-wrap justify-content-center gap-4";
    akharImages.forEach(image => {
        imageElement.innerHTML += `
            <div class="col-auto">
                <img src="${image.image}" alt="${image.word}" class="img-fluid rounded-3" style="width: 200px;">
                <h5>${image.word}</h5>
            </div>
        `;
    });
    imageSection.appendChild(imageElement);
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