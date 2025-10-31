import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';



export class Player{

  isFocusing = false;   // whether we’re zoomed in on an object
focusTarget = null;   // the interactable object we’re focused on
originalCameraPos = null; // store camera before zoom
originalControlsEnabled = true; // track controls state
focusSpeed = 5; 
  maxSpeed =20;
  height =6;
  radius =0.5;
  highlighted = null;
outlineMesh = null;
raycaster = new THREE.Raycaster();

  input =new THREE.Vector3();
  velocity=new THREE.Vector3();

  gravity=-30;
  jumpStrength=15;
  vy=0;
  onGround = false;

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight);
  controls = new PointerLockControls(this.camera, document.body);

  constructor(scene,collidables=[]) {
    this.collidables=collidables;
    this.Setcontrols={forward:"KeyW",backward:"KeyZ",right:"KeyD",left:"KeyA",jump:"Space",interact:"KeyE",exitInteract:"Space"}
    this.interactionInput={forward:"false",backward:"false",right:"false",left:"false",action:"false",cancel:"false"}
    this.camera.position.set(-1, this.height * 0.9, -1);
    scene.add(this.camera);


  const reticle = document.createElement("div");
  reticle.id = "reticle";
  reticle.style.position = "absolute";
  reticle.style.top = "50%";
  reticle.style.left = "50%";
  reticle.style.width = "12px";
  reticle.style.height = "12px";
  reticle.style.marginLeft = "-6px";
  reticle.style.marginTop = "-6px";
  reticle.style.pointerEvents = "none";
  reticle.style.zIndex = "9999";
  reticle.style.display = "flex";
  reticle.style.alignItems = "center";
  reticle.style.justifyContent = "center";
  reticle.innerHTML = `
    <div style="
      width: 2px; 
      height: 12px; 
      background: white;
    "></div>
    <div style="
      width: 12px; 
      height: 2px; 
      background: white; 
      position: absolute;
    "></div>
  `;
  document.body.appendChild(reticle);



    document.addEventListener("keydown", this.onKeyDown.bind(this));
    document.addEventListener("keyup", this.onKeyUp.bind(this));
  }

removeReticle(){
      const ret = document.getElementById("reticle");
    if (ret) ret.remove();
}


applyInputs(dt){
  if (!this.controls.isLocked || this.isFocusing) return;


  const dir=this.input.clone();
  if (dir.lengthSq()>0){
    dir.normalize()
  };
  this.velocity.copy(dir).multiplyScalar(this.maxSpeed*dt);

  const oldPos=this.camera.position.clone();
  this.controls.moveRight(this.velocity.x);
  this.controls.moveForward(this.velocity.z);

  const hitH=this.checkCollisions({ horizontal: true });
  if (hitH){

    const normal=hitH.normal.clone();
    const slideDir=this.velocity.clone().projectOnPlane(normal);

    this.camera.position.copy(oldPos);
    this.controls.moveRight(slideDir.x);
    this.controls.moveForward(slideDir.z);

    if (this.checkCollisions({ horizontal: true })){
      this.camera.position.copy(oldPos);
    }
  }

  this.vy+=this.gravity*dt;
  this.camera.position.y +=this.vy*dt;

  if(this.camera.position.y<0){
    this.camera.position.set(-1, this.height * 0.9, -1);
  }

  const groundHit=this.checkGround();
  if (groundHit&&this.vy<=0) {
    this.onGround=true;
    this.vy=0;
    this.camera.position.y=groundHit.point.y+this.height*0.9;
  } else{
    this.onGround=false;
  }
}

checkGround(){
  const origin = this.camera.position.clone();
  const down = new THREE.Vector3(0, -1, 0);

  const ray =new THREE.Raycaster(origin,down,0,this.height+0.5);

  const intersects = ray.intersectObjects(this.collidables.map(c =>c.mesh),true);
  if (intersects.length >0){
    return intersects[0];
  }
  return null;
}

  checkCollisions(options = {}){

    const eyeOffset = this.height * 0.9;
    const feet = this.camera.position.clone().setY(this.camera.position.y - eyeOffset);
    const head = feet.clone().add(new THREE.Vector3(0, this.height, 0));

    for (let objData of this.collidables) {
      const { mesh, type } = objData;

      if (options.horizontal && (type === "floor"||type==="ceiling"))continue;
      if (options.vertical && type==="wall") continue;

      const box=new THREE.Box3().setFromObject(mesh);

      if (this.intersectsCapsuleBox(feet,head,this.radius,box)){
        const objCenter = new THREE.Vector3();
        box.getCenter(objCenter);

        const midPoint = feet.clone().add(head).multiplyScalar(0.5);
        let normal = midPoint.clone().sub(objCenter).normalize();

        if (options.horizontal) normal.y = 0;

        return { object: mesh, normal, surfaceY: box.max.y };
      }
    }

    return null;
  }


  intersectsCapsuleBox(feet, head, radius, box){
    const capsuleClosest = this.closestPointOnSegment(box.getCenter(new THREE.Vector3()), feet, head);
    const sphere = new THREE.Sphere(capsuleClosest, radius);
    return box.intersectsSphere(sphere);
  }

  closestPointOnSegment(p, a, b){
    const ab = b.clone().sub(a);
    const t = (p.clone().sub(a)).dot(ab) / ab.lengthSq();
    if (t < 0) return a.clone();
    if (t > 1) return b.clone();
    return a.clone().add(ab.multiplyScalar(t));
  }

  get position(){
    return this.camera.position;
  }

checkLookingAt(){
  const dir = new THREE.Vector3();
  this.camera.getWorldDirection(dir);

  this.raycaster.set(this.camera.position, dir);
  

    const validMeshes = this.collidables.filter(c => c && c.mesh).map(c => c.mesh);

  if (validMeshes.length === 0) {
    this.highlighted = null;
    return null;
  }

    const intersects = this.raycaster.intersectObjects(validMeshes, true);
  if (intersects.length > 0) {


    const obj = this.collidables.find(c => intersects[0].object === c.mesh || c.mesh.children.includes(intersects[0].object));
        
    if (obj && obj.type === "interactable"){


     
     this.highlighted = obj;
      return obj;
    }

    
  }

  this.highlighted =null;
  return null;
}


toggleFocus() {
  if (!this.isFocusing) {
    if (!this.highlighted) return;
    


    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    this.raycaster.set(this.camera.position, dir);
    const intersects = this.raycaster.intersectObjects([this.highlighted.mesh], true);
    
    if (intersects.length === 0) return;

    this.focusTarget = this.highlighted;
    this.isFocusing = true;
    this.originalCameraPos = this.camera.position.clone();
    this.originalCameraRot = this.camera.quaternion.clone();
    this.controls.enabled = false;


    if (this.focusTarget.onFocus) {
      this.focusTarget.onFocus(this);
    }

    const hitPoint = intersects[0].point;
    const faceNormal = intersects[0].face ? intersects[0].face.normal.clone() : dir.clone().negate();
    

    const worldNormal = faceNormal.clone().transformDirection(intersects[0].object.matrixWorld);


    const box = new THREE.Box3().setFromObject(this.focusTarget.mesh);
    const size = new THREE.Vector3();
    box.getSize(size);


    const fov = this.camera.fov * (Math.PI / 180);
    const aspect = this.camera.aspect;
    

    const objectSize = Math.max(size.x, size.y, size.z);
    const distanceY = (objectSize * 0.8) / Math.tan(fov / 2);
    const distanceX = (objectSize * 0.8) / (Math.tan(fov / 2) * aspect);
    
    const baseDistance = Math.max(distanceX, distanceY);
    const safeDistance = Math.max(baseDistance, 0.2);


    this.focusCenter = hitPoint.clone();
    

    this.targetPos = hitPoint.clone().add(worldNormal.multiplyScalar(safeDistance));
    

    this.targetQuat = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().lookAt(this.targetPos, this.focusCenter, new THREE.Vector3(0, 1, 0))
    );

  } else {

    if (this.focusTarget && this.focusTarget.onUnfocus) {
      this.focusTarget.onUnfocus(this);
    }

    this.isFocusing = false;
    this.focusTarget = null;
    

    this.interactionInput = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      action: false,
      cancel: false
    };
    
    this.targetPos = this.originalCameraPos;
    this.targetQuat = this.originalCameraRot;
    
    setTimeout(() => {
      if (!this.isFocusing) {
        this.controls.enabled = true;
      }
    }, 200);
  }
}


updateFocus(dt) {
  if (this.isFocusing) {

    if(this.focusTarget.onFocus){
    this.camera.position.lerp(this.targetPos, Math.min(this.focusSpeed * dt, 1));
    this.camera.quaternion.slerp(this.targetQuat, Math.min(this.focusSpeed * dt, 1));
  }
    

    if (this.focusTarget && this.focusTarget.onInteract) {
    
      this.focusTarget.onInteract(dt, this, this.interactionInput);
    }
    
  } else if (this.targetPos && !this.controls.enabled) {
    this.camera.position.lerp(this.targetPos, Math.min(this.focusSpeed * dt, 1));
    this.camera.quaternion.slerp(this.targetQuat, Math.min(this.focusSpeed * dt, 1));
    
    if (this.camera.position.distanceTo(this.targetPos) < 0.1) {
      this.controls.enabled = true;
      this.targetPos = null;
      this.targetQuat = null;
    }
  }
}
onKeyDown(event) {
  if (!this.controls.isLocked && !this.isFocusing) this.controls.lock();


  if (this.isFocusing && this.focusTarget) {
    switch (event.code) {
      case this.Setcontrols.forward:
        this.interactionInput.forward = true;
        break;
      case this.Setcontrols.backward:
        this.interactionInput.backward = true;
        break;
      case this.Setcontrols.left:
        this.interactionInput.left = true;
        break;
      case this.Setcontrols.right:
        this.interactionInput.right = true;
        break;
      case this.Setcontrols.interact:
        this.interactionInput.action = true;
        break;
      case this.Setcontrols.exitInteract:
        this.interactionInput.cancel = true;
        this.toggleFocus();
        break;
    }
    return;
  }


  switch (event.code) {
    case this.Setcontrols.forward: 
      this.input.z = 1; 
      break;
    case this.Setcontrols.backward: 
      this.input.z = -1; 
      break;
    case this.Setcontrols.left: 
      this.input.x = -1; 
      break;
    case this.Setcontrols.right: 
      this.input.x = 1; 
      break;
    case this.Setcontrols.interact: 
      this.toggleFocus();
      break;
    case this.Setcontrols.jump:
      if (this.onGround) {
        this.vy = this.jumpStrength;
        this.onGround = false;
      }
      break;
  }
}


onKeyUp(event) {
  if (this.isFocusing && this.focusTarget) {
    switch (event.code) {
      case this.Setcontrols.forward:
        this.interactionInput.forward = false;
        break;
      case this.Setcontrols.backward:
        this.interactionInput.backward = false;
        break;
      case this.Setcontrols.left:
        this.interactionInput.left = false;
        break;
      case this.Setcontrols.right:
        this.interactionInput.right = false;
        break;
      case this.Setcontrols.interact:
        this.interactionInput.action = false;
        break;
      case this.Setcontrols.exitInteract:
        this.interactionInput.cancel = false;
        break;
    }
    return;
  }


  switch (event.code){
    case this.Setcontrols.forward:
    case this.Setcontrols.backward:
      this.input.z = 0;
      break;
    case this.Setcontrols.left:
    case this.Setcontrols.right:
      this.input.x = 0;
      break;
  }
}
}