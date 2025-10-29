import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


export class Ktable extends THREE.Group{

constructor(){
    super();

}

loadKitchenTable(scene, collidables) {
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



}