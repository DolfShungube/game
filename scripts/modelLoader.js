
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

export class ModelLoader extends THREE.Group{

constructor(){
    super();

}

loadModel(scene, modelUrl, position, scale, rotation = { x: 0, y: 0, z: 0 }, name = 'model') {
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


}

