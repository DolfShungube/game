
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';



export class Player{
  maxSpeed =30;
  height =6;
  radius =1.5;

  input =new THREE.Vector3();
  velocity=new THREE.Vector3();

  gravity=-30;
  jumpStrength=15;
  vy=0;
  onGround = false;

  camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight,0.01,1000);
  controls = new PointerLockControls(this.camera, document.body);

  constructor(scene,collidables=[]) {
    this.collidables=collidables;
    this.Setcontrols={forward:"KeyW",backward:"KeyZ",right:"KeyD",left:"KeyA",jump:"Space"}
    this.camera.position.set(0, this.height * 0.9, 0);
    scene.add(this.camera);

    document.addEventListener("keydown", this.onKeyDown.bind(this));
    document.addEventListener("keyup", this.onKeyUp.bind(this));
  }


applyInputs(dt){
  if (!this.controls.isLocked) return;

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

  onKeyDown(event) {
    if (!this.controls.isLocked) this.controls.lock();

    switch (event.code) {
      case this.Setcontrols.forward: this.input.z = 1; break;
      case this.Setcontrols.backward: this.input.z = -1; break;
      case this.Setcontrols.left: this.input.x = -1; break;
      case this.Setcontrols.right: this.input.x = 1; break;
      case this.Setcontrols.jump:
        if (this.onGround){
          this.vy = this.jumpStrength;
          this.onGround = false;
        }
        break;
    }
  }

  onKeyUp(event){
    switch (event.code) {
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
