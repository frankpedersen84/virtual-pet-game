let pet = null;
let selectedTrick = null;

const tricks = {
    'sit': {
        name: 'Sit',
        difficulty: 1,
        reward: 10,
        intelligence_required: 0,
        description: 'Teach your pet to sit on command'
    },
    'roll': {
        name: 'Roll Over',
        difficulty: 2,
        reward: 20,
        intelligence_required: 10,
        description: 'Your pet will do a complete roll'
    },
    'dance': {
        name: 'Dance',
        difficulty: 3,
        reward: 30,
        intelligence_required: 20,
        description: 'Your pet will perform a cute dance'
    },
    'speak': {
        name: 'Speak',
        difficulty: 2,
        reward: 15,
        intelligence_required: 5,
        description: 'Your pet will make their signature sound'
    },
    'jump': {
        name: 'Jump',
        difficulty: 2,
        reward: 25,
        intelligence_required: 15,
        description: 'Your pet will do an acrobatic jump'
    }
};

// Initialize the training interface
async function initTraining() {
    await updatePetStatus();
    displayTricks();
    setupEventListeners();
    updateTrainButton();
}

// Display available tricks
function displayTricks() {
    const tricksList = document.getElementById('tricks-list');
    tricksList.innerHTML = '';

    Object.entries(tricks).forEach(([key, trick]) => {
        const trickElement = document.createElement('div');
        trickElement.className = `trick-card ${key === selectedTrick ? 'selected' : ''}`;
        trickElement.dataset.trickKey = key;
        trickElement.innerHTML = `
            <h4>${trick.name}</h4>
            <p>${trick.description}</p>
            <div class="trick-stats">
                <span>Difficulty: ${'★'.repeat(trick.difficulty)}</span>
                <span>Reward: ${trick.reward} coins</span>
                <span>Required Intelligence: ${trick.intelligence_required}</span>
            </div>
        `;
        
        if (pet.intelligence >= trick.intelligence_required) {
            trickElement.classList.add('available');
            trickElement.addEventListener('click', () => selectTrick(key));
        } else {
            trickElement.classList.add('locked');
        }
        
        tricksList.appendChild(trickElement);
    });
}

// Select a trick
function selectTrick(trickKey) {
    // Remove selected class from all tricks
    document.querySelectorAll('.trick-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selected class to clicked trick
    const selectedCard = document.querySelector(`.trick-card[data-trick-key="${trickKey}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        selectedTrick = trickKey;
        updateTrainButton();
    }
}

// Update train button state
function updateTrainButton() {
    const trainButton = document.getElementById('train-button');
    if (selectedTrick && pet.intelligence >= tricks[selectedTrick].intelligence_required) {
        trainButton.disabled = false;
        trainButton.textContent = `Train ${tricks[selectedTrick].name}`;
    } else {
        trainButton.disabled = true;
        trainButton.textContent = 'Select a trick to train';
    }
}

// Set up event listeners
function setupEventListeners() {
    document.getElementById('train-button').addEventListener('click', () => {
        if (selectedTrick) {
            trainSpecificTrick(selectedTrick);
        } else {
            showMessage('Please select a trick to train');
        }
    });
    document.getElementById('perform-button').addEventListener('click', performTricks);
    document.getElementById('boost-button').addEventListener('click', useEnergyBoost);
}

// Update the display
function updateDisplay() {
    // Update intelligence bar
    const intelligenceBar = document.getElementById('intelligence-bar');
    intelligenceBar.style.width = `${pet.intelligence}%`;
    
    // Update money display
    document.getElementById('money-amount').textContent = pet.money;
    
    // Update pet display
    updatePetDisplay(getPetMood());
    
    // Update tricks availability
    displayTricks();
    
    // Update boost button state
    const boostButton = document.getElementById('boost-button');
    boostButton.disabled = pet.money < 25;
    
    // Update train button
    updateTrainButton();
}

// Update pet status from the server
async function updatePetStatus() {
    const response = await fetch('/api/pet/status');
    pet = await response.json();
    updateDisplay();
    updateCooldown();
}

// Update cooldown timer
function updateCooldown() {
    const cooldownTimer = document.getElementById('cooldown-timer');
    const lastTrained = new Date(pet.last_trained);
    const now = new Date();
    const timeDiff = Math.max(0, 1800 - Math.floor((now - lastTrained) / 1000));
    
    if (timeDiff > 0) {
        const minutes = Math.floor(timeDiff / 60);
        const seconds = timeDiff % 60;
        cooldownTimer.textContent = `Next training in: ${minutes}m ${seconds}s`;
        
        // Update every second
        setTimeout(updateCooldown, 1000);
    } else {
        cooldownTimer.textContent = 'Ready to train!';
    }
}

// Update pet display with sprite
function updatePetDisplay(mood = 'normal') {
    const petDisplay = document.getElementById('pet-display');
    if (!petDisplay) return;
    
    petDisplay.innerHTML = '';
    const petImage = document.createElement('img');
    const imagePath = `/static/sprites/${pet.pet_type}/${mood}.png`;
    
    petImage.src = imagePath;
    petImage.className = 'pet-sprite';
    petImage.alt = `${pet.pet_type} feeling ${mood}`;
    
    petImage.onerror = () => {
        console.error('Failed to load sprite:', imagePath);
        petDisplay.innerHTML = `<div class="pet-sprite">Missing: ${mood}.png</div>`;
    };
    
    petDisplay.appendChild(petImage);
}

// Get pet's mood based on training state
function getPetMood() {
    if (pet.intelligence > 80) {
        return 'happy';
    } else if (pet.intelligence < 20) {
        return 'sad';
    } else if (document.querySelector('.pet-container .performing')) {
        return 'love';
    } else {
        return 'normal';
    }
}

// Train the pet
async function trainPet() {
    const response = await fetch('/api/pet/train', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    const result = await response.json();
    
    if (result.success) {
        showMessage(`Training successful! Intelligence increased by ${result.intelligence_gain}`);
        await updatePetStatus();
    } else {
        showMessage('Training failed. Your pet might be too tired.');
    }
}

// Train specific trick
async function trainSpecificTrick(trickKey) {
    const trick = tricks[trickKey];
    if (!trick) return;

    try {
        const response = await fetch('/api/pet/train', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ trick: trickKey })
        });

        const result = await response.json();
        if (result.success) {
            // Show training animation
            const petDisplay = document.getElementById('pet-display');
            if (petDisplay) {
                updatePetDisplay('love');
                petDisplay.style.animation = 'bounce 1s infinite';
                setTimeout(() => {
                    petDisplay.style.animation = '';
                    updatePetDisplay(getPetMood());
                }, 2000);
            }
            
            showMessage(`Successfully trained ${trick.name}!`);
            await updatePetStatus();
            displayTricks();
        } else {
            updatePetDisplay('sad');
            showMessage(result.message || 'Failed to train trick');
        }
    } catch (error) {
        console.error('Error training pet:', error);
        showMessage('Error training pet');
    }
}

// Perform tricks to earn rewards
async function performTricks() {
    try {
        const response = await fetch('/api/pet/perform', {
            method: 'POST'
        });

        const result = await response.json();
        if (result.success) {
            // Show performance animation
            const petDisplay = document.getElementById('pet-display');
            if (petDisplay) {
                updatePetDisplay('happy');
                petDisplay.style.animation = 'dance 2s';
                setTimeout(() => {
                    petDisplay.style.animation = '';
                    updatePetDisplay(getPetMood());
                }, 2000);
            }
            
            showMessage(`Great performance! Earned ${result.reward} coins!`);
            await updatePetStatus();
        } else {
            updatePetDisplay('sad');
            showMessage(result.message || 'Failed to perform tricks');
        }
    } catch (error) {
        console.error('Error performing tricks:', error);
        showMessage('Error performing tricks');
    }
}

// Use energy boost
async function useEnergyBoost() {
    try {
        const response = await fetch('/api/pet/boost', {
            method: 'POST'
        });

        const result = await response.json();
        if (result.success) {
            // Show boost animation
            const petDisplay = document.getElementById('pet-display');
            if (petDisplay) {
                updatePetDisplay('love');
                petDisplay.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    petDisplay.style.animation = '';
                    updatePetDisplay(getPetMood());
                }, 500);
            }
            
            showMessage('Energy boost activated!');
            await updatePetStatus();
            startCooldown();
        } else {
            updatePetDisplay('sad');
            showMessage(result.message || 'Not enough money for energy boost');
        }
    } catch (error) {
        console.error('Error using energy boost:', error);
        showMessage('Error using energy boost');
    }
}

// Show training messages
function showMessage(message) {
    const messageElement = document.getElementById('training-message');
    messageElement.textContent = message;
    messageElement.classList.add('show');
    
    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 3000);
}

// Update the CSS to add animation
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .pet.performing {
            animation: perform 1s ease-in-out;
        }
        
        @keyframes perform {
            0% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.1) rotate(-10deg); }
            75% { transform: scale(1.1) rotate(10deg); }
            100% { transform: scale(1) rotate(0deg); }
        }
        
        @keyframes floatUp {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-50px) scale(1.2); opacity: 0; }
        }

        .floating-number {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #2ecc71;
            font-size: 1.5rem;
            font-weight: bold;
            text-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
            animation: floatUp 1s ease-out forwards;
            pointer-events: none;
        }

        .floating-number.critical {
            color: #f1c40f;
            font-size: 2rem;
            text-shadow: 0 0 15px rgba(241, 196, 15, 0.7);
        }
        
        .pet-sprite {
            width: 100px;
            height: 100px;
        }
        
        @keyframes bounce {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.2);
            }
        }
        
        @keyframes dance {
            0%, 100% {
                transform: rotate(0deg);
            }
            25% {
                transform: rotate(-10deg);
            }
            75% {
                transform: rotate(10deg);
            }
        }
        
        @keyframes shake {
            0%, 100% {
                transform: translateX(0);
            }
            25% {
                transform: translateX(-10px);
            }
            75% {
                transform: translateX(10px);
            }
        }
    </style>
`);

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initTraining);
