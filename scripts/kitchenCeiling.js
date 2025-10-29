import * as THREE from "three";


export class KCeiling extends THREE.Group{

constructor(){
    super();

}

loadCeilingTexture(room, texturePath) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        texturePath,
        (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 4);
            texture.anisotropy = 16;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
            
            const ceilingMaterial = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.8,
                metalness: 0.0,
                envMapIntensity: 0.5,
            });
            
            if (room.ceiling) {
                room.ceiling.material = ceilingMaterial;
            }
            
            console.log('✓ Ceiling texture loaded');
        },
        undefined,
        (error) => {
            console.error('✗ Error loading ceiling texture:', error);
        }
    );
}
}