
import { Room } from './room';
import { worldBuilder } from './renderCommons';
import { Player } from './player';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { ClockPuzzle } from './clockPuzzle';
import { DrawerPuzzle } from './drawerPuzzle';


// stuff inside the level1_World function is just for testing, not final: DOLF

let gameLevelComplete=false;  // level completed or not
let gameItems=[];  // keeps track of items player has collected
let gameTimer=0;  // game time we agreed on


export function level1_World(){

const world= new worldBuilder();
const room= new Room();

const renderer = world.ititialiseRenderer();
const scene= world.initializeScene();
const clockPuzzle= new ClockPuzzle();
const drawerPuzzle= new DrawerPuzzle();
const clock=clockPuzzle.createBaseClock();
const Basedrawer= drawerPuzzle.createBaseDrawer();
const drawer1= Basedrawer.drawer1;
 const drawer2= Basedrawer.drawer2;
const drawer= Basedrawer.container;
const lock1= Basedrawer.lock1;
const lock2= Basedrawer.lock2;
const lock3= Basedrawer.lock3;
const lock4= Basedrawer.lock4;

// const lock1Control=drawerPuzzle.createBaseLock().lockControls;
// const lock1Machanism=lock1Control.lockMechanism;






world.addBaseLighting()

const collidables =[
  // list of items the player is able to collide with, (everthing should be type wall)

  { mesh: room.floor, type: 'floor'},
  { mesh: room.ceiling, type: 'ceiling'},
  clock,drawer,lock1,lock2,lock3,lock4,drawer1,drawer2,
  ...Object.values(room.walls).map(w => ({ mesh: w, type: 'wall' }))
];

room.generateBaseRoom();
clock.mesh.scale.set(3,3,3)
clock.mesh.position.set(0, 20,-38);
drawer.mesh.position.set(-10,2,-30);

//drawer.mesh.rotation.y=2
//lock1Control.mesh.scale.set(0.08,0.08,0.08)
// lock1Control.mesh.position.set(10,5,0)
// lock1Machanism.mesh.position.set(-10,5,0)

lock1.mesh.scale.set(0.3,0.3,0.3)
lock1.mesh.position.set(-7.9,2,-30.0);
lock1.mesh.rotation.y=Math.PI/2

lock2.mesh.scale.set(0.3,0.3,0.3)
lock2.mesh.rotation.y=Math.PI/2
lock2.mesh.position.set(-38.5,5,10);



lock3.mesh.scale.set(0.3,0.3,0.3)
lock3.mesh.rotation.y=3*Math.PI/2
lock3.mesh.position.set(38.5,5,-10);

lock4.mesh.scale.set(0.3,0.3,0.3)
lock4.mesh.rotation.y=Math.PI
lock4.mesh.position.set(10,5,32);

room.addItem(clock.mesh)
room.add(drawer.mesh)
room.add(lock1.mesh)
room.add(lock2.mesh)
room.add(lock3.mesh)
room.add(lock4.mesh)
scene.add(room)
const player = new Player(scene,collidables);
const controls= new OrbitControls(player.camera,renderer.domElement)


function customGameLogic(a){
  
  // defines logic of how different objects will interact, eg if clock puzzle is solved, do this...




}

// checkSolved(a);




 world.startAnimation(player,customGameLogic);

















}





















