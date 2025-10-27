import * as THREE from 'three';
import { Room } from './room';
import { worldBuilder } from './renderCommons';
import { Player } from './player';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { ClockPuzzle } from './clockPuzzle';
import { RiddlePuzzle } from './riddlePuzzle';


// stuff inside the level1_World function is just for testing, not final: DOLF

let gameLevelComplete=false;  // level completed or not
let gameItems=[];  // keeps track of items player has collected
let gameTimer=0;  // game time we agreed on


//creating the table in the room ,will move if needed

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

function createCouch() {
    const couchGroup = new THREE.Group();
    
    // Couch dimensions
    const seatWidth = 6;
    const seatDepth = 2.5;
    const seatHeight = 1.5;
    const backrestHeight = 3;
    const armrestWidth = 0.5;
    const armrestHeight = 2;
    
    // Load couch texture
    const textureLoader = new THREE.TextureLoader();
    const couchTexture = textureLoader.load('./src/textures/couch_texture.jpg');
    
    // Configure texture
    couchTexture.wrapS = THREE.RepeatWrapping;
    couchTexture.wrapT = THREE.RepeatWrapping;
    couchTexture.repeat.set(2, 2);
    couchTexture.anisotropy = 16;
    couchTexture.colorSpace = THREE.SRGBColorSpace;
    
    // Materials with texture
    const fabricMaterial = new THREE.MeshStandardMaterial({
        map: couchTexture,
        roughness: 0.8,
        metalness: 0.0
    });
    
    const cushionMaterial = new THREE.MeshStandardMaterial({
        map: couchTexture,
        roughness: 0.7,
        metalness: 0.0
    });
    
    // Seat base
    const seatGeometry = new THREE.BoxGeometry(seatWidth, seatHeight, seatDepth);
    const seat = new THREE.Mesh(seatGeometry, cushionMaterial);
    seat.position.set(0, seatHeight / 2, 0);
    couchGroup.add(seat);
    
    // Backrest
    const backrestGeometry = new THREE.BoxGeometry(seatWidth, backrestHeight, 0.5);
    const backrest = new THREE.Mesh(backrestGeometry, fabricMaterial);
    backrest.position.set(0, seatHeight + backrestHeight / 2, -seatDepth / 2 + 0.25);
    couchGroup.add(backrest);
    
    // Left armrest
    const armrestGeometry = new THREE.BoxGeometry(armrestWidth, armrestHeight, seatDepth);
    const leftArmrest = new THREE.Mesh(armrestGeometry, fabricMaterial);
    leftArmrest.position.set(-seatWidth / 2 - armrestWidth / 2, seatHeight + armrestHeight / 2 - 0.5, 0);
    couchGroup.add(leftArmrest);
    
    // Right armrest
    const rightArmrest = new THREE.Mesh(armrestGeometry, fabricMaterial);
    rightArmrest.position.set(seatWidth / 2 + armrestWidth / 2, seatHeight + armrestHeight / 2 - 0.5, 0);
    couchGroup.add(rightArmrest);
    
    // Add cushions on seat
    const cushionGeometry = new THREE.BoxGeometry(2.5, 0.4, 2);
    for (let i = 0; i < 2; i++) {
        const cushion = new THREE.Mesh(cushionGeometry, cushionMaterial);
        cushion.position.set(-1.5 + i * 3, seatHeight + 0.2, 0);
        couchGroup.add(cushion);
    }
    
    // Enable shadows
    couchGroup.children.forEach(mesh => {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
    });
    
    return couchGroup;
}

function createCarpet() {
    const textureLoader = new THREE.TextureLoader();
    
    const carpetWidth = 15;
    const carpetDepth = 15;
    const carpetGeometry = new THREE.PlaneGeometry(carpetWidth, carpetDepth);
    
    // Load all PBR textures for realistic rendering
    const baseTexture = textureLoader.load('./src/textures/carpet/Color.jpg');
    const normalTexture = textureLoader.load('./src/textures/carpet/NormalGL.jpg');
    const roughnessTexture = textureLoader.load('./src/textures/carpet/Roughness.jpg');
    const displacementTexture = textureLoader.load('./src/textures/carpet/Displacement.jpg');
    
    // Configure all textures
    [baseTexture, normalTexture, roughnessTexture, displacementTexture].forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8);
        texture.anisotropy = 16;
    });
    
    baseTexture.colorSpace = THREE.SRGBColorSpace;
    
    // Create PBR material with all texture maps
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
    
    // Position carpet on floor (slightly above to prevent z-fighting)
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.y = 0.01;
    carpet.position.x = 0; // Center of room
    carpet.position.z = 10; // Center of room
    
    carpet.receiveShadow = true;
    
    return carpet;
}

// Creating the fire place with realistic PBR textures
function createFireplace() {
    const fireplaceGroup = new THREE.Group();
    
    // Load all PBR brick textures
    const textureLoader = new THREE.TextureLoader();
    
    const brickColor = textureLoader.load('./src/textures/fireplace/Bricks_Color.jpg');
    const brickNormal = textureLoader.load('./src/textures/fireplace/Bricks101_NormalDX.jpg');
    const brickRoughness = textureLoader.load('./src/textures/fireplace/Bricks101_Roughness.jpg');
    const brickDisplacement = textureLoader.load('./src/textures/fireplace/Bricks_Displacement.jpg');
    const brickOcclusion = textureLoader.load('./src/textures/fireplace/Bricks_Occlusion.jpg');
    const woodCover = textureLoader.load('./src/textures/fireplace/WoodFloor041_Color.jpg');
    const darkInteriorTexture = textureLoader.load('./src/textures/fireplace/dark_Color.jpg');
    
    // Helper function to create properly wrapped brick material
    const createBrickMaterial = (width, height) => {
        // Clone textures for independent wrapping
        const colorMap = brickColor.clone();
        const normalMap = brickNormal.clone();
        const roughnessMap = brickRoughness.clone();
        const displacementMap = brickDisplacement.clone();
        const aoMap = brickOcclusion.clone();
        
        // Configure all textures with proper wrapping
        [colorMap, normalMap, roughnessMap, displacementMap, aoMap].forEach(texture => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
            texture.anisotropy = 16;
            texture.needsUpdate = true;
        });
        
        colorMap.colorSpace = THREE.SRGBColorSpace;
        
        // Create material with properly configured textures
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
    
    // Back wall of fireplace
    const backWallGeo = new THREE.BoxGeometry(fireplaceWidth, fireplaceHeight, wallThickness);
    const backWallMaterial = createBrickMaterial(fireplaceWidth, fireplaceHeight);
    const backWall = new THREE.Mesh(backWallGeo, backWallMaterial);
    backWall.position.set(0, fireplaceHeight / 2, -fireplaceDepth / 2);
    fireplaceGroup.add(backWall);
    
    // Left wall
    const sideWallGeo = new THREE.BoxGeometry(wallThickness, fireplaceHeight, fireplaceDepth);
    const leftWallMaterial = createBrickMaterial(fireplaceDepth, fireplaceHeight);
    const leftWall = new THREE.Mesh(sideWallGeo, leftWallMaterial);
    leftWall.position.set(-fireplaceWidth / 2, fireplaceHeight / 2, 0);
    fireplaceGroup.add(leftWall);
    
    // Right wall
    const rightWallMaterial = createBrickMaterial(fireplaceDepth, fireplaceHeight);
    const rightWall = new THREE.Mesh(sideWallGeo, rightWallMaterial);
    rightWall.position.set(fireplaceWidth / 2, fireplaceHeight / 2, 0);
    fireplaceGroup.add(rightWall);
    
    // Bottom (hearth/floor of fireplace)
    const hearthGeo = new THREE.BoxGeometry(fireplaceWidth, wallThickness, fireplaceDepth);
    const hearthMaterial = createBrickMaterial(fireplaceWidth, fireplaceDepth);
    const hearth = new THREE.Mesh(hearthGeo, hearthMaterial);
    hearth.position.set(0, wallThickness / 2, 0);
    fireplaceGroup.add(hearth);
    
    // Front raised step/platform - with wood sides
    const stepWidth = fireplaceWidth + 2;
    const stepDepth = 2.5;
    const stepHeight = 0.6;
    
    // Create wood material for step sides
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
    
    // Materials array: [right, left, top, bottom, front, back]
    const stepMaterials = [
        woodMaterialStep,                           // right side
        woodMaterialStep,                           // left side
        createBrickMaterial(stepWidth, stepDepth),  // top
        createBrickMaterial(stepWidth, stepDepth),  // bottom
        woodMaterialStep,                           // front side
        woodMaterialStep                            // back side
    ];
    
    const stepGeo = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
    const step = new THREE.Mesh(stepGeo, stepMaterials);
    step.position.set(0, stepHeight / 2, (fireplaceDepth / 2) + (stepDepth / 2));
    fireplaceGroup.add(step);
    
    // Top (mantle) - with wood sides
    const mantleWidth = fireplaceWidth + 1.5;
    const mantleDepth = fireplaceDepth + 1.5;
    const mantleHeight = 0.8;
    
    // Create wood material for mantle sides
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
    
    // Materials array: [right, left, top, bottom, front, back]
    const mantleMaterials = [
        woodMaterial,                                    // right side
        woodMaterial,                                    // left side
        createBrickMaterial(mantleWidth, mantleDepth),  // top
        createBrickMaterial(mantleWidth, mantleDepth),  // bottom
        woodMaterial,                                    // front side
        woodMaterial                                     // back side
    ];
    
    const mantleGeo = new THREE.BoxGeometry(mantleWidth, mantleHeight, mantleDepth);
    const mantle = new THREE.Mesh(mantleGeo, mantleMaterials);
    mantle.position.set(0, fireplaceHeight, 0);
    fireplaceGroup.add(mantle);
    
    // ===== INTERIOR CAVITY (Hollow space) =====
    
    // Calculate interior dimensions
    const interiorFloorWidth = fireplaceWidth - wallThickness * 2;
    const interiorFloorDepth = fireplaceDepth - wallThickness;
    const interiorFloorThickness = 0.2;
    const interiorHeight = fireplaceHeight - wallThickness * 2;
    
    // Interior floor (bottom of the cavity)
    const interiorFloorGeo = new THREE.BoxGeometry(
        interiorFloorWidth,
        interiorFloorThickness,
        interiorFloorDepth
    );
    
    // Configure dark interior texture for floor
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
    const interiorBackWallGeo = new THREE.BoxGeometry(
        interiorFloorWidth,
        interiorHeight,
        interiorFloorThickness
    );
    
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
    interiorBackWall.position.set(
        0,
        interiorHeight / 2 + wallThickness,
        -(fireplaceDepth / 2) + wallThickness + interiorFloorThickness / 2
    );
    fireplaceGroup.add(interiorBackWall);
    
    // Interior left wall
    const interiorSideWallGeo = new THREE.BoxGeometry(
        interiorFloorThickness,
        interiorHeight,
        interiorFloorDepth - interiorFloorThickness
    );
    
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
    interiorLeftWall.position.set(
        -(interiorFloorWidth / 2) + interiorFloorThickness / 2,
        interiorHeight / 2 + wallThickness,
        interiorFloorThickness / 2
    );
    fireplaceGroup.add(interiorLeftWall);
    
    // Interior right wall
    const interiorRightWall = new THREE.Mesh(interiorSideWallGeo, interiorSideMaterial.clone());
    interiorRightWall.position.set(
        (interiorFloorWidth / 2) - interiorFloorThickness / 2,
        interiorHeight / 2 + wallThickness,
        interiorFloorThickness / 2
    );
    fireplaceGroup.add(interiorRightWall);
    
    // Interior ceiling (top of cavity)
    const interiorCeilingGeo = new THREE.BoxGeometry(
        interiorFloorWidth,
        interiorFloorThickness,
        interiorFloorDepth
    );
    
    const interiorCeiling = new THREE.Mesh(interiorCeilingGeo, interiorFloorMaterial.clone());
    interiorCeiling.position.set(
        0,
        fireplaceHeight - wallThickness / 2,
        0
    );
    fireplaceGroup.add(interiorCeiling);
    
    // ===== EMBERS AND LIGHTING =====
    
    // Add glowing embers/coals at the bottom
    const emberGroup = new THREE.Group();
    
    const emberMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4400,
        emissive: 0xff3300,
        emissiveIntensity: 1.5,
        roughness: 0.8,
        metalness: 0.0
    });
    
    // Create 12 random ember pieces
    for (let i = 0; i < 12; i++) {
        const emberSize = 0.2 + Math.random() * 0.3;
        const emberGeometry = new THREE.SphereGeometry(emberSize, 8, 8);
        const ember = new THREE.Mesh(emberGeometry, emberMaterial);
        
        // Random position on interior floor
        ember.position.set(
            (Math.random() - 0.5) * (interiorFloorWidth - 1),
            wallThickness + interiorFloorThickness + emberSize / 2,
            (Math.random() - 0.5) * (interiorFloorDepth - 1)
        );
        
        emberGroup.add(ember);
    }
    
    fireplaceGroup.add(emberGroup);
    
    // Add point light for fire glow effect
    const fireLight = new THREE.PointLight(0xff6600, 2, 15);
    fireLight.position.set(0, wallThickness + 1, 0);
    fireLight.castShadow = true;
    fireplaceGroup.add(fireLight);
    
    // Enable shadows for all fireplace components
    fireplaceGroup.children.forEach(mesh => {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
    });
    
    return fireplaceGroup;
}

// ENHANCED: Realistic floor texture loading with PBR materials
function loadFloorTexture(room, texturePath) {
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load(
        texturePath,
        (texture) => {
            // Configure texture wrapping and repeat
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 4);
            
            // Improve texture quality
            texture.anisotropy = 16;
            
            // Use sRGB color space for correct color reproduction
            texture.colorSpace = THREE.SRGBColorSpace;
            
            // Better filtering for quality
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
            
            // Create realistic PBR material instead of basic material
            const floorMaterial = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.8,        // Slightly rough wooden floor
                metalness: 0.0,        // Wood is non-metallic
                envMapIntensity: 0.5,  // Subtle reflections
            });
            
            // Apply the material to the floor
            // Check if room has setFloorMaterial method, otherwise set directly
            if (room.setFloorMaterial) {
                room.setFloorMaterial(floorMaterial);
            } else if (room.floor) {
                room.floor.material = floorMaterial;
            }
            
            console.log('Realistic floor texture loaded successfully');
        },
        undefined,
        (error) => {
            console.error('Error loading floor texture:', error);
        }
    );
}

// Function for the texture for the ceiling
function loadCeilingTexture(room, texturePath) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        texturePath,
        (texture) => {
            // Configure texture wrapping and repeat
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 4);
            
            // Improve texture quality
            texture.anisotropy = 16;
            
            // Use sRGB color space for correct color reproduction
            texture.colorSpace = THREE.SRGBColorSpace;
            
            // Better filtering for quality
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
            
            // Create realistic PBR material
            const ceilingMaterial = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.8,
                metalness: 0.0,
                envMapIntensity: 0.5,
            });
            
            // Apply the material to the ceiling - FIXED
            if (room.ceiling) {
                room.ceiling.material = ceilingMaterial;
            }
            
            console.log('Realistic ceiling texture loaded successfully');
        },
        undefined,
        (error) => {
            console.error('Error loading ceiling texture:', error);
        }
    );
}

function loadWallTexture(room, texturePath, wallSide = 'all') {
    const textureLoader = new THREE.TextureLoader();
    
    // Function to configure texture properties
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
    
    // Load base color texture
    textureLoader.load(
        texturePath,
        (baseTexture) => {
            configureTexture(baseTexture, 2);
            baseTexture.colorSpace = THREE.SRGBColorSpace;
            
            // Create enhanced PBR material with better properties
            const wallMaterial = new THREE.MeshStandardMaterial({
                map: baseTexture,
                roughness: 0.9,           // Rough brick surface
                metalness: 0.0,           // Non-metallic
                envMapIntensity: 0.3,     // Subtle environment reflections
                side: THREE.DoubleSide,
                flatShading: false,
                
                // Enhanced lighting response
                emissive: 0x000000,
                emissiveIntensity: 0,
                
                // Better bump mapping for depth
                bumpScale: 0.02,          // Subtle surface irregularities
                
                // Displacement for geometric detail (if supported)
                displacementScale: 0.0,
                
                // Improved shading
                normalMapType: THREE.TangentSpaceNormalMap,
            });
            
            // Try to load normal map for surface detail (optional enhancement)
            const normalMapPath = './src/textures/wall_4_ambient.png';
            textureLoader.load(
                normalMapPath,
                (normalTexture) => {
                    configureTexture(normalTexture, 2);
                    wallMaterial.normalMap = normalTexture;
                    wallMaterial.normalScale = new THREE.Vector2(0.5, 0.5);
                    console.log('Normal map loaded for enhanced depth');
                    wallMaterial.needsUpdate = true;
                },
                undefined,
                () => {
                    // Fallback: use base texture as bump map
                    wallMaterial.bumpMap = baseTexture;
                    console.log('Using base texture for bump mapping');
                }
            );
            
            // Try to load roughness map (optional enhancement)
            const roughnessMapPath = texturePath.replace('.jpg', '_roughness.jpg');
            textureLoader.load(
                roughnessMapPath,
                (roughnessTexture) => {
                    configureTexture(roughnessTexture, 2);
                    wallMaterial.roughnessMap = roughnessTexture;
                    console.log('Roughness map loaded');
                    wallMaterial.needsUpdate = true;
                },
                undefined,
                () => console.log('No roughness map found, using constant value')
            );
            
            // Try to load ambient occlusion map (optional enhancement)
            const aoMapPath = texturePath.replace('.jpg', '_ao.jpg');
            textureLoader.load(
                aoMapPath,
                (aoTexture) => {
                    configureTexture(aoTexture, 2);
                    wallMaterial.aoMap = aoTexture;
                    wallMaterial.aoMapIntensity = 1.0;
                    console.log('AO map loaded for realistic shadows');
                    wallMaterial.needsUpdate = true;
                },
                undefined,
                () => console.log('No AO map found')
            );
            
            // Apply material to walls
            if (wallSide === 'all') {
                Object.keys(room.walls).forEach(side => {
                    if (room.walls[side]) {
                        const clonedMaterial = wallMaterial.clone();
                        room.walls[side].material = clonedMaterial;
                        
                        // Enable shadow receiving for realistic lighting
                        room.walls[side].receiveShadow = true;
                        room.walls[side].castShadow = false;
                    }
                });
            } else if (room.walls[wallSide]) {
                room.walls[wallSide].material = wallMaterial;
                room.walls[wallSide].receiveShadow = true;
                room.walls[wallSide].castShadow = false;
            }
            
            console.log(`Enhanced realistic wall texture loaded for: ${wallSide}`);
        },
        undefined,
        (error) => {
            console.error('Error loading wall texture:', error);
        }
    );
}

export function level1_World() {
    // --- This is for the riddle Machine ---
    const riddle = "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?";
    const answer = "map";
    const riddleMachine = new RiddlePuzzle(riddle, answer);
    // Riddle Machine is at X = -37.0 (LEFT side of the table)
    riddleMachine.position.set(-27.5, 3.2, -27.0); 

    const world = new worldBuilder();
    
    // Create room with furniture options
    const room = new Room(
        { width: 60, height: 20 },
        {
            furniture: {
                bookshelf: {
                    enabled: true,
                    position: { x: 0, y: 0, z: 13 },
                    scale: 0.7,
                    modelUrl: './models/bookshelf.glb'
                },
                coffeeTable: {
                    enabled: true, 
                    position: { x: 0, y: 2.0, z: 10 },
                    scale: 1.0,
                    modelUrl: './models/coffee_table.glb'
                },
            }
        }
    );

    const clockPuzzle = new ClockPuzzle(5);
    clockPuzzle.createBaseClock();
    const table = createTable();
    // Table is at X = -34.0
    table.position.set(-25.0, 0, -27.0);


    const fireplace = createFireplace();
    // Position fireplace against a wall (e.g., north wall at z = -30)
    fireplace.position.set(27, 0, 3);
    // rotating the fireplace
    fireplace.rotation.y = -Math.PI / 2;   // 90° - faces EAST (right wall)

    // Create two couches
    const couch1 = createCouch();
    couch1.position.set(-10, 0, 10); // Left side of room
    couch1.rotation.y = Math.PI / 2; // Face toward center

    const couch2 = createCouch();
    couch2.position.set(10, 0, 10); // Right side of room
    couch2.rotation.y = -Math.PI / 2; // Face toward center

    const collidables = [  // list of items the player is able to collide with
        { mesh: room.floor, type: 'floor' },
        { mesh: room.ceiling, type: 'ceiling'},
        { mesh: clockPuzzle, type: 'wall' },
        { mesh: table, type: 'wall'}, 
        { mesh: riddleMachine, type: 'wall'}, 
        { mesh: couch1, type: 'wall'},
        { mesh: couch2, type: 'wall'},
        // Add furniture to collidables
        ...(room.furniture.bookshelf ? [{ mesh: room.furniture.bookshelf, type: 'furniture' }] : []),
        ...(room.furniture.coffeeTable ? [{ mesh: room.furniture.coffeeTable, type: 'furniture' }] : []),
        ...Object.values(room.walls).map(w => ({ mesh: w, type: 'wall' }))
    ];

    const carpet = createCarpet();

    const renderer = world.ititialiseRenderer();
    const scene = world.initializeScene();
    world.addBaseLighting();

    // ENHANCED: Realistic Wooden Floor with PBR material
    loadFloorTexture(room, './src/textures/floor_level1_(1).jpg');
    loadWallTexture(room, './src/textures/wall_4.jpg', 'all');
    loadCeilingTexture(room, './src/textures/ceiling_1.jpg');
    
    clockPuzzle.createBaseClock();
    clockPuzzle.position.set(0, 15, -28);
    clockPuzzle.updateClockhands(245 * Math.PI / 360, 0.5);
    
    room.addItem(clockPuzzle);
    room.addItem(table);
    room.addItem(riddleMachine);
    room.addItem(couch1);
    room.addItem(couch2);
    room.addItem(fireplace);
    room.addItem(carpet);
    scene.add(room);

    const player = new Player(scene, collidables);

    world.startAnimation(player, riddleMachine);
}