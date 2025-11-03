import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


export class Fridge extends THREE.Group{

constructor(){
    super();

}

loadFridgeModel(scene, collidables) {
    console.log('Loading fridge model...');
    const loader = new GLTFLoader();
    
    // Try with URL encoding for the path with spaces and parentheses
    const fridgePath = '/textures/house_props_fridge/scene.gltf';
    
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



}