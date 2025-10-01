import * as THREE from "three";




export class Room extends THREE.Group{

    constructor(size={width:80,height:50}){
        super();
        this.size=size;

        this.walls={};
        this.floor=null;
        this.ceiling=null;

        this.generateBaseRoom();

    }
  


    generateBaseRoom(){


    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888,side:THREE.DoubleSide });
    const wallThickness = 1;
    const wallGeometry = new THREE.BoxGeometry(this.size.width, this.size.height, wallThickness);
    const halfHeight = this.size.height/2;
    const halfWidth  = this.size.width/2;

    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.set(0, halfHeight, -halfWidth + wallThickness/2);
    this.add(backWall);
    this.walls.back = backWall;

    const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
    frontWall.position.set(0, halfHeight, halfWidth - wallThickness/2);
    this.add(frontWall);
    this.walls.front = frontWall;

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, this.size.height, this.size.width), wallMaterial);
    leftWall.position.set(-halfWidth + wallThickness/2, halfHeight, 0);
    this.add(leftWall);
    this.walls.left = leftWall;

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, this.size.height, this.size.width), wallMaterial);
    rightWall.position.set(halfWidth - wallThickness/2, halfHeight, 0);
    this.add(rightWall);
    this.walls.right = rightWall;

    const floorGeometry = new THREE.PlaneGeometry(this.size.width,this.size.width);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y =0;
    this.add(floor);
    this.floor = floor;

    const ceiling = new THREE.Mesh(
      floorGeometry,
      new THREE.MeshStandardMaterial({ color: 0x555555 })
    );
    ceiling.rotation.x =Math.PI/2;
    ceiling.position.y =this.size.height;
   // this.add(ceiling);  
    this.ceiling = ceiling;
  }
  
  
  setWallTexture(side,texture){
    if (this.walls[side]){
      this.walls[side].material.map = texture;
      this.walls[side].material.needsUpdate = true;
    }
  }

  setFloorTexture(texture){
    if (this.floor){
      this.floor.material.map = texture;
      this.floor.material.needsUpdate = true;
    }
  }

  setCeilingTexture(texture){
    if (this.ceiling){
      this.ceiling.material.map = texture;
      this.ceiling.material.needsUpdate = true;
    }
  }
  
  addItem(mesh){  // we use this to add additional objects to a room
    this.add(mesh);
  }  

    

}

