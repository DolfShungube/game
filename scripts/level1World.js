import * as THREE from 'three';
import { Room } from './room';
import { worldBuilder } from './renderCommons';
import { Player } from './player';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { ClockPuzzle } from './clockPuzzle';
import { DrawerPuzzle } from './drawerPuzzle';
import {ButtonPuzzle } from './buttonPuzzle';
import { CombinationLockPuzzle } from './combinationLockPuzzle';
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
import { TallyMarks } from './tallyMarks';



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

export class Level1{

    worldLoading=true;
    LevelComplete=false;
    timeComplete=false;
    
     // Background music
    bgMusic = null;
    

    constructor(){



    }



    linkDrawerToClock(clock,drawer){

        if(clock.solved){
            drawer.solved=true;

        }else{
            drawer.solved=false;
        }
    }

    linkButtonsToCombinationLock(buttonList,combinationList){

        for(let i=0;i<buttonList.length;i++){

        if(buttonList[i].solved){
            combinationList[i].unlocked=true;
        }else{
            combinationList[i].unlocked=false;
        }


        }
    }

    allCombinationsSolved(combinationList){

        let allSolved=true

    for(let i=0;i<combinationList.length;i++){

        if(!combinationList[i].solved){
            allSolved=false
            break;

        }
    }

    return allSolved
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






    setConbinationValues(combinationList,values){

        for (let i=0; i<combinationList.length;i++){
        combinationList[i].solutionNumber= values[i]
        }


    }



    async init(){

    //added this for the purpose of music loading screen
    this.worldLoading = true;
    toggleLoadingOverlay(true);
    updateLoadingStatus("Initializing escape room world...");

    this.world= new worldBuilder();
    this.world.currentLevel='level 1' 
    this.renderer = this.world.ititialiseRenderer();
    this.scene= this.world.initializeScene();
    this.room= new Room();
    this.room.generateBaseRoom();
    this.collidables =[
    { mesh: this.room.floor, type: 'floor'},
    { mesh: this.room.ceiling, type: 'ceiling'},
    ...Object.values(this.room.walls).map(w => ({ mesh: w, type: 'wall' }))

]
    

    this.Table= new table1();
    this.Bookshelf= new BookShelf()
    this.Couch1 = new Couch()
    this.Carpet1= new Carpet()
    this.Fireplace= new FirePlace()
    this.combinationLockPuzzle= new CombinationLockPuzzle()
    this.modelLoader= new ModelLoader()
    this.clockPuzzle= new ClockPuzzle();
    this.drawerPuzzle= new DrawerPuzzle();
    this.buttonPuzzle= new ButtonPuzzle();
    this.floor= new Floor()
    this.wall= new Wall()
    this.ceiling= new Ceiling()
    this.tallyMarks = new TallyMarks();
    


    this.floor.loadFloorTexture(this.room, './src/textures/floor_level1_(1).jpg');
    this.wall.loadWallTexture(this.room, './src/textures/wall_4.jpg', 'all');
    this.ceiling.loadCeilingTexture(this.room, './src/textures/ceiling_1.jpg');


    this.clock=this.clockPuzzle.createBaseClock();

    this.Basedrawer= this.drawerPuzzle.createBaseDrawer();
    

    this.drawer1= this.Basedrawer.drawer1;
    this.drawer2= this.Basedrawer.drawer2;
    this.drawer= this.Basedrawer.container;

    this.lock1= this.Basedrawer.lock1;
    this.lock2= this.Basedrawer.lock2;
    this.lock3= this.Basedrawer.lock3;
    this.lock4= this.Basedrawer.lock4;

    this.button1=this.Basedrawer.button1;
    this.button2= this.Basedrawer.button2;
    this.button3= this.buttonPuzzle.createBaseButton();
    this.button4= this.buttonPuzzle.createBaseButton();


    this.combinationLock1= this.combinationLockPuzzle.createBaseCombinationLock();
    this.combinationLock2= this.combinationLockPuzzle.createBaseCombinationLock();
    this.combinationLock3= this.combinationLockPuzzle.createBaseCombinationLock();
    this.combinationLock4= this.combinationLockPuzzle.createBaseCombinationLock();

    this.couch1 = this.Couch1.createCouch(this.scene, {x: -10, y: 0, z: 10}, Math.PI / 2);
    this.couch2 = this.Couch1.createCouch(this.scene, {x: 10, y: 0, z: 10}, -Math.PI);

    this.carpet = this.Carpet1.createCarpet();
    this.table=this.Table.createTable();
    this.fireplace = this.Fireplace.createFireplace();    
    this.bookshelf = this.Bookshelf.loadBookshelf(this.scene,{ x: -12, y: 0, z: 20},6.2,Math.PI / 2);
    this.coffeeTable = this.modelLoader.loadModel(this.scene,'./models/coffee_table.glb',{ x: 8, y: 0.3, z: 3 },4.5,{ x: Math.PI / 2, y: 0, z: 0 },'coffeeTable');
    this.painting = this.modelLoader.loadModel(this.scene,'./models/painting.glb',{ x: -21.3, y: 6.5, z: 0 },6.6, Math.PI /2,'painting');
    this.painting_2 =  this.modelLoader.loadModel(this.scene,'./models/my_haunted_painting.glb',{ x: -21.3, y: 6.5, z: 5 },0.5,{ x: 0, y: 0, z: -Math.PI/2},'painting_2');
    this.carpet_model =  this.modelLoader.loadModel(this.scene,'./models/carpet.glb',{x:5 , y:0.3 , z:4 },0.3,0,'carpet_model');
    this.table_model =  this.modelLoader.loadModel(this.scene, './models/table.glb',{x: 16, y : 0, z :-15.0},0.7,-Math.PI/2,'table_model')
    this.table_model_lamp =  this.modelLoader.loadModel(this.scene, './models/soviet_old_table.glb',{x: -20, y : 0.5, z :-10.0},7.0,0 ,'table_model_lamp')
    this.lamp =  this.modelLoader.loadModel(this.scene, './models/table_lamp_01.glb', {x: -20, y : 3.5, z :-7.0},0.05,0 ,'lamp')
    this.books =  this.modelLoader.loadModel(this.scene, './models/books_with_magnifier.glb', {x: -19.5, y : 3.5, z :-12.0},7.0,-Math.PI/2 ,'books')


    this.riddle = "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?";
    this.answer = "map";
    this.riddleMachine = new RiddlePuzzle(this.riddle, this.answer);



        const L=[this.couch1,this.couch2,this.coffeeTable,this.table_model,this.table_model_lamp]

        for(let i=0;i<L.length;i++){
            this.collidables.push({mesh:L[i],type:"wall"})
        }
        
    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    this.world.addBaseLighting()
    
    this.bookshelfSpotlight1 = new THREE.SpotLight(0xffffff, 2.5, 30, Math.PI / 4, 0.2, 1.2);
    this.bookshelfSpotlight1.position.set(1, 15, 15);
    this.bookshelfSpotlight1.target.position.set(-12,5,20);



    this.bookshelfSpotlight2 = new THREE.SpotLight(0xffffff, 2.0, 25, Math.PI / 3, 0.3, 1.0);
    this.bookshelfSpotlight2.position.set(10, 12, 25);
    this.bookshelfSpotlight2.target.position.set(1, 5, 25);

    this.riddleMachine.position.set(16, 3.5, -15.0);
    this.riddleMachine.rotation.y = -Math.PI / 2;

    this.table.position.set(16, 0, -15.0);
    this.table.rotation.y = -Math.PI / 2;

    this.fireplace.position.set(20, 0, 3);
    this.fireplace.rotation.y = -Math.PI / 2;


    this.keyLight.position.set(15, 20, 10);
    this.keyLight.castShadow = true;


    this.fillLight.position.set(-10, 10, -10);

    this.rimLight.position.set(0, 15, -15);

    this.couch1.position.set(0, 2, 4);
    this.couch2.position.set(7, 2, 13);

      
    const list =[this.clock,this.lock1,this.lock2,this.lock3,this.lock4,
    this.drawer1,this.drawer2,
    this.button1,this.button2,this.button3,this.button4,
    {mesh:this.bookshelf,type:'wall'},
    {mesh:this.table_model_lamp,type:'wall'},
    {mesh:this.fireplace,type:'wall'},
    {mesh:this.table,type:'wall'},
    {mesh:this.riddleMachine,type:'interactable'},
    this.combinationLock1,this.combinationLock2,this.combinationLock3,this.combinationLock4]

    for(let i=0;i<list.length;i++){
        this.collidables.push(list[i])
    }

 



    this.clock.mesh.scale.set(2,2,2)
    this.clock.mesh.position.set(0, 9, -21.0);

    this.drawer.mesh.position.set(-19,1.5,-18);
    this.drawer.mesh.rotation.y=Math.PI/2

    this.button3.mesh.position.set(-19.5,1.95,-10)
    this.button3.mesh.scale.set(0.5,0.5,0.5)
    this.button3.mesh.rotation.x=-Math.PI/2




    this.button4.mesh.position.set(-12,5.4,20)
    this.button4.mesh.scale.set(0.5,0.5,0.5)
    this.button4.mesh.rotation.x=-Math.PI/2

    //dail.mesh.position.set(0,4,5)
    this.lock1.mesh.scale.set(0.3,0.3,0.3)
    this.lock1.mesh.position.set(-19,2,-15.9);
    this.lock1.mesh.rotation.z=Math.PI/2

    this.lock2.mesh.scale.set(0.3,0.3,0.3)
    this.lock2.mesh.rotation.y=Math.PI/2
    this.lock2.mesh.position.set(-21,8.7,4.9);

    this.lock3.mesh.scale.set(0.3,0.3,0.3)
    this.lock3.mesh.rotation.y=3*Math.PI/2
    this.lock3.mesh.position.set(17.2,2.8,-13);

    this.lock4.mesh.scale.set(0.3,0.3,0.3)
    this.lock4.mesh.rotation.x=Math.PI/2
    this.lock4.mesh.position.set(8,2.3,3);





    this.combinationLock1.mesh.rotation.z = Math.PI / 2;
    this.combinationLock1.mesh.rotation.y = -Math.PI;
    this.combinationLock1.mesh.position.set(-0.5,6,22.1)

    this.combinationLock2.mesh.rotation.z = Math.PI / 2;
    this.combinationLock2.mesh.rotation.y = -Math.PI;
    this.combinationLock2.mesh.position.set(1,7,22.1)

    this.combinationLock3.mesh.rotation.z = Math.PI/2 ;
    this.combinationLock3.mesh.rotation.y = -Math.PI;
    this.combinationLock3.mesh.position.set(1,5,22.1)

    this.combinationLock4.mesh.rotation.z = Math.PI/2;
    this.combinationLock4.mesh.rotation.y = -Math.PI;
    this.combinationLock4.mesh.position.set(2.5,6,22.1);


    const tally1 = this.tallyMarks.createTallyMarks({ x: -20.9, y: 13, z: 18.5 }, Math.PI / 2, 2);
    const tally2 = this.tallyMarks.createTallyMarks({ x: 20.9, y: 13, z: -18.5 }, -Math.PI / 2, 4);
    const tally3 = this.tallyMarks.createTallyMarks({ x: 18.5, y: 13, z: 20.9 }, Math.PI, 3);
    const tally4 = this.tallyMarks.createTallyMarks({ x: -18.5, y: 13, z: -19.9 }, 0, 5);

    this.room.add(tally1);
    this.room.add(tally2);
    this.room.add(tally3);
    this.room.add(tally4);


    this.room.addItem(this.clock.mesh)
    this.room.add(this.drawer.mesh)

    this.room.add(this.lock1.mesh)
    this.room.add(this.lock2.mesh)
    this.room.add(this.lock3.mesh)
    this.room.add(this.lock4.mesh)

    this.room.add(this.combinationLock1.mesh)
    this.room.add(this.combinationLock2.mesh)
    this.room.add(this.combinationLock3.mesh)
    this.room.add(this.combinationLock4.mesh)

    this.room.add(this.button3.mesh)
    this.room.add(this.button4.mesh)

    this.room.addItem(this.clockPuzzle);
    this.room.add(this.riddleMachine);
    this.room.addItem(this.rimLight);
    this.room.addItem(this.fireplace);
    this.room.addItem(this.fillLight);
    this.room.addItem(this.keyLight);
    this.room.addItem(this.ambientLight);
    this.room.addItem(this.couch1);
    this.room.addItem(this.couch2);
    this.room.add(this.keyLight);
    this.room.add(this.fillLight);
    this.room.add(this.ambientLight);
    this.room.add(this.rimLight);
    this.room.add(this.bookshelfSpotlight1);
    this.room.add(this.bookshelfSpotlight1.target);
    this.room.add(this.bookshelfSpotlight2);
    this.room.add(this.bookshelfSpotlight2.target);




    this.scene.add(this.room);
    this.player = new Player(this.scene,this.collidables);
    this.player.controls.enabled=false;
    //const controls= new OrbitControls(this.player.camera,this.renderer.domElement)
    this.riddleMachine.setupInteraction(this.player.camera, this.player);
    //---------------------------------


  
    const listener = new THREE.AudioListener();
    this.player.camera.add( listener );
    this.bgMusic = new THREE.Audio( listener );
    const audioLoader = new THREE.AudioLoader();

    updateLoadingStatus("Loading the Room....");
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
    //-----------------


    this.buttonList=[this.button1,this.button2,this.button3,this.button4]
    this.combinationList=[this.combinationLock1,this.combinationLock2,this.combinationLock3,this.combinationLock4]
    this.combinationValues=[1,1,1,1]




    this.worldLoading = false;
    toggleLoadingOverlay(false); // Hide the overlay before the game starts

    }  

 
       setConbinationValues(combinationList,values){

    for (let i=0; i<combinationList.length;i++){
      combinationList[i].solutionNumber= values[i]
    }
} 

    customGameLogic(){
        this.riddleMachine.updateInteraction();
        this.linkDrawerToClock(this.clock,this.drawer2)
        this.linkButtonsToCombinationLock(this.buttonList,this.combinationList)
        this.world.levelComplete=this.allCombinationsSolved(this.combinationList)

    }


    levelCompleteAction(){


    }




    startGame(){
        this.setConbinationValues(this.combinationList,this.combinationValues)
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


