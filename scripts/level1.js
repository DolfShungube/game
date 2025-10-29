
import * as THREE from 'three';
import { Room } from './room';
import { worldBuilder } from './renderCommons';
import { Player } from './player';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { ClockPuzzle } from './clockPuzzle';
import { DrawerPuzzle } from './drawerPuzzle';
import {ButtonPuzzle } from './buttonPuzzle';
import { CombinationLockPuzzle } from './combinationLockPuzzle';
import { DailPuzzle } from './dail';
import { RiddlePuzzle } from './riddlePuzzle';
import { table1 } from './table1';
import { BookShelf } from './bookShelf';
import { Couch } from './couch';
import { Carpet } from './carpet';
import { FirePlace } from './firePlace';
import { Floor } from './floor';
import { Ceiling } from './ceiling';
import { Wall } from './wall';
import { ModelLoader } from './modelLoader';


let gameLevelComplete=false; 

export function level1_World(){

const world= new worldBuilder();
const room= new Room();
const Table= new table1();
const Bookshelf= new BookShelf()
const Couch1 = new Couch()
const Carpet1= new Carpet()
const Fireplace= new FirePlace()



const renderer = world.ititialiseRenderer();
const scene= world.initializeScene();
const modelLoader= new ModelLoader()
const clockPuzzle= new ClockPuzzle();
const drawerPuzzle= new DrawerPuzzle();
const buttonPuzzle= new ButtonPuzzle();
const dailPuzzle= new DailPuzzle();
const floor= new Floor()
const wall= new Wall()
const ceiling= new Ceiling()
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



const couch1 = Couch1.createCouch(scene, {x: -10, y: 0, z: 10}, Math.PI / 2);
const couch2 = Couch1.createCouch(scene, {x: 10, y: 0, z: 10}, -Math.PI);
const carpet = Carpet1.createCarpet();
const table=Table.createTable();
 const fireplace = Fireplace.createFireplace();
 
const bookshelf = Bookshelf.loadBookshelf(scene,{ x: -12, y: 0, z: 20},6.2,Math.PI / 2);
const coffeeTable = modelLoader.loadModel(scene,'./models/coffee_table.glb',{ x: 8, y: 0.3, z: 3 },4.5,{ x: Math.PI / 2, y: 0, z: 0 },'coffeeTable');
const painting =  modelLoader.loadModel(scene,'./models/painting.glb',{ x: -21.3, y: 6.5, z: 0 },6.6, Math.PI /2,'painting');
const painting_2 =  modelLoader.loadModel(scene,'./models/my_haunted_painting.glb',{ x: -21.3, y: 6.5, z: 5 },0.5,{ x: 0, y: 0, z: -Math.PI/2},'painting_2');
const carpet_model =  modelLoader.loadModel(scene,'./models/carpet.glb',{x:5 , y:0.3 , z:4 },0.3,0,'carpet_model');
const table_model =  modelLoader.loadModel(scene, './models/table.glb',{x: 16, y : 0, z :-15.0},0.7,-Math.PI/2,'table_model')
const table_model_lamp =  modelLoader.loadModel(scene, './models/soviet_old_table.glb',{x: -20, y : 0.5, z :-10.0},7.0,0 ,'table_model_lamp')
const lamp =  modelLoader.loadModel(scene, './models/table_lamp_01.glb', {x: -20, y : 3.5, z :-7.0},0.05,0 ,'lamp')
const books =  modelLoader.loadModel(scene, './models/books_with_magnifier.glb', {x: -19.5, y : 3.5, z :-12.0},7.0,-Math.PI/2 ,'books')


const riddle = "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?";
const answer = "map";
const riddleMachine = new RiddlePuzzle(riddle, answer);
    
 const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
 const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
 const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
 const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
  world.addBaseLighting()
  
const bookshelfSpotlight1 = new THREE.SpotLight(0xffffff, 2.5, 30, Math.PI / 4, 0.2, 1.2);
bookshelfSpotlight1.position.set(1, 15, 15);
bookshelfSpotlight1.target.position.set(-12,5,20);



const bookshelfSpotlight2 = new THREE.SpotLight(0xffffff, 2.0, 25, Math.PI / 3, 0.3, 1.0);
bookshelfSpotlight2.position.set(10, 12, 25);
bookshelfSpotlight2.target.position.set(1, 5, 25);

riddleMachine.position.set(16, 3.5, -15.0);
riddleMachine.rotation.y = -Math.PI / 2;

table.position.set(16, 0, -15.0);
table.rotation.y = -Math.PI / 2;

fireplace.position.set(20, 0, 3);
fireplace.rotation.y = -Math.PI / 2;


keyLight.position.set(15, 20, 10);
keyLight.castShadow = true;


fillLight.position.set(-10, 10, -10);

rimLight.position.set(0, 15, -15);

couch1.position.set(0, 2, 4);
couch2.position.set(7, 2, 13);

const collidables =[
 

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



 floor.loadFloorTexture(room, './src/textures/floor_level1_(1).jpg');
 wall.loadWallTexture(room, './src/textures/wall_4.jpg', 'all');
 ceiling.loadCeilingTexture(room, './src/textures/ceiling_1.jpg');


clock.mesh.scale.set(3,3,3)
clock.mesh.position.set(0, 9, -21.0);
drawer.mesh.position.set(-10,1.5,-20);


button3.mesh.position.set(-2,3,0)
button3.mesh.scale.set(0.5,0.5,0.5)

button4.mesh.position.set(2,3,0)
button4.mesh.scale.set(0.5,0.5,0.5)

dail.mesh.position.set(0,4,5)

lock3.mesh.scale.set(0.3,0.3,0.3)
lock3.mesh.rotation.y=3*Math.PI/2
lock3.mesh.position.set(21.3,3,-8);

lock4.mesh.scale.set(0.3,0.3,0.3)
lock4.mesh.rotation.y=Math.PI
lock4.mesh.position.set(7,5,21.3);

button3.mesh.position.set(-2,3,-9)
button3.mesh.scale.set(0.5,0.5,0.5)

button4.mesh.position.set(2,3,-9)
button4.mesh.scale.set(0.5,0.5,0.5)


combinationLock1.mesh.rotation.z = Math.PI / 2;
combinationLock1.mesh.position.set(-0.5,3,-22.0)

combinationLock2.mesh.rotation.z = Math.PI / 2;
combinationLock2.mesh.position.set(0.5,3,-22.0)

combinationLock3.mesh.rotation.z = Math.PI / 2;
combinationLock3.mesh.position.set(1.5,3,-22.0)

combinationLock4.mesh.rotation.z = Math.PI / 2;
combinationLock4.mesh.position.set(2.5,3,-22.0)


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

room.add(button3.mesh)
room.add(button4.mesh)

room.addItem(clockPuzzle);
room.addItem(riddleMachine);
room.addItem(rimLight);
room.addItem(fireplace);
room.addItem(fillLight);
room.addItem(keyLight);
room.addItem(ambientLight);
room.addItem(couch1);
room.addItem(couch2);
room.add(keyLight);
room.add(fillLight);
room.add(ambientLight);
room.add(rimLight);
room.add(bookshelfSpotlight1);
room.add(bookshelfSpotlight1.target);
room.add(bookshelfSpotlight2);
room.add(bookshelfSpotlight2.target);


scene.add(room);


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