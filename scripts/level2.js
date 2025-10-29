import * as THREE from 'three';
import { Room } from './room2';
import { worldBuilder } from './renderCommons';
import { Player } from './player';
import { KWall } from './kitchenWall';
import { KFloor } from './kitchenFloor';
import { KCeiling } from './kitchenCeiling';
import { Ktable } from './kitchenTable';
import { ModelLoader } from './modelLoader';

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
    

    const collidables = [
        { mesh: room.floor, type: 'floor' },
        { mesh: room.ceiling, type: 'ceiling'},
        ...Object.values(room.walls).map(w => ({ mesh: w, type: 'wall' }))
    ];



    const stove = modelLoader.loadModel(scene,'./models/gas_stove.glb',{ x: 0, y: 4, z: 0 },3.2,0);
    const top =  modelLoader.loadModel(scene,'./models/top.glb',{ x: -6,y: 0,z: 0},5,0);
    const microwave =  modelLoader.loadModel(scene,'./models/microwave.glb',{ x: -6,y: 5.6,z: 0},0.8,0);
    kFloor.loadFloorTexture(room, './src/textures/floor_level_2/textures/floor_tiles_06_diff_4k.jpg');
    kWall.loadWallTexture(room, './src/textures/wall_plaster_level_2/textures/Texturelabs_Fabric_180XL.jpg');
    kCeiling.loadCeilingTexture(room, './src/textures/wall_plaster_level_2/textures/Texturelabs_Brick_132L.jpg');

    scene.add(room);

    kTable.loadKitchenTable(scene, collidables);

    const player = new Player(scene, collidables);

    world.startAnimation(player);
    

}