import * as THREE from 'three';

export class TextureObject extends THREE.Group {
    constructor() {
        super();
    }

    createTexturePlane(texturePath, width = 3, height = 2) {
        const textureLoader = new THREE.TextureLoader();
        
        // Load the texture with higher quality settings
        const texture = textureLoader.load(texturePath);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter; // Better for scaling down
        texture.magFilter = THREE.LinearFilter; // Better for scaling up
        texture.anisotropy = this.renderer ? this.renderer.capabilities.getMaxAnisotropy() : 16;
        texture.generateMipmaps = true;
        
        // Create material with the texture
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: false,
            side: THREE.DoubleSide,
            roughness: 0.8, // Less shiny
            metalness: 0.1  // Less reflective
        });

        // Create plane geometry
        const geometry = new THREE.PlaneGeometry(width, height);
        const plane = new THREE.Mesh(geometry, material);
        
        // Enable shadows
        plane.castShadow = false;
        plane.receiveShadow = true;

        this.add(plane);
        return this;
    }

    // Updated framed document method with better settings
    createFramedDocument(texturePath, frameWidth = 3.5, frameHeight = 2.5) {
        const group = new THREE.Group();

        // Create frame
        const frameMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513, // Dark wood color
            roughness: 0.9,   // Less reflective
            metalness: 0.1
        });
        
        const frameGeometry = new THREE.BoxGeometry(frameWidth, frameHeight, 0.1);
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.z = -0.05;
        
        // Create document with texture - IMPROVED TEXTURE SETTINGS
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(texturePath);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = this.renderer ? this.renderer.capabilities.getMaxAnisotropy() : 16;
        texture.generateMipmaps = true;
        
        const documentMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
            roughness: 0.9,    // Much less shiny to reduce glare
            metalness: 0.0,    // No metalness
            emissive: 0x000000, // No self-illumination
            emissiveIntensity: 0
        });
        
        const documentGeometry = new THREE.PlaneGeometry(frameWidth - 0.2, frameHeight - 0.2);
        const document = new THREE.Mesh(documentGeometry, documentMaterial);
        document.position.z = 0.01;

        group.add(frame);
        group.add(document);
        
        this.add(group);
        return this;
    }
}