const quoteElement = document.getElementById("quote");
const inputElement = document.getElementById("input");
const timeElement = document.getElementById("time");
const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");
const topWpmElement = document.getElementById("topWpm");
const startBtn = document.getElementById("startBtn");
const themeSelect = document.getElementById("themeSelect");
const timeSelect = document.getElementById("timeSelect");
const overlay = document.getElementById("countdownOverlay");
const countdownText = document.getElementById("countdownText");

let timer, timeLeft, currentQuote, totalTyped, correctChars, mistakeIndices;
let topWpm = localStorage.getItem("topWpm") || 0;
topWpmElement.textContent = topWpm;

themeSelect.addEventListener("change", () => {
  document.body.className = themeSelect.value;
});

timeSelect.addEventListener("change", () => {
  timeElement.textContent = timeSelect.value;
});

// Quotes by length
const shortQuotes = [
  "Code is like humor.",
  "Think twice, code once.",
  "Keep it simple, stupid.",
  "Make it work, then make it better.",
  "Talk is cheap. Show me the code."
];

const mediumQuotes = [
  "Every great developer you know once wrote bad code.",
  "Clean code always looks like it was written by someone who cares.",
  "Programming isn't about what you know. It's about what you can figure out.",
  "Typing speed improves with regular practice and focus.",
  "The best error message is the one that never shows up."
];

const longQuotes = [
  "Software development is a journey of continuous learning and improvement. It requires curiosity, patience, and the ability to learn from failure.",
  "The best way to become a better programmer is to build projects, break things, fix them, and reflect on the experience.",
  "A good programmer is someone who looks both ways before crossing a one-way street. They think of edge cases and prepare for the unexpected.",
  "Every software engineer eventually realizes that writing code is the easiest part — the hard part is communication and collaboration.",
  "The difference between a novice and an expert programmer is not in writing more lines of code, but in writing fewer lines that do more."
];

const extraLongQuotes = [
  "In five minutes, your typing skills will be tested with a passage meant to stretch your focus and endurance. Programming, much like typing, is an art that requires rhythm, accuracy, and a mindset for progress. You may not see instant results, but over time, consistent effort leads to exponential improvement. Stay relaxed, sit straight, and let your fingers flow across the keyboard like a symphony of thoughts turned into code. Typing is not about rushing, it's about finding your pace, and learning to correct yourself as you go.",
  "Mastery comes not from the absence of error, but from the ability to recognize and fix it. The best developers are often the best typists, not because of speed alone, but because of their ability to translate thought into clear, readable text. Each word typed now reflects your readiness to work in fast, demanding environments. With practice, muscle memory improves, and so does your confidence. Let this test be a stepping stone — not just to type faster, but to express yourself clearly and confidently."
];

// Load based on time
function getQuoteForTime(seconds) {
  if (seconds <= 10) return getRandom(shortQuotes);
  if (seconds <= 30) return getRandom(mediumQuotes);
  if (seconds <= 60) return getRandom(longQuotes);
  return getRandom(extraLongQuotes);
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function loadQuote() {
  const selectedTime = parseInt(timeSelect.value);
  currentQuote = getQuoteForTime(selectedTime);
  quoteElement.innerHTML = currentQuote
    .split("")
    .map(char => `<span>${char}</span>`)
    .join("");
}

function startTest() {
  inputElement.disabled = true;
  inputElement.value = "";
  wpmElement.textContent = 0;
  accuracyElement.textContent = 0;
  timeElement.textContent = timeSelect.value;
  quoteElement.innerHTML = "";

  showCountdown(3, () => {
    loadQuote();
    inputElement.disabled = false;
    inputElement.focus();
    totalTyped = 0;
    correctChars = 0;
    mistakeIndices = [];

    timeLeft = parseInt(timeSelect.value);
    clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
  });
}

function showCountdown(startFrom, callback) {
  overlay.classList.remove("hidden");
  let counter = startFrom;
  const interval = setInterval(() => {
    if (counter > 0) {
      countdownText.textContent = counter;
    } else if (counter === 0) {
      countdownText.textContent = "Go!";
    } else {
      clearInterval(interval);
      overlay.classList.add("hidden");
      callback();
    }
    counter--;
  }, 1000);
}

function updateTimer() {
  timeLeft--;
  timeElement.textContent = timeLeft;
  if (timeLeft <= 0) {
    clearInterval(timer);
    inputElement.disabled = true;
    calculateResult();
  }
}

inputElement.addEventListener("keydown", (e) => {
  if (e.key === "Backspace") e.preventDefault();
});

inputElement.addEventListener("input", () => {
  const typed = inputElement.value;
  const quoteSpans = quoteElement.querySelectorAll("span");
  const maxLength = quoteSpans.length;

  if (typed.length > maxLength) {
    inputElement.value = typed.slice(0, maxLength);
    return;
  }

  totalTyped = typed.length;
  correctChars = 0;
  mistakeIndices = [];

  for (let i = 0; i < maxLength; i++) {
    const actualChar = currentQuote[i];
    const typedChar = typed[i];

    if (!typedChar) {
      quoteSpans[i].classList.remove("highlight-correct", "highlight-wrong");
    } else if (typedChar === actualChar) {
      quoteSpans[i].classList.add("highlight-correct");
      quoteSpans[i].classList.remove("highlight-wrong");
      correctChars++;
    } else {
      quoteSpans[i].classList.add("highlight-wrong");
      quoteSpans[i].classList.remove("highlight-correct");
      if (!mistakeIndices.includes(i)) mistakeIndices.push(i);
    }
  }
});

function calculateResult() {
  const elapsed = parseInt(timeSelect.value) - timeLeft;
  const minutes = Math.max(elapsed / 60, 1);
  const wpm = Math.round((correctChars / 5) / minutes);
  const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 0;

  wpmElement.textContent = isFinite(wpm) ? wpm : 0;
  accuracyElement.textContent = accuracy;

  if (wpm > topWpm) {
    localStorage.setItem("topWpm", wpm);
    topWpmElement.textContent = wpm;
  }

  if (totalTyped === 0) {
    alert("⌨️ You didn’t type anything. Try again!");
    return;
  }

  if (mistakeIndices.length > 0) {
    let errorMsg = `\n\nYou made ${mistakeIndices.length} mistake(s):\n`;
    mistakeIndices.forEach(index => {
      const expected = currentQuote[index];
      const typedChar = inputElement.value[index] || "(nothing)";
      errorMsg += `• At position ${index + 1}: expected '${expected}', got '${typedChar}'\n`;
    });
    alert(errorMsg);
  } else {
    alert("✅ No mistakes! Excellent typing!");
  }
}

startBtn.addEventListener("click", startTest);
