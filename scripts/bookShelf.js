import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";


export class BookShelf extends THREE.Group{

constructor(){
    super();

}

loadBookshelf(scene, position, scale, rotation = 0) {
    const loader = new GLTFLoader();
    const bookshelfGroup = new THREE.Group();
    
    console.log('🔍 Starting bookshelf load...');
    
    // Try multiple possible paths
    const paths = [
        './models/bookshelf.glb',
        '../public/models/bookshelf.glb',
        'models/bookshelf.glb',
        '../public/models/bookshelf.glb',
        '/models/bookshelf.glb'
    ];
    
    let currentPathIndex = 0;
    
    function attemptLoad() {
        const currentPath = paths[currentPathIndex];
     
        loader.load(
            currentPath,
            // Success callback
            function (gltf) {
                console.log('✅ SUCCESS! Bookshelf loaded from:', currentPath);
                
                const bookshelf = gltf.scene;
                
                // Apply scale
                bookshelf.scale.set(scale, scale, scale);
                
                // Log model info
                console.log('Bookshelf info:', {
                    children: bookshelf.children.length,
                    scale: bookshelf.scale
                });
                
                // Enable shadows and materials
                bookshelf.traverse((child) => {
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
                        
                        console.log('  - Mesh:', child.name || 'unnamed', 'has material:', !!child.material);
                    }
                });
                
                bookshelfGroup.add(bookshelf);
                
                // Apply position and rotation
                bookshelfGroup.position.set(position.x, position.y, position.z);
                bookshelfGroup.rotation.y = rotation;
                
                scene.add(bookshelfGroup);
                
                // Add bounding box helper for debugging
                const box = new THREE.Box3().setFromObject(bookshelfGroup);
                const size = box.getSize(new THREE.Vector3());
                console.log('📦 Bookshelf dimensions:', {
                    width: size.x.toFixed(2),
                    height: size.y.toFixed(2),
                    depth: size.z.toFixed(2)
                });
                console.log('📍 Bookshelf position:', bookshelfGroup.position);
                
               
            },
            // Progress callback
            function (xhr) {
                if (xhr.lengthComputable) {
                    const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
                    console.log(`Loading: ${percent}%`);
                }
            },
            // Error callback
            function (error) {
                console.error(`Failed to load from ${currentPath}:`, error.message);
                
                currentPathIndex++;
                if (currentPathIndex < paths.length) {
                    console.log(' Trying next path...');
                    attemptLoad();
                } else {
                    console.error('All paths failed! Creating placeholder...');
                    createBookshelfPlaceholder(scene, position, scale, rotation);
                }
            }
        );
    }
    
    attemptLoad();
    return bookshelfGroup;
}





}