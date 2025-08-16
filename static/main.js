import { isValidWord } from "./word_validation.mjs";
import { selectWord } from "./word_validation.mjs";

let grid = []; // grid[6][5]
let keyboard = [];
let guesses = [];
let gridIndex = 0; // index of next letter to input
let numGuesses = 0;
let answer = "";
 // get a random word from an easy or difficult five letter word list
document.addEventListener("DOMContentLoaded", update_difficulty);
async function update_difficulty() {
    const savedText = localStorage.getItem("difficulty-btn-text");
    if (savedText) {
        document.getElementById("difficulty-btn").textContent = savedText;
    }
    if (document.getElementById("difficulty-btn").textContent.includes("ON")) {
        try {
            const response = await fetch("http://127.0.0.1:5000/update_difficulty", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify("on"),
            });
        } catch (error) {
            console.error("Error:", error);
        }
        answer = await selectWord(true);
    }
    else {
        try {
            const response = await fetch("http://127.0.0.1:5000/update_difficulty", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify("off"),
            });
        } catch (error) {
            console.error("Error:", error);
        }
        answer = await selectWord(false);
    }
};
let gameOver = false;
const qwerty = [
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
    'Z', 'X', 'C', 'V', 'B', 'N', 'M'
];

// Refresh word list
try {
    const response = await fetch("http://127.0.0.1:5000/clear_word_list", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    }
    });
} catch (error) {
    console.error("Error:", error);
}

// Generates cells for the Wordle grid
const gridContainer = document.getElementById('wordle-grid');
for (let i = 0; i < 30; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        grid.push(cell);
        gridContainer.appendChild(cell);
}

async function addLetter(letter) {
    // Stops the player from typing into the next row before submitting, or if the game is complete
    if (gridIndex > 0 && gridIndex % 5 == 0 && !isRowSubmitted() || gameOver) {
        return;
    }
    grid[gridIndex].innerText = letter;
    gridIndex += 1;
}

function handleKeydown(event) {
    // Check if the key is a valid letter
    if (/^[a-zA-Z]$/.test(event.key)) {
        const letter = event.key.toUpperCase();
        addLetter(letter);
    }
    else if (event.keyCode == 13) enter_guess();
    else if (event.keyCode == 8 || event.keyCode == 46) delLetter();
}
document.addEventListener('keydown', handleKeydown);

// Generates buttons for each row of the on-screen keyboard
const keyboard_row1_container = document.getElementById('keyboard-row1');
        for (let i = 0; i < 10; i++) {
            const letter = qwerty[i]; // Generates letters in  QWERTY order
            const button = document.createElement('button');
            button.className = 'key-row1';
            button.id = letter.toLowerCase();
            button.textContent = letter;
            button.addEventListener('click', (event) => {
                const letter = event.target.textContent;
                console.log(`Button ${letter} clicked and function triggered.`);
                addLetter(letter);
            });
            keyboard.push(button);
            keyboard_row1_container.appendChild(button);
        }

const keyboard_row2_container = document.getElementById('keyboard-row2');
        for (let i = 10; i < 19; i++) {
            const letter = qwerty[i];
            const button = document.createElement('button');
            button.className = 'key-row2';
            button.id = letter.toLowerCase();
            button.textContent = letter;
            button.addEventListener('click', (event) => {
                const letter = event.target.textContent;
                console.log(`Button ${letter} clicked and function triggered.`);
                addLetter(letter);
            });
            keyboard.push(button);
            keyboard_row2_container.appendChild(button);
        }

const keyboard_row3_container = document.getElementById('keyboard-row3');
        for (let i = 19; i < 26; i++) {
            const letter = qwerty[i];
            const button = document.createElement('button');
            button.className = 'key-row3';
            button.id = letter.toLowerCase();
            button.textContent = letter;
            button.addEventListener('click', (event) => {
                const letter = event.target.textContent;
                addLetter(letter);
            });
            keyboard.push(button);
            keyboard_row3_container.appendChild(button);
        }
        const button = document.createElement('button');
        button.className = 'key-row3';
        button.id = 'key-del';
        button.textContent = 'DEL';
        keyboard_row3_container.appendChild(button);

async function showMessage(flag) {
    const message = document.getElementById('wordle-message');
    if (message.classList.contains('show') && flag != 0) {
        return;
    }
    message.style.visibility = 'visible';
    if (flag == 1) {
        message.textContent = "Not enough letters";
    }
    else if (flag == 2) {
        message.textContent = "Not in word list";
    }
    else if (flag == 3) {
        message.style.width = "140px";
        message.textContent = "Word already guessed";
    }
    else if (flag == 4) {
        var completionMessages = ["Genius", "Magnificent", "Impressive", "Splendid", "Great", "Phew!"];
        message.textContent = completionMessages[numGuesses-1];
    }
    else if (flag == 5) {
        message.textContent = answer.toUpperCase();
    }
    if (flag != 4 && flag != 5) {
        for (let i = 0; i < 5; i++) {
            grid[5*numGuesses + i].classList.toggle('shake');
        }
        await new Promise(r => setTimeout(r, 1000));
        message.style.visibility = 'hidden';
        for (let i = 0; i < 5; i++) {
            grid[5*numGuesses + i].classList.toggle('shake');
        }
    }
    if (flag == 3) message.style.width = "120px";
    return;
}

document.getElementById("difficulty-btn").addEventListener("click", async function() {
    const difficulty_btn = document.getElementById("difficulty-btn");

    if (difficulty_btn.textContent.includes("OFF")) difficulty_btn.textContent = "Hard Mode: ON";
    else difficulty_btn.textContent = "Hard Mode: OFF";

    localStorage.setItem("difficulty-btn-text", difficulty_btn.textContent);
    location.reload();
});

document.getElementById("key-enter").addEventListener("click", enter_guess);
async function enter_guess() {
    if (gameOver) return;

    // Not enough letters
    if ((gridIndex < 5) || (gridIndex % 5 != 0)) {
        showMessage(1);
        return;
    }

    // Stores the possible guess in array
    var letters = [];
    for (let i = 0; i < 5; i++) {
        letters.push(grid[5*numGuesses + i].textContent.toLowerCase());
    }

    var guess = letters.join("");
    // Invalid word
    if (await isValidWord(guess) == false) {
        showMessage(2);
        return;
    }
    // Already guessed word
    if (guesses.includes(guess)) {
        showMessage(3);
        return;
    }
    guesses.push(guess);
    var guessPattern = "";

    // Green pass
    let answerArr = answer.split("");
    let letterCount = {};
    answerArr.forEach(ch => letterCount[ch] = (letterCount[ch] || 0) + 1);
    let resultColors = Array(5).fill("grey"); // default all grey
    let greensCount = {};

    for (let i = 0; i < 5; i++) {
        let ch = letters[i];
        let keyLetter = document.getElementById(ch);
        grid[5*numGuesses + i].style.outline = "0";
        if (keyLetter) keyLetter.style.outline = "0";
        grid[5*numGuesses + i].style.color = "white";
        if (keyLetter) keyLetter.style.color = "white";

        if (answer[i] === ch) {
            resultColors[i] = "G";
            greensCount[ch] = (greensCount[ch] || 0) + 1;
            letterCount[ch]--;
        }
    }

    // Yellow/grey pass
    for (let i = 0; i < 5; i++) {
        let ch = letters[i];
        if (resultColors[i] == "G") continue;

        if (letterCount[ch] > 0) {
            resultColors[i] = "Y";
            letterCount[ch]--;
        } else {
            resultColors[i] = "B";
        }
    }

    // Apply colors and build pattern
    for (let i = 0; i < 5; i++) {
        let ch = letters[i];
        let keyLetter = document.getElementById(ch);
        let color, patternChar;
        if (resultColors[i] == "G") {
            color = "rgb(120, 168, 107)";
            patternChar = "G";
        }
        else if (resultColors[i] == "Y") {
            color = "rgb(200, 180, 100)";
            patternChar = "Y";
        }
        else {
            color = "rgb(120, 125, 125)";
            patternChar = "B";
        }
        grid[5*numGuesses + i].style.backgroundColor = color;
        if (keyLetter) keyLetter.style.backgroundColor = color;
        guessPattern += patternChar;
    }

    if (guess == answer) {
        await completed();
        gameOver = true;
    }
    if (gridIndex >= 30 && guess != answer) {
        await failed();
        gameOver = true;
    }

    // Update list of possible answers
    try {
        const response = await fetch("http://127.0.0.1:5000/update_word_list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({guess, guessPattern}),
        });
    } catch (error) {
        console.error("Error:", error);
    }

    numGuesses += 1;
}

document.getElementById("key-del").addEventListener("click", delLetter);
function delLetter() {
    // Stops player from deleting from previous row
    if (gridIndex % 5 == 0 && isRowSubmitted() == true) {
        return;
    }
    grid[gridIndex - 1].innerText = "";
    gridIndex -= 1;
}

function isRowSubmitted() {
    var row = gridIndex % 5 == 0 ? Math.floor(gridIndex/5) - 1 : Math.floor(gridIndex/5);
    return !(numGuesses <= row);
}

function playAgain() {
    document.getElementById("playAgainButton").style.display = "block";
}

async function completed() {
    showMessage(4);
    for (let i = 0; i < 5; i++) {
        grid[numGuesses*5 + i].classList.toggle('bounce');
        await new Promise(r => setTimeout(r, 220));
    }
    setTimeout(playAgain, 1000);
}
async function failed() {
    showMessage(5);
    for (let i = 0; i < 5; i++) {
        grid[numGuesses*5 + i].classList.toggle('flash-grid');
        await new Promise(r => setTimeout(r, 220));
    }
    setTimeout(playAgain, 1000);
}

/* WORDLE BOT */
document.getElementById("bot-guess-btn").addEventListener("click", async (event) => {
    if (gameOver) return;
    let bestWord = "";
    if (numGuesses == 0) bestWord = "SALET"; // Hardcoded to save (a lot of) time
    else {
        try {
            const response = await fetch("http://127.0.0.1:5000/get_best_word", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            });
            if (response.ok) {
                const data = await response.json();
                bestWord = data.message.toUpperCase();
            }
        } catch (error) {
            console.error("Error:", error);
            document.getElementById("best-word-response").innerText =
            "Error: Something went wrong.";
        }
    }
    
    // Clear current row
    for (let i = 0; i < 5; i++) {
        grid[numGuesses * 5 + i].innerText = "";
    }
    for (let i = 0; i < 5; i++) {
        grid[numGuesses * 5 + i].innerText = bestWord[i];
    }
    gridIndex = numGuesses * 5 + 5;
    document.activeElement.blur();
});
