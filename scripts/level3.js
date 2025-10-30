import * as THREE from 'three';
import { Room } from './room';
import { worldBuilder } from './renderCommons';
import { Player } from './player';
import { Floor } from './floor';
import { Ceiling } from './ceiling';
import { Wall_Level3 } from './wall_level3';
import { Floor_Level3 } from './floor_level3';
import { ModelLoader } from './modelLoader';

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
        
        // Create the base room
        this.room = new Room();
        this.room.generateBaseRoom();
        
        // Set up collidables (walls, floor, ceiling)
        this.collidables = [
            { mesh: this.room.floor, type: 'floor' },
            { mesh: this.room.ceiling, type: 'ceiling' },
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

        // Optional: Add a second ceiling light on the other side for symmetry
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
        
        // Right wall lights
        const wallLight4 = new THREE.PointLight(0xffaa66, 6.5, 15, 2);
        wallLight4.position.set(20, 8, 0);
        this.room.add(wallLight4);
        
        // Additional corner accent lights for better coverage
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
        
        // Optional: Add subtle fog for atmospheric effect
        this.scene.fog = new THREE.Fog(0x0a0a0a, 25, 55);

        // Add room to scene
        this.scene.add(this.room);
        
        // Initialize player
        this.player = new Player(this.scene, this.collidables);
        this.player.controls.enabled = false;
    }

    customGameLogic() {
        // Empty for now - add your Level 3 specific game logic here
    }

    levelCompleteAction() {
        // Add level completion logic here
        console.log('Level 3 Complete!');
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