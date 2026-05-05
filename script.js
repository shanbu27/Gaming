// =====================
// USER SYSTEM
// =====================
function getUser() {
    return localStorage.getItem("loggedUser") || "Guest";
}

const user = getUser();
let bestKey = "bestWpm_" + user;

// =====================
// ELEMENTS (safe refs)
// =====================
const textDisplay   = document.getElementById("textDisplay");
const inputBox      = document.getElementById("inputBox");
const startBtn      = document.getElementById("startBtn");
const restartBtn    = document.getElementById("restartBtn");
const timeEl        = document.getElementById("time");
const wpmEl         = document.getElementById("wpm");
const accuracyEl    = document.getElementById("accuracy");
const countdownEl   = document.getElementById("countdown");
const difficultyEl  = document.getElementById("difficulty");
const bestWpmEl     = document.getElementById("bestWpm");
const comboEl       = document.getElementById("combo");
const streakEl      = document.getElementById("streak");
const progressBar   = document.getElementById("progressBar");
const progressFill  = document.getElementById("progressFill");
const typeSound     = document.getElementById("typeSound");

// =====================
// USER LABEL
// =====================
const userLabel = document.getElementById("userLabel");
if (userLabel) userLabel.textContent = "Player: " + user;

// =====================
// THEME SYSTEM (applied immediately to avoid flash)
// =====================
(function() {
    if (localStorage.getItem("theme") === "light") {
        document.documentElement.classList.add("light-mode");
        document.addEventListener("DOMContentLoaded", () => {
            document.body.classList.add("light");
            const btn = document.getElementById("themeToggle");
            if (btn) btn.textContent = "🌙 Dark Mode";
        });
    }
})();

function toggleTheme() {
    const isLight = document.body.classList.toggle("light");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    const btn = document.getElementById("themeToggle");
    if (btn) btn.textContent = isLight ? "🌙 Dark Mode" : "☀️ Light Mode";
}

// =====================
// GAME STATE
// =====================
const MAX_TIME = 60;
let timer, time = 0, isPlaying = false, originalText = "";
let combo = 0, streak = 0, maxStreak = 0, mistakes = 0;
let bestWpm = parseInt(localStorage.getItem(bestKey)) || 0;
if (bestWpmEl) bestWpmEl.textContent = bestWpm;

// =====================
// TEXT LIBRARY
// =====================
const texts = {
    easy: [
        "I like coding every day.",
        "Dogs are very friendly pets.",
        "JavaScript is a fun language.",
        "The sun rises in the east.",
        "She drinks coffee every morning.",
        "Books open the mind to new worlds.",
        "Music makes every moment better.",
        "We learn by making mistakes.",
        "A smile can change someone's day.",
        "Practice makes perfect over time."
    ],
    medium: [
        "Programming improves your problem solving skills.",
        "Typing fast requires daily practice and deep focus.",
        "Developers build software to solve real world problems.",
        "Consistency is the key to mastering any new skill.",
        "Good code is easy to read and simple to maintain.",
        "Version control helps teams collaborate on large projects.",
        "Debugging is the art of removing errors from your code.",
        "Functions let you reuse blocks of code efficiently.",
        "The best programmers are always learning something new.",
        "Breaking problems into smaller steps makes them easier."
    ],
    hard: [
        "Asynchronous programming improves performance in non-blocking I/O operations.",
        "Data structures and algorithms determine software efficiency and scalability.",
        "Modern applications rely on optimized backend architecture and caching layers.",
        "Recursion is a technique where a function calls itself to solve subproblems.",
        "Polymorphism allows objects of different types to be treated uniformly.",
        "Dependency injection reduces coupling and improves testability in large systems.",
        "Garbage collection automatically manages memory allocation in modern runtimes.",
        "Concurrency allows multiple computations to make progress simultaneously.",
        "Immutability in functional programming eliminates side effects and bugs.",
        "Binary search reduces lookup complexity from linear to logarithmic time."
    ]
};

function getTextByDifficulty() {
    const level = difficultyEl ? difficultyEl.value : "medium";
    const pool = texts[level] || texts.medium;
    return pool[Math.floor(Math.random() * pool.length)];
}

// =====================
// REGISTER
// =====================
function register() {
    const regUser    = document.getElementById("regUser");
    const regEmail   = document.getElementById("regEmail");
    const regPass    = document.getElementById("regPass");
    const regConfirm = document.getElementById("regConfirm");
    const error      = document.getElementById("errorMsg");

    if (!regUser) return;

    const u = regUser.value.trim().toLowerCase();
    const e = regEmail.value.trim();
    const p = regPass.value.trim();
    const c = regConfirm.value.trim();

    error.style.color = "var(--danger)";

    if (!u || !p || !c) { error.textContent = "⚠️ All fields required"; return; }
    if (u.length < 3)   { error.textContent = "⚠️ Username must be at least 3 characters"; return; }
    if (!/^[a-zA-Z0-9_]+$/.test(u)) { error.textContent = "⚠️ Letters, numbers, underscores only"; return; }
    if (p.length < 5)   { error.textContent = "⚠️ Password must be at least 5 characters"; return; }
    if (!/\d/.test(p))  { error.textContent = "⚠️ Password must include a number"; return; }
    if (p !== c)        { error.textContent = "❌ Passwords do not match"; return; }
    if (localStorage.getItem("user_" + u)) { error.textContent = "⚠️ Username already taken"; return; }

    localStorage.setItem("user_" + u, p);
    if (e) localStorage.setItem("email_" + u, e);

    error.style.color = "var(--accent)";
    error.textContent = "✅ Account created! Redirecting...";

    setTimeout(() => { window.location.href = "login.html"; }, 1200);
}

// =====================
// LOGIN
// =====================
function login() {
    const logUser = document.getElementById("logUser");
    const logPass = document.getElementById("logPass");
    if (!logUser) return;

    const u = logUser.value.trim().toLowerCase();
    const p = logPass.value.trim();
    const saved = localStorage.getItem("user_" + u);

    if (!saved)        { showAuthError("login", "❌ Username not found"); return; }
    if (saved !== p)   { showAuthError("login", "❌ Wrong password"); return; }

    localStorage.setItem("loggedUser", u);
    window.location.href = "game.html";
}

function showAuthError(page, msg) {
    let el = document.getElementById("loginMsg");
    if (!el) {
        el = document.createElement("p");
        el.id = "loginMsg";
        document.querySelector(".auth-container").appendChild(el);
    }
    el.style.color = "var(--danger)";
    el.style.fontSize = "13px";
    el.style.fontFamily = "'Space Mono', monospace";
    el.textContent = msg;
}

// =====================
// RESET PASSWORD
// =====================
function resetPassword() {
    const resetUser    = document.getElementById("resetUser");
    const resetPass    = document.getElementById("resetPass");
    const resetConfirm = document.getElementById("resetConfirm");
    const msg          = document.getElementById("resetMsg");
    if (!resetUser) return;

    const u = resetUser.value.trim().toLowerCase();
    const p = resetPass.value.trim();
    const c = resetConfirm.value.trim();

    msg.style.color = "var(--danger)";

    if (!u || !p || !c) { msg.textContent = "⚠️ All fields required"; return; }
    if (!localStorage.getItem("user_" + u)) { msg.textContent = "⚠️ Username not found"; return; }
    if (p.length < 5)   { msg.textContent = "⚠️ Password must be at least 5 characters"; return; }
    if (!/\d/.test(p))  { msg.textContent = "⚠️ Password must include a number"; return; }
    if (p !== c)        { msg.textContent = "❌ Passwords do not match"; return; }

    localStorage.setItem("user_" + u, p);
    msg.style.color = "var(--accent)";
    msg.textContent = "✅ Password reset! Redirecting...";

    setTimeout(() => { window.location.href = "login.html"; }, 1500);
}

// =====================
// DASHBOARD
// =====================
function loadDashboard() {
    if (!window.location.pathname.includes("dashboard.html")) return;

    const u = getUser();
    const userEl = document.getElementById("dashUser");
    if (userEl) userEl.textContent = u;

    const bw = document.getElementById("dashBestWpm");
    const ac = document.getElementById("dashAccuracy");
    const sk = document.getElementById("dashStreak");
    const gp = document.getElementById("dashGames");

    if (bw) bw.textContent = localStorage.getItem("bestWpm_" + u) || 0;
    if (ac) ac.textContent = (localStorage.getItem("lastAccuracy_" + u) || 0) + "%";
    if (sk) sk.textContent = localStorage.getItem("maxStreak_" + u) || 0;
    if (gp) gp.textContent = localStorage.getItem("gamesPlayed_" + u) || 0;
}

loadDashboard();

// =====================
// START GAME
// =====================
if (startBtn) startBtn.addEventListener("click", startCountdown);

// Press Enter to start if not playing
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && startBtn && !isPlaying) startCountdown();
});

function startCountdown() {
    let count = 3;
    resetGame();
    if (inputBox) inputBox.disabled = true;
    if (textDisplay) textDisplay.textContent = "Get ready...";
    if (countdownEl) countdownEl.textContent = count;

    const cd = setInterval(() => {
        count--;
        if (countdownEl) countdownEl.textContent = count > 0 ? count : "Go!";
        if (count <= 0) {
            clearInterval(cd);
            setTimeout(() => {
                if (countdownEl) countdownEl.textContent = "";
                startGame();
            }, 400);
        }
    }, 1000);
}

function startGame() {
    if (!inputBox || !textDisplay) return;

    inputBox.value = "";
    inputBox.disabled = false;
    inputBox.focus();

    originalText = getTextByDifficulty();
    textDisplay.innerHTML = renderText("", originalText);

    time = 0; isPlaying = true; combo = 0; streak = 0; maxStreak = 0; mistakes = 0;
    clearInterval(timer);

    timer = setInterval(() => {
        time++;
        if (timeEl) timeEl.textContent = time;
        if (time >= MAX_TIME) endGame(true);
    }, 1000);
}

// =====================
// RENDER TEXT
// =====================
function renderText(typed, original) {
    let html = "";
    for (let i = 0; i < original.length; i++) {
        if (i < typed.length) {
            if (typed[i] === original[i]) {
                html += `<span class="char-correct">${escapeHtml(original[i])}</span>`;
            } else {
                html += `<span class="char-wrong">${escapeHtml(original[i])}</span>`;
            }
        } else if (i === typed.length) {
            html += `<span class="char-cursor">${escapeHtml(original[i])}</span>`;
        } else {
            html += `<span class="char-pending">${escapeHtml(original[i])}</span>`;
        }
    }
    return html;
}

function escapeHtml(c) {
    return c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c;
}

// =====================
// INPUT ENGINE
// =====================
if (inputBox) {
    inputBox.addEventListener("input", () => {
        if (!isPlaying) return;

        const typed = inputBox.value;
        let correct = 0;
        combo = 0;

        for (let i = 0; i < typed.length; i++) {
            if (typed[i] === originalText[i]) {
                correct++;
                combo++;
                streak++;
                if (streak > maxStreak) maxStreak = streak;
            } else {
                streak = 0;
                mistakes++;
            }
        }

        if (textDisplay) textDisplay.innerHTML = renderText(typed, originalText);

        if (comboEl)  comboEl.textContent  = combo;
        if (streakEl) streakEl.textContent = streak;

        // Progress
        if (progressFill) {
            progressFill.style.width = ((typed.length / originalText.length) * 100) + "%";
        }

        // WPM & accuracy
        const words    = typed.trim() ? typed.trim().split(/\s+/).length : 0;
        const elapsed  = time || 1;
        const wpm      = Math.round((words / elapsed) * 60);
        const accuracy = Math.round((correct / Math.max(typed.length, 1)) * 100);

        if (wpmEl)      wpmEl.textContent      = wpm;
        if (accuracyEl) accuracyEl.textContent = accuracy;

        if (typed === originalText) endGame(false, accuracy, wpm);
    });
}

// =====================
// END GAME
// =====================
function endGame(timeout = false, accuracy = 0, finalWpm = 0) {
    clearInterval(timer);
    isPlaying = false;
    if (inputBox) inputBox.disabled = true;

    const typed = inputBox ? inputBox.value : "";
    const words = typed.trim() ? typed.trim().split(/\s+/).length : 0;
    const wpm   = finalWpm || Math.round((words / Math.max(time, 1)) * 60);
    const acc   = accuracy || Math.round(((originalText.length - mistakes) / Math.max(originalText.length, 1)) * 100);

    const isNewRecord = wpm > bestWpm;
    if (isNewRecord) {
        bestWpm = wpm;
        localStorage.setItem(bestKey, bestWpm);
        if (bestWpmEl) bestWpmEl.textContent = bestWpm;
    }

    // Track games played
    const gamesKey = "gamesPlayed_" + user;
    localStorage.setItem(gamesKey, (parseInt(localStorage.getItem(gamesKey)) || 0) + 1);
    localStorage.setItem("lastAccuracy_" + user, acc);
    localStorage.setItem("maxStreak_" + user, maxStreak);

    // Show modal
    showResultModal({ wpm, acc, time, maxStreak, timeout, isNewRecord });
}

// =====================
// RESULT MODAL
// =====================
function showResultModal({ wpm, acc, time, maxStreak, timeout, isNewRecord }) {
    const overlay = document.getElementById("resultModal");
    if (!overlay) return;

    overlay.querySelector("#modalTitle").textContent    = timeout ? "⏰ Time's Up!" : "🎉 Well Done!";
    overlay.querySelector("#modalSub").textContent      = timeout ? "You ran out of time." : "You finished the text!";
    overlay.querySelector("#modalWpm").textContent      = wpm;
    overlay.querySelector("#modalAcc").textContent      = acc + "%";
    overlay.querySelector("#modalTime").textContent     = time + "s";
    overlay.querySelector("#modalStreak").textContent   = maxStreak;

    const badge = overlay.querySelector("#newRecordBadge");
    badge.style.display = isNewRecord ? "inline-block" : "none";

    overlay.classList.add("show");
}

function closeModal() {
    const overlay = document.getElementById("resultModal");
    if (overlay) overlay.classList.remove("show");
}

function playAgain() {
    closeModal();
    startCountdown();
}

// =====================
// RESET GAME
// =====================
function resetGame() {
    clearInterval(timer);
    time = 0; isPlaying = false; originalText = "";
    streak = 0; combo = 0; mistakes = 0;

    if (inputBox)     { inputBox.value = ""; inputBox.disabled = true; }
    if (timeEl)       timeEl.textContent      = 0;
    if (wpmEl)        wpmEl.textContent       = 0;
    if (accuracyEl)   accuracyEl.textContent  = 0;
    if (comboEl)      comboEl.textContent     = 0;
    if (streakEl)     streakEl.textContent    = 0;
    if (countdownEl)  countdownEl.textContent = "";
    if (progressFill) progressFill.style.width = "0%";
    if (textDisplay)  textDisplay.textContent = "Press Start or Enter to begin";
}

// =====================
// RESTART
// =====================
if (restartBtn) restartBtn.addEventListener("click", resetGame);

// =====================
// NAVIGATION
// =====================
function goRegister() { window.location.href = "register.html"; }
function goLogin()    { window.location.href = "login.html"; }
function playGame()   { window.location.href = "game.html"; }

function logout() {
    localStorage.removeItem("loggedUser");
    window.location.href = "login.html";
}
