
import { level2_World } from '../scripts/level2.js';
import { level1_World } from '../scripts/level1.js';
import { Level1 } from '../scripts/level1World.js';


//const level1= await level1_World();

const world = new Level1()
world.init()
setTimeout(()=>{world.startGame()},1000)
// setTimeout(()=>{world.pauseGame()},10000)
// setTimeout(()=>{world.unPauseGame()},20000)









