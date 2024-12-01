# Virtual Pet Game

A web-based virtual pet game where you can take care of your digital companion! Feed your pet, play with it, and earn money through various activities.

## Features

- Take care of your virtual pet
- Monitor your pet's happiness and hunger levels
- Feed your pet (costs 10 coins)
- Play with your pet to earn money (20 coins per play)
- Dynamic pet expressions based on its state
- Automatic status updates every 10 seconds

## Setup

1. Install the required packages:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

3. Open your web browser and navigate to `http://localhost:5000`

## How to Play

- Your pet has two main stats: Happiness and Hunger
- Feed your pet to increase its hunger and happiness levels (costs 10 coins)
- Play with your pet to earn money and increase happiness (but it will get hungrier)
- Watch your pet's expression change based on its mood!
- Keep your pet happy and well-fed to see it thrive

## Technical Stack

- Backend: Python (Flask)
- Frontend: HTML, CSS, JavaScript
- Database: SQLite with SQLAlchemy
