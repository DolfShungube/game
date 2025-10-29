
import { Room } from './room';
import { worldBuilder } from './renderCommons';
import { Player } from './player';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { ClockPuzzle } from './clockPuzzle';
import { DrawerPuzzle } from './drawerPuzzle';
import {ButtonPuzzle } from './buttonPuzzle';
import { CombinationLockPuzzle } from './combinationLockPuzzle';
import { DailPuzzle } from './dail';


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
const buttonPuzzle= new ButtonPuzzle();
const dailPuzzle= new DailPuzzle();
const clock=clockPuzzle.createBaseClock();
const dail= dailPuzzle.createBaseDail()

const Basedrawer= drawerPuzzle.createBaseDrawer();
const combinationLockPuzzle= new CombinationLockPuzzle()

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
  { mesh: room.ceiling, type: 'ceiling'},
  clock,
  drawer,
  lock1,lock2,lock3,lock4,
  drawer1,drawer2,
  button1,button2,button3,button4,
  dail,
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

dail.mesh.position.set(0,4,5)


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

room.add(combinationLock1.mesh)
room.add(combinationLock2.mesh)
room.add(combinationLock3.mesh)
room.add(combinationLock4.mesh)

// room.add(button3.mesh)
// room.add(button4.mesh)

// room.add(dail.mesh)

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






 world.startAnimation(player,customGameLogic);





}





















