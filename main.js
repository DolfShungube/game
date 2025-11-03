import { level1_World } from './scripts/level1.js';
import { Level1 } from './scripts/level1World.js';
import { level2_World } from './scripts/level2.js';
import { Level2 } from './scripts/level2World.js';
import { Level3_World } from './scripts/level3World.js';
import { Settings } from './Settings.js';

// Initialize settings
const gameSettings = new Settings();

// Store the current level instance globally
let currentLevel = null;
const app = document.getElementById('app');
const menu = document.getElementById('menu-container');

// Create a back button dynamically (so it's not in HTML)
const backButton = document.createElement('button');
backButton.textContent = '⬅ Back to Main Menu';
backButton.id = 'backButton';
backButton.style.position = 'absolute';
backButton.style.top = '20px';
backButton.style.left = '20px';
backButton.style.padding = '10px 15px';
backButton.style.fontSize = '1em';
backButton.style.background = 'rgba(0,0,0,0.6)';
backButton.style.color = 'white';
backButton.style.border = '2px solid white';
backButton.style.borderRadius = '8px';
backButton.style.cursor = 'pointer';
backButton.style.display = 'none'; 
backButton.style.zIndex = '1000';
document.body.appendChild(backButton);

// Add click listeners for levels
document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const level = parseInt(btn.dataset.level);
    startLevel(level);
  });
});

// Back to main menu when clicked
backButton.addEventListener('click', () => {
  endLevel();
});

async function startLevel(levelNum) {
  app.innerHTML = ''; // Clear old content
  menu.style.display = 'none'; // Hide menu
  backButton.style.display = 'block'; // Show back button

  try {
    switch (levelNum) {
      case 1:
        currentLevel = new Level1();
        await currentLevel.init();
        currentLevel.player.setControls(gameSettings.getControls());
        currentLevel.startGame();
        break;
      case 2:
        currentLevel = new Level2();
        await currentLevel.init();
        currentLevel.player.setControls(gameSettings.getControls());
        currentLevel.startGame();
        break;
      case 3:
        currentLevel = new Level3_World();
        await currentLevel.init();
        currentLevel.player.setControls(gameSettings.getControls());
        currentLevel.startGame();
        break;
      default:
        console.error('Invalid level number:', levelNum);
    }
  } catch (error) {
    console.error('Error starting level:', error);
    endLevel(); // Return to menu on error
  }
}

function endLevel() {
  // Properly clean up the current level
  if (currentLevel && typeof currentLevel.endGame === 'function') {
    currentLevel.endGame();
  }
  currentLevel = null;
  app.innerHTML = '';
  menu.style.display = 'block';
  backButton.style.display = 'none';
  const oldCanvas = document.querySelector('canvas');
  if (oldCanvas) oldCanvas.remove();
}