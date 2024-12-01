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
    'catnip': {
        name: 'Premium Catnip',
        emoji: '🌿',
        price: 200,
        happiness: 50,
        intelligence: 30,
        description: 'Super-charged training boost! Instantly increases intelligence.',
        durability: 1,
        category: 'boost',
        effect: 'Triggers instant training success!'
    },
    'genius_treats': {
        name: 'Genius Treats',
        emoji: '🧠',
        price: 150,
        intelligence: 20,
        happiness: 25,
        description: 'Brain-boosting treats that make learning easier',
        durability: 2,
        category: 'boost',
        effect: 'Doubles training effectiveness!'
    },
    'energy_drink': {
        name: 'Pet Energy Drink',
        emoji: '⚡',
        price: 100,
        happiness: 30,
        intelligence: 15,
        description: 'Instant energy boost for training sessions',
        durability: 3,
        category: 'boost',
        effect: 'No cooldown between training sessions!'
    },
    'golden_collar': {
        name: 'Golden Training Collar',
        emoji: '👑',
        price: 500,
        happiness: 100,
        intelligence: 50,
        description: 'Legendary item that maximizes training potential',
        durability: 5,
        category: 'boost',
        effect: 'Guaranteed critical training success!'
    },
    'wisdom_scroll': {
        name: 'Ancient Wisdom Scroll',
        emoji: '📜',
        price: 300,
        intelligence: 40,
        happiness: 20,
        description: 'Ancient knowledge that instantly teaches new tricks',
        durability: 1,
        category: 'boost',
        effect: 'Unlocks a random new trick!'
    }
};

let petState = {
    money: 0,
    inventory: []
};

async function getPetStatus() {
    try {
        const response = await fetch('/api/pet/status');
        const data = await response.json();
        petState.money = data.money;
        petState.inventory = data.inventory;
        updateUI();
    } catch (error) {
        console.error('Error fetching pet status:', error);
    }
}

async function buyItem(itemId) {
    const item = shopItems[itemId];
    try {
        const response = await fetch('/api/pet/buy_item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ itemId: itemId })
        });
        
        const result = await response.json();
        if (result.success) {
            await getPetStatus();
            updateUI();
            showNotification(`You bought a ${item.name}!`);
        } else {
            showNotification('Failed to buy item: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error buying item:', error);
        showNotification('Error buying item', 'error');
    }
}

async function useItem(inventoryIndex) {
    try {
        const response = await fetch('/api/pet/use_item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inventoryIndex: inventoryIndex })
        });
        
        const result = await response.json();
        if (result.success) {
            await getPetStatus();
            showNotification('Item used successfully!');
        } else {
            showNotification('Failed to use item: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error using item:', error);
        showNotification('Error using item', 'error');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

function renderShop() {
    const shopContainer = document.getElementById('shop-items');
    if (!shopContainer) return;
    
    shopContainer.innerHTML = '';
    
    // Create boost items section
    const boostSection = document.createElement('div');
    boostSection.className = 'shop-section boost-items';
    boostSection.innerHTML = '<h3>🌟 Power Boost Items</h3>';
    
    // Create regular items section
    const regularSection = document.createElement('div');
    regularSection.className = 'shop-section regular-items';
    regularSection.innerHTML = '<h3>Regular Items</h3>';
    
    Object.entries(shopItems).forEach(([itemId, item]) => {
        const itemElement = document.createElement('div');
        itemElement.className = `shop-item ${item.category === 'boost' ? 'boost-item' : ''}`;
        
        const effectText = item.effect ? `<div class="item-effect">${item.effect}</div>` : '';
        const statsText = [];
        if (item.happiness) statsText.push(`+${item.happiness} Happiness`);
        if (item.hunger) statsText.push(`+${item.hunger} Food`);
        if (item.intelligence) statsText.push(`+${item.intelligence} Intelligence`);
        
        itemElement.innerHTML = `
            <div class="item-header">
                <span class="item-emoji">${item.emoji}</span>
                <span class="item-name">${item.name}</span>
            </div>
            <div class="item-description">${item.description}</div>
            ${effectText}
            <div class="item-stats">${statsText.join(' • ')}</div>
            <div class="item-footer">
                <span class="item-price">💰 ${item.price}</span>
                <span class="item-durability">Uses: ${item.durability}</span>
            </div>
            <button onclick="buyItem('${itemId}')" ${petState.money < item.price ? 'disabled' : ''}>
                Buy
            </button>
        `;
        
        if (item.category === 'boost') {
            boostSection.appendChild(itemElement);
        } else {
            regularSection.appendChild(itemElement);
        }
    });
    
    shopContainer.appendChild(boostSection);
    shopContainer.appendChild(regularSection);
}

function renderInventory() {
    const inventoryContainer = document.getElementById('inventory-items');
    inventoryContainer.innerHTML = '';
    
    if (!petState.inventory || petState.inventory.length === 0) {
        inventoryContainer.innerHTML = '<div class="empty-inventory">Your inventory is empty</div>';
        return;
    }
    
    petState.inventory.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = `inventory-item ${item.category}`;
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
    renderShop();
    renderInventory();
    document.getElementById('money').textContent = petState.money;
}

// Initialize the shop when the page loads
window.onload = async function() {
    await getPetStatus();
    updateUI();
    
    // Set up periodic status updates
    setInterval(getPetStatus, 5000);
};
