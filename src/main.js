import { level1_World } from '../scripts/level1.js';
import { Level1 } from '../scripts/level1World.js';
import { level2_World } from '../scripts/level2.js';

//const level1= await level1_World();

const world = new Level1()
world.init()
setTimeout(()=>{world.startGame()},1000)
// setTimeout(()=>{world.pauseGame()},10000)
// setTimeout(()=>{world.unPauseGame()},20000)

//import { level1_World } from '../scripts/level1.js';

const app = document.getElementById('app');
const menu = document.getElementById('menu-container');


// Create a back button dynamically (so it’s not in HTML)
const backButton = document.createElement('button');
backButton.textContent = '⬅ Back to Main Menu';
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
backButton.style.display = 'none'; // hidden by default
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

function startLevel(levelNum) {
  app.innerHTML = ''; // Clear old content
  menu.style.display = 'none'; // Hide menu
  backButton.style.display = 'block'; // Show back button

  switch (levelNum) {
    case 1:
      Level1;
      break;
    case 2:
      level2_World?.();
      break;
    case 3:
      level3_World?.();
      break;
    default:
      console.error('Invalid level number:', levelNum);
  }
}

function endLevel() {
  // Reset app and return to menu
  app.innerHTML = '';
  menu.style.display = 'block';
  backButton.style.display = 'none';

  // Optional: also clear the WebGL renderer (so GPU memory frees)
  const oldCanvas = document.querySelector('canvas');
  if (oldCanvas) oldCanvas.remove();
}
