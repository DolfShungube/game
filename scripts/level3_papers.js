import * as THREE from 'three';

export class MultiplePapers extends THREE.Group {
  constructor(texturePath, noteText, position = new THREE.Vector3(0, 3, 0),page="1") {
    super();
    this.page=page
    this.name = 'InteractivePaper';
    this.noteText = noteText;
    this.texturePath = texturePath;
    this.isUIVisible = false;
    this.paperMesh = null;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // --- create paper in 3D world ---
    this.createPaperMesh();
    this.position.copy(position);

    // --- create paper UI for reading ---
    this.paperUI = this.createPaperUI();
  }

  createPaperMesh() {
    const geometry = new THREE.PlaneGeometry(0.9, 1.3);
    const texture = new THREE.TextureLoader().load(this.texturePath);
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.9,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });

    this.paperMesh = new THREE.Mesh(geometry, material);
    this.paperMesh.rotation.x = -Math.PI / 2; // flat on table
    this.paperMesh.castShadow = true;
    this.paperMesh.receiveShadow = true;

    this.add(this.paperMesh);
  }

  createPaperUI() {
    const div = document.createElement('div');
    div.id = `paper-ui-${this.uuid}`;
    div.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(20, 20, 20, 0.95);
      color: white;
      padding: 20px;
      border: 2px solid #aaa;
      width: 400px;
      height: 300px;
      overflow-y: auto;
      font-family: monospace;
      z-index: 1000;
      display: none;
    `;
    div.innerHTML = `
      <h2>Note ${this.page}</h2>
      <p>${this.noteText}</p>
      
    `;
    document.body.appendChild(div);
    
    return div;
  }

  setupInteraction(camera, player) {
    this.camera = camera;
    this.player = player;

    document.addEventListener('keydown', (event) => {

      if(event.code==player.Setcontrols.interact){

      if (this.isUIVisible) return;

      const cameraPos = this.camera.position.clone();
      const cameraDir = new THREE.Vector3();
      this.camera.getWorldDirection(cameraDir);

      const worldPos = new THREE.Vector3();
      this.getWorldPosition(worldPos);
      const toPaper = worldPos.clone().sub(cameraPos);
      const distance = toPaper.length();
      toPaper.normalize();

      const facingDot = cameraDir.dot(toPaper);
      const closeEnough = distance < 5.0;
      const lookingAt = facingDot > 0.9;

      if (closeEnough && lookingAt) {
        this.showPaper();
      }
    }
    });

    document.addEventListener('keydown', (event) => {
      if (event.code=== player.Setcontrols.exitInteract && this.isUIVisible) {
        this.hidePaper();
      }
    });

  
  }

  showPaper() {
    this.paperUI.style.display = 'block';
    this.isUIVisible = true;
    if (this.player && this.player.controls) this.player.controls.enabled = false;
  }

  hidePaper() {
    this.paperUI.style.display = 'none';
    this.isUIVisible = false;
    if (this.player && this.player.controls) this.player.controls.enabled = true;
  }
}
