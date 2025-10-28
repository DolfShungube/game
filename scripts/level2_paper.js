import * as THREE from 'three';

export class Paper {
  constructor(width = 6, height = 8, texturePath = null) {
    const geometry = new THREE.PlaneGeometry(width, height);
    let material;
    this.mesh = new THREE.Mesh(geometry); // 👈 create mesh early

    if (texturePath) {
      const loader = new THREE.TextureLoader();

      loader.load(texturePath, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        // Apply material now that texture is ready
        material = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.9,
          metalness: 0.0,
          side: THREE.DoubleSide,
        });

        this.mesh.material = material;

        // Fix aspect ratio properly
        const aspect = texture.image.width / texture.image.height;
        const paperAspect = width / height;
        if (aspect > paperAspect) {
          this.mesh.scale.set(1, paperAspect / aspect, 1);
        } else if (aspect < paperAspect) {
          this.mesh.scale.set(aspect / paperAspect, 1, 1);
        }
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        color: 0xfdfdfd,
        roughness: 0.9,
        metalness: 0.0,
        side: THREE.DoubleSide,
      });
      this.mesh.material = material;
    }

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }
}
