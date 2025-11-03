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


let gameLevelComplete = false;
let gameTimer = 0;

export function level2_World() {

    const world = new worldBuilder();
     const renderer = world.ititialiseRenderer();
    const scene = world.initializeScene();   
    const room = new Room();
    world.addBaseLighting();
    room.generateBaseRoom();

    const modelLoader= new ModelLoader()
    const kWall= new KWall()
    const kFloor= new KFloor()
    const kCeiling= new KCeiling()
    const kTable= new Ktable()
    const dailPuzzle = new DailPuzzle()
    const clue= new Paper(1,2,'/textures/level2_paper.png')

    const dail1= dailPuzzle.createBaseDail()
    const dail2= dailPuzzle.createBaseDail()

    dail1.targetValue=75
    dail2.targetValue=21
    

    const collidables = [
        { mesh: room.floor, type: 'floor' },
        { mesh: room.ceiling, type: 'ceiling'},
        dail1,dail2,
        ...Object.values(room.walls).map(w => ({ mesh: w, type: 'wall' }))
    ];




    dail1.mesh.scale.set(0.2,0.2,0.2)
    dail1.mesh.position.set(7.42,4.3,-10.4)
    dail2.mesh.scale.set(0.2,0.2,0.2)
    dail2.mesh.position.set(8.42,4.3,-10.4)
    clue.mesh.position.set(-11.6,4,-1)
    clue.mesh.rotation.y= Math.PI/2


    room.add(dail1.mesh)
    room.add(dail2.mesh)
    room.add(clue.mesh)




const stove = modelLoader.loadModel(scene,'/models/gas_stove.glb',{ x: 8, y: 2.7, z: -12 },4.5,0);
const top = modelLoader.loadModel(scene,'/models/top.glb',{ x: -10, y: 0, z: -14 },5,0);
const microwave = modelLoader.loadModel(scene,'/models/microwave.glb',{ x: -10, y: 4.5, z: -14 },0.8,0);
const fridge = modelLoader.loadModel(scene,'/models/fridge.glb',{ x: -13, y: 0, z: 0 },3,Math.PI/2);
const sink = modelLoader.loadModel(scene,'/models/sink.glb',{ x: 0, y: 4.2, z: -14 },6,0);
const trashCan = modelLoader.loadModel(scene,'/models/trashcan.glb',{ x: -13, y: 0, z: -13 },3,0);
const painting = modelLoader.loadModel(scene,'/models/painting.glb',{ x: -13.5, y: 7, z: -5 },2,Math.PI/2);
const clock = modelLoader.loadModel(scene,'/models/clock.glb',
  { x: 0, y: 9, z: -14 }, 3.5, 0);

const obj=[stove,top,microwave,fridge,sink,trashCan,painting,clock]

for(let i=0;i<obj.length;i++){
    collidables.push({mesh:obj[i],type:"wall"})
}

    kFloor.loadFloorTexture(room, '/textures/floor_level_2/textures/floor_tiles_06_diff_4k.jpg');
    kWall.loadWallTexture(room, '/textures/wall_plaster_level_2/textures/Texturelabs_Fabric_180XL.jpg');
    kCeiling.loadCeilingTexture(room, '/textures/wall_plaster_level_2/textures/Texturelabs_Brick_132L.jpg');

    scene.add(room);

    kTable.loadKitchenTable(scene, collidables);

    const player = new Player(scene, collidables);

    function setDials(dail1,dail2,v1,v2){
        dail1.targetValue=v1
        dail2.targetValue=v2

    }

    function checkComplete(dail1,dail2){
        if(dail1.solved && dail2.solved){

            

            return true

        }
        return false


    }


setDials(dail1,dail2,75,21)
function customGameLogic(){

    checkComplete(dail1,dail2)


}    

    world.startAnimation(player,customGameLogic);
    

}