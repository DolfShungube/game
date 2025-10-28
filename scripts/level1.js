import * as THREE from 'three';
import { Room } from './room';
import { worldBuilder } from './renderCommons';
import { Player } from './player';
import { OrbitControls, ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import { ClockPuzzle } from './clockPuzzle';
import { RiddlePuzzle } from './riddlePuzzle';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { fill } from 'three/src/extras/TextureUtils.js';

// Global game state variables
let gameLevelComplete = false;
let gameItems = [];
let gameTimer = 0;

// ============================================
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

// ============================================
// MAIN LEVEL FUNCTION
// ============================================
export function level1_World() {
    // Riddle puzzle setup
    const riddle = "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?";
    const answer = "map";
    const riddleMachine = new RiddlePuzzle(riddle, answer);
    riddleMachine.position.set(16, 3.2, -15.0);
    riddleMachine.rotation.y = -Math.PI / 2;
    
    // Initialize world and room
    const world = new worldBuilder();
    const room = new Room();
    const clockPuzzle = new ClockPuzzle(5);
    
    const renderer = world.ititialiseRenderer();
    const scene = world.initializeScene();
    world.addBaseLighting();
    
    // Create table with fixed textures
  
    
    const table=createTable();
// Table is at X = -34.0
table.position.set(16, 0, -15.0);
table.rotation.y = -Math.PI / 2;
    
    // Create carpet
    const carpet = createCarpet();
    
    // Create fireplace
    const fireplace = createFireplace();
    fireplace.position.set(20, 0, 3);
    fireplace.rotation.y = -Math.PI / 2;
    
    // Create lighting setup
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(15, 20, 10);
    keyLight.castShadow = true;
    scene.add(keyLight);
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(0, 15, -15);
    scene.add(rimLight);
    
    // Create couches
    const couch1 = createCouch(scene, {x: -10, y: 0, z: 10}, Math.PI / 2);
    couch1.position.set(0, 2, 4);
    
    const couch2 = createCouch(scene, {x: 10, y: 0, z: 10}, -Math.PI);
    couch2.position.set(7, 2, 13);
    
    // Setup collidables
    const collidables = [
        { mesh: room.floor, type: 'floor' },
        { mesh: room.ceiling, type: 'ceiling' },
        { mesh: clockPuzzle, type: 'wall' },
        { mesh: table, type: 'wall' },
        { mesh: riddleMachine, type: 'wall' },
        { mesh: couch1, type: 'wall' },
        { mesh: couch2, type: 'wall' },
        ...Object.values(room.walls).map(w => ({ mesh: w, type: 'wall' }))
    ];
    
    // Generate room and load textures
    room.generateBaseRoom();
    loadFloorTexture(room, './src/textures/floor_level1_(1).jpg');
    loadWallTexture(room, './src/textures/wall_4.jpg', 'all');
    loadCeilingTexture(room, './src/textures/ceiling_1.jpg');
    
    // Setup clock puzzle
    clockPuzzle.createBaseClock();
    clockPuzzle.position.set(0, 15, -28);
    clockPuzzle.updateClockhands(245 * Math.PI / 360, 0.5);
    
    // Add all items to room
    room.addItem(clockPuzzle);
    room.addItem(table);
    room.addItem(riddleMachine);
    room.addItem(rimLight);
    room.addItem(fillLight);
    room.addItem(keyLight);
    room.addItem(ambientLight);
    room.addItem(couch1);
    room.addItem(couch2);
    // room.addItem(carpet); // Uncomment if you want to add the carpet
    room.addItem(fireplace);
    
    scene.add(room);
    
    // Create player
    const player = new Player(scene, collidables);
    
    // Start animation
    world.startAnimation(player, riddleMachine);
}