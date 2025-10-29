
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
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// stuff inside the level1_World function is just for testing, not final: DOLF

let gameLevelComplete=false;  // level completed or not
let gameItems=[];  // keeps track of items player has collected
let gameTimer=0;  // game time we agreed on

//============================================
// TABLE CREATION - FIXED WITH PROPER TEXTURES
// ============================================
function createTable(){
  //1 . defining the materials
  const woodMaterial = new THREE.MeshPhongMaterial({
     color: 0x8B4513 ,
     specular: 0x111111,
      shininess: 50 
    });

    //2 group container for the table so I can move it around and add legs and top to it
    const tableGroup  = new THREE.Group();

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
    const legOffsetY = NEW_LEG_HEIGHT  / 2;
    const legOffsetX = (tabletopWidth / 2) - (legWidth * 2); // (8 / 2) - 0.2 = 3.8
    const legOffsetZ = (tabletopDepth / 2) - (legWidth * 2); // (4 / 2) - 0.2 = 1.8

    const legPositions = [
      [ legOffsetX, legOffsetY,  legOffsetZ], // Front-Right
      [-legOffsetX, legOffsetY,  legOffsetZ], // Front-Left
      [ legOffsetX, legOffsetY, -legOffsetZ], // Back-Right
      [-legOffsetX, legOffsetY, -legOffsetZ]  // Back-Left
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

// ============================================
// COUCH CREATION
// ============================================
function createCouch(scene, position, rotation) {
    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    const couchGroup = new THREE.Group();
    
    // Load couch textures
    const diffuseMap = textureLoader.load('./src/textures/couch/textures/wire_196088225_diffuse.png');
    const normalMap = textureLoader.load('./src/textures/couch/textures/wire_196088225_normal.png');
    const specularMap = textureLoader.load('./src/textures/couch/textures/wire_196088225_specularGlossiness.png');
    
    // Configure textures
    [diffuseMap, normalMap, specularMap].forEach(texture => {
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.anisotropy = 16;
        texture.flipY = false;
    });
    
    diffuseMap.colorSpace = THREE.SRGBColorSpace;
    
    loader.load('./src/textures/couch_2.glb', function (gltf) {
        gltf.scene.scale.set(0.02, 0.02, 0.02);
        
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                child.material = new THREE.MeshStandardMaterial({
                    map: diffuseMap,
                    normalMap: normalMap,
                    normalScale: new THREE.Vector2(0.5, 0.5),
                    roughnessMap: specularMap,
                    roughness: 0.6,
                    metalness: 0.0,
                    emissive: new THREE.Color(0x1a1410),
                    emissiveIntensity: 0.15,
                    side: THREE.DoubleSide,
                    envMapIntensity: 0.5
                });
                
                console.log('Couch material applied with textures');
            }
        });
        
        couchGroup.add(gltf.scene);
        
    }, undefined, function (error) {
        console.error('Error loading couch:', error);
    });
    
    if (position) {
        couchGroup.position.set(position.x, position.y + 1.5, position.z);
    }
    
    if (rotation) {
        couchGroup.rotation.y = rotation;
    }
    
    scene.add(couchGroup);
    return couchGroup;
}

// ============================================
// CARPET CREATION
// ============================================
function createCarpet() {
    const textureLoader = new THREE.TextureLoader();
    const carpetWidth = 60;
    const carpetDepth = 60;
    const carpetGeometry = new THREE.PlaneGeometry(carpetWidth, carpetDepth);
    
    // Load PBR textures
    const baseTexture = textureLoader.load('./src/textures/carpet/Color.jpg');
    const normalTexture = textureLoader.load('./src/textures/carpet/NormalGL.jpg');
    const roughnessTexture = textureLoader.load('./src/textures/carpet/Roughness.jpg');
    const displacementTexture = textureLoader.load('./src/textures/carpet/Displacement.jpg');
    
    // Configure textures
    [baseTexture, normalTexture, roughnessTexture, displacementTexture].forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8);
        texture.anisotropy = 16;
    });
    
    baseTexture.colorSpace = THREE.SRGBColorSpace;
    
    const carpetMaterial = new THREE.MeshStandardMaterial({
        map: baseTexture,
        normalMap: normalTexture,
        normalScale: new THREE.Vector2(1.0, 1.0),
        roughnessMap: roughnessTexture,
        roughness: 0.9,
        metalness: 0.0,
        displacementMap: displacementTexture,
        displacementScale: 0.05,
        side: THREE.DoubleSide
    });
    
    const carpet = new THREE.Mesh(carpetGeometry, carpetMaterial);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.y = 0.01;
    carpet.position.x = 0;
    carpet.position.z = 0;
    carpet.receiveShadow = true;
    
    return carpet;
}

// ============================================
// FIREPLACE CREATION
// ============================================
function createFireplace() {
    const fireplaceGroup = new THREE.Group();
    const textureLoader = new THREE.TextureLoader();
    
    // Load brick textures
    const brickColor = textureLoader.load('./src/textures/fireplace/Bricks_Color.jpg');
    const brickNormal = textureLoader.load('./src/textures/fireplace/Bricks101_NormalDX.jpg');
    const brickRoughness = textureLoader.load('./src/textures/fireplace/Bricks101_Roughness.jpg');
    const brickDisplacement = textureLoader.load('./src/textures/fireplace/Bricks_Displacement.jpg');
    const brickOcclusion = textureLoader.load('./src/textures/fireplace/Bricks_Occlusion.jpg');
    const woodCover = textureLoader.load('./src/textures/fireplace/WoodFloor041_Color.jpg');
    const darkInteriorTexture = textureLoader.load('./src/textures/fireplace/dark_Color.jpg');
    
    // Helper function to create brick material
    const createBrickMaterial = () => {
        const colorMap = brickColor.clone();
        const normalMap = brickNormal.clone();
        const roughnessMap = brickRoughness.clone();
        const displacementMap = brickDisplacement.clone();
        const aoMap = brickOcclusion.clone();
        
        [colorMap, normalMap, roughnessMap, displacementMap, aoMap].forEach(texture => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
            texture.anisotropy = 16;
            texture.needsUpdate = true;
        });
        
        colorMap.colorSpace = THREE.SRGBColorSpace;
        
        return new THREE.MeshStandardMaterial({
            map: colorMap,
            normalMap: normalMap,
            normalScale: new THREE.Vector2(1.0, 1.0),
            roughnessMap: roughnessMap,
            roughness: 0.9,
            metalness: 0.0,
            displacementMap: displacementMap,
            displacementScale: 0.02,
            aoMap: aoMap,
            aoMapIntensity: 1.0
        });
    };
    
    // Dimensions
    const fireplaceWidth = 9;
    const fireplaceHeight = 6;
    const fireplaceDepth = 4;
    const wallThickness = 0.5;
    
    // Back wall
    const backWallGeo = new THREE.BoxGeometry(fireplaceWidth, fireplaceHeight, wallThickness);
    const backWall = new THREE.Mesh(backWallGeo, createBrickMaterial());
    backWall.position.set(0, fireplaceHeight / 2, -fireplaceDepth / 2);
    fireplaceGroup.add(backWall);
    
    // Left wall
    const sideWallGeo = new THREE.BoxGeometry(wallThickness, fireplaceHeight, fireplaceDepth);
    const leftWall = new THREE.Mesh(sideWallGeo, createBrickMaterial());
    leftWall.position.set(-fireplaceWidth / 2, fireplaceHeight / 2, 0);
    fireplaceGroup.add(leftWall);
    
    // Right wall
    const rightWall = new THREE.Mesh(sideWallGeo, createBrickMaterial());
    rightWall.position.set(fireplaceWidth / 2, fireplaceHeight / 2, 0);
    fireplaceGroup.add(rightWall);
    
    // Bottom hearth
    const hearthGeo = new THREE.BoxGeometry(fireplaceWidth, wallThickness, fireplaceDepth);
    const hearth = new THREE.Mesh(hearthGeo, createBrickMaterial());
    hearth.position.set(0, wallThickness / 2, 0);
    fireplaceGroup.add(hearth);
    
    // Front step with wood sides
    const stepWidth = fireplaceWidth + 2;
    const stepDepth = 2.5;
    const stepHeight = 0.6;
    
    const woodCoverStep = woodCover.clone();
    woodCoverStep.wrapS = THREE.RepeatWrapping;
    woodCoverStep.wrapT = THREE.RepeatWrapping;
    woodCoverStep.repeat.set(2, 1);
    woodCoverStep.anisotropy = 16;
    woodCoverStep.colorSpace = THREE.SRGBColorSpace;
    woodCoverStep.needsUpdate = true;
    
    const woodMaterialStep = new THREE.MeshStandardMaterial({
        map: woodCoverStep,
        roughness: 0.7,
        metalness: 0.0
    });
    
    const stepMaterials = [
        woodMaterialStep,
        woodMaterialStep,
        createBrickMaterial(),
        createBrickMaterial(),
        woodMaterialStep,
        woodMaterialStep
    ];
    
    const stepGeo = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
    const step = new THREE.Mesh(stepGeo, stepMaterials);
    step.position.set(0, stepHeight / 2, (fireplaceDepth / 2) + (stepDepth / 2));
    fireplaceGroup.add(step);
    
    // Mantle with wood sides
    const mantleWidth = fireplaceWidth + 1.5;
    const mantleDepth = fireplaceDepth + 1.5;
    const mantleHeight = 0.8;
    
    const woodCoverClone = woodCover.clone();
    woodCoverClone.wrapS = THREE.RepeatWrapping;
    woodCoverClone.wrapT = THREE.RepeatWrapping;
    woodCoverClone.repeat.set(2, 1);
    woodCoverClone.anisotropy = 16;
    woodCoverClone.colorSpace = THREE.SRGBColorSpace;
    woodCoverClone.needsUpdate = true;
    
    const woodMaterial = new THREE.MeshStandardMaterial({
        map: woodCoverClone,
        roughness: 0.7,
        metalness: 0.0
    });
    
    const mantleMaterials = [
        woodMaterial,
        woodMaterial,
        createBrickMaterial(),
        createBrickMaterial(),
        woodMaterial,
        woodMaterial
    ];
    
    const mantleGeo = new THREE.BoxGeometry(mantleWidth, mantleHeight, mantleDepth);
    const mantle = new THREE.Mesh(mantleGeo, mantleMaterials);
    mantle.position.set(0, fireplaceHeight, 0);
    fireplaceGroup.add(mantle);
    
    // Interior cavity
    const interiorFloorWidth = fireplaceWidth - wallThickness * 2;
    const interiorFloorDepth = fireplaceDepth - wallThickness;
    const interiorFloorThickness = 0.2;
    const interiorHeight = fireplaceHeight - wallThickness * 2;
    
    // Interior floor
    const interiorFloorGeo = new THREE.BoxGeometry(interiorFloorWidth, interiorFloorThickness, interiorFloorDepth);
    
    const darkFloorTexture = darkInteriorTexture.clone();
    darkFloorTexture.wrapS = THREE.RepeatWrapping;
    darkFloorTexture.wrapT = THREE.RepeatWrapping;
    darkFloorTexture.repeat.set(3, 3);
    darkFloorTexture.anisotropy = 16;
    darkFloorTexture.colorSpace = THREE.SRGBColorSpace;
    darkFloorTexture.needsUpdate = true;
    
    const interiorFloorMaterial = new THREE.MeshStandardMaterial({
        map: darkFloorTexture,
        roughness: 0.95,
        metalness: 0.0,
        emissive: 0x331100,
        emissiveIntensity: 0.15
    });
    
    const interiorFloor = new THREE.Mesh(interiorFloorGeo, interiorFloorMaterial);
    interiorFloor.position.set(0, wallThickness + interiorFloorThickness / 2, 0);
    fireplaceGroup.add(interiorFloor);
    
    // Interior back wall
    const interiorBackWallGeo = new THREE.BoxGeometry(interiorFloorWidth, interiorHeight, interiorFloorThickness);
    
    const darkBackTexture = darkInteriorTexture.clone();
    darkBackTexture.wrapS = THREE.RepeatWrapping;
    darkBackTexture.wrapT = THREE.RepeatWrapping;
    darkBackTexture.repeat.set(2, 2);
    darkBackTexture.anisotropy = 16;
    darkBackTexture.colorSpace = THREE.SRGBColorSpace;
    darkBackTexture.needsUpdate = true;
    
    const interiorBackMaterial = new THREE.MeshStandardMaterial({
        map: darkBackTexture,
        roughness: 0.95,
        metalness: 0.0,
        emissive: 0x442200,
        emissiveIntensity: 0.2
    });
    
    const interiorBackWall = new THREE.Mesh(interiorBackWallGeo, interiorBackMaterial);
    interiorBackWall.position.set(0, interiorHeight / 2 + wallThickness, -(fireplaceDepth / 2) + wallThickness + interiorFloorThickness / 2);
    fireplaceGroup.add(interiorBackWall);
    
    // Interior side walls
    const interiorSideWallGeo = new THREE.BoxGeometry(interiorFloorThickness, interiorHeight, interiorFloorDepth - interiorFloorThickness);
    
    const darkSideTexture = darkInteriorTexture.clone();
    darkSideTexture.wrapS = THREE.RepeatWrapping;
    darkSideTexture.wrapT = THREE.RepeatWrapping;
    darkSideTexture.repeat.set(1.5, 2);
    darkSideTexture.anisotropy = 16;
    darkSideTexture.colorSpace = THREE.SRGBColorSpace;
    darkSideTexture.needsUpdate = true;
    
    const interiorSideMaterial = new THREE.MeshStandardMaterial({
        map: darkSideTexture,
        roughness: 0.95,
        metalness: 0.0,
        emissive: 0x331100,
        emissiveIntensity: 0.15
    });
    
    const interiorLeftWall = new THREE.Mesh(interiorSideWallGeo, interiorSideMaterial);
    interiorLeftWall.position.set(-(interiorFloorWidth / 2) + interiorFloorThickness / 2, interiorHeight / 2 + wallThickness, interiorFloorThickness / 2);
    fireplaceGroup.add(interiorLeftWall);
    
    const interiorRightWall = new THREE.Mesh(interiorSideWallGeo, interiorSideMaterial.clone());
    interiorRightWall.position.set((interiorFloorWidth / 2) - interiorFloorThickness / 2, interiorHeight / 2 + wallThickness, interiorFloorThickness / 2);
    fireplaceGroup.add(interiorRightWall);
    
    // Interior ceiling
    const interiorCeilingGeo = new THREE.BoxGeometry(interiorFloorWidth, interiorFloorThickness, interiorFloorDepth);
    const interiorCeiling = new THREE.Mesh(interiorCeilingGeo, interiorFloorMaterial.clone());
    interiorCeiling.position.set(0, fireplaceHeight - wallThickness / 2, 0);
    fireplaceGroup.add(interiorCeiling);
    
    // Embers
    const emberMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4400,
        emissive: 0xff3300,
        emissiveIntensity: 1.5,
        roughness: 0.8,
        metalness: 0.0
    });
    
    for (let i = 0; i < 12; i++) {
        const emberSize = 0.2 + Math.random() * 0.3;
        const emberGeometry = new THREE.SphereGeometry(emberSize, 8, 8);
        const ember = new THREE.Mesh(emberGeometry, emberMaterial);
        
        ember.position.set(
            (Math.random() - 0.5) * (interiorFloorWidth - 1),
            wallThickness + interiorFloorThickness + emberSize / 2,
            (Math.random() - 0.5) * (interiorFloorDepth - 1)
        );
        
        fireplaceGroup.add(ember);
    }
    
    // Fire light
    const fireLight = new THREE.PointLight(0xff6600, 2, 15);
    fireLight.position.set(0, wallThickness + 1, 0);
    fireLight.castShadow = true;
    fireplaceGroup.add(fireLight);
    
    // Enable shadows
    fireplaceGroup.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    
    return fireplaceGroup;
}

// ============================================
// TEXTURE LOADING FUNCTIONS
// ============================================
function loadFloorTexture(room, texturePath) {
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load(texturePath, (texture) => {
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
        
        console.log('Floor texture loaded successfully');
    }, undefined, (error) => {
        console.error('Error loading floor texture:', error);
    });
}

function loadCeilingTexture(room, texturePath) {
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load(texturePath, (texture) => {
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
        
        console.log('Ceiling texture loaded successfully');
    }, undefined, (error) => {
        console.error('Error loading ceiling texture:', error);
    });
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
    
    textureLoader.load(texturePath, (baseTexture) => {
        configureTexture(baseTexture, 2);
        baseTexture.colorSpace = THREE.SRGBColorSpace;
        
        const wallMaterial = new THREE.MeshStandardMaterial({
            map: baseTexture,
            roughness: 0.9,
            metalness: 0.0,
            envMapIntensity: 0.3,
            side: THREE.DoubleSide,
            flatShading: false,
            bumpScale: 0.02,
            normalMapType: THREE.TangentSpaceNormalMap,
        });
        
        // Try to load normal map
        const normalMapPath = './src/textures/wall_4_ambient.png';
        textureLoader.load(normalMapPath, (normalTexture) => {
            configureTexture(normalTexture, 2);
            wallMaterial.normalMap = normalTexture;
            wallMaterial.normalScale = new THREE.Vector2(0.5, 0.5);
            wallMaterial.needsUpdate = true;
            console.log('Normal map loaded');
        }, undefined, () => {
            wallMaterial.bumpMap = baseTexture;
            console.log('Using base texture for bump mapping');
        });
        
        // Apply material to walls
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
        
        console.log(`Wall texture loaded for: ${wallSide}`);
    }, undefined, (error) => {
        console.error('Error loading wall texture:', error);
    });
}
// Bookshelf

function loadBookshelf(scene, position, scale, rotation = 0) {
    const loader = new GLTFLoader();
    const bookshelfGroup = new THREE.Group();
    
    console.log('🔍 Starting bookshelf load...');
    
    // Try multiple possible paths
    const paths = [
        './models/bookshelf.glb',
        './public/models/bookshelf.glb',
        'models/bookshelf.glb',
        'public/models/bookshelf.glb',
        '/models/bookshelf.glb'
    ];
    
    let currentPathIndex = 0;
    
    function attemptLoad() {
        const currentPath = paths[currentPathIndex];
     
        loader.load(
            currentPath,
            // Success callback
            function (gltf) {
                console.log('✅ SUCCESS! Bookshelf loaded from:', currentPath);
                
                const bookshelf = gltf.scene;
                
                // Apply scale
                bookshelf.scale.set(scale, scale, scale);
                
                // Log model info
                console.log('Bookshelf info:', {
                    children: bookshelf.children.length,
                    scale: bookshelf.scale
                });
                
                // Enable shadows and materials
                bookshelf.traverse((child) => {
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
                        
                        console.log('  - Mesh:', child.name || 'unnamed', 'has material:', !!child.material);
                    }
                });
                
                bookshelfGroup.add(bookshelf);
                
                // Apply position and rotation
                bookshelfGroup.position.set(position.x, position.y, position.z);
                bookshelfGroup.rotation.y = rotation;
                
                scene.add(bookshelfGroup);
                
                // Add bounding box helper for debugging
                const box = new THREE.Box3().setFromObject(bookshelfGroup);
                const size = box.getSize(new THREE.Vector3());
                console.log('📦 Bookshelf dimensions:', {
                    width: size.x.toFixed(2),
                    height: size.y.toFixed(2),
                    depth: size.z.toFixed(2)
                });
                console.log('📍 Bookshelf position:', bookshelfGroup.position);
                
               
            },
            // Progress callback
            function (xhr) {
                if (xhr.lengthComputable) {
                    const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
                    console.log(`Loading: ${percent}%`);
                }
            },
            // Error callback
            function (error) {
                console.error(`Failed to load from ${currentPath}:`, error.message);
                
                currentPathIndex++;
                if (currentPathIndex < paths.length) {
                    console.log(' Trying next path...');
                    attemptLoad();
                } else {
                    console.error('All paths failed! Creating placeholder...');
                    createBookshelfPlaceholder(scene, position, scale, rotation);
                }
            }
        );
    }
    
    attemptLoad();
    return bookshelfGroup;
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

// ============================================
// MAIN LEVEL FUNCTION
// ============================================


































export function level1_World(){

const world= new worldBuilder();
const room = new Room();




const renderer = world.ititialiseRenderer();
const scene= world.initializeScene();
const clockPuzzle= new ClockPuzzle();
const drawerPuzzle= new DrawerPuzzle();
const buttonPuzzle= new ButtonPuzzle();
const clock=clockPuzzle.createBaseClock();

const Basedrawer= drawerPuzzle.createBaseDrawer();
const combinationLockPuzzle= new CombinationLockPuzzle()
//const button= buttonPuzzle.createBaseButton();
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

// bookshelf
const bookshelf = loadBookshelf(
    scene,
    { x: -12, y: 0, z: 20},  // Position from your Room config
    6.2,                       // Scale from your Room config
    Math.PI / 2                         // Rotation (adjust if needed)
);

// Load coffee table
const coffeeTable = loadModel(
    scene,
    './models/coffee_table.glb',
    { x: 8, y: 0.3, z: 3 },
    4.5,
    { x: Math.PI / 2, y: 0, z: 0 },  // 90° vertical tilt
    'coffeeTable'
);
// Load painting
const painting = loadModel(
    scene,
    './models/painting.glb',
    { x: -21.3, y: 6.5, z: 0 },
    6.6,
    Math.PI /2,  // No rotation
    'painting'
);

// 2nd painting
const painting_2 = loadModel(
    scene,
    './models/my_haunted_painting.glb',
    { x: -21.3, y: 6.5, z: 5 },
    0.5,
   { x: 0, y: 0, z: -Math.PI/2},
    'painting_2'
);
// Load carpet
const carpet_model = loadModel(
  scene,
  './models/carpet.glb',
  {x:5 , y:0.3 , z:4 },
  0.3,
  0,
  'carpet_model'
)
// Load Table with riddleMachine
const table_model = loadModel(
  scene, 
  './models/table.glb',
  {x: 16, y : 0, z :-15.0},
  0.7,
  -Math.PI/2,
  'table_model'
)
// Load Table with lamp



const table_model_lamp = loadModel(
  scene, 
  './models/soviet_old_table.glb',
  {x: -20, y : 0.5, z :-10.0},
  7.0,
  0 ,
  'table_model_lamp'
)
// lamp for the table
const lamp = loadModel(
    scene, 
    './models/table_lamp_01.glb', 
     {x: -20, y : 3.5, z :-7.0},
    0.05,
    0 ,
    'lamp'
)

// Books
const books = loadModel(
    scene, 
    './models/books_with_magnifier.glb', 
     {x: -19.5, y : 3.5, z :-12.0},
   7.0,
    -Math.PI/2 ,
    'books'
)



// Riddle puzzle setup
const riddle = "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?";
const answer = "map";
const riddleMachine = new RiddlePuzzle(riddle, answer);
    
// Table
const table=createTable();

// Create carpet
const carpet = createCarpet();


// Fireplace
 const fireplace = createFireplace();

// light setup
 const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
 const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
 const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
 const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);

 // couches
const couch1 = createCouch(scene, {x: -10, y: 0, z: 10}, Math.PI / 2);
const couch2 = createCouch(scene, {x: 10, y: 0, z: 10}, -Math.PI);


// const lock1Control=drawerPuzzle.createBaseLock().lockControls;
// const lock1Machanism=lock1Control.lockMechanism;

world.addBaseLighting()



riddleMachine.position.set(16, 3.5, -15.0);
riddleMachine.rotation.y = -Math.PI / 2;

// Table is at X = -34.0
table.position.set(16, 0, -15.0);
table.rotation.y = -Math.PI / 2;


fireplace.position.set(20, 0, 3);
fireplace.rotation.y = -Math.PI / 2;


keyLight.position.set(15, 20, 10);
keyLight.castShadow = true;
scene.add(keyLight);

fillLight.position.set(-10, 10, -10);
scene.add(fillLight);

scene.add(ambientLight);

rimLight.position.set(0, 15, -15);
scene.add(rimLight);

couch1.position.set(0, 2, 4);
couch2.position.set(7, 2, 13);

const collidables =[
  // list of items the player is able to collide with, (everthing should be type wall)

  { mesh: room.floor, type: 'floor'},
  { mesh: room.ceiling, type: 'ceiling'},
  clock,
  drawer,
  lock1,lock2,lock3,lock4,
  drawer1,drawer2,
  button1,button2,button3,button4,
  combinationLock1,combinationLock2,combinationLock3,combinationLock4,
  
  ...Object.values(room.walls).map(w => ({ mesh: w, type: 'wall' }))
];

room.generateBaseRoom();
 loadFloorTexture(room, './src/textures/floor_level1_(1).jpg');
 loadWallTexture(room, './src/textures/wall_4.jpg', 'all');
 loadCeilingTexture(room, './src/textures/ceiling_1.jpg');


clock.mesh.scale.set(3,3,3)
clock.mesh.position.set(0, 9, -21.0);
drawer.mesh.position.set(-10,1.5,-20);


lock1.mesh.scale.set(0.3,0.3,0.3)
lock1.mesh.position.set(-7.9,2,-20.0);
lock1.mesh.rotation.y=Math.PI/2

lock2.mesh.scale.set(0.3,0.3,0.3)
lock2.mesh.rotation.y=Math.PI/2
lock2.mesh.position.set(-21.3,5,10);



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
// room.addItem(table);
 room.addItem(riddleMachine);
 room.addItem(rimLight);
 room.addItem(fireplace);
 room.addItem(fillLight);
 room.addItem(keyLight);
 room.addItem(ambientLight);
 room.addItem(couch1);
 room.addItem(couch2);

scene.add(room);

const bookshelfSpotlight1 = new THREE.SpotLight(0xffffff, 2.5, 30, Math.PI / 4, 0.2, 1.2);
bookshelfSpotlight1.position.set(1, 15, 15);
bookshelfSpotlight1.target.position.set(-12,5,20);

scene.add(bookshelfSpotlight1);
scene.add(bookshelfSpotlight1.target);

const bookshelfSpotlight2 = new THREE.SpotLight(0xffffff, 2.0, 25, Math.PI / 3, 0.3, 1.0);
bookshelfSpotlight2.position.set(10, 12, 25);
bookshelfSpotlight2.target.position.set(1, 5, 25);
scene.add(bookshelfSpotlight2);
scene.add(bookshelfSpotlight2.target);

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