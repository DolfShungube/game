import * as THREE from 'three';
import { Room } from './room2';
import { worldBuilder } from './renderCommons';
import { Player } from './player';
import { KWall } from './kitchenWall';
import { KFloor } from './kitchenFloor';
import { KCeiling } from './kitchenCeiling';
import { Ktable } from './kitchenTable';
import { ModelLoader } from './modelLoader';
import { DailPuzzle } from './dail';
import { Paper } from './level2_paper';



//this are purely just helper functions to manage loading overlay
const updateLoadingStatus = (message) => {
    const statusElement = document.getElementById('loading-status');
    if (statusElement) {
        statusElement.textContent = message;
    }
};


const toggleLoadingOverlay = (isVisible) => {
    const overlayElement = document.getElementById('loading-overlay');
    if (overlayElement) {
        overlayElement.style.display = isVisible ? 'flex' : 'none'; 
    }
};

export class Level2{

    worldLoading=true;
    LevelComplete=false;
    timeComplete=false;

    // Background music
    bgMusic = null;
    
    

    constructor(){



}



    

    allDialSolved(dail1,dail2){
        if(dail1.solved && dail2.solved){

            

            return true

        }
        return false


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



setDials(dail1,dail2,v1,v2){
        dail1.targetValue=v1
        dail2.targetValue=v2

    }



    async init(){

         this.worldLoading = true;
        toggleLoadingOverlay(true);
        updateLoadingStatus("Initializing escape room world...");

        this.world = new worldBuilder();
        this.renderer = this.world.ititialiseRenderer();
        this.scene = this.world.initializeScene();   
        this.room = new Room();
        this.world.addBaseLighting();
        this.room.generateBaseRoom();
    
        this.modelLoader= new ModelLoader()
        this.kWall= new KWall()
        this.kFloor= new KFloor()
        this.kCeiling= new KCeiling()
        this.kTable= new Ktable()
        this.dailPuzzle = new DailPuzzle()
        this.clue= new Paper(1,2,'./src/textures/level2_paper.png')
    
        this.dail1= this.dailPuzzle.createBaseDail()
        this.dail2= this.dailPuzzle.createBaseDail()
    
        // this.dail1.targetValue=75
        // this.dail2.targetValue=21
        this.setDials(this.dail1,this.dail2,75,21)
        
    
        this.collidables = [
            { mesh: this.room.floor, type: 'floor' },
            { mesh: this.room.ceiling, type: 'ceiling'},
            this.dail1,this.dail2,
            ...Object.values(this.room.walls).map(w => ({ mesh: w, type: 'wall' }))
        ];
    
    
    
    
        this.dail1.mesh.scale.set(0.2,0.2,0.2)
        this.dail1.mesh.position.set(7.42,4.3,-10.4)
        this.dail2.mesh.scale.set(0.2,0.2,0.2)
        this.dail2.mesh.position.set(8.42,4.3,-10.4)
        this.clue.mesh.position.set(-11.6,4,-1)
        this.clue.mesh.rotation.y= Math.PI/2
    
    
        this.room.add(this.dail1.mesh)
        this.room.add(this.dail2.mesh)
        this.room.add(this.clue.mesh)
    
    
    
    
    this.stove = this.modelLoader.loadModel(this.scene,'./models/gas_stove.glb',{ x: 8, y: 2.7, z: -12 },4.5,0);
    this.top = this.modelLoader.loadModel(this.scene,'./models/top.glb',{ x: -10, y: 0, z: -14 },5,0);
    this.microwave = this.modelLoader.loadModel(this.scene,'./models/microwave.glb',{ x: -10, y: 4.5, z: -14 },0.8,0);
    this.fridge = this.modelLoader.loadModel(this.scene,'./models/fridge.glb',{ x: -13, y: 0, z: 0 },3,Math.PI/2);
    this.sink = this.modelLoader.loadModel(this.scene,'./models/sink.glb',{ x: 0, y: 4.2, z: -14 },6,0);
    this.trashCan = this.modelLoader.loadModel(this.scene,'./models/trashcan.glb',{ x: -13, y: 0, z: -13 },3,0);
    this.painting = this.modelLoader.loadModel(this.scene,'./models/painting.glb',{ x: -13.5, y: 7, z: -5 },2,Math.PI/2);
    this.clock = this.modelLoader.loadModel(this.scene,'./models/clock.glb',
      { x: 0, y: 9, z: -14 }, 3.5, 0);
    
    const obj=[this.stove,this.top,this.microwave,this.fridge,this.sink,this.trashCan,this.painting,this.clock]
    
    for(let i=0;i<obj.length;i++){
        this.collidables.push({mesh:obj[i],type:"wall"})
    }
    
        this.kFloor.loadFloorTexture(this.room, './src/textures/floor_level_2/textures/floor_tiles_06_diff_4k.jpg');
        this.kWall.loadWallTexture(this.room, './src/textures/wall_plaster_level_2/textures/Texturelabs_Fabric_180XL.jpg');
        this.kCeiling.loadCeilingTexture(this.room, './src/textures/wall_plaster_level_2/textures/Texturelabs_Brick_132L.jpg');
    
        this.scene.add(this.room);
    
        this.kTable.loadKitchenTable(this.scene, this.collidables);
    
        this.player = new Player(this.scene, this.collidables);

        // Load and set up background music
    
            const listener = new THREE.AudioListener();
            this.player.camera.add( listener );
            this.bgMusic = new THREE.Audio( listener );
            const audioLoader = new THREE.AudioLoader();
        
            updateLoadingStatus("Loading the Room....");
            // Use a Promise to ensure we wait for the audio to load
            await new Promise(resolve => {
                audioLoader.load( './src/textures/escape.mp3', ( buffer ) => {
                this.bgMusic.setBuffer( buffer );
                this.bgMusic.setLoop( true );
                this.bgMusic.setVolume( 0.3 );
                updateLoadingStatus("Music loaded. Finishing setup...");
                resolve(); // Resolve the promise once loading is complete
             },
             ( progress ) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            updateLoadingStatus(`Loading Room and Music: ${percent}%`);
        },
             );
            });

            this.worldLoading = false;
            toggleLoadingOverlay(false);
    }  


    customGameLogic(){

        this.world.levelComplete=this.allDialSolved(this.dail1,this.dail2)
        this.gameState()
    }


    levelCompleteAction(){
        // some html stuff to do when game is complete
        // eg back to main menu
        // show completion time
        // show best time
    }




    startGame(){
        this.world.startAnimation(this.player,() => this.customGameLogic())

         if(this.bgMusic && this.bgMusic.buffer && !this.bgMusic.isPlaying) {
        this.bgMusic.play();
        }
       }

    endGame(){
        //also the timer
        this.world.stopAnimation();
        this.bgMusic.stop();
    }

     pauseGame(){
        this.world.pauseAnimation();

    }

         unPauseGame(){
        this.world.unPauseAnimation();

    }
        

    }


