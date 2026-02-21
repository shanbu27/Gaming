// Elements
const startBtn = document.getElementById("startBtn");
const countdownEl = document.getElementById("countdown");
const textDisplay = document.getElementById("textDisplay");
const inputBox = document.getElementById("inputBox");
const timeEl = document.getElementById("time");
const finalWpmEl = document.getElementById("finalWpm");
const accuracyEl = document.getElementById("accuracy");
const restartBtn = document.getElementById("restartBtn");
const themeSelect = document.getElementById("themeSelect");
const aiWpmEl = document.getElementById("aiWpm");
const winnerEl = document.getElementById("winner");

// Paragraphs
const paragraphs = [
    "Typing is fun and useful.",
    "Practice daily to improve.",
    "Speed grows with patience.",
    "Accuracy is more important than raw speed.",
    "Consistency builds strong technical skills."
];

// Timer & AI variables
let startTime = null;
let timerInterval = null;
let aiInterval = null;
let aiWpm = 0;
let correctChars = 0;
let currentText = "";

// Load saved theme
const savedTheme = localStorage.getItem("theme") || "light";
document.body.className = savedTheme;
themeSelect.value = savedTheme;

// Theme switch
themeSelect.addEventListener("change", () => {
    const selectedTheme = themeSelect.value;
    document.body.className = selectedTheme;
    localStorage.setItem("theme", selectedTheme);
});

// Load random text
function loadText() {
    currentText = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    textDisplay.innerHTML = "";
    currentText.split("").forEach(char => {
        const span = document.createElement("span");
        span.innerText = char;
        textDisplay.appendChild(span);
    });
}

// Countdown 3-2-1 before typing
function startCountdown() {
    let count = 3;
    countdownEl.textContent = count;
    inputBox.disabled = true;

    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownEl.textContent = count;
        } else {
            clearInterval(interval);
            countdownEl.textContent = "";
            inputBox.disabled = false;
            inputBox.focus();
            startTime = new Date();
            timerInterval = setInterval(updateTime, 1000);

            // Start AI simulation
            aiWpm = Math.floor(Math.random() * 40) + 60; // AI base WPM
            aiInterval = setInterval(() => {
                let variation = Math.floor(Math.random() * 5) - 2; // fluctuation
                aiWpm += variation;
                if (aiWpm < 20) aiWpm = 20;
                aiWpmEl.textContent = aiWpm;
            }, 1000);
        }
    }, 1000);
}

// Update timer display
function updateTime() {
    const seconds = Math.floor((new Date() - startTime) / 1000);
    timeEl.textContent = seconds;
}

// Finish race
function finishRace() {
    clearInterval(timerInterval);
    clearInterval(aiInterval);

    const totalTime = (new Date() - startTime) / 1000;
    const wordCount = currentText.trim().split(/\s+/).length;
    const wpm = Math.round((wordCount / totalTime) * 60);
    finalWpmEl.textContent = wpm;
    inputBox.disabled = true;

    // Show winner
    if (wpm >= aiWpm) {
        winnerEl.textContent = "You Win! 🏁";
    } else {
        winnerEl.textContent = "AI Wins 🤖";
    }
}

// Check typing input
inputBox.addEventListener("input", () => {
    const typed = inputBox.value.split("");
    const spans = textDisplay.querySelectorAll("span");
    correctChars = 0;

    spans.forEach((span, i) => {
        const char = typed[i];
        if (char == null) {
            span.classList.remove("correct", "wrong");
        } else if (char === span.innerText) {
            span.classList.add("correct");
            span.classList.remove("wrong");
            correctChars++;
        } else {
            span.classList.add("wrong");
            span.classList.remove("correct");
        }
    });

    const accuracy = typed.length ? Math.round((correctChars / typed.length) * 100) : 100;
    accuracyEl.textContent = accuracy;

    if (typed.length === spans.length && correctChars === spans.length) {
        finishRace();
    }
});

// Start button
startBtn.addEventListener("click", () => {
    startBtn.disabled = true;
    loadText();
    inputBox.value = "";
    finalWpmEl.textContent = "0";
    timeEl.textContent = "0";
    accuracyEl.textContent = "100";
    aiWpmEl.textContent = "0";
    winnerEl.textContent = "";
    startCountdown();
});

// Restart button
restartBtn.addEventListener("click", () => {
    startBtn.disabled = false;
    inputBox.disabled = true;
    inputBox.value = "";
    finalWpmEl.textContent = "0";
    timeEl.textContent = "0";
    accuracyEl.textContent = "100";
    aiWpmEl.textContent = "0";
    winnerEl.textContent = "";
    textDisplay.innerHTML = "";
    countdownEl.textContent = "";
    clearInterval(timerInterval);
    clearInterval(aiInterval);
});
