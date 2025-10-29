import * as THREE from "three";



export class KWall extends THREE.Group{

constructor(){
    super();

}
loadWallTexture(room, texturePath, wallSide = 'all') {
    const textureLoader = new THREE.TextureLoader();
    
    const configureTexture = (texture, repeatScale = 2) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatScale, repeatScale);
        texture.anisotropy = 16;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        return texture;
    };
    
    textureLoader.load(
        texturePath,
        (baseTexture) => {
            configureTexture(baseTexture, 2);
            baseTexture.colorSpace = THREE.SRGBColorSpace;
            
            const wallMaterial = new THREE.MeshStandardMaterial({
                map: baseTexture,
                roughness: 0.9,
                metalness: 0.0,
                envMapIntensity: 0.3,
                side: THREE.DoubleSide,
                flatShading: false,
                emissive: 0x000000,
                emissiveIntensity: 0,
                bumpScale: 0.02,
                displacementScale: 0.0,
                normalMapType: THREE.TangentSpaceNormalMap,
            });
            
            if (wallSide === 'all') {
                Object.keys(room.walls).forEach(side => {
                    if (room.walls[side]) {
                        const clonedMaterial = wallMaterial.clone();
                        room.walls[side].material = clonedMaterial;
                        room.walls[side].receiveShadow = true;
                        room.walls[side].castShadow = false;
                    }
                });
            } else if (room.walls[wallSide]) {
                room.walls[wallSide].material = wallMaterial;
                room.walls[wallSide].receiveShadow = true;
                room.walls[wallSide].castShadow = false;
            }
            
            console.log(`✓ Wall texture loaded for: ${wallSide}`);
        },
        undefined,
        (error) => {
            console.error('✗ Error loading wall texture:', error);
        }
    );
}
}