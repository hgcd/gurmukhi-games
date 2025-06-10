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
    }
}

