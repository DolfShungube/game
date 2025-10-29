import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


export class Stove extends THREE.Group{

constructor(){
    super();

}

loadStoveModel(scene, collidables) {
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



}