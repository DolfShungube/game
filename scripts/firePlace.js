import * as THREE from "three";


export class FirePlace extends THREE.Group{

constructor(){
    super();

}

createFireplace() {
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





}