import * as THREE from 'three';
import { Room } from './room2';
import { worldBuilder } from './renderCommons';
import { Player } from './player';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ClockPuzzle } from './clockPuzzle';
import { RiddlePuzzle } from './riddlePuzzle';

let gameLevelComplete = false;
let gameItems = [];
let gameTimer = 0;

// ENHANCED: Realistic floor texture loading with PBR materials
function loadFloorTexture(room, texturePath) {
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load(
        texturePath,
        (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 4);
            texture.anisotropy = 16;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
            
            const floorMaterial = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.8,
                metalness: 0.0,
                envMapIntensity: 0.5,
            });
            
            if (room.setFloorMaterial) {
                room.setFloorMaterial(floorMaterial);
            } else if (room.floor) {
                room.floor.material = floorMaterial;
            }
            
            console.log('✓ Floor texture loaded');
        },
        undefined,
        (error) => {
            console.error('✗ Error loading floor texture:', error);
        }
    );
}

// Function for the texture for the ceiling
function loadCeilingTexture(room, texturePath) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        texturePath,
        (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 4);
            texture.anisotropy = 16;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
            
            const ceilingMaterial = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.8,
                metalness: 0.0,
                envMapIntensity: 0.5,
            });
            
            if (room.ceiling) {
                room.ceiling.material = ceilingMaterial;
            }
            
            console.log('✓ Ceiling texture loaded');
        },
        undefined,
        (error) => {
            console.error('✗ Error loading ceiling texture:', error);
        }
    );
}

function loadWallTexture(room, texturePath, wallSide = 'all') {
    const textureLoader = new THREE.TextureLoader();
    
    const configureTexture = (texture, repeatScale = 2) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatScale, repeatScale);
        texture.anisotropy = 16;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        return texture;
    };
    
    textureLoader.load(
        texturePath,
        (baseTexture) => {
            configureTexture(baseTexture, 2);
            baseTexture.colorSpace = THREE.SRGBColorSpace;
            
            const wallMaterial = new THREE.MeshStandardMaterial({
                map: baseTexture,
                roughness: 0.9,
                metalness: 0.0,
                envMapIntensity: 0.3,
                side: THREE.DoubleSide,
                flatShading: false,
                emissive: 0x000000,
                emissiveIntensity: 0,
                bumpScale: 0.02,
                displacementScale: 0.0,
                normalMapType: THREE.TangentSpaceNormalMap,
            });
            
            if (wallSide === 'all') {
                Object.keys(room.walls).forEach(side => {
                    if (room.walls[side]) {
                        const clonedMaterial = wallMaterial.clone();
                        room.walls[side].material = clonedMaterial;
                        room.walls[side].receiveShadow = true;
                        room.walls[side].castShadow = false;
                    }
                });
            } else if (room.walls[wallSide]) {
                room.walls[wallSide].material = wallMaterial;
                room.walls[wallSide].receiveShadow = true;
                room.walls[wallSide].castShadow = false;
            }
            
            console.log(`✓ Wall texture loaded for: ${wallSide}`);
        },
        undefined,
        (error) => {
            console.error('✗ Error loading wall texture:', error);
        }
    );
}

// Function to load the stove model with realistic materials
function loadStoveModel(scene, collidables) {
    console.log('Loading stove model...');
    const loader = new GLTFLoader();
    
    loader.load(
        './src/textures/stove/scene.gltf',
        (gltf) => {
            console.log('✓ Stove loaded successfully');
            const stove = gltf.scene;
            
            // Model is huge (66-86 units), scale down to fit room
            stove.position.set(0, 0, -8);  // Against back wall, on floor
            stove.scale.set(0.05, 0.05, 0.05);  // Scale down to room size
            stove.rotation.y = 0;  // Facing forward
            
            // Apply realistic materials to each mesh
            stove.traverse((child) => {
                if (child.isMesh) {
                    // Create material based on mesh name/purpose
                    let material;
                    
                    if (child.name.toLowerCase().includes('metal') || 
                        child.name.toLowerCase().includes('chrome')) {
                        // Metallic parts (handles, knobs)
                        material = new THREE.MeshStandardMaterial({
                            color: 0xdddddd,  // Bright chrome/steel
                            roughness: 0.2,
                            metalness: 1.0,
                            envMapIntensity: 1.0
                        });
                    } else if (child.name.toLowerCase().includes('glass')) {
                        // Glass door/window
                        material = new THREE.MeshStandardMaterial({
                            color: 0x666666,
                            roughness: 0.1,
                            metalness: 0.0,
                            transparent: true,
                            opacity: 0.5
                        });
                    } else {
                        // Main stove body - white finish
                        material = new THREE.MeshStandardMaterial({
                            color: 0xf5f5f5,  // White/off-white
                            roughness: 0.4,
                            metalness: 0.1,
                            envMapIntensity: 0.6
                        });
                    }
                    
                    child.material = material;
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Add to collidables
                    collidables.push({ mesh: child, type: 'obstacle' });
                }
            });
            
            scene.add(stove);
            console.log('✓ Stove added to scene');
        },
        (progress) => {
            if (progress.total > 0) {
                console.log(`Loading stove: ${(progress.loaded / progress.total * 100).toFixed(0)}%`);
            }
        },
        (error) => {
            console.error('Error loading stove:', error);
        }
    );
}

// Function to load the fridge model
function loadFridgeModel(scene, collidables) {
    console.log('Loading fridge model...');
    const loader = new GLTFLoader();
    
    // Try with URL encoding for the path with spaces and parentheses
    const fridgePath = './src/textures/house_props_fridge/scene.gltf';
    
    loader.load(
        fridgePath,
        (gltf) => {
            console.log('✓ Fridge loaded successfully');
            const fridge = gltf.scene;
            
            // Calculate bounding box to understand size
            const box = new THREE.Box3().setFromObject(fridge);
            const size = box.getSize(new THREE.Vector3());
            console.log('📦 Fridge original size:', size);
            
            // Position next to stove (adjust as needed)
            fridge.position.set(-4, 0, -8);  // Left side of back wall
            fridge.scale.set(0.05, 0.05, 0.05);  // Start with same scale as stove
            fridge.rotation.y = 0;  // Facing forward
            
            // Apply white fridge material
            fridge.traverse((child) => {
                if (child.isMesh) {
                    let material;
                    
                    if (child.name.toLowerCase().includes('metal') || 
                        child.name.toLowerCase().includes('handle')) {
                        // Metallic handles
                        material = new THREE.MeshStandardMaterial({
                            color: 0xcccccc,
                            roughness: 0.3,
                            metalness: 0.9,
                            envMapIntensity: 1.0
                        });
                    } else {
                        // Main fridge body - white appliance finish
                        material = new THREE.MeshStandardMaterial({
                            color: 0xfafafa,  // Bright white
                            roughness: 0.3,
                            metalness: 0.2,
                            envMapIntensity: 0.7
                        });
                    }
                    
                    child.material = material;
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Add to collidables
                    collidables.push({ mesh: child, type: 'obstacle' });
                }
            });
            
            scene.add(fridge);
            console.log('✓ Fridge added to scene');
        },
        (progress) => {
            if (progress.total > 0) {
                console.log(`Loading fridge: ${(progress.loaded / progress.total * 100).toFixed(0)}%`);
            }
        },
        (error) => {
            console.error('❌ Error loading fridge:', error);
            console.error('Error message:', error.message);
            
            // Create a fallback white box as fridge placeholder
            console.log('📦 Creating fallback fridge...');
            
            // Main fridge body
            const fridgeBody = new THREE.Mesh(
                new THREE.BoxGeometry(2.5, 4.5, 2),
                new THREE.MeshStandardMaterial({ 
                    color: 0xfafafa,
                    roughness: 0.2,
                    metalness: 0.3
                })
            );
            fridgeBody.position.set(-4, 2.25, -8);
            fridgeBody.castShadow = true;
            fridgeBody.receiveShadow = true;
            
            // Add a handle
            const handle = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.8, 0.3),
                new THREE.MeshStandardMaterial({
                    color: 0xcccccc,
                    roughness: 0.2,
                    metalness: 0.9
                })
            );
            handle.position.set(-2.9, 2.5, -8);
            
            // Add a freezer section line
            const line = new THREE.Mesh(
                new THREE.BoxGeometry(2.5, 0.05, 2.01),
                new THREE.MeshStandardMaterial({
                    color: 0xdddddd,
                    roughness: 0.3,
                    metalness: 0.2
                })
            );
            line.position.set(-4, 3, -8);
            
            scene.add(fridgeBody);
            scene.add(handle);
            scene.add(line);
            collidables.push({ mesh: fridgeBody, type: 'obstacle' });
            console.log('✓ Fallback fridge with details added');
        }
    );
}

// Function to load and add the kitchen table model with custom textures
function loadKitchenTable(scene, collidables) {
    console.log('🔧 Starting kitchen table load...');
    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    
    // Load wood textures
    const woodDiffuse = textureLoader.load('./src/textures/kitchen_table/textures/Wood_Material_diffuse.jpeg');
    const woodNormal = textureLoader.load('./src/textures/kitchen_table/textures/Wood_Material_normal.png');
    
    [woodDiffuse, woodNormal].forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.anisotropy = 16;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
    });
    
    woodDiffuse.colorSpace = THREE.SRGBColorSpace;
    
    const woodMaterial = new THREE.MeshStandardMaterial({
        map: woodDiffuse,
        normalMap: woodNormal,
        normalScale: new THREE.Vector2(1.0, 1.0),
        roughness: 0.6,
        metalness: 0.0,
        envMapIntensity: 0.5,
    });
    
    const whiteWoodDiffuse = textureLoader.load('./src/textures/kitchen_table/textures/White_Wood_Material_diffuse.jpeg');
    const whiteWoodNormal = textureLoader.load('./src/textures/kitchen_table/textures/White_Wood_Material_normal.png');
    
    [whiteWoodDiffuse, whiteWoodNormal].forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.anisotropy = 16;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
    });
    
    whiteWoodDiffuse.colorSpace = THREE.SRGBColorSpace;
    
    const whiteWoodMaterial = new THREE.MeshStandardMaterial({
        map: whiteWoodDiffuse,
        normalMap: whiteWoodNormal,
        normalScale: new THREE.Vector2(1.0, 1.0),
        roughness: 0.7,
        metalness: 0.0,
        envMapIntensity: 0.4,
    });
    
    loader.load(
        './src/textures/kitchen_table/scene.gltf',
        (gltf) => {
            const table = gltf.scene;
            
            table.position.set(6, 0, 4);
            table.scale.set(0.3, 0.3, 0.3);
            
            table.traverse((child) => {
                if (child.isMesh) {
                    if (child.name.toLowerCase().includes('white') || 
                        child.material?.name?.toLowerCase().includes('white')) {
                        child.material = whiteWoodMaterial;
                    } else {
                        child.material = woodMaterial;
                    }
                    
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    collidables.push({ mesh: child, type: 'obstacle' });
                }
            });
            
            scene.add(table);
            console.log('✓ Kitchen table loaded successfully');
        },
        (progress) => {
            if (progress.total > 0) {
                console.log(`⏳ Loading table: ${(progress.loaded / progress.total * 100).toFixed(1)}%`);
            }
        },
        (error) => {
            console.error('✗ Error loading kitchen table:', error);
        }
    );
}
// Generic function to load any GLTF model
function loadModel(scene, modelUrl, position, scale, rotation = { x: 0, y: 0, z: 0 }, name = 'model') {
    const loader = new GLTFLoader();
    const modelGroup = new THREE.Group();
    
    // Support both old format (single number) and new format (object with x,y,z)
    if (typeof rotation === 'number') {
        rotation = { x: 0, y: rotation, z: 0 };
    }
    
    console.log(`🔍 Starting ${name} load...`);
    
    // Try multiple possible paths
    const basePath = modelUrl.replace('./', '').replace('/', '');
    const paths = [
        modelUrl,
        './' + basePath,
        './public/' + basePath,
        basePath,
        'public/' + basePath,
        '/' + basePath
    ];
    
    let currentPathIndex = 0;
    
    function attemptLoad() {
        const currentPath = paths[currentPathIndex];
        console.log(`Trying ${name} path ${currentPathIndex + 1}/${paths.length}: ${currentPath}`);
        
        loader.load(
            currentPath,
            // Success callback
            function (gltf) {
                console.log(`✅ SUCCESS! ${name} loaded from:`, currentPath);
                
                const model = gltf.scene;
                
                // Apply scale
                model.scale.set(scale, scale, scale);
                
                // Log model info
                console.log(`${name} info:`, {
                    children: model.children.length,
                    scale: model.scale
                });
                
                // Enable shadows and materials
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        // Ensure material exists
                        if (!child.material) {
                            child.material = new THREE.MeshStandardMaterial({
                                color: 0x8B4513,
                                roughness: 0.8,
                                metalness: 0.0
                            });
                        }
                        
                        console.log(`  - Mesh:`, child.name || 'unnamed', 'has material:', !!child.material);
                    }
                });
                
                modelGroup.add(model);
                
                // Apply position and rotation (all three axes)
                modelGroup.position.set(position.x, position.y, position.z);
                modelGroup.rotation.x = rotation.x;
                modelGroup.rotation.y = rotation.y;
                modelGroup.rotation.z = rotation.z;
                
                scene.add(modelGroup);
                
                // Add bounding box helper for debugging
                const box = new THREE.Box3().setFromObject(modelGroup);
                const size = box.getSize(new THREE.Vector3());
                console.log(`📦 ${name} dimensions:`, {
                    width: size.x.toFixed(2),
                    height: size.y.toFixed(2),
                    depth: size.z.toFixed(2)
                });
                console.log(`📍 ${name} position:`, modelGroup.position);
                console.log(`🔄 ${name} rotation:`, modelGroup.rotation);
            },
            // Progress callback
            function (xhr) {
                if (xhr.lengthComputable) {
                    const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
                    console.log(`Loading ${name}: ${percent}%`);
                }
            },
            // Error callback
            function (error) {
                console.error(`❌ Failed to load ${name} from ${currentPath}:`, error.message);
                
                currentPathIndex++;
                if (currentPathIndex < paths.length) {
                    console.log(`⚠️ Trying next path for ${name}...`);
                    attemptLoad();
                } else {
                    console.error(`❌ All paths failed for ${name}!`);
                    createPlaceholder(scene, position, scale, rotation, name);
                }
            }
        );
    }
    
    attemptLoad();
    return modelGroup;
}

export function level2_World() {
    console.log('🎮 Initializing Level 2...');
    
    const riddle = "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?";
    const answer = "map";

    const world = new worldBuilder();
    const room = new Room();
    









    const collidables = [
        { mesh: room.floor, type: 'floor' },
        { mesh: room.ceiling, type: 'ceiling'},
        ...Object.values(room.walls).map(w => ({ mesh: w, type: 'wall' }))
    ];

    const renderer = world.ititialiseRenderer();
    const scene = world.initializeScene();



    // stove


const stove = loadModel(
    scene,
    './models/gas_stove.glb',
    { x: 0, y: 4, z: 0 },
    3.2,
    0
);

// Counter / Top
const top = loadModel(
    scene,
    './models/top.glb',
    { 
        x: -6,       // align with stove
        y: 0,     // top surface height of the counter
        z: 0
    },
    5,           // scale
    0
);

// Microwave (on top of the counter)
const microwave = loadModel(
    scene,
    './models/microwave.glb',
    { 
        x: -6,       // center it on top of the counter
        y: 5.6,     // slightly above the top to sit on it
        z: 0
    },
    0.8,         // scale
    0
);


    world.addBaseLighting();

    room.generateBaseRoom();
    
    // Load textures
    loadFloorTexture(room, './src/textures/floor_level_2/textures/floor_tiles_06_diff_4k.jpg');
    loadWallTexture(room, './src/textures/wall_plaster_level_2/textures/Texturelabs_Fabric_180XL.jpg');
    loadCeilingTexture(room, './src/textures/wall_plaster_level_2/textures/Texturelabs_Brick_132L.jpg');

    scene.add(room);

    // Load models
    loadKitchenTable(scene, collidables);
    //loadStoveModel(scene, collidables);
   // loadFridgeModel(scene, collidables);  // Add fridge

    const player = new Player(scene, collidables);

    world.startAnimation(player);
    
    console.log('✓ Level 2 initialization complete');
}