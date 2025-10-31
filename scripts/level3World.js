import * as THREE from 'three';
import { Room } from './room';
import { worldBuilder } from './renderCommons';
import { Player } from './player';
import { Ceiling } from './ceiling';
import { Wall_Level3 } from './wall_level3';
import { Floor_Level3 } from './floor_level3';
import { ModelLoader } from './modelLoader';
import { CombinationLockPuzzle } from './combinationLockPuzzle';
import { MultiplePapers } from './level3_papers';

export class Level3_World {
    worldLoading = true;
    LevelComplete = false;
    timeComplete = false;

    constructor() {
        // Initialize all properties
        this.world = null;
        this.renderer = null;
        this.scene = null;
        this.room = null;
        this.player = null;
        this.floor = null;
        this.wall = null;
        this.ceiling = null;
        this.collidables = [];
    }

    gameState() {
        if (this.LevelComplete) {
            return "pass";
        } else if (this.timeComplete) {
            return "fail";
        }
        return "progress";
    }

    async init() {
        // Initialize world and renderer
        this.world = new worldBuilder(); 
        this.renderer = this.world.ititialiseRenderer();
        this.scene = this.world.initializeScene();
        const combinationLockPuzzle= new CombinationLockPuzzle()
        
        // Create the base room
        this.room = new Room();
        this.room.generateBaseRoom();

        this.L1=["A",'B','C','D','E','S','G','H','I','Y']

        this.dialTexture= combinationLockPuzzle.letterTexture(this.L1)

        this.combinationLock1= combinationLockPuzzle.createBaseCombinationLock(this.dialTexture);
        this.combinationLock2= combinationLockPuzzle.createBaseCombinationLock(this.dialTexture);
        this.combinationLock3= combinationLockPuzzle.createBaseCombinationLock(this.dialTexture);
        this.combinationLock4= combinationLockPuzzle.createBaseCombinationLock(this.dialTexture);
        this.combinationLock5= combinationLockPuzzle.createBaseCombinationLock(this.dialTexture);
        this.combinationLock6= combinationLockPuzzle.createBaseCombinationLock(this.dialTexture);
        this.combinationLock7= combinationLockPuzzle.createBaseCombinationLock(this.dialTexture);
        this.combList=[this.combinationLock1,this.combinationLock2,this.combinationLock3,this.combinationLock4,this.combinationLock5,this.combinationLock6,this.combinationLock7]

        this.setConbinationValues(this.combList,[2,1,5,5,8,3,9])

        //the notes in the level
        this.note1 = new MultiplePapers('../src/textures/tx1.png', 
        "I counted 52 steps from the mirror to the door. But when I turned back… there were only 51. Someone walked the last one for me.", 
        new THREE.Vector3(-5, 5, -5) 
        );
        this.note2 = new MultiplePapers('../src/textures/tx1.png', 
        "The candles burned for 39 minutes. Then the air grew cold — and the flame bent toward the vent. She’s still breathing in there.", 
        new THREE.Vector3(-3, 5, -7)
        );
        
        this.note3 = new MultiplePapers('../src/textures/tx1.png', 
        "Drawer 15… it won’t open. Blood under the handle, like someone tried. Perhaps they found what they shouldn’t.", 
        new THREE.Vector3(-1, 5, 1)
        );
        this.note4 = new MultiplePapers('../src/textures/tx1.png', 
        "72 seconds of light, then darkness again. The generator hums like a heartbeat. I think it knows when I’m watching.", 
        new THREE.Vector3(2, 5, 1)
        );
        this.note5 = new MultiplePapers('../src/textures/tx1.png', 
        "The clocks stopped at 9 and 3. Both point to where she hid the key, but only one tells the truth.", 
        new THREE.Vector3(5, 5, 1)
        );
        this.note6 = new MultiplePapers('../src/textures/tx1.png', 
        "Rooms 10 and 11 are connected… but not by doors. The wall hums if you listen closely. Something moves between them.", 
        new THREE.Vector3(8, 5, 1)
        );
        this.note7 = new MultiplePapers('../src/textures/tx1.png', 
        "Between 8 and 11 — that’s where it happened. The screams stopped, the scratching didn’t. Don’t open it again.", 
        new THREE.Vector3(10, 5, 1)
        );
        this.note8 = new MultiplePapers('../src/textures/tx1.png', 
        "Page 8 is torn out. That’s where the real message was. The rest is just a distraction.", 
        new THREE.Vector3(13, 5, 1)
        );


        

        this.collidables = [
            { mesh: this.room.floor, type: 'floor' },
            { mesh: this.room.ceiling, type: 'ceiling' },
            { mesh: this.note1, type: 'interactable' },
            { mesh: this.note2, type: 'interactable' },
            { mesh: this.note3, type: 'interactable' },
            { mesh: this.note4, type: 'interactable' },
            { mesh: this.note5, type: 'interactable' },
            { mesh: this.note6, type: 'interactable' },
            { mesh: this.note7, type: 'interactable' },
            { mesh: this.note8, type: 'interactable' },
            this.combinationLock6,this.combinationLock5,this.combinationLock4,this.combinationLock3,this.combinationLock2,this.combinationLock1,this.combinationLock7,
            ...Object.values(this.room.walls).map(w => ({ mesh: w, type: 'wall' }))
        ];

        // Initialize the modelloader
        this.modelLoader = new ModelLoader();



        // Initialize floor, wall, and ceiling texture loaders
        this.floor_level3 = new Floor_Level3();
        this.wall_level3 = new Wall_Level3();
        this.ceiling = new Ceiling();

        // Load textures for the room - using laminate floor with PBR textures
        this.floor_level3.loadAdvancedFloorTexture(this.room);
        this.wall_level3.loadAdvancedWallTexture(this.room);
        this.ceiling.loadCeilingTexture(this.room, './src/textures/ceiling_1.jpg');

        


        
        this.combinationLock1.mesh.rotation.z = Math.PI / 2;
        this.combinationLock1.mesh.rotation.y = -Math.PI/2;
        this.combinationLock1.mesh.position.set(22.1,6,-3.5)
        this.combinationLock1.unlocked=true

        this.combinationLock3.mesh.rotation.z = Math.PI / 2;
        this.combinationLock3.mesh.rotation.y = -Math.PI/2;
        this.combinationLock3.mesh.position.set(22.1,6,-4.5)
        this.combinationLock3.unlocked=true

        this.combinationLock4.mesh.rotation.z = Math.PI / 2;
        this.combinationLock4.mesh.rotation.y = -Math.PI/2;
        this.combinationLock4.mesh.position.set(22.1,6,-5.5)
        this.combinationLock4.unlocked=true

        this.combinationLock2.mesh.rotation.z = Math.PI / 2;
        this.combinationLock2.mesh.rotation.y = -Math.PI/2;
        this.combinationLock2.mesh.position.set(22.1,6,3.5)
        this.combinationLock2.unlocked=true

        this.combinationLock5.mesh.rotation.z = Math.PI / 2;
        this.combinationLock5.mesh.rotation.y = -Math.PI/2;
        this.combinationLock5.mesh.position.set(22.1,6,4.5)
        this.combinationLock5.unlocked=true

        this.combinationLock6.mesh.rotation.z = Math.PI / 2;
        this.combinationLock6.mesh.rotation.y = -Math.PI/2;
        this.combinationLock6.mesh.position.set(22.1,6,5.5)
        this.combinationLock6.unlocked=true 

        this.combinationLock7.mesh.rotation.z = Math.PI / 2;
        this.combinationLock7.mesh.rotation.y = -Math.PI/2;
        this.combinationLock7.mesh.position.set(22.1,6,6.5)
        this.combinationLock7.unlocked=true
        
        

        this.room.add(this.combinationLock1.mesh)
        this.room.add(this.combinationLock2.mesh)
        this.room.add(this.combinationLock3.mesh)
        this.room.add(this.combinationLock4.mesh)
        this.room.add(this.combinationLock5.mesh)
        this.room.add(this.combinationLock6.mesh)
        this.room.add(this.combinationLock7.mesh)

        // this is my notes added to the scene
        this.room.add(this.note1);
        this.room.add(this.note2);
        this.room.add(this.note3);
        this.room.add(this.note4);
        this.room.add(this.note5);
        this.room.add(this.note6);
        this.room.add(this.note7);
        this.room.add(this.note8);
        //--------------------------------------

        // Loading models
        this.Table = this.modelLoader.loadModel(
            this.scene,
            './models/level3/simple_table_low_poly.glb',
            { x: 0, y: 2, z: 0 },
            6,
            { x: 0, y: -Math.PI / 2, z: 0 },
            'Table'
        );
        
        this.Door = this.modelLoader.loadModel(
            this.scene,
            './models/level3/door.glb',
            { x: 21.5, y: 8.5, z: 0 },
            0.04,
            { x: 0, y: -Math.PI / 2, z: 0 },
            'Door'
        );
        
        this.Board = this.modelLoader.loadModel(
            this.scene,
            './models/level3/realistic_blackboard.glb',
            { x: -21.3, y: 7.5, z: 0 },
            4,
            { x: 0, y: Math.PI / 2, z: 0 },
            'Board'
        );
        const L=[this.Table,this.Board]

        for(let i=0;i<L.length;i++){
            this.collidables.push({mesh:L[i],type:"wall"})
        }

        this.ceiling_light = this.modelLoader.loadModel(
            this.scene,
            './models/level3/ceiling_light.glb',
            { x: 4, y: 11, z: 0 },
            0.01,
            { x: 0, y: Math.PI / 2, z: 0 },
            'ceiling_light'
        );

        // Add actual light source to ceiling light model
        const ceilingLightSource = new THREE.PointLight(0xfff4e6, 8.0, 25, 1.8);
        ceilingLightSource.position.set(4, 11, 0);
        ceilingLightSource.castShadow = true;
        ceilingLightSource.shadow.mapSize.width = 1024;
        ceilingLightSource.shadow.mapSize.height = 1024;
        this.room.add(ceilingLightSource);


        this.ceiling_light2 = this.modelLoader.loadModel(
            this.scene,
            './models/level3/ceiling_light.glb',
            { x: -4, y: 11, z: 0 },
            0.01,
            { x: 0, y: Math.PI / 2, z: 0 },
            'ceiling_light2'
        );

        const ceilingLightSource2 = new THREE.PointLight(0xfff4e6, 8.0, 25, 1.8);
        ceilingLightSource2.position.set(-4, 11, 0);
        ceilingLightSource2.castShadow = true;
        ceilingLightSource2.shadow.mapSize.width = 1024;
        ceilingLightSource2.shadow.mapSize.height = 1024;
        this.room.add(ceilingLightSource2);

        // Dark mysterious lighting setup
        // Very dim ambient light for minimal base visibility
        const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.25);
        this.room.add(ambientLight);
        
        // First ceiling spotlight (mystery room style) - INCREASED INTENSITY
        const spotlight1 = new THREE.SpotLight(0xfff4e6, 15, 45, Math.PI / 5, 0.4, 1.5);
        spotlight1.position.set(-4, 11, 0);
        spotlight1.target.position.set(-5, 0, 0);
        spotlight1.castShadow = true;
        spotlight1.shadow.mapSize.width = 2048;
        spotlight1.shadow.mapSize.height = 2048;
        spotlight1.shadow.camera.near = 1;
        spotlight1.shadow.camera.far = 30;
        
        // Second ceiling spotlight - INCREASED INTENSITY
        const spotlight2 = new THREE.SpotLight(0xfff4e6, 15, 45, Math.PI / 5, 0.4, 1.5);
        spotlight2.position.set(4, 11, 0);
        spotlight2.target.position.set(5, 0, 0);
        spotlight2.castShadow = true;
        spotlight2.shadow.mapSize.width = 2048;
        spotlight2.shadow.mapSize.height = 2048;
        spotlight2.shadow.camera.near = 1;
        spotlight2.shadow.camera.far = 30;
        
        this.room.add(spotlight1);
        this.room.add(spotlight1.target);
        this.room.add(spotlight2);
        this.room.add(spotlight2.target);
        
        // Wall lights - accent lighting on walls
        // Front wall lights
        const wallLight1 = new THREE.PointLight(0xffaa66, 6.5, 15, 2);
        wallLight1.position.set(0, 8, 20);
        this.room.add(wallLight1);
        
        // Back wall lights
        const wallLight2 = new THREE.PointLight(0xffaa66, 6.5, 15, 2);
        wallLight2.position.set(0, 8, -20);
        this.room.add(wallLight2);
        
        // Left wall lights
        const wallLight3 = new THREE.PointLight(0xffaa66, 6.5, 15, 2);
        wallLight3.position.set(-20, 8, 0);
        this.room.add(wallLight3);
        

        const wallLight4 = new THREE.PointLight(0xffaa66, 6.5, 15, 2);
        wallLight4.position.set(20, 8, 0);
        this.room.add(wallLight4);
        

        const cornerLight1 = new THREE.PointLight(0xff8844, 6.5, 12, 2);
        cornerLight1.position.set(-15, 6, 15);
        this.room.add(cornerLight1);
        
        const cornerLight2 = new THREE.PointLight(0xff8844, 6.5, 12, 2);
        cornerLight2.position.set(15, 6, 15);
        this.room.add(cornerLight2);
        
        const cornerLight3 = new THREE.PointLight(0xff8844, 6.5, 12, 2);
        cornerLight3.position.set(-15, 6, -15);
        this.room.add(cornerLight3);
        
        const cornerLight4 = new THREE.PointLight(0xff8844, 6.5, 12, 2);
        cornerLight4.position.set(15, 6, -15);
        this.room.add(cornerLight4);
        
        this.scene.fog = new THREE.Fog(0x0a0a0a, 25, 55);

        // Add room to scene
        this.scene.add(this.room);
        
        this.player = new Player(this.scene, this.collidables);
        this.player.controls.enabled = false;


        //This is to setup interaction for the notes in the level
        this.note1.setupInteraction(this.player.camera, this.player);
        this.note2.setupInteraction(this.player.camera, this.player);
        this.note3.setupInteraction(this.player.camera, this.player);
        this.note4.setupInteraction(this.player.camera, this.player);
        this.note5.setupInteraction(this.player.camera, this.player);
        this.note6.setupInteraction(this.player.camera, this.player);
        this.note7.setupInteraction(this.player.camera, this.player);
        this.note8.setupInteraction(this.player.camera, this.player);
        //--------------------------------------------
    }

    customGameLogic(){
       
        this.allCombinationsSolved(this.combList)
        this.gameState()
       
    }

setConbinationValues(combinationList,values){

    for (let i=0; i<combinationList.length;i++){
      combinationList[i].solutionNumber= values[i]
    }
}

    gameState(){
        if(this.LevelComplete){
            return "pass"
        }

        else if(this.timeComplete){

            return "fail"

        }

        return "progress"
    }


allCombinationsSolved(combinationList){

  let allSolved=true

  for(let i=0;i<combinationList.length;i++){

      if(!combinationList[i].solved){
        allSolved=false
        break;

      }
  }

  if(allSolved){
    this.gameLevelComplete=true;
  }
}

    startGame() {
        if (this.world && this.player) {
            this.world.startAnimation(this.player, () => this.customGameLogic());
        }
    }

    endGame() {
        if (this.world) {
            this.world.stopAnimation();
        }
    }

    pauseGame() {
        if (this.world) {
            this.world.pauseAnimation();
        }
    }

    unPauseGame() {
        if (this.world) {
            this.world.unPauseAnimation();
        }
    }
}