import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


export class Couch extends THREE.Group{

constructor(){
    super();

}

createCouch(scene, position, rotation) {
    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    const couchGroup = new THREE.Group();
    
    // Load couch textures
    const diffuseMap = textureLoader.load('/textures/couch/textures/wire_196088225_diffuse.png');
    const normalMap = textureLoader.load('/textures/couch/textures/wire_196088225_normal.png');
    const specularMap = textureLoader.load('/textures/couch/textures/wire_196088225_specularGlossiness.png');
    
    // Configure textures
    [diffuseMap, normalMap, specularMap].forEach(texture => {
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.anisotropy = 16;
        texture.flipY = false;
    });
    
    diffuseMap.colorSpace = THREE.SRGBColorSpace;
    
    loader.load('/textures/couch_2.glb', function (gltf) {
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



}