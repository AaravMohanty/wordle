/**
 * WORDLE CLONE - STUDENT IMPLEMENTATION
 * 
 * Complete the functions below to create a working Wordle game.
 * Each function has specific requirements and point values.
 * 
 * GRADING BREAKDOWN:
 * - Core Game Functions (60 points): initializeGame, handleKeyPress, submitGuess, checkLetter, updateGameState
 * - Advanced Features (30 points): updateKeyboardColors, processRowReveal, showEndGameModal, validateInput
 */

// ========================================
// CORE GAME FUNCTIONS (60 POINTS TOTAL)
// ========================================

/**
 * Initialize a new game
 * POINTS: 10
 * 
 * TODO: Complete this function to:
 * - Reset all game state variables
 * - Get a random word from the word list
 * - Clear the game board
 * - Hide any messages or modals
 */
function initializeGame() {
    // TODO: Reset game state variables
    currentWord = WordleWords.getRandomWord();  // Set this to a random word
    currentGuess = '';
    currentRow = 0;
    gameOver = false;
    gameWon = false;
    
    // TODO: Get a random word from the word list
    // HINT: Use WordleWords.getRandomWord()
    // TODO: Reset the game board
    // HINT: Use resetBoard()
    // TODO: Hide any messages
    // HINT: Use hideModal() and ensure message element is hidden
    resetBoard();
    hideModal();
}

/**
 * Handle keyboard input
 * POINTS: 15
 * 
 * TODO: Complete this function to:
 * - Process letter keys (A-Z)
 * - Handle ENTER key for word submission
 * - Handle BACKSPACE for letter deletion
 * - Update the display when letters are added/removed
 */
function handleKeyPress(key) {
    // TODO: Check if game is over - if so, return early
    if (gameOver) return;

    // Validate input
    if (!validateInput(key, currentGuess)) return;

    // TODO: Handle letter keys (A-Z)
    // HINT: Use regex /^[A-Z]$/ to test if key is a letter
    // HINT: Check if currentGuess.length < WORD_LENGTH before adding
    // HINT: Use getTile() and updateTileDisplay() to show the letter
    if (/^[A-Z]$/.test(key)) {
        if (currentGuess.length < WORD_LENGTH) {
            const col = currentGuess.length;
            const tile = getTile(currentRow, col);
            currentGuess += key;
            updateTileDisplay(tile, key);
        }
        return;
    }
    
    // TODO: Handle ENTER key
    // HINT: Check if guess is complete using isGuessComplete()
    // HINT: Call submitGuess() if complete, show error message if not
    if (key === 'ENTER') {
        if (isGuessComplete()) {
            submitGuess();
        } else {
            showMessage('Not enough letters', 'error', 1200);
            shakeRow(currentRow);
        }
        return;
    }
    
    // TODO: Handle BACKSPACE key  
    // HINT: Check if there are letters to remove
    // HINT: Clear the tile display and remove from currentGuess
    if (key === 'BACKSPACE') {
        if (currentGuess.length > 0) {
            const idx = currentGuess.length - 1;
            const tile = getTile(currentRow, idx);
            currentGuess = currentGuess.slice(0, -1);
            updateTileDisplay(tile, '');
        }
        return;
    }
}

/**
 * Submit and process a complete guess
 * POINTS: 20
 * 
 * TODO: Complete this function to:
 * - Validate the guess is a real word
 * - Check each letter against the target word
 * - Update tile colors and keyboard
 * - Handle win/lose conditions
 */
function submitGuess() {
    // TODO: Validate guess is complete
    // HINT: Use isGuessComplete()
    if (!isGuessComplete()) {
        showMessage('Not enough letters', 'error', 1200);
        shakeRow(currentRow);
        return;
    }
    
    const guess = getCurrentGuess();
    const target = getTargetWord();

    // TODO: Validate guess is a real word
    // HINT: Use WordleWords.isValidWord()
    // HINT: Show error message and shake row if invalid
    if (!WordleWords.isValidWord(guess)) {
        showMessage('Not in word list', 'error', 1200);
        shakeRow(currentRow);
        return;
    }
    
    // TODO: Check each letter and get results
    // HINT: Use checkLetter() for each position
    // HINT: Store results in an array
    const results = [];
    for (let i = 0; i < WORD_LENGTH; i++) {
        results.push(checkLetter(guess[i], i, target));
    }
    
    // TODO: Update tile colors immediately
    // HINT: Loop through results and use setTileState()
    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = getTile(currentRow, i);
        setTileState(tile, results[i]);
    }
    
    // TODO: Update keyboard colors
    // HINT: Call updateKeyboardColors()
    updateKeyboardColors(guess, results);
    
    // Optional simple celebration for a perfect row
    processRowReveal(currentRow, results);
    
    // TODO: Check if guess was correct
    // HINT: Compare currentGuess with currentWord
    const isCorrect = (guess === target);
    
    // TODO: Update game state
    // HINT: Call updateGameState()
    updateGameState(isCorrect);
    
    // TODO: Move to next row if game continues
    // HINT: Increment currentRow and reset currentGuess
    if (!gameOver) {
        currentRow++;
        currentGuess = '';
    }
}

/**
 * Check a single letter against the target word
 * POINTS: 10
 * 
 * TODO: Complete this function to:
 * - Return 'correct' if letter matches position exactly
 * - Return 'present' if letter exists but wrong position
 * - Return 'absent' if letter doesn't exist in target
 * - Handle duplicate letters correctly (this is the tricky part!)
 */
function checkLetter(guessLetter, position, targetWord) {
    // TODO: Convert inputs to uppercase for comparison
    const guess = getCurrentGuess(); // already uppercase
    const target = targetWord.toUpperCase();

    const g = guess.split('');
    const t = target.split('');
    const states = Array(WORD_LENGTH).fill('absent');

    // Count target letters
    
    // Start with an empty object to store the letter counts.
    const counts = {};

    // Loop through each character 'ch' in the array 't'.
    for (const ch of t) {
    // Check if we have already counted this character before.
    if (counts[ch]) {
        // If we have, just add one to its current count.
        counts[ch] = counts[ch] + 1;
    } else {
        counts[ch] = 1;
    }
    }

    // mark exact matches and decrement counts
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (g[i] === t[i]) {
            states[i] = 'correct';
            counts[g[i]] -= 1;
        }
    }

    // mark present (wrong position) if any counts remain
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (states[i] !== 'correct') {
            const ch = g[i];
            if ((counts[ch] || 0) > 0) {
                states[i] = 'present';
                counts[ch] -= 1;
            } else {
                states[i] = 'absent';
            }
        }
    }

    return states[position];
}

/**
 * Update game state after a guess
 * POINTS: 5
 * 
 * TODO: Complete this function to:
 * - Check if player won (guess matches target)
 * - Check if player lost (used all attempts)
 * - Show appropriate end game modal
 */
function updateGameState(isCorrect) {
    // TODO: Handle win condition
    // HINT: Set gameWon and gameOver flags, call showEndGameModal
    if (isCorrect) {
        gameWon = true;
        gameOver = true;
        showEndGameModal(true, getTargetWord());
        return;
    }
    
    // TODO: Handle lose condition  
    // HINT: Check if currentRow >= MAX_GUESSES - 1
    if (currentRow >= MAX_GUESSES - 1) {
        gameWon = false;
        gameOver = true;
        showEndGameModal(false, getTargetWord());
    }
}

// ========================================
// ADVANCED FEATURES (30 POINTS TOTAL)
// ========================================

/**
 * Update keyboard key colors based on guessed letters
 * POINTS: 10
 * 
 * TODO: Complete this function to:
 * - Update each key with appropriate color
 * - Maintain color priority (green > yellow > gray)
 * - Don't downgrade key colors
 */
function updateKeyboardColors(guess, results) {
    // TODO: Loop through each letter in the guess
    for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = guess[i];
        const state = results[i]; // 'correct' | 'present' | 'absent'
        
        // TODO: Get the keyboard key element
        // HINT: Use document.querySelector with [data-key="LETTER"]
        // TODO: Apply color with priority system (handled by helper)
        updateKeyboardKey(letter, state);
    }
}

/**
 * Process row reveal (simplified - no animations needed)
 * POINTS: 5 (reduced from 15 since animations removed)
 * 
 * TODO: Complete this function to:
 * - Check if all letters were correct
 * - Trigger celebration if player won this round
 */
function processRowReveal(rowIndex, results) {
    // TODO: Check if all results are 'correct'
    // HINT: Use results.every() method
    const allCorrect = results.every(function(r) {
        return r === 'correct';
    });
    
    // TODO: If all correct, trigger celebration
    // HINT: Use celebrateRow() function
    if (allCorrect) {
        celebrateRow(rowIndex);
    }
}

/**
 * Show end game modal with results
 * POINTS: 10
 * 
 * TODO: Complete this function to:
 * - Display appropriate win/lose message
 * - Show the target word
 * - Update game statistics
 */
function showEndGameModal(won, targetWord) {
    // TODO: Create appropriate message based on won parameter
    // HINT: For wins, include number of guesses used
    // HINT: For losses, reveal the target word
    // TODO: Update statistics
    // HINT: Use updateStats() function
    updateStats(won);

    // TODO: Show the modal
    // HINT: Use showModal() function
    let guessesUsed;
    if (won) {
        guessesUsed = currentRow + 1;
    } else {
        guessesUsed = 0;
    }
    showModal(won, targetWord.toUpperCase(), guessesUsed);
}

/**
 * Validate user input before processing
 * POINTS: 5
 * 
 * TODO: Complete this function to:
 * - Check if game is over
 * - Validate letter keys (only if guess not full)
 * - Validate ENTER key (only if guess complete)
 * - Validate BACKSPACE key (only if letters to remove)
 */
function validateInput(key, currentGuess) {
    // TODO: Return false if game is over
    if (gameOver) return false;
    
    // TODO: Handle letter keys
    // HINT: Check if currentGuess.length < WORD_LENGTH
    if (/^[A-Z]$/.test(key)) {
        return currentGuess.length < WORD_LENGTH;
    }
    
    // TODO: Handle ENTER key
    // HINT: Check if currentGuess.length === WORD_LENGTH
    if (key === 'ENTER') {
        return currentGuess.length === WORD_LENGTH;
    }
    
    // TODO: Handle BACKSPACE key
    // HINT: Check if currentGuess.length > 0
    if (key === 'BACKSPACE') {
        return currentGuess.length > 0;
    }
    
    return false;
}
