let petState = {
    happiness: 50,
    hunger: 50,
    intelligence: 50, 
    money: 100,
    pet_type: 'cat',
    inventory: [],
    color: 'default' 
};

const petEmojis = {
    cat: {
        colors: ['🐱', '🐈', '🐈‍⬛', '😺', '😸', '😹'],
        happy: {
            default: '😺',
            black: '🐈‍⬛',
            white: '😸',
            orange: '😹'
        },
        normal: {
            default: '😸',
            black: '🐈',
            white: '😼',
            orange: '😻'
        },
        sad: {
            default: '😿',
            black: '🐱',
            white: '😾',
            orange: '😹'
        }
    },
    dog: {
        colors: ['🐶', '🐕', '🐩', '🐺', '🐕‍🦺'],
        happy: {
            default: '🐶',
            black: '🐕‍🦺',
            white: '🐩',
            brown: '🐺'
        },
        normal: {
            default: '🐕',
            black: '🐕‍🦺',
            white: '🐩',
            brown: '🐺'
        },
        sad: {
            default: '🐕‍🦺',
            black: '🐶',
            white: '🐩',
            brown: '🐺'
        }
    },
    rabbit: {
        colors: ['🐰', '🐇', '🐰'],
        happy: {
            default: '🐰',
            white: '🐇',
            brown: '🐰'
        },
        normal: {
            default: '🐇',
            white: '🐰',
            brown: '🐇'
        },
        sad: {
            default: '🐇💤',
            white: '🐰💤',
            brown: '🐇💤'
        }
    },
    hamster: {
        colors: ['🐹', '🐹💤'],
        happy: {
            default: '🐹',
            brown: '🐹',
            white: '🐹'
        },
        normal: {
            default: '🐹',
            brown: '🐹',
            white: '🐹'
        },
        sad: {
            default: '🐹💤',
            brown: '🐹💤',
            white: '🐹💤'
        }
    },
    bird: {
        colors: ['🐤', '🐦', '🐧'],
        happy: {
            default: '🐤',
            blue: '🐦',
            black: '🐧'
        },
        normal: {
            default: '🐦',
            blue: '🐤',
            black: '🐧'
        },
        sad: {
            default: '🐦💤',
            blue: '🐤💤',
            black: '🐧💤'
        }
    }
};

const shopItems = {
    'toy_ball': {
        name: 'Bouncy Ball',
        emoji: '⚾',
        price: 20,
        happiness: 15,
        description: 'A fun ball to play with!',
        durability: 3
    },
    'treat': {
        name: 'Tasty Treat',
        emoji: '🦴',
        price: 10,
        happiness: 10,
        hunger: 5,
        description: 'A delicious snack',
        durability: 1
    },
    'bed': {
        name: 'Cozy Bed',
        emoji: '🛏️',
        price: 50,
        happiness: 20,
        description: 'A comfortable place to rest',
        durability: 5
    },
    'premium_food': {
        name: 'Premium Food',
        emoji: '🥩',
        price: 30,
        happiness: 15,
        hunger: 25,
        description: 'High-quality pet food',
        durability: 1
    },
    'toy_mouse': {
        name: 'Toy Mouse',
        emoji: '🐁',
        price: 15,
        happiness: 12,
        description: 'A fun toy to chase',
        durability: 2
    },
    'book': {
        name: 'Book',
        emoji: '📚',
        price: 20,
        intelligence: 10,
        description: 'A book to learn from',
        durability: 1
    }
};

function updateProgressBar(elementId, value) {
    console.log(`Updating ${elementId} to ${value}%`);  
    const progressBar = document.getElementById(elementId);
    if (!progressBar) {
        console.error(`Progress bar with ID ${elementId} not found.`);
        return;
    }

    progressBar.value = value;

    progressBar.classList.remove('low', 'medium', 'good');

    if (value < 30) {
        progressBar.classList.add('low');
    } else if (value < 70) {
        progressBar.classList.add('medium');
    } else {
        progressBar.classList.add('good');
    }
}

function getPetMood() {
    if (petState.happiness < 30) {
        return 'sad';
    } else if (petState.happiness > 70) {
        return 'happy';
    } else if (petState.hunger > 70) {
        return 'hungry';
    } else if (petState.happiness < 40 && petState.hunger > 60) {
        return 'angry';
    } else if (petState.happiness > 80 && petState.hunger < 30) {
        return 'love';
    } else if (petState.happiness < 50 && petState.hunger < 30) {
        return 'sleepy';
    } else {
        return 'normal';
    }
}

function updatePetDisplay() {
    const petDisplay = document.getElementById('pet-display');
    if (!petDisplay) {
        console.error('Could not find pet-display element');
        return;
    }

    const mood = getPetMood();
    console.log('Current pet state:', petState);
    console.log('Determined mood:', mood);
    
    petDisplay.innerHTML = '';
    
    const petImage = document.createElement('img');
    const imagePath = `/static/sprites/${petState.pet_type}/${mood}.png`;
    console.log('Loading sprite from:', imagePath);
    
    petImage.src = imagePath;
    petImage.className = 'pet-sprite';
    petImage.alt = `${petState.pet_type} feeling ${mood}`;
    
    petImage.onerror = () => {
        console.error('Failed to load sprite:', imagePath);
        // Fallback to show which image we're trying to load
        petDisplay.innerHTML = `<div class="pet-sprite">Missing: ${mood}.png</div>`;
    };
    
    petImage.onload = () => {
        console.log('Successfully loaded sprite:', imagePath);
    };
    
    petDisplay.appendChild(petImage);
}

async function getPetStatus() {
    try {
        const response = await fetch('/api/pet/status');
        const data = await response.json();
        console.log('Received pet status:', data);  
        petState = {
            happiness: data.happiness,
            hunger: data.hunger,
            intelligence: data.intelligence, 
            money: data.money,
            pet_type: data.pet_type,
            inventory: data.inventory,
            color: data.color 
        };
        updateUI();
    } catch (error) {
        console.error('Error fetching pet status:', error);
    }
}

async function feedPet() {
    try {
        const response = await fetch('/api/pet/feed', { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            await getPetStatus();
            const petDisplay = document.getElementById('pet-display');
            if (petDisplay) {
                petDisplay.style.animation = 'bounce 0.5s';
                setTimeout(() => {
                    petDisplay.style.animation = '';
                }, 500);
            }
        } else {
            alert(data.message || 'Not enough money!');
        }
    } catch (error) {
        console.error('Error feeding pet:', error);
    }
}

async function playWithPet() {
    try {
        const response = await fetch('/api/pet/play', { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            await getPetStatus();
            const petDisplay = document.getElementById('pet-display');
            if (petDisplay) {
                petDisplay.style.animation = 'bounce 0.5s infinite';
                setTimeout(() => {
                    petDisplay.style.animation = '';
                }, 2000);
            }
        } else {
            alert(data.message || 'Failed to play with pet');
        }
    } catch (error) {
        console.error('Error playing with pet:', error);
    }
}

async function changePetType(type) {
    try {
        const response = await fetch('/api/pet/change_type', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type: type })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log('Successfully changed pet type to:', type);
            petState.pet_type = type;
            updateUI();
            const petDisplay = document.getElementById('pet-display');
            if (petDisplay) {
                petDisplay.style.animation = 'bounce 0.5s';
                setTimeout(() => {
                    petDisplay.style.animation = '';
                }, 500);
            }
        } else {
            alert(data.message || 'Failed to change pet type');
        }
    } catch (error) {
        console.error('Error changing pet type:', error);
    }
}

function buyItem(itemId) {
    const item = shopItems[itemId];
    if (petState.money >= item.price) {
        petState.money -= item.price;
        petState.inventory.push({
            ...item,
            id: itemId,
            remainingUses: item.durability
        });
        updateUI();
        alert(`You bought a ${item.name}!`);
    } else {
        alert('Not enough money!');
    }
}

function useItem(inventoryIndex) {
    const item = petState.inventory[inventoryIndex];
    if (item.remainingUses > 0) {
        if (item.happiness) {
            petState.happiness = Math.min(100, petState.happiness + item.happiness);
        }
        if (item.hunger) {
            petState.hunger = Math.min(100, petState.hunger + item.hunger);
        }
        if (item.intelligence) {
            petState.intelligence = Math.min(100, petState.intelligence + item.intelligence);
        }
        
        item.remainingUses--;
        
        if (item.remainingUses <= 0) {
            petState.inventory.splice(inventoryIndex, 1);
        }
        
        updateUI();
        const petDisplay = document.getElementById('pet-display');
        if (petDisplay) {  
            petDisplay.style.animation = 'bounce 0.5s';
            setTimeout(() => {
                petDisplay.style.animation = '';
            }, 500);
        }
    }
}

function renderShop() {
    const shopContainer = document.getElementById('shop-items');
    if (!shopContainer) return;  
    
    shopContainer.innerHTML = '';
    
    for (const [itemId, item] of Object.entries(shopItems)) {
        const itemElement = document.createElement('div');
        itemElement.className = 'shop-item';
        itemElement.innerHTML = `
            <div class="item-emoji">${item.emoji}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-description">${item.description}</div>
            <div class="item-effects">
                ${item.happiness ? `+${item.happiness} Happiness` : ''}
                ${item.hunger ? `+${item.hunger} Food` : ''}
                ${item.intelligence ? `+${item.intelligence} Intelligence` : ''}
                ${item.durability > 1 ? `<br>${item.durability} uses` : ''}
            </div>
            <div class="price">💰 ${item.price}</div>
            <button class="buy-button" onclick="buyItem('${itemId}')">Buy</button>
        `;
        shopContainer.appendChild(itemElement);
    }
}

function renderInventory() {
    const inventoryContainer = document.getElementById('inventory-items');
    if (!inventoryContainer) return;  
    
    if (petState.inventory.length === 0) {
        inventoryContainer.innerHTML = '<div class="empty-inventory">Your inventory is empty</div>';
        return;
    }
    
    petState.inventory.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.innerHTML = `
            <div class="item-emoji">${item.emoji}</div>
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="uses-left">${item.remainingUses} uses left</div>
            </div>
            <button class="use-button" onclick="useItem(${index})">Use</button>
        `;
        inventoryContainer.appendChild(itemElement);
    });
}

function updateUI() {
    updateProgressBar('happiness-bar', petState.happiness);
    updateProgressBar('hunger-bar', petState.hunger);
    updateProgressBar('intelligence-bar', petState.intelligence);
    document.getElementById('money-display').textContent = petState.money;
    updatePetDisplay();
}

function decayStats() {
    // Hunger increases (gets worse)
    petState.hunger = Math.max(0, Math.min(100, petState.hunger - 2));
    
    // Happiness decreases if hungry
    if (petState.hunger < 30) {
        petState.happiness = Math.max(0, Math.min(100, petState.happiness - 3));
    } else {
        petState.happiness = Math.max(0, Math.min(100, petState.happiness - 1));
    }
    
    updateUI();
}

async function ignorePet() {
    try {
        petState.happiness = Math.max(0, petState.happiness - 15);
        const petDisplay = document.getElementById('pet-display');
        if (petDisplay) {
            petDisplay.style.animation = 'shake 0.5s';
            setTimeout(() => {
                petDisplay.style.animation = '';
            }, 500);
        }
        updateUI();
    } catch (error) {
        console.error('Error ignoring pet:', error);
    }
}

async function scoldPet() {
    try {
        petState.happiness = Math.max(0, petState.happiness - 25);
        const petDisplay = document.getElementById('pet-display');
        if (petDisplay) {
            petDisplay.style.animation = 'shake 0.8s';
            setTimeout(() => {
                petDisplay.style.animation = '';
            }, 800);
        }
        updateUI();
    } catch (error) {
        console.error('Error scolding pet:', error);
    }
}

// Theme management
function setTheme(theme) {
    // Remove all existing theme classes
    document.body.classList.remove('theme-default', 'theme-dark', 'theme-pastel', 'theme-retro', 'theme-forest');
    // Add the new theme class
    document.body.classList.add(`theme-${theme}`);
    // Save the theme preference
    localStorage.setItem('petGameTheme', theme);
    
    // Update active theme button
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(`${theme}-theme`)) {
            btn.classList.add('active');
        }
    });
}

// Load saved theme
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('petGameTheme') || 'default';
    setTheme(savedTheme);
}

function initializeGame() {
    // Load saved theme
    loadSavedTheme();
    // Start the stat decay
    setInterval(decayStats, 10000);
    // Initial UI update
    updateUI();
}

setInterval(getPetStatus, 10000);

getPetStatus();

window.onload = function() {
    renderShop();
    initializeGame();
};
