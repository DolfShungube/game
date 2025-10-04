import * as THREE from 'three';
import { Room } from './room';
import { worldBuilder } from './renderCommons';
import { Player } from './player';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { ClockPuzzle } from './clockPuzzle';
import { RiddlePuzzle } from './riddlePuzzle';


// stuff inside the level1_World function is just for testing, not final: DOLF

let gameLevelComplete=false;  // level completed or not
let gameItems=[];  // keeps track of items player has collected
let gameTimer=0;  // game time we agreed on


//creating the table in the room ,will move if needed

function createTable(){
  //1 . defining the materials
  const woodMaterial = new THREE.MeshPhongMaterial({
     color: 0x8B4513 ,
     specular: 0x111111,
      shininess: 50 
    });

    //2 group container for the table so I can move it around and add legs and top to it
    const tableGroup  = new THREE.Group();

    //Dimensions: Tabletop (2m x 0.1m x 1m), Legs (0.1m x 0.9m x 0.1m)
    const tableHeight = 3.0; 
    const tabletopThickness = 0.1;
    const NEW_LEG_HEIGHT = tableHeight - tabletopThickness;
    const legHeight = 0.9;
    const legWidth = 0.1

    // NEW TABLETOP DIMENSIONS
    const tabletopWidth = 8;
    const tabletopDepth = 4;

    //3. creating the tabletop
    const tabletopGeometry = new THREE.BoxGeometry(tabletopWidth,tabletopThickness, tabletopDepth);
    const tabletop = new THREE.Mesh(tabletopGeometry, woodMaterial);

    //4.Positioning the table top so its on top of the legs
    tabletop.position.y = tableHeight - (tabletopThickness / 2); 
    tableGroup.add(tabletop);

    // 5.Creating the four legs
    const legGeometry = new THREE.BoxGeometry(legWidth, NEW_LEG_HEIGHT, legWidth);
    const legOffsetY = NEW_LEG_HEIGHT  / 2;
    const legOffsetX = (tabletopWidth / 2) - (legWidth * 2); // (8 / 2) - 0.2 = 3.8
    const legOffsetZ = (tabletopDepth / 2) - (legWidth * 2); // (4 / 2) - 0.2 = 1.8

    const legPositions = [
      [ legOffsetX, legOffsetY,  legOffsetZ], // Front-Right
      [-legOffsetX, legOffsetY,  legOffsetZ], // Front-Left
      [ legOffsetX, legOffsetY, -legOffsetZ], // Back-Right
      [-legOffsetX, legOffsetY, -legOffsetZ]  // Back-Left
    ];

     legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, woodMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        tableGroup.add(leg);
    });

    //this adds the shadow to the table so we can uncomment it later for better visual
    //tableGroup.children.forEach(mesh => {
        //mesh.castShadow = true;
        //mesh.receiveShadow = true;
    //});

    return tableGroup;

}


/*function createDebugPaper() {
    // 1. Geometry: Standard visible size.
    const paperGeo = new THREE.PlaneGeometry(1.0, 1.0); 
    
    // 2. Material: SWITCHED TO PHONG MATERIAL and light color for proper lighting response
    const paperMat = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
      specular: 0x111111,
      shininess: 50,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -4,
    }); 


    
    const debugPaper = new THREE.Mesh(paperGeo, paperMat);
    debugPaper.position.set(0, 4, 0);
   debugPaper.material.color.set(0xff0000); // Bright red for testing
    debugPaper.scale.set(2, 2, 1); 

    
    // *** CRITICAL FIX: Ensure the paper renders on top of the table ***
    //debugPaper.renderOrder = 10;
    
    // 3. Position Calculation (Local to the Table Group):
    
    const LOCAL_TABLETOP_Y = 2.95; 
    // Y: Paper rests 0.01m above the tabletop 
    const LOCAL_Y = LOCAL_TABLETOP_Y + 0.01; 
       
    // X/Z: Dead center
    const LOCAL_X = 0.0; 
    const LOCAL_Z = 0.0; 

    debugPaper.position.set(LOCAL_X, 3.03, LOCAL_Z);
    
    // Lie flat on the table 
    debugPaper.rotation.x = -Math.PI / 2; 
    
    console.log("Debug Paper Local Position (to table):", debugPaper.position.toArray());
    
    return debugPaper;
}*/


export function level1_World(){

// --- This is for the riddle Machine (Anyone who has a great riddle can chnage this one below and provide the answers also)---
const riddle = "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?";
const answer = "map";
const riddleMachine = new RiddlePuzzle(riddle, answer);
// Riddle Machine is at X = -37.0 (LEFT side of the table)
riddleMachine.position.set(-37.0, 3.2, -36.0); 

const world= new worldBuilder();
const room= new Room();
const clockPuzzle= new ClockPuzzle(5);
clockPuzzle.createBaseClock();
const table=createTable();
// Table is at X = -34.0
table.position.set(-34.0, 0, -36.0);

  //const debugPaper = createDebugPaper();


//debugPaper.material.depthTest = false;  // Force render on top of everything
//debugPaper.material.color.set(0xff0000); // Make it bright red for visibility test
//debugPaper.scale.set(5, 5, 1); // Make it larger to verify it's really there
//wconsole.log("World Position:", debugPaper.getWorldPosition(new THREE.Vector3()));


const collidables =[  // list of items the player is able to collide with, (everthing should be type wall)

  { mesh: room.floor, type: 'floor' },
  { mesh: room.ceiling, type: 'ceiling'},
  {mesh:clockPuzzle,type:'wall'},
  { mesh: table, type: 'wall'}, 
  { mesh: riddleMachine, type: 'wall'}, 
  ...Object.values(room.walls).map(w => ({ mesh: w, type: 'wall' }))
];




const renderer = world.ititialiseRenderer();
const scene= world.initializeScene();
world.addBaseLighting()


room.generateBaseRoom();
clockPuzzle.createBaseClock();
clockPuzzle.position.set(0, 25,-38);
clockPuzzle.updateClockhands(245*Math.PI/360,0.5);
room.addItem(clockPuzzle);
room.addItem(table);
room.addItem(riddleMachine);
//table.add(debugPaper);
scene.add(room)

// *** Correct Attachment to the table group ***




const player = new Player(scene,collidables);

// Set camera to look at the center of the table/paper



world.startAnimation(player,riddleMachine);

}