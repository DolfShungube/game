import { Room } from './room';
import { worldBuilder } from './renderCommons';
import { Player } from './player';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { ClockPuzzle } from './clockPuzzle';
import { DrawerPuzzle } from './drawerPuzzle';
import {ButtonPuzzle } from './buttonPuzzle';
import { CombinationLockPuzzle } from './combinationLockPuzzle';
import { RiddlePuzzle } from './riddlePuzzle';
import {createTable} from './TableStruct'
import {Paper} from './level2_paper'
import {MultiplePapers} from './level2_papers'
import * as THREE from 'three';

// stuff inside the level1_World function is just for testing, not final: DOLF

let gameLevelComplete=false;  // level completed or not
let gameItems=[];  // keeps track of items player has collected
let gameTimer=0;  // game time we agreed on


export function level1_World(){

// this is just so I can pass them in the machine I will remove for cleaner code but it doesn't actually cause that much of problems
//const riddle = "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?";
//const answer = "map";


const world= new worldBuilder();
const room= new Room();
 
const riddleMachine = new RiddlePuzzle("I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?","map");
const table=createTable();
// the paper
const myPaper = new Paper(6, 8, '../src/textures/test1.png');
// Create a few notes
const note1 = new MultiplePapers(
  '../src/textures/tx1.png',
  "I counted 52 steps from the mirror to the door.But when I turned around… there were only 51 back.Something walked the last one for me.",
  new THREE.Vector3(1, 3.03, -20)
);

const note2 = new MultiplePapers(
  '../src/textures/tx1.png',
  'The candles burned for 39 minutes.Then the air grew cold — and the flame bent toward the vent.She’s still breathing in there.”',
  new THREE.Vector3(5, 3.03, -20)
);

const note3 = new MultiplePapers(
  '../src/textures/tx1.png',
  'Drawer 15… it won’t open.Blood under the handle, like someone tried.Maybe they found what they shouldn’t.”',
  new THREE.Vector3(7, 3.03, -20)
);

const note4 = new MultiplePapers(
  '../src/textures/tx1.png',
  '72 seconds of light, then darkness again.The generator hums like a heartbeat.I think it knows when I’m watching.”',
  new THREE.Vector3(10, 3.03, -20)
);
const note5 = new MultiplePapers(
  '../src/textures/tx1.png',
  'Page 8 is torn out.That’s where the real message was.The rest is just a distraction.”',
  new THREE.Vector3(13, 3.03, -20)
);

const note6 = new MultiplePapers(
  '../src/textures/tx1.png',
  'he clocks stopped at 9 and 3.Both point to where she hid the key.But only one of them tells the truth.',
  new THREE.Vector3(16, 3.03, -20)
);

const note7 = new MultiplePapers(
  '../src/textures/tx1.png',
  'Rooms 10 and 11 are connected… but not by doors.The wall hums if you listen closely.Something’s moving between them.',
  new THREE.Vector3(18, 3.03, -20)
);

const note8 = new MultiplePapers(
  '../src/textures/tx1.png',
  'Between 8 and 11—that’s where it happened.The screams stopped, the scratching didn’t.Don’t open it again.',
  new THREE.Vector3(20, 3.03, -20)
)






myPaper.mesh.position.set(-38.9, 5, 0);
myPaper.mesh.rotation.y = Math.PI / 2;





const renderer = world.ititialiseRenderer();
const scene= world.initializeScene();
const clockPuzzle= new ClockPuzzle();
const drawerPuzzle= new DrawerPuzzle();
const buttonPuzzle= new ButtonPuzzle();
const clock=clockPuzzle.createBaseClock();

const Basedrawer= drawerPuzzle.createBaseDrawer();
const combinationLockPuzzle= new CombinationLockPuzzle()
//const button= buttonPuzzle.createBaseButton();
const drawer1= Basedrawer.drawer1;
 const drawer2= Basedrawer.drawer2;
const drawer= Basedrawer.container;
const lock1= Basedrawer.lock1;
const lock2= Basedrawer.lock2;
const lock3= Basedrawer.lock3;
const lock4= Basedrawer.lock4;
const button1=Basedrawer.button1;
const button2= Basedrawer.button2;
const button3= buttonPuzzle.createBaseButton();
const button4= buttonPuzzle.createBaseButton();


const combinationLock1= combinationLockPuzzle.createBaseCombinationLock();
const combinationLock2= combinationLockPuzzle.createBaseCombinationLock();
const combinationLock3= combinationLockPuzzle.createBaseCombinationLock();
const combinationLock4= combinationLockPuzzle.createBaseCombinationLock();




// const lock1Control=drawerPuzzle.createBaseLock().lockControls;
// const lock1Machanism=lock1Control.lockMechanism;






world.addBaseLighting()

const collidables =[
  // list of items the player is able to collide with, (everthing should be type wall)

  { mesh: room.floor, type: 'floor'},
  { mesh: room.ceiling, type: 'ceiling'}, { mesh: riddleMachine, type: 'wall'},{ mesh: table, type: 'wall'}, 
  clock,
  drawer,
  lock1,lock2,lock3,lock4,
  drawer1,drawer2,
  button1,button2,button3,button4,
  combinationLock1,combinationLock2,combinationLock3,combinationLock4,
  
  ...Object.values(room.walls).map(w => ({ mesh: w, type: 'wall' }))
];

room.generateBaseRoom();
clock.mesh.scale.set(3,3,3)
clock.mesh.position.set(0, 20,-38);
drawer.mesh.position.set(-10,2,-30);

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

button3.mesh.position.set(-2,3,0)
button3.mesh.scale.set(0.5,0.5,0.5)

button4.mesh.position.set(2,3,0)
button4.mesh.scale.set(0.5,0.5,0.5)


combinationLock1.mesh.rotation.z = Math.PI / 2;
combinationLock1.mesh.position.set(-0.5,3,-39.6)

combinationLock2.mesh.rotation.z = Math.PI / 2;
combinationLock2.mesh.position.set(0.5,3,-39.6)

combinationLock3.mesh.rotation.z = Math.PI / 2;
combinationLock3.mesh.position.set(1.5,3,-39.6)

combinationLock4.mesh.rotation.z = Math.PI / 2;
combinationLock4.mesh.position.set(2.5,3,-39.6)


room.addItem(clock.mesh)
room.add(drawer.mesh)
room.add(lock1.mesh)
room.add(lock2.mesh)
room.add(lock3.mesh)
room.add(lock4.mesh)
room.add(riddleMachine)
room.add(myPaper.mesh)

//the notes the code for it is under level2_papers.js
room.add(note1);
room.add(note2);
room.add(note3);
room.add(note4);
room.add(note5);
room.add(note6);
room.add(note7);
room.add(note8);
room.addItem(table);


room.add(combinationLock1.mesh)
room.add(combinationLock2.mesh)
room.add(combinationLock3.mesh)
room.add(combinationLock4.mesh)

room.add(button3.mesh)
room.add(button4.mesh)

scene.add(room)

const player = new Player(scene,collidables);
const controls= new OrbitControls(player.camera,renderer.domElement)

let buttonList=[button1,button2,button3,button4]
let combinationList=[combinationLock1,combinationLock2,combinationLock3,combinationLock4]
let combinationValues=[1,2,3,4]

setConbinationValues(combinationList,combinationValues)


function customGameLogic(){

  linkDrawerToClock(clock,drawer2)
  linkButtonsToCombinationLock(buttonList,combinationList)
  allCombinationsSolved(combinationList)
  riddleMachine.updateInteraction()

}

//I am going to do the raycastering part here cause I don't get the code on how you did yours so I will make a function to handle those interacction here

function handleRiddleTrageting(riddleMachine,player){

}




function linkDrawerToClock(clock,drawer){

      if(clock.solved){
        drawer.solved=true;

      }else{
        drawer.solved=false;
      }
}

function linkButtonsToCombinationLock(buttonList,combinationList){

    for(let i=0;i<buttonList.length;i++){

      if(buttonList[i].solved){
        combinationList[i].unlocked=true;
      }else{
        combinationList[i].unlocked=false;
      }


    }
}

function allCombinationsSolved(combinationList){

  let allSolved=true

  for(let i=0;i<combinationList.length;i++){

      if(!combinationList[i].solved){
        allSolved=false
        break;

      }
  }

  if(allSolved){
    gameLevelComplete=true;
  }
}


function setConbinationValues(combinationList,values){

    for (let i=0; i<combinationList.length;i++){
      combinationList[i].solutionNumber= values[i]
    }


}




//testing
riddleMachine.setupInteraction(player.camera,player);
note1.setupInteraction(player.camera, player);
note2.setupInteraction(player.camera, player);
note3.setupInteraction(player.camera, player);
note4.setupInteraction(player.camera, player);
note5.setupInteraction(player.camera, player);
note6.setupInteraction(player.camera, player);
note7.setupInteraction(player.camera, player);
note8.setupInteraction(player.camera, player);

 world.startAnimation(player,customGameLogic,);





}