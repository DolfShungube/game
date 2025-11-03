import * as THREE from "three";



export class Floor_Level3 extends THREE.Group{

constructor(){
    super();

}

loadAdvancedFloorTexture(room) {
        const textureLoader = new THREE.TextureLoader();
        
        // Base paths
        const basePath = '/textures/floor_level3/textures/';
        
        // Load all textures
        const diffuseMap = textureLoader.load(basePath + 'laminate_floor_02_diff_4k.jpg');
        const normalMap = textureLoader.load(basePath + 'laminate_floor_02_nor_gl_4k.jpg');
        const roughnessMap = textureLoader.load(basePath + 'laminate_floor_02_rough_4k.jpg');
        
        // Configure diffuse map
        diffuseMap.wrapS = THREE.RepeatWrapping;
        diffuseMap.wrapT = THREE.RepeatWrapping;
        diffuseMap.repeat.set(4, 4);
        diffuseMap.anisotropy = 16;
        diffuseMap.colorSpace = THREE.SRGBColorSpace;
        diffuseMap.minFilter = THREE.LinearMipmapLinearFilter;
        diffuseMap.magFilter = THREE.LinearFilter;
        diffuseMap.generateMipmaps = true;
        
        // Configure normal map
        normalMap.wrapS = THREE.RepeatWrapping;
        normalMap.wrapT = THREE.RepeatWrapping;
        normalMap.repeat.set(4, 4);
        normalMap.anisotropy = 16;
        normalMap.minFilter = THREE.LinearMipmapLinearFilter;
        normalMap.magFilter = THREE.LinearFilter;
        normalMap.generateMipmaps = true;
        
        // Configure roughness map
        roughnessMap.wrapS = THREE.RepeatWrapping;
        roughnessMap.wrapT = THREE.RepeatWrapping;
        roughnessMap.repeat.set(4, 4);
        roughnessMap.anisotropy = 16;
        roughnessMap.minFilter = THREE.LinearMipmapLinearFilter;
        roughnessMap.magFilter = THREE.LinearFilter;
        roughnessMap.generateMipmaps = true;
        
        // Create PBR material with all maps
        const floorMaterial = new THREE.MeshStandardMaterial({
            map: diffuseMap,
            normalMap: normalMap,
            normalScale: new THREE.Vector2(1.0, 1.0), // Adjust for more/less bump effect
            roughnessMap: roughnessMap,
            roughness: 0.9, // Base roughness value
            metalness: 0.0, // Not metallic
            envMapIntensity: 0.3,
        });
        
        // Apply to floor
        if (room.setFloorMaterial) {
            room.setFloorMaterial(floorMaterial);
        } else if (room.floor) {
            room.floor.material = floorMaterial;
        }
        
        console.log('Advanced laminate floor texture loaded with PBR maps');
    }





}