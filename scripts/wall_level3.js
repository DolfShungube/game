import * as THREE from "three";



export class Wall_Level3 extends THREE.Group{

constructor(){
    super();

}

loadAdvancedWallTexture(room, wallSide = 'all') {
        const textureLoader = new THREE.TextureLoader();
        
        // Base path for wall textures
        const basePath = '/textures/rock_wall_level3/textures/';
        
        // Load all texture maps
        const diffuseMap = textureLoader.load(basePath + 'rock_wall_13_diff_4k.jpg');
        const normalMap = textureLoader.load(basePath + 'rock_wall_13_nor_gl_4k.jpg');
        const armMap = textureLoader.load(basePath + 'rock_wall_13_arm_4k.jpg'); // AO+Roughness+Metallic
        
        // Configure diffuse map
        diffuseMap.wrapS = THREE.RepeatWrapping;
        diffuseMap.wrapT = THREE.RepeatWrapping;
        diffuseMap.repeat.set(2, 2);
        diffuseMap.anisotropy = 16;
        diffuseMap.colorSpace = THREE.SRGBColorSpace;
        diffuseMap.minFilter = THREE.LinearMipmapLinearFilter;
        diffuseMap.magFilter = THREE.LinearFilter;
        diffuseMap.generateMipmaps = true;
        
        // Configure normal map
        normalMap.wrapS = THREE.RepeatWrapping;
        normalMap.wrapT = THREE.RepeatWrapping;
        normalMap.repeat.set(2, 2);
        normalMap.anisotropy = 16;
        normalMap.minFilter = THREE.LinearMipmapLinearFilter;
        normalMap.magFilter = THREE.LinearFilter;
        normalMap.generateMipmaps = true;
        
        // Configure ARM map (Ambient Occlusion + Roughness + Metallic)
        armMap.wrapS = THREE.RepeatWrapping;
        armMap.wrapT = THREE.RepeatWrapping;
        armMap.repeat.set(2, 2);
        armMap.anisotropy = 16;
        armMap.minFilter = THREE.LinearMipmapLinearFilter;
        armMap.magFilter = THREE.LinearFilter;
        armMap.generateMipmaps = true;
        
        // Create PBR material with all maps
        const wallMaterial = new THREE.MeshStandardMaterial({
            map: diffuseMap,
            normalMap: normalMap,
            normalScale: new THREE.Vector2(1.0, 1.0), // Adjust for more/less depth
            aoMap: armMap, // Use ARM map for ambient occlusion
            aoMapIntensity: 1.0,
            roughnessMap: armMap, // ARM map also contains roughness in green channel
            roughness: 1.0, // Base roughness
            metalnessMap: armMap, // ARM map also contains metallic in blue channel
            metalness: 0.0, // Base metalness
            envMapIntensity: 0.3,
            side: THREE.DoubleSide,
        });
        
        // Apply material to walls
        if (wallSide === 'all') {
            Object.keys(room.walls).forEach(side => {
                if (room.walls[side]) {
                    const clonedMaterial = wallMaterial.clone();
                    room.walls[side].material = clonedMaterial;
                    room.walls[side].receiveShadow = true;
                    room.walls[side].castShadow = false;
                    
                    // Ensure geometry has UV2 for AO map
                    if (!room.walls[side].geometry.attributes.uv2) {
                        room.walls[side].geometry.setAttribute('uv2', 
                            room.walls[side].geometry.attributes.uv);
                    }
                }
            });
        } else if (room.walls[wallSide]) {
            room.walls[wallSide].material = wallMaterial;
            room.walls[wallSide].receiveShadow = true;
            room.walls[wallSide].castShadow = false;
            
            // Ensure geometry has UV2 for AO map
            if (!room.walls[wallSide].geometry.attributes.uv2) {
                room.walls[wallSide].geometry.setAttribute('uv2', 
                    room.walls[wallSide].geometry.attributes.uv);
            }
        }
        
        console.log(`Advanced rock wall texture loaded for: ${wallSide}`);
    }



}