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
let currentWord = null; // { punjabi_gurmukhi, english }
let currentOptions = []; // akhar options
let correctAkhar = null;
let answerRevealed = false;
let mistakes = [];
let correct = [];
let missingIndex = -1;

// DOM elements
const startView = document.getElementById('start-view');
const gameView = document.getElementById('game-view');
const endView = document.getElementById('end-view');
const progressText = document.getElementById('progress-text');
const progressBar = document.getElementById('progress-bar');
const scoreDisplay = document.getElementById('score');
const finalScore = document.getElementById('final-score');
const nextButton = document.getElementById('next-button');
const startButton = document.getElementById('start-button');
const topicSelect = document.getElementById('topic-select');
const questionWord = document.getElementById('question-word');
const questionEnglish = document.getElementById('question-english');
const playAudioBtn = document.getElementById('play-audio');
let audioElement = null;

// Initialize game
function initGame() {
	roundIndex = 0;
	score = 0;
	mistakes = [];
	correct = [];
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
	populateTopics();
}

function populateTopics() {
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

topicSelect.addEventListener('change', handleTopicChange);

// Start a new round
function startRound() {
	if (!selectedTopic || currentVocabData.length === 0) {
		alert('Please select a topic first!');
		return;
	}
	
	// Pick a random word from the selected topic
	currentWord = currentVocabData[Math.floor(Math.random() * currentVocabData.length)];

	// Build the masked word by removing a random akhar
	const akhars = splitAkharClusters(currentWord.punjabi_gurmukhi);
	const removableIndices = akhars.map((a, idx) => idx).filter(idx => akhars[idx].trim() !== '');
	missingIndex = removableIndices[Math.floor(Math.random() * removableIndices.length)];
	correctAkhar = akhars[missingIndex];
	akhars[missingIndex] = '＿'; // full-width underscore for visibility
	const maskedWord = akhars; // array of display akhar clusters

	// Prepare options: correct akhar + 4 random akhars
	const akharPool = getAkharPool();
	const otherAkhars = akharPool.filter(a => a !== correctAkhar);
	const randomOthers = otherAkhars.sort(() => Math.random() - 0.5).slice(0, 4);
	currentOptions = [...randomOthers, correctAkhar].sort(() => Math.random() - 0.5);

	// Render
	renderQuestion(maskedWord, missingIndex);
	questionEnglish.textContent = currentWord.english || '';
	setupAudio(currentWord);
	updateOptionsDisplay();

	// State
	answerRevealed = false;
	nextButton.classList.add('d-none');
	updateProgress();
	showView(gameView);
}

function renderQuestion(displayChars, missingIdx) {
	// Build spans so the missing slot can be styled distinctly
	const html = displayChars.map((ch, idx) => {
		if (idx === missingIdx) {
			return `<span id="missing-akhar-slot" class="px-0 rounded text-blue">${ch}</span>`;
		}
		return `<span>${ch}</span>`;
	}).join('');
	questionWord.innerHTML = html;
}

function getAkharPool() {
	// Construct a unique set of akhars from current vocab data for option generation
	const set = new Set();
	currentVocabData.forEach(item => {
		const clusters = splitAkharClusters(item.punjabi_gurmukhi);
		clusters.forEach(cluster => {
			if (cluster && cluster.trim() !== '') set.add(cluster);
		});
	});
	return Array.from(set);
}

function updateOptionsDisplay() {
	for (let i = 1; i <= 5; i++) {
		const btn = document.getElementById(`akhar-option-${i}`);
		const option = currentOptions[i - 1];
		if (option) {
			btn.textContent = option;
			btn.disabled = false;
			btn.classList.remove('bg-success-light', 'bg-failure-light');
			btn.onclick = () => selectAkhar(option, btn);
		} else {
			btn.textContent = '';
			btn.disabled = true;
			btn.onclick = null;
		}
	}
}

function selectAkhar(akhar, btn) {
	if (answerRevealed) return;
	answerRevealed = true;

	const isCorrect = akhar === correctAkhar;
	if (isCorrect) {
		score += POINTS_PER_CORRECT;
		correct.push({ word: currentWord.punjabi_gurmukhi, english: currentWord.english, akhar: correctAkhar });
	} else {
		score += POINTS_PER_INCORRECT;
		mistakes.push({ word: currentWord.punjabi_gurmukhi, english: currentWord.english, picked: akhar, correct: correctAkhar });
	}

	// Reveal the missing akhar in the question using the same class highlight
	const slot = document.getElementById('missing-akhar-slot');
	if (slot) {
		slot.textContent = correctAkhar;
	}

	// Play audio when answer is revealed
	if (audioElement) {
		try {
			audioElement.currentTime = 0;
			audioElement.play();
		} catch(e) {
			console.warn('Audio play failed', e);
		}
	}

	// Visual feedback on options
	for (let i = 1; i <= 5; i++) {
		const optionBtn = document.getElementById(`akhar-option-${i}`);
		const option = currentOptions[i - 1];
		if (option === correctAkhar) {
			optionBtn.classList.add('bg-success-light');
			setTimeout(() => bounceElement(`akhar-option-${i}`), 100);
		} else if (option === akhar && !isCorrect) {
			optionBtn.classList.add('bg-failure-light');
			setTimeout(() => shakeElement(`akhar-option-${i}`), 100);
		}
		optionBtn.disabled = true;
	}

	setTimeout(() => {
		updateDisplay();
		nextButton.classList.remove('d-none');
	}, 400);
}

function setupAudio(word) {
	if (audioElement) {
		try { audioElement.pause(); } catch(e) {}
		audioElement = null;
	}
	if (word && word.audio) {
		audioElement = new Audio(word.audio);
		playAudioBtn.disabled = false;
		playAudioBtn.onclick = () => {
			try { audioElement.currentTime = 0; audioElement.play(); } catch(e) { console.warn('Audio play failed', e); }
		};
	} else {
		playAudioBtn.disabled = true;
		playAudioBtn.onclick = null;
	}
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

	registerActivity(
		"missing akhar spelling",
		score,
		["spelling"],
		{
			mistakes,
			correct,
			topic: selectedTopic
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

// Init
document.addEventListener('DOMContentLoaded', initGame);
