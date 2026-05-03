
// =====================
// USER SYSTEM
// =====================
function getUser() {
    return localStorage.getItem("loggedUser") || "Guest";
}

const user = getUser();
let bestKey = "bestWpm_" + user;

// =====================
// ELEMENTS
// =====================
const textDisplay = document.getElementById("textDisplay");
const inputBox = document.getElementById("inputBox");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const timeEl = document.getElementById("time");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const countdownEl = document.getElementById("countdown");

const difficulty = document.getElementById("difficulty");
const bestWpmEl = document.getElementById("bestWpm");
const comboEl = document.getElementById("combo");
const progressBar = document.getElementById("progressBar");
const typeSound = document.getElementById("typeSound");

// =====================
// USER LABEL
// =====================
if (document.getElementById("userLabel")) {
    document.getElementById("userLabel").textContent = "Player: " + user;
}

// =====================
// GAME STATE
// =====================
const MAX_TIME = 60;

let timer;
let time = 0;
let isPlaying = false;
let originalText = "";
let combo = 0;

// 🔥 STREAK SYSTEM
let streak = 0;
let maxStreak = 0;

// =====================
// LOAD BEST SCORE
// =====================
let bestWpm = localStorage.getItem(bestKey) || 0;
if (bestWpmEl) bestWpmEl.textContent = bestWpm;

// =====================
// THEME SYSTEM
// =====================

// load saved theme
if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
}

function toggleTheme() {
    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {
        localStorage.setItem("theme", "light");
        document.getElementById("themeToggle").textContent = "🌙 Dark Mode";
    } else {
        localStorage.setItem("theme", "dark");
        document.getElementById("themeToggle").textContent = "☀️ Light Mode";
    }
}

// =====================
// REGISTER
// =====================
function register() {
    let user = document.getElementById("regUser").value.trim().toLowerCase();
    let email = document.getElementById("regEmail").value.trim();
    let pass = document.getElementById("regPass").value.trim();
    let confirm = document.getElementById("regConfirm").value.trim();

    let error = document.getElementById("errorMsg");

    error.style.color = "red";

    if (user === "" || pass === "" || confirm === "") {
        error.textContent = "⚠️ All fields required";
        return;
    }

    if (user.length < 3) {
        error.textContent = "⚠️ Username must be at least 3 letters";
        return;
    }

    if (!/^[a-zA-Z]+$/.test(user)) {
        error.textContent = "⚠️ Letters only (no numbers/symbols)";
        return;
    }

    if (pass.length < 5) {
        error.textContent = "⚠️ Password must be at least 5 characters";
        return;
    }

    if (pass !== confirm) {
        error.textContent = "❌ Passwords do not match";
        return;
    }

    if (!/\d/.test(pass)) {
        error.textContent = "⚠️ Password must include a number";
        return;
    }

    if (localStorage.getItem("user_" + user)) {
        error.textContent = "⚠️ Username already exists";
        return;
    }

    localStorage.setItem("user_" + user, pass);

    if (email) {
        localStorage.setItem("email_" + user, email);
    }

    error.style.color = "green";
    error.textContent = "✅ Account created! Redirecting...";

    alert("🎉 Registered successfully! Please login.");

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1200);
}

// =====================
// LOGIN
// =====================
function login() {
    let user = document.getElementById("logUser").value.trim().toLowerCase();
    let pass = document.getElementById("logPass").value.trim();

    let saved = localStorage.getItem("user_" + user);

    if (!saved) {
        alert("User not found");
        return;
    }

    if (saved !== pass) {
        alert("Wrong password");
        return;
    }

    localStorage.setItem("loggedUser", user);

    window.location.href = "dashboard.html";
}

// =====================
// RESET PASSWORD
// =====================
function resetPassword() {
    let user = document.getElementById("resetUser").value.trim().toLowerCase();
    let newPass = document.getElementById("resetPass").value.trim();
    let confirm = document.getElementById("resetConfirm").value.trim();

    let msg = document.getElementById("resetMsg");
    msg.style.color = "red";

    if (user === "" || newPass === "" || confirm === "") {
        msg.textContent = "⚠️ All fields required";
        return;
    }

    if (!localStorage.getItem("user_" + user)) {
        msg.textContent = "⚠️ Username not found";
        return;
    }

    if (newPass.length < 5) {
        msg.textContent = "⚠️ Password must be at least 5 characters";
        return;
    }

    if (!/\d/.test(newPass)) {
        msg.textContent = "⚠️ Password must include a number";
        return;
    }

    if (newPass !== confirm) {
        msg.textContent = "❌ Passwords do not match";
        return;
    }

    localStorage.setItem("user_" + user, newPass);

    alert("🔐 Password reset successfully! Please login with your new password.");

    msg.style.color = "green";
    msg.textContent = "✅ Password reset! Redirecting to login...";

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
}

// =====================
// DASHBOARD
// =====================
if (window.location.pathname.includes("dashboard.html")) {
    const user = getUser();

    document.getElementById("user").textContent = "👤 " + user;

    let best = localStorage.getItem("bestWpm_" + user) || 0;
    document.getElementById("bestWpm").textContent = best;

    let acc = localStorage.getItem("lastAccuracy_" + user) || 0;
    document.getElementById("accuracy").textContent = acc;

    let savedStreak = localStorage.getItem("maxStreak_" + user) || 0;
    if (document.getElementById("streak")) {
        document.getElementById("streak").textContent = savedStreak;
    }
}

// =====================
// TEXT GENERATOR
// =====================
function getTextByDifficulty() {
    const easy = ["I like coding.", "Dogs are friendly.", "JavaScript is fun."];
    const medium = [
        "Programming improves problem solving skills.",
        "Typing fast requires daily practice and focus.",
        "Developers build software for real world problems."
    ];
    const hard = [
        "Asynchronous programming improves performance in non-blocking operations.",
        "Data structures determine software efficiency and scalability.",
        "Modern applications rely on optimized backend architecture."
    ];

    let level = difficulty ? difficulty.value : "medium";

    if (level === "easy") return easy[Math.floor(Math.random() * easy.length)];
    if (level === "hard") return hard[Math.floor(Math.random() * hard.length)];
    return medium[Math.floor(Math.random() * medium.length)];
}

// =====================
// START GAME
// =====================
if (startBtn) {
startBtn.addEventListener("click", startCountdown);
}

function startCountdown() {
    let count = 3;

    resetGame();

    inputBox.disabled = true;
    textDisplay.textContent = "Get ready...";
    countdownEl.textContent = count;

    let cd = setInterval(() => {
        count--;
        countdownEl.textContent = count;

        if (count === 0) {
            clearInterval(cd);
            countdownEl.textContent = "";
            startGame();
        }
    }, 1000);
}

function startGame() {
    inputBox.value = "";
    inputBox.disabled = false;
    inputBox.focus();

    originalText = getTextByDifficulty();
    textDisplay.innerHTML = originalText;

    time = 0;
    isPlaying = true;
    combo = 0;

    streak = 0;
    maxStreak = 0;

    clearInterval(timer);

    timer = setInterval(() => {
        time++;
        timeEl.textContent = time;

        if (time >= MAX_TIME) {
            endGame(true);
        }
    }, 1000);
}

// =====================
// INPUT ENGINE + STREAK
// =====================
if (inputBox) {
inputBox.addEventListener("input", () => {
    if (!isPlaying) return;

    let typed = inputBox.value;

    let correct = 0;
    combo = 0;

    let html = "";

    for (let i = 0; i < originalText.length; i++) {
        if (i < typed.length) {
            if (typed[i] === originalText[i]) {
                html += `<span style="color:#00ff99">${originalText[i]}</span>`;
                correct++;
                combo++;

                streak++;
                if (streak > maxStreak) maxStreak = streak;

            } else {
                html += `<span style="color:red">${originalText[i]}</span>`;
                streak = 0;
            }
        } else {
            html += originalText[i];
        }
    }

    textDisplay.innerHTML = html;

    comboEl.textContent = combo;

    if (document.getElementById("streak")) {
        document.getElementById("streak").textContent = streak;
    }

    updateProgress();

    let words = typed.trim().split(" ").length;
    let wpm = Math.round((words / time) * 60) || 0;

    let accuracy = Math.round((correct / originalText.length) * 100) || 0;

    wpmEl.textContent = wpm;
    accuracyEl.textContent = accuracy;

    if (typed === originalText) {
        endGame(false, accuracy);
    }
});
}

// =====================
// END GAME
// =====================
function endGame(timeout = false, accuracy = 0) {
    clearInterval(timer);
    isPlaying = false;
    inputBox.disabled = true;

    let typed = inputBox.value;
    let words = typed.trim().split(" ").length;
    let wpm = Math.round((words / time) * 60) || 0;

    if (wpm > bestWpm) {
        bestWpm = wpm;
        localStorage.setItem(bestKey, bestWpm);
        if (bestWpmEl) bestWpmEl.textContent = bestWpm;
    }

    localStorage.setItem("lastAccuracy_" + user, accuracy);
    localStorage.setItem("maxStreak_" + user, maxStreak);

    textDisplay.textContent = timeout
        ? "⏰ Time's up!"
        : "🎉 Perfect! You finished!";

    if (typeSound) typeSound.play();
}

// =====================
// PROGRESS BAR
// =====================
function updateProgress() {
    let percent = (inputBox.value.length / originalText.length) * 100;
    progressBar.innerHTML = `<div style="width:${percent}%;height:100%;background:#00ff99;"></div>`;
}

// =====================
// RESET GAME
// =====================
function resetGame() {
    clearInterval(timer);

    time = 0;
    isPlaying = false;
    originalText = "";

    streak = 0;

    if (inputBox) inputBox.value = "";
    if (inputBox) inputBox.disabled = true;

    if (timeEl) timeEl.textContent = 0;
    if (wpmEl) wpmEl.textContent = 0;
    if (accuracyEl) accuracyEl.textContent = 0;
    if (comboEl) comboEl.textContent = 0;
    if (countdownEl) countdownEl.textContent = "";

    if (progressBar) progressBar.innerHTML = "";

    if (document.getElementById("streak")) {
        document.getElementById("streak").textContent = 0;
    }
}

// =====================
// RESTART
// =====================
if (restartBtn) {
    restartBtn.addEventListener("click", resetGame);
}

// =====================
// NAVIGATION
// =====================
function goRegister() {
    window.location.href = "register.html";
}

function logout() {
    localStorage.removeItem("loggedUser");
    window.location.href = "login.html";
}