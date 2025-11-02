
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

export class ModelLoader extends THREE.Group{

constructor(){
    super();

}


loadModel(scene, modelUrl, position, scale, rotation = { x: 0, y: 0, z: 0 }, name = 'model') {
    const loader = new GLTFLoader();
    const modelGroup = new THREE.Group();
    

    if (typeof rotation === 'number') {
        rotation = { x: 0, y: rotation, z: 0 };
    }
    

    
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

        
        loader.load(
            currentPath,
            // Success callback
            function (gltf) {

                
                const model = gltf.scene;
                
                // Apply scale
                model.scale.set(scale, scale, scale);
                

                
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


            },
            // Progress callback
            function (xhr) {
                if (xhr.lengthComputable) {
                    const percent = (xhr.loaded / xhr.total * 100).toFixed(0);

                }
            },
            // Error callback
            function (error) {

                
                currentPathIndex++;
                if (currentPathIndex < paths.length) {

                    attemptLoad();
                } else {
                    createPlaceholder(scene, position, scale, rotation, name);
                }
            }
        );
    }
    
    attemptLoad();
    return modelGroup;
}


}

