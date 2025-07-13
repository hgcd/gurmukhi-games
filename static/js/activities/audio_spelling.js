let words = [];

let MAX_ROUNDS = 10;
const MAX_WORDS = 15;
const MAX_OPTIONS = 7;

let predAkharSeq;
let akharBank;
let trueAkharSeq;
let score;
let revealedAnswer;
let correctAkhar;
let incorrectAkhar;

let roundIndex = 0;

function showView(view) {
    if (view === "start") {
        hideModal();
        document.getElementById("start-view").classList.remove("d-none");
        document.getElementById("game-view").classList.add("d-none");
    } else if (view === "game") {
        hideModal();
        document.getElementById("start-view").classList.add("d-none");
        document.getElementById("game-view").classList.remove("d-none");
    } else if (view === "end") {
        showModal();
    }
}

function initGame() {
    roundIndex = 0;
    showView("game");
    resetGame();
    updateRound();
    updateDisplay();
}

function replayGame() {
    showView("start");
}

function nextRound() {
    roundIndex++;
    if (roundIndex < MAX_ROUNDS) {
        updateRound();
        updateDisplay();
    } else {
        showView("end");
        registerActivity(
            "audio spelling",
            score,
            ["listening", "recognition", "vocabulary", "spelling"],
            {
                "akhar_mistakes": incorrectAkhar,
                "akhar_correct": correctAkhar
            }
        );
    }
}

function setWordData(topic) {
    if (topic === "common") {
        words = WORD_DATA.most_common_500_words.terms;
        MAX_ROUNDS = MAX_ROUNDS > words.length ? words.length : MAX_ROUNDS;
    } else if (topic === "mukta") {
        words = WORD_DATA.mukta_words.terms;
        MAX_ROUNDS = MAX_ROUNDS > words.length ? words.length : MAX_ROUNDS;
    }
}

function resetGame() {
    predAkharSeq = [];
    akharBank = [];
    trueAkharSeq = [];
    score = 0;
    revealedAnswer = false;
    correctAkhar = [];
    incorrectAkhar = [];

    // Shuffle word order
    words = shuffle(words).slice(0, MAX_WORDS);
}

function updateRound() {
    // Set new round variables
    predAkharSeq = [];
    akharBank = getAkharBank();
    trueAkharSeq = splitAkharClusters(words[roundIndex].punjabi_gurmukhi);
    revealedAnswer = false;

    // Play audio
    playAudio(words[roundIndex].audio);

    // Update audio button
    document.getElementById("audio-button").onclick = function() {
        playAudio(words[roundIndex].audio);
    }

    // Update english word
    document.getElementById("english-word").innerHTML = "\"" + words[roundIndex].english + "\"";
}

function getAkharBank() {
    wordAkharClusters = deduplicate(splitAkharClusters(words[roundIndex].punjabi_gurmukhi));
    allAkharClusters = [];
    for (let i = 0; i < words.length; i++) {
        if (i !== roundIndex) {
            allAkharClusters.push(...deduplicate(splitAkharClusters(words[i].punjabi_gurmukhi)));
        }
    }
    
    // Shuffle all akhar clusters and select
    allAkharClusters = shuffle(allAkharClusters);
    akharBank = wordAkharClusters;
    if (trueAkharSeq.length < MAX_OPTIONS) {
        akharBank = akharBank.concat(allAkharClusters);
        akharBank = deduplicate(akharBank);
        akharBank = akharBank.slice(0, MAX_OPTIONS);
    }

    // Shuffle akhar bank
    akharBank = shuffle(akharBank);

    return akharBank;
}

function updateDisplay() {
    // Update predicted akhar sequence
    let predAkharSeqStr = "";
    for (let i = 0; i < trueAkharSeq.length; i++) {
        // If answer is revealed, color the guess
        if (revealedAnswer) {
            if (predAkharSeq[i] === trueAkharSeq[i]) {
                predAkharSeqStr += `<span class='text-success-dark'>${trueAkharSeq[i]}</span>`;
            } else {
                predAkharSeqStr += `<span class='text-failure-dark'>${trueAkharSeq[i]}</span>`;
            }
        }

        // If answer is not revealed, color the guess
        else {
            if (i < predAkharSeq.length) {
                predAkharSeqStr += `<span class='text-blue-dark'>${predAkharSeq[i]}</span>`;
            } else {
                predAkharSeqStr += " <span class='text-blue-light'>_</span>";
            }
        }
    }
    document.getElementById("guessed-word").innerHTML = predAkharSeqStr;

    // Update akhar bank
    let akharBankStr = "";
    for (let i = 0; i < akharBank.length; i++) {
        let btnClass = "";
        if (predAkharSeq.includes(akharBank[i])) {
            btnClass = "bg-blue-light";
        } else {
            btnClass = "bg-light";
        }
        akharBankStr += `
            <button class="btn-press ${btnClass} gurmukhi-braah-one p-3 m-1 border" onclick="addAkhar('${akharBank[i]}')">
                <h1>${akharBank[i]}</h1>
            </button>
        `;
    }
    akharBankStr += `
        <button class="btn-press bg-failure-light p-3 m-1 border" onclick="removeAkhar()">
            <h1><i class="bi bi-backspace-fill"></i></h1>
        </button>
    `;
    document.getElementById("akhar-bank").innerHTML = akharBankStr;

    // Update option buttons
    let optionButtonsStr = "";
    if (predAkharSeq.length === trueAkharSeq.length && !revealedAnswer) {
        optionButtonsStr += `
            <button class="btn-press bg-blue-dark m-1" onclick="checkAnswer()">
                <h1>Check</h1>
            </button>
        `;
    }
    if (revealedAnswer) {
        optionButtonsStr += `
            <button class="btn-press bg-blue-dark m-1" onclick="nextRound()">
                <h1>Next</h1>
            </button>
        `;
    }
    document.getElementById("option-buttons").innerHTML = optionButtonsStr;

    // Update progress bar
    let progress = Math.round((roundIndex / (MAX_ROUNDS-1)) * 100);
    document.getElementById("progress-bar").style.width = `${progress}%`;
    document.getElementById("progress-text").innerHTML = `${roundIndex + 1} / ${MAX_ROUNDS}`;

    // Update score
    document.getElementById("score").innerHTML = score;
    document.getElementById("final-score").innerHTML = score;

    document.getElementById("mistakes").innerHTML = deduplicate(incorrectAkhar).join(", ");
}

function addAkhar(akhar) {
    if (predAkharSeq.length < trueAkharSeq.length && !revealedAnswer) {
        predAkharSeq.push(akhar);
        updateDisplay();
    }
}

function removeAkhar() {
    if (predAkharSeq.length > 0 && !revealedAnswer) {
        predAkharSeq.pop();
        updateDisplay();
    }
}

function checkAnswer() {
    let numCorrect = 0;
    let numIncorrect = 0;
    for (let i = 0; i < trueAkharSeq.length; i++) {
        if (predAkharSeq[i] === trueAkharSeq[i]) {
            numCorrect++;
            if (trueAkharSeq[i] != " ") {correctAkhar.push(trueAkharSeq[i]);}
        } else {
            numIncorrect++;
            if (trueAkharSeq[i] != " ") {incorrectAkhar.push(stripNonAkhar(trueAkharSeq[i]));}
        }
    }

    // Update score
    score += numCorrect;
    score -= numIncorrect;
    
    // Check if all akhar clusters are correct
    if (numCorrect === trueAkharSeq.length) {
        bounceElement("guessed-word");
    } else {
        shakeElement("guessed-word");
    }

    // Set revealed answer
    revealedAnswer = true;

    // Update display
    updateDisplay();
}