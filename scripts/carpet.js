
import * as THREE from "three";


export class Carpet extends THREE.Group{

constructor(){
    super();

}

createCarpet() {
    const textureLoader = new THREE.TextureLoader();
    const carpetWidth = 60;
    const carpetDepth = 60;
    const carpetGeometry = new THREE.PlaneGeometry(carpetWidth, carpetDepth);
    
    // Load PBR textures
    const baseTexture = textureLoader.load('./src/textures/carpet/Color.jpg');
    const normalTexture = textureLoader.load('./src/textures/carpet/NormalGL.jpg');
    const roughnessTexture = textureLoader.load('./src/textures/carpet/Roughness.jpg');
    const displacementTexture = textureLoader.load('./src/textures/carpet/Displacement.jpg');
    
    // Configure textures
    [baseTexture, normalTexture, roughnessTexture, displacementTexture].forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8);
        texture.anisotropy = 16;
    });
    
    baseTexture.colorSpace = THREE.SRGBColorSpace;
    
    const carpetMaterial = new THREE.MeshStandardMaterial({
        map: baseTexture,
        normalMap: normalTexture,
        normalScale: new THREE.Vector2(1.0, 1.0),
        roughnessMap: roughnessTexture,
        roughness: 0.9,
        metalness: 0.0,
        displacementMap: displacementTexture,
        displacementScale: 0.05,
        side: THREE.DoubleSide
    });
    
    const carpet = new THREE.Mesh(carpetGeometry, carpetMaterial);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.y = 0.01;
    carpet.position.x = 0;
    carpet.position.z = 0;
    carpet.receiveShadow = true;
    
    return carpet;
}



}

