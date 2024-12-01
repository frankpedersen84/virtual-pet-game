let selectedPetType = 'cat';
let selectedColor = 'default';

const petEmojis = {
    cat: '😺',
    dog: '🐶',
    rabbit: '🐰',
    hamster: '🐹',
    bird: '🐤'
};

const colorThemes = {
    default: {
        primary: '#FFB6C1',
        secondary: '#87CEEB',
        accent: '#FFA07A'
    },
    pastel: {
        primary: '#FFD1DC',
        secondary: '#B0E0E6',
        accent: '#FFB6C1'
    },
    forest: {
        primary: '#90EE90',
        secondary: '#98FB98',
        accent: '#3CB371'
    },
    sunset: {
        primary: '#FFA07A',
        secondary: '#FFD700',
        accent: '#FF6347'
    },
    ocean: {
        primary: '#00CED1',
        secondary: '#4169E1',
        accent: '#1E90FF'
    }
};

function updatePreview() {
    const petPreview = document.getElementById('pet-preview');
    const previewName = document.getElementById('preview-name');
    const petName = document.getElementById('pet-name').value || 'Your Pet';

    petPreview.textContent = petEmojis[selectedPetType];
    previewName.textContent = petName;

    // Apply color theme
    document.documentElement.style.setProperty('--primary-color', colorThemes[selectedColor].primary);
    document.documentElement.style.setProperty('--secondary-color', colorThemes[selectedColor].secondary);
    document.documentElement.style.setProperty('--accent-color', colorThemes[selectedColor].accent);
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Pet type selection
    const petOptions = document.querySelectorAll('.pet-option');
    petOptions.forEach(option => {
        option.addEventListener('click', function() {
            petOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedPetType = this.dataset.type;
            updatePreview();
        });
    });

    // Color theme selection
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedColor = this.dataset.color;
            updatePreview();
        });
    });

    // Pet name input
    const petNameInput = document.getElementById('pet-name');
    petNameInput.addEventListener('input', updatePreview);

    // Form submission
    const form = document.getElementById('pet-customization-form');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const petData = {
            name: document.getElementById('pet-name').value,
            type: selectedPetType,
            color_theme: selectedColor
        };

        try {
            const response = await fetch('/api/pet/customize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(petData)
            });

            const result = await response.json();
            if (result.success) {
                window.location.href = '/'; // Redirect to main game
            } else {
                alert('Failed to create pet: ' + result.error);
            }
        } catch (error) {
            console.error('Error creating pet:', error);
            alert('Failed to create pet. Please try again.');
        }
    });

    // Initialize preview
    updatePreview();
    petOptions[0].classList.add('selected');
    colorOptions[0].classList.add('selected');
});
