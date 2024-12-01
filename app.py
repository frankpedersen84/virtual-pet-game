from flask import Flask, render_template, jsonify, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import os
import random

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pet_game.db'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    money = db.Column(db.Integer, default=100)
    pet = db.relationship('Pet', backref='owner', uselist=False)

class Pet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    pet_type = db.Column(db.String(50), default='cat')
    color_theme = db.Column(db.String(50), default='default')
    happiness = db.Column(db.Integer, default=50)
    hunger = db.Column(db.Integer, default=50)
    intelligence = db.Column(db.Integer, default=0)
    last_fed = db.Column(db.DateTime, default=datetime.utcnow)
    last_trained = db.Column(db.DateTime, default=datetime.utcnow)
    money = db.Column(db.Integer, default=100)
    inventory = db.Column(db.JSON, default=list)
    learned_tricks = db.Column(db.JSON, default=list)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

def reset_database():
    with app.app_context():
        print('Dropping all tables...')
        db.drop_all()
        print('Creating all tables...')
        db.create_all()
        print('Database reset complete')

def get_or_create_pet():
    pet = Pet.query.first()
    if not pet:
        # Create a default pet if none exists
        user = User()
        db.session.add(user)
        pet = Pet(name="My Pet", owner=user, pet_type='cat')
        db.session.add(pet)
        db.session.commit()
    return pet

with app.app_context():
    reset_database()

# Shop items configuration
SHOP_ITEMS = {
    'toy_ball': {
        'name': 'Bouncy Ball',
        'emoji': '⚾',
        'price': 20,
        'durability': 3,
        'category': 'regular'
    },
    'treat': {
        'name': 'Tasty Treat',
        'emoji': '🦴',
        'price': 10,
        'durability': 1,
        'category': 'regular'
    },
    'bed': {
        'name': 'Cozy Bed',
        'emoji': '🛏️',
        'price': 50,
        'durability': 5,
        'category': 'regular'
    },
    'premium_food': {
        'name': 'Premium Food',
        'emoji': '🥩',
        'price': 30,
        'durability': 1,
        'category': 'regular'
    },
    'toy_mouse': {
        'name': 'Toy Mouse',
        'emoji': '🐁',
        'price': 15,
        'durability': 2,
        'category': 'regular'
    },
    'catnip': {
        'name': 'Premium Catnip',
        'emoji': '🌿',
        'price': 200,
        'durability': 1,
        'category': 'boost'
    },
    'genius_treats': {
        'name': 'Genius Treats',
        'emoji': '🧠',
        'price': 150,
        'durability': 2,
        'category': 'boost'
    },
    'energy_drink': {
        'name': 'Pet Energy Drink',
        'emoji': '⚡',
        'price': 100,
        'durability': 3,
        'category': 'boost'
    },
    'golden_collar': {
        'name': 'Golden Training Collar',
        'emoji': '👑',
        'price': 500,
        'durability': 5,
        'category': 'boost'
    },
    'wisdom_scroll': {
        'name': 'Ancient Wisdom Scroll',
        'emoji': '📜',
        'price': 300,
        'durability': 1,
        'category': 'boost'
    }
}

@app.route('/')
def home():
    pet = get_or_create_pet()
    if not pet.name:
        return redirect(url_for('customize'))
    return render_template('index.html')

@app.route('/customize')
def customize():
    return render_template('customize.html')

@app.route('/shop')
def shop():
    return render_template('shop.html')

@app.route('/training')
def training():
    return render_template('training.html')

@app.route('/games')
def games():
    return render_template('games.html')

@app.route('/api/pet/status')
def get_pet_status():
    pet = get_or_create_pet()
    
    # Decrease happiness and hunger over time
    current_time = datetime.utcnow()
    time_since_fed = (current_time - pet.last_fed).total_seconds() / 60  # minutes
    
    pet.hunger = max(0, 100 - int(time_since_fed))
    pet.happiness = max(0, 100 - int(time_since_fed * 1.5))
    
    db.session.commit()
    
    return jsonify({
        'happiness': pet.happiness,
        'hunger': pet.hunger,
        'intelligence': pet.intelligence,
        'money': pet.money,
        'pet_type': pet.pet_type,
        'color': pet.color_theme,
        'inventory': pet.inventory or [],
        'learned_tricks': pet.learned_tricks or []
    })

@app.route('/api/pet/customize', methods=['POST'])
def customize_pet():
    data = request.json
    pet = get_or_create_pet()
    
    if 'name' in data:
        pet.name = data['name']
    
    if 'pet_type' in data:
        pet.pet_type = data['pet_type']
    
    if 'color_theme' in data:
        pet.color_theme = data['color_theme']
    
    db.session.commit()
    
    return jsonify({
        'success': True, 
        'name': pet.name, 
        'pet_type': pet.pet_type, 
        'color_theme': pet.color_theme
    })

@app.route('/api/pet/feed', methods=['POST'])
def feed_pet():
    pet = get_or_create_pet()
    if pet and pet.money >= 10:
        pet.hunger = min(100, pet.hunger + 20)
        pet.happiness = min(100, pet.happiness + 10)
        pet.money -= 10
        pet.last_fed = datetime.utcnow()
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'success': False})

@app.route('/api/pet/play', methods=['POST'])
def play_with_pet():
    pet = get_or_create_pet()
    if pet:
        pet.happiness = min(100, pet.happiness + 20)
        pet.hunger = max(0, pet.hunger - 10)
        pet.money += 20
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'success': False})

@app.route('/api/pet/change_type', methods=['POST'])
def change_pet_type():
    print('Received pet type change request')
    if not request.is_json:
        print('Error: Request is not JSON')
        return jsonify({'success': False, 'error': 'Request must be JSON'})
    
    pet_type = request.json.get('type')
    print('Requested pet type:', pet_type)
    
    if not pet_type:
        print('Error: No pet type provided')
        return jsonify({'success': False, 'error': 'No pet type provided'})
    
    if pet_type not in ['cat', 'dog', 'rabbit', 'hamster', 'bird']:
        print('Error: Invalid pet type:', pet_type)
        return jsonify({'success': False, 'error': 'Invalid pet type'})
    
    pet = get_or_create_pet()
    if not pet:
        print('Error: No pet found in database')
        return jsonify({'success': False, 'error': 'No pet found'})
    
    print('Current pet type:', pet.pet_type)
    pet.pet_type = pet_type
    try:
        db.session.commit()
        print('Successfully changed pet type to:', pet_type)
        return jsonify({'success': True})
    except Exception as e:
        print('Error saving to database:', str(e))
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Database error'})

@app.route('/api/pet/buy_item', methods=['POST'])
def buy_item():
    pet = get_or_create_pet()
    data = request.get_json()
    
    if not data or 'itemId' not in data:
        return jsonify({'success': False, 'error': 'Invalid request'}), 400
        
    item_id = data['itemId']
    
    if item_id not in SHOP_ITEMS:
        return jsonify({'success': False, 'error': 'Invalid item'}), 400
    
    item = SHOP_ITEMS[item_id]
    if pet.money < item['price']:
        return jsonify({'success': False, 'error': 'Not enough money'}), 400
        
    try:
        pet.money -= item['price']
        if not pet.inventory:
            pet.inventory = []
        
        # Store full item information in inventory
        pet.inventory.append({
            'id': item_id,
            'name': item['name'],
            'emoji': item['emoji'],
            'remainingUses': item['durability'],
            'category': item['category']
        })
        
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/pet/use_item', methods=['POST'])
def use_item():
    pet = get_or_create_pet()
    data = request.get_json()
    
    if not data or 'inventoryIndex' not in data:
        return jsonify({'success': False, 'error': 'Invalid request'}), 400
    
    inventory_index = data['inventoryIndex']
    
    if 0 <= inventory_index < len(pet.inventory):
        item = pet.inventory[inventory_index]
        
        # Apply item effects
        if 'happiness' in item:
            pet.happiness = min(100, pet.happiness + item['happiness'])
        if 'hunger' in item:
            pet.hunger = min(100, pet.hunger + item['hunger'])
            
        # Update durability
        item['remainingUses'] -= 1
        if item['remainingUses'] <= 0:
            pet.inventory.pop(inventory_index)
        else:
            pet.inventory[inventory_index] = item
            
        db.session.commit()
        return jsonify({'success': True})
    
    return jsonify({'success': False, 'error': 'Invalid inventory index'}), 400

@app.route('/api/pet/train', methods=['POST'])
def train_pet():
    pet = get_or_create_pet()
    current_time = datetime.utcnow()
    data = request.json or {}
    
    # Check if enough time has passed since last training (30 minutes cooldown)
    if (current_time - pet.last_trained).total_seconds() < 1800:
        return jsonify({
            'success': False,
            'message': 'Your pet needs rest before training again'
        })
    
    # Check if pet is happy and not hungry
    if pet.happiness < 30 or pet.hunger < 30:
        return jsonify({
            'success': False,
            'message': 'Your pet is too tired or hungry to train'
        })
    
    # Get the trick being trained
    trick_key = data.get('trick', 'sit')  # Default to 'sit' if no trick specified
    
    # Define tricks and their requirements
    tricks = {
        'sit': {'intelligence_req': 0, 'reward': 10, 'difficulty': 1, 'base_range': (1, 3)},
        'roll': {'intelligence_req': 10, 'reward': 20, 'difficulty': 2, 'base_range': (2, 5)},
        'dance': {'intelligence_req': 20, 'reward': 30, 'difficulty': 3, 'base_range': (3, 7)},
        'speak': {'intelligence_req': 5, 'reward': 15, 'difficulty': 2, 'base_range': (2, 4)},
        'jump': {'intelligence_req': 15, 'reward': 25, 'difficulty': 2, 'base_range': (2, 6)}
    }
    
    trick = tricks.get(trick_key)
    if not trick:
        return jsonify({
            'success': False,
            'message': 'Invalid trick selected'
        })
    
    # Check if pet meets intelligence requirement
    if pet.intelligence < trick['intelligence_req']:
        return jsonify({
            'success': False,
            'message': f'Your pet needs {trick["intelligence_req"]} intelligence to learn this trick'
        })
    
    # Calculate random intelligence gain based on trick difficulty
    min_gain, max_gain = trick['base_range']
    intelligence_gain = random.randint(min_gain, max_gain)
    
    # Critical success chance (20% chance)
    critical = random.random() < 0.20
    if critical:
        intelligence_gain *= 2
    
    # Bonus points based on happiness and hunger (up to 50% bonus)
    stat_bonus = (pet.happiness + pet.hunger) / 400  # Max 0.5 bonus multiplier
    intelligence_gain = round(intelligence_gain * (1 + stat_bonus))
    
    # Ensure minimum gain of 1 and maximum of 10
    intelligence_gain = min(10, max(1, intelligence_gain))
    
    pet.intelligence = min(100, pet.intelligence + intelligence_gain)
    
    # Update pet stats (more drain for higher difficulty tricks)
    happiness_drain = 5 * trick['difficulty']
    hunger_drain = 7 * trick['difficulty']
    
    pet.happiness = max(0, pet.happiness - happiness_drain)
    pet.hunger = max(0, pet.hunger - hunger_drain)
    pet.last_trained = current_time
    
    # Add trick to learned tricks if not already learned
    learned_tricks = pet.learned_tricks or []
    if trick_key not in learned_tricks:
        learned_tricks.append(trick_key)
        pet.learned_tricks = learned_tricks
    
    db.session.commit()
    
    # Prepare success message
    message = f'Training successful! Intelligence increased by {intelligence_gain}'
    if critical:
        message = ' CRITICAL SUCCESS! ' + message
    
    return jsonify({
        'success': True,
        'intelligence_gain': intelligence_gain,
        'critical': critical,
        'message': message
    })

@app.route('/api/pet/perform', methods=['POST'])
def perform_tricks():
    pet = get_or_create_pet()
    
    # Get learned tricks
    learned_tricks = pet.learned_tricks or []
    
    # Check if pet has learned any tricks
    if not learned_tricks:
        return jsonify({
            'success': False,
            'message': 'Your pet hasn\'t learned any tricks yet'
        })
    
    # Check if pet can perform (needs at least 30 intelligence)
    if pet.intelligence < 30:
        return jsonify({
            'success': False,
            'message': 'Your pet needs more training before performing'
        })
    
    # Calculate reward based on intelligence and number of tricks known
    base_reward = 10
    intelligence_bonus = pet.intelligence // 10
    tricks_bonus = len(learned_tricks) * 5
    total_reward = base_reward + intelligence_bonus + tricks_bonus
    
    # Add reward and update happiness
    pet.money += total_reward
    pet.happiness = min(100, pet.happiness + 10)
    
    db.session.commit()
    
    # Get a random trick to mention in the message
    random_trick = learned_tricks[hash(datetime.now()) % len(learned_tricks)]
    
    return jsonify({
        'success': True,
        'reward': total_reward,
        'message': f'Amazing! Your pet performed {random_trick.title()} perfectly! Earned {total_reward} coins!'
    })

@app.route('/api/pet/boost', methods=['POST'])
def boost_pet():
    pet = get_or_create_pet()
    boost_cost = 25

    # Check if pet has enough money
    if pet.money < boost_cost:
        return jsonify({
            'success': False,
            'message': 'Not enough money for energy boost'
        })

    # Apply the boost
    pet.money -= boost_cost
    pet.last_trained = datetime.utcnow() - timedelta(minutes=30)  # Reset cooldown
    pet.happiness = min(100, pet.happiness + 20)  # Bonus happiness
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Energy boost applied!'
    })

@app.route('/api/pet/earn', methods=['POST'])
def earn_money():
    pet = get_or_create_pet()
    data = request.get_json()
    
    if not data or 'amount' not in data:
        return jsonify({'success': False, 'error': 'Invalid request'}), 400
        
    try:
        amount = int(data['amount'])
        if amount < 0:
            return jsonify({'success': False, 'error': 'Invalid amount'}), 400
            
        pet.money += amount
        db.session.commit()
        return jsonify({'success': True, 'money': pet.money})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 10000)))
