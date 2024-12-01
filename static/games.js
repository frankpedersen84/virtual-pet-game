let petState = {
    money: 0
};

let currentGame = null;
let gameInterval = null;
let score = 0;
let gameActive = false;
let flipped = [];
let matched = [];

async function getPetStatus() {
    try {
        const response = await fetch('/api/pet/status');
        const data = await response.json();
        petState.money = data.money;
        document.getElementById('money').textContent = petState.money;
    } catch (error) {
        console.error('Error fetching pet status:', error);
    }
}

async function updateMoney(amount) {
    try {
        const response = await fetch('/api/pet/earn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: amount })
        });
        if (response.ok) {
            await getPetStatus();
        }
    } catch (error) {
        console.error('Error updating money:', error);
    }
}

function startGame(gameType) {
    gameActive = true;
    const gameContainer = document.getElementById('game-container');
    const gameArea = document.getElementById('game-area');
    const gameTitle = document.getElementById('game-title');
    const gameStats = document.getElementById('game-stats');
    
    gameContainer.style.display = 'block';
    gameStats.textContent = '';
    
    switch(gameType) {
        case 'catch':
            gameTitle.textContent = '🎯 Catch the Mouse';
            startCatchGame();
            break;
        case 'memory':
            gameTitle.textContent = '🧠 Pet Memory';
            startMemoryGame();
            break;
        case 'quiz':
            gameTitle.textContent = '📚 Pet Quiz';
            startQuizGame();
            break;
    }
}

function closeGame() {
    gameActive = false;
    currentGame = null;
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    flipped = [];
    matched = [];
    document.getElementById('game-container').style.display = 'none';
}

// Catch the Mouse Game
function startCatchGame() {
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = '<div id="mouse" class="mouse">🐁</div>';
    const mouse = document.getElementById('mouse');
    
    mouse.addEventListener('click', catchMouse);
    
    function moveMouse() {
        if (!gameActive) return;
        const maxX = gameArea.clientWidth - 50;
        const maxY = gameArea.clientHeight - 50;
        const x = Math.random() * maxX;
        const y = Math.random() * maxY;
        mouse.style.left = x + 'px';
        mouse.style.top = y + 'px';
    }
    
    gameInterval = setInterval(moveMouse, 1000);
    moveMouse();
}

async function catchMouse() {
    if (!gameActive) return;
    
    score++;
    const reward = Math.floor(Math.random() * 11) + 5; // 5-15 coins
    await updateMoney(reward);
    
    document.getElementById('game-stats').textContent = `Score: ${score} | Last Catch: +${reward} coins`;
    const mouse = document.getElementById('mouse');
    
    // Add catch animation
    mouse.style.transform = 'scale(0.8)';
    setTimeout(() => {
        if (mouse) mouse.style.transform = 'scale(1)';
    }, 100);
}

// Memory Game
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let matchedPairs = 0;
const totalPairs = 8;

const emojis = ['🐶', '🐱', '🐰', '🐹', '🦜', '🐠', '🐢', '🦊'];
const allEmojis = [...emojis, ...emojis];

function createMemoryGame() {
    const memoryGrid = document.querySelector('.memory-grid');
    memoryGrid.innerHTML = '';
    matchedPairs = 0;

    // Shuffle emojis
    const shuffledEmojis = allEmojis.sort(() => Math.random() - 0.5);

    shuffledEmojis.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.emoji = emoji;
        
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">❓</div>
                <div class="card-back">${emoji}</div>
            </div>
        `;
        
        card.addEventListener('click', flipCard);
        memoryGrid.appendChild(card);
    });
}

function startMemoryGame() {
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = '<div class="memory-grid"></div>';
    createMemoryGame();
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flipped');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    matchedPairs++;

    if (matchedPairs === totalPairs) {
        setTimeout(() => {
            alert('Congratulations! You completed the memory game! +50 coins');
            updateMoney(50);
            resetMemoryGame();
        }, 500);
    }

    resetBoard();
}

function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function resetMemoryGame() {
    const cards = document.querySelectorAll('.memory-card');
    cards.forEach(card => {
        card.classList.remove('flipped');
        card.addEventListener('click', flipCard);
    });
    createMemoryGame();
}

// Quiz Game
const quizQuestions = [
    {
        question: "What should you do if your pet stops eating?",
        answers: [
            "Wait and see if they get hungry",
            "Consult a veterinarian",
            "Force feed them",
            "Change their food immediately"
        ],
        correct: 1
    },
    {
        question: "How often should you take your dog for a walk?",
        answers: [
            "Once a week",
            "Once a month",
            "At least once a day",
            "Only when they ask"
        ],
        correct: 2
    },
    {
        question: "What is the normal body temperature for a cat?",
        answers: [
            "101-102.5°F (38.3-39.2°C)",
            "97-99°F (36.1-37.2°C)",
            "103-105°F (39.4-40.6°C)",
            "95-97°F (35-36.1°C)"
        ],
        correct: 0
    },
    {
        question: "How often should you clean a fish tank?",
        answers: [
            "Once a year",
            "Every 2-4 weeks",
            "Only when it looks dirty",
            "Every 6 months"
        ],
        correct: 1
    },
    {
        question: "What is a sign of dehydration in pets?",
        answers: [
            "Wagging tail",
            "Excessive energy",
            "Dry, sticky gums",
            "Frequent urination"
        ],
        correct: 2
    },
    {
        question: "How often should you brush your dog's teeth?",
        answers: [
            "Never",
            "Once a year",
            "Once a month",
            "2-3 times per week"
        ],
        correct: 3
    },
    {
        question: "What is the best way to introduce a new pet to your home?",
        answers: [
            "Let them explore freely immediately",
            "Gradually introduce them to one room at a time",
            "Keep them isolated for a week",
            "Introduce them to all your other pets right away"
        ],
        correct: 1
    },
    {
        question: "How often should you clean your pet's food and water bowls?",
        answers: [
            "Daily",
            "Weekly",
            "Monthly",
            "When they look dirty"
        ],
        correct: 0
    },
    {
        question: "What is the most important factor in choosing a pet?",
        answers: [
            "Cost",
            "Appearance",
            "Lifestyle compatibility",
            "Size"
        ],
        correct: 2
    },
    {
        question: "How often should you trim your dog's nails?",
        answers: [
            "Never",
            "Every 4-6 weeks",
            "Once a year",
            "Only when they break"
        ],
        correct: 1
    },
    {
        question: "What should you do if your pet eats something toxic?",
        answers: [
            "Wait to see if they get sick",
            "Make them throw up",
            "Give them water",
            "Contact pet poison control immediately"
        ],
        correct: 3
    },
    {
        question: "How often should adult cats visit the vet?",
        answers: [
            "Only when sick",
            "Once every few years",
            "At least once a year",
            "Every month"
        ],
        correct: 2
    },
    {
        question: "What is the best way to reward good behavior in pets?",
        answers: [
            "Positive reinforcement with treats and praise",
            "Ignore it",
            "Give them a toy",
            "Pet them roughly"
        ],
        correct: 0
    },
    {
        question: "How can you tell if your pet is overweight?",
        answers: [
            "They sleep a lot",
            "You can't feel their ribs",
            "They eat a lot",
            "They drink a lot of water"
        ],
        correct: 1
    },
    {
        question: "What is the best way to socialize a puppy?",
        answers: [
            "Keep them away from other dogs",
            "Expose them to various experiences during 3-16 weeks",
            "Wait until they're fully vaccinated",
            "Let them figure it out on their own"
        ],
        correct: 1
    },
    {
        question: "How can you prevent separation anxiety in pets?",
        answers: [
            "Leave without saying goodbye",
            "Gradually accustom them to being alone",
            "Always take them with you",
            "Get another pet immediately"
        ],
        correct: 1
    },
    {
        question: "What should you do if your pet is shaking or trembling?",
        answers: [
            "Ignore it, it's normal",
            "Give them a warm bath",
            "Exercise them more",
            "Consult a veterinarian"
        ],
        correct: 3
    },
    {
        question: "How often should you groom a long-haired cat?",
        answers: [
            "Daily brushing",
            "Once a month",
            "Never, they clean themselves",
            "Only when matted"
        ],
        correct: 0
    },
    {
        question: "What is the proper way to pick up a rabbit?",
        answers: [
            "By the ears",
            "Supporting their hindquarters and chest",
            "By the scruff",
            "Under their arms"
        ],
        correct: 1
    },
    {
        question: "How can you tell if a bird is sick?",
        answers: [
            "Singing a lot",
            "Changes in behavior, appetite, or droppings",
            "Sleeping during the day",
            "Being more active than usual"
        ],
        correct: 1
    },
    {
        question: "What is the ideal temperature for a bearded dragon's basking spot?",
        answers: [
            "70-80°F (21-27°C)",
            "95-105°F (35-40°C)",
            "60-70°F (15-21°C)",
            "110-120°F (43-49°C)"
        ],
        correct: 1
    },
    {
        question: "How often should you change a hamster's bedding?",
        answers: [
            "Once a year",
            "Every 6 months",
            "Weekly",
            "When it smells bad"
        ],
        correct: 2
    },
    {
        question: "What is the best substrate for a leopard gecko?",
        answers: [
            "Sand",
            "Reptile carpet or tile",
            "Loose soil",
            "Wood chips"
        ],
        correct: 1
    },
    {
        question: "How can you tell if your fish tank is overcrowded?",
        answers: [
            "Fish are always swimming",
            "Water gets dirty quickly and fish gasp at surface",
            "Fish are very colorful",
            "Fish stay at the bottom"
        ],
        correct: 1
    },
    {
        question: "What should you do if your pet has fleas?",
        answers: [
            "Just wait for them to go away",
            "Only treat the pet",
            "Treat pet and environment comprehensively",
            "Give them a bath"
        ],
        correct: 2
    }
];

let currentQuestion = 0;
let quizScore = 0;
let currentQuestions = [];

function startQuizGame() {
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = '<div class="quiz-question"></div>';
    currentQuestion = 0;
    quizScore = 0;
    
    // Randomly select 15 questions for this round
    currentQuestions = shuffleArray([...quizQuestions]).slice(0, 15);
    
    showQuestion();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showQuestion() {
    const quizContainer = document.querySelector('.quiz-question');
    if (currentQuestion >= currentQuestions.length) {
        showQuizComplete();
        return;
    }

    const question = currentQuestions[currentQuestion];
    quizContainer.innerHTML = `
        <h4>Question ${currentQuestion + 1}/${currentQuestions.length}</h4>
        <p>${question.question}</p>
        <div class="quiz-answers">
            ${shuffleArray([...question.answers]).map((answer, index) => `
                <button onclick="checkAnswer(${question.answers.indexOf(answer)})">${answer}</button>
            `).join('')}
        </div>
    `;
}

function checkAnswer(answerIndex) {
    const question = currentQuestions[currentQuestion];
    const buttons = document.querySelectorAll('.quiz-answers button');
    buttons.forEach(button => button.disabled = true);

    if (answerIndex === question.correct) {
        quizScore++;
        buttons[Array.from(buttons).findIndex(button => button.textContent === question.answers[answerIndex])].style.backgroundColor = '#2ecc71';
    } else {
        buttons[Array.from(buttons).findIndex(button => button.textContent === question.answers[answerIndex])].style.backgroundColor = '#e74c3c';
        buttons[Array.from(buttons).findIndex(button => button.textContent === question.answers[question.correct])].style.backgroundColor = '#2ecc71';
    }

    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 1500);
}

function showQuizComplete() {
    const quizContainer = document.querySelector('.quiz-question');
    const earnedCoins = Math.floor((quizScore / currentQuestions.length) * 100);
    
    quizContainer.innerHTML = `
        <div class="quiz-complete">
            <h3>Quiz Complete!</h3>
            <p>You got ${quizScore} out of ${currentQuestions.length} questions correct!</p>
            <p>You earned ${earnedCoins} coins!</p>
            <button class="quiz-restart" onclick="startQuizGame()">Try Again</button>
        </div>
    `;

    updateMoney(earnedCoins);
}

// Initialize
window.onload = function() {
    getPetStatus();
};
