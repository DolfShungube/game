
import { Room } from './room';
import { worldBuilder } from './renderCommons';
import { Player } from './player';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

let gameLevelComplete=false;  // level completed or not
let gameItems=[];  // keeps track of items player has collected
let gameTimer=0;  // game time we agreed on


export function level1_World(){

const world= new worldBuilder();
const room= new Room();

const collidables =[  // list of items the player is able to collide with, (everthing should be type wall)

  { mesh: room.floor, type: 'floor' },
  { mesh: room.ceiling, type: 'ceiling'},
  ...Object.values(room.walls).map(w => ({ mesh: w, type: 'wall' }))
];




const renderer = world.ititialiseRenderer();
const scene= world.initializeScene();
world.addBaseLighting()


room.generateBaseRoom();
scene.add(room)

const player = new Player(scene,collidables);
const controls= new OrbitControls(player.camera,renderer.domElement) // well remove this once we done 
 world.startAnimation(player);


}





















