
// class for this puzzle goes here, including creating base object

// same as password puzzle
// four comparePuzzle objects, this time each has its own items array,just the current angle of rotation
//item list will have one item, angle of rotation of each "lock" some fixed point 
// compare against expected angle, maybe all a small variation
// once all 4 locks are solved drawer can be opened


import * as THREE from "three";
export class DrawerPuzzle extends THREE.Group{

constructor(){
    super();

}

createDrawer() {

    const lock1=this.createBaseLock();
    const lock1Control=lock1.lockControls;
    const lock1Machanism=lock1Control.lockMechanism

    const lock2=this.createBaseLock();
    const lock2Control=lock2.lockControls;
    const lock2Machanism=lock2Control.lockMechanism  
    
    
    const lock3=this.createBaseLock();
    const lock3Control=lock3.lockControls;
    const lock3Machanism=lock3Control.lockMechanism   
    
    
    const lock4=this.createBaseLock();
    const lock4Control=lock4.lockControls;
    const lock4Machanism=lock4Control.lockMechanism  


    const drawerContainer = new THREE.Group();
    const frameWidth = 4;
    const frameHeight = 2;
    const frameDepth = 3;
    const frameThickness = 0.1;

    const backGeometry = new THREE.BoxGeometry(frameWidth, frameHeight, frameThickness);
    const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.2
    });

    const back = new THREE.Mesh(backGeometry, frameMaterial); // back side
    back.position.z = -frameDepth / 2;
    drawerContainer.add(back);

    const bottomGeometry = new THREE.BoxGeometry(frameWidth, frameThickness, frameDepth); // bottom
    const bottom = new THREE.Mesh(bottomGeometry, frameMaterial);
    bottom.position.y = -frameHeight / 2;
    drawerContainer.add(bottom);


    const top = new THREE.Mesh(bottomGeometry, frameMaterial); // top
    top.position.y = frameHeight / 2;
    drawerContainer.add(top);

    const sideGeometry = new THREE.BoxGeometry(frameThickness, frameHeight, frameDepth);// l side
    const leftSide = new THREE.Mesh(sideGeometry, frameMaterial);
    leftSide.position.x = -frameWidth / 2;
    drawerContainer.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeometry, frameMaterial); // r side
    rightSide.position.x = frameWidth / 2;
    drawerContainer.add(rightSide);


    const dividerGeometry = new THREE.BoxGeometry(frameWidth, frameThickness, frameDepth);
    const divider = new THREE.Mesh(dividerGeometry, frameMaterial);
    divider.position.y = 0; // Middle of the drawer
    drawerContainer.add(divider);

    // lock4Machanism.mesh.rotation.z=2*Math.PI
    // lock3Machanism.mesh.rotation.z=3*Math.PI/2
    // lock2Machanism.mesh.rotation.z=Math.PI
    // lock1Machanism.mesh.rotation.z=Math.PI/2

    lock1Control.solutionAngle=3*Math.PI/2
    lock2Control.solutionAngle=Math.PI
    lock3Control.solutionAngle=Math.PI/2
    lock4Control.solutionAngle=0

    lock1Machanism.mesh.position.set(1.94,0.07,1.52);
    lock1Machanism.mesh.scale.set(0.125,0.125,0.125);
    drawerContainer.add(lock1Machanism.mesh)

    lock2Machanism.mesh.position.set(1.94,0.95,1.52);
    lock2Machanism.mesh.scale.set(0.125,0.125,0.125);
    drawerContainer.add(lock2Machanism.mesh)
    
    lock3Machanism.mesh.position.set(-1.94,0.95,1.52);
    lock3Machanism.mesh.scale.set(0.125,0.125,0.125);
    drawerContainer.add(lock3Machanism.mesh) 

    lock4Machanism.mesh.position.set(-1.94,0.07,1.52);
    lock4Machanism.mesh.scale.set(0.125,0.125,0.125);
    drawerContainer.add(lock4Machanism.mesh) 



    const compartment1 = new THREE.Group();
    const compWidth = frameWidth - 0.4;
    const compHeight = 0.8;
    const compDepth = frameDepth - 0.3;

    const comp1FrontGeometry = new THREE.BoxGeometry(compWidth, compHeight, 0.15); //front face
    const comp1Material = new THREE.MeshStandardMaterial({ 
        color: 0xA0522D,
        roughness: 0.7,
        metalness: 0.3
    })


    const comp1Front = new THREE.Mesh(comp1FrontGeometry, comp1Material);
    comp1Front.position.z = frameDepth /2.1;
    compartment1.add(comp1Front);

    const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 16); // comp 1 handle
    const handleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x444444,
        metalness: 0.8,
        roughness: 0.3
    });   
    
    const handle1 = new THREE.Mesh(handleGeometry, handleMaterial);
    handle1.rotation.z = Math.PI / 2;
    handle1.position.z = frameDepth / 2+0.13;
    compartment1.add(handle1);
    
    compartment1.position.y = frameHeight / 4;
    compartment1.position.z = 0.2;
    drawerContainer.add(compartment1);


    const comp1BottomGeometry = new THREE.BoxGeometry(compWidth, 0.05, compDepth);
    const comp1Bottom = new THREE.Mesh(comp1BottomGeometry, frameMaterial);
    comp1Bottom.position.z = 0.15;
    comp1Bottom.position.y = -compHeight / 2;
    compartment1.add(comp1Bottom);
    
    // Compartment 1 left wall
    const comp1LeftWallGeometry = new THREE.BoxGeometry(0.05, compHeight, compDepth);
    const comp1LeftWall = new THREE.Mesh(comp1LeftWallGeometry, frameMaterial);
    comp1LeftWall.position.x = -compWidth / 2;
    comp1LeftWall.position.z = 0.15;
    compartment1.add(comp1LeftWall);
    
    // Compartment 1 right wall
    const comp1RightWall = new THREE.Mesh(comp1LeftWallGeometry, frameMaterial);
    comp1RightWall.position.x = compWidth / 2;
    comp1RightWall.position.z = 0.15;
    compartment1.add(comp1RightWall);    
    
    const compartment2 = new THREE.Group();
    
    const comp2Front = new THREE.Mesh(comp1FrontGeometry, comp1Material.clone()); //face
    comp2Front.material.color.setHex(0x8B7355);
    comp2Front.position.z = frameDepth /2;
    compartment2.add(comp2Front);


    // Compartment 2 bottom
    const comp2Bottom = new THREE.Mesh(comp1BottomGeometry, frameMaterial);
    comp2Bottom.position.z = 0.2;
    comp2Bottom.position.y = -compHeight / 2;
    compartment2.add(comp2Bottom);
    
    // Compartment 2 left wall
    const comp2LeftWall = new THREE.Mesh(comp1LeftWallGeometry, frameMaterial);
    comp2LeftWall.position.x = -compWidth / 2;
    comp2LeftWall.position.z = 0.2;
    compartment2.add(comp2LeftWall);
    
    // Compartment 2 right wall
    const comp2RightWall = new THREE.Mesh(comp1LeftWallGeometry, frameMaterial);
    comp2RightWall.position.x = compWidth / 2;
    comp2RightWall.position.z = 0.2;
    compartment2.add(comp2RightWall);
    
    
    const handle2 = new THREE.Mesh(handleGeometry, handleMaterial); // comp 2 handle
    handle2.rotation.z = Math.PI / 2;
    handle2.position.z = frameDepth / 2 + 0.13;
    compartment2.add(handle2);






    compartment2.position.y = -frameHeight / 4;
    compartment2.position.z = 0;
    drawerContainer.add(compartment2);


    drawerContainer.position.set(0, 2, -5);



    return {
        container: drawerContainer,
        compartment1: compartment1,
        compartment2: compartment2,
        lock1Control:lock1Control,
        lock2Control:lock2Control,
        lock3Control:lock3Control,
        lock4Control:lock4Control
    };

}


createBaseDrawer(){

    

    const drawerData = this.createDrawer();


    const mainDrawer={
        mesh:drawerData.container,
        type: "wall"
    }
    const drawer1 = {

        mesh: drawerData.compartment1,
        type: 'interactable',
        interactionType: 'drawer',
        solved: false,
        
        state: {
            isOpen: false,
            openAmount: 0,
            maxOpen: 2.5,
            speed: 1.5
        },
        
        onFocus: function() {

        },
        
        onInteract: function(dt, player, input) {
            if (this.solved && input.forward && (!this.state.isOpen||this.openAmount==0)) {
                this.state.openAmount += dt * this.state.speed;
                if (this.state.openAmount >= this.state.maxOpen) {
                    this.state.openAmount = this.state.maxOpen;
                    this.state.isOpen = true;
                }
            }
            
            if (this.solved && input.backward && this.state.openAmount > 0) {
                this.state.openAmount -= dt * this.state.speed;
                if (this.state.openAmount <= 0) {
                    this.state.openAmount = 0;
                    this.state.isOpen = false;
                }
            }
            
            this.updateDrawer();
        },

            onUnfocus: function() {
        },
        
        updateDrawer: function(){
            this.mesh.position.z = this.state.openAmount;
            this.checkSolved();
        },
        checkSolved: function(){
            drawerData.lock1Control.updateSolved();
            drawerData.lock2Control.updateSolved();
            drawerData.lock3Control.updateSolved();
            drawerData.lock4Control.updateSolved();

          //  console.log(drawerData.lock1Control.solved,drawerData.lock2Control.solved,drawerData.lock3Control.solved, drawerData.lock4Control.solved )
            

        
            if(
                drawerData.lock1Control.solved 
               &&
                drawerData.lock2Control.solved
                 &&
                drawerData.lock3Control.solved
                &&
                 drawerData.lock4Control.solved
            ){
                this.solved=true;
            }else{
                this.solved=false;
            }
        }   
    }


    const drawer2 = {
        mesh: drawerData.compartment2,
        type: 'interactable',
        interactionType: 'drawer',
        
        state: {
            isOpen: false,
            openAmount: 0,
            maxOpen: 2.5,
            speed: 1.5
        },
        
        onFocus: function(){

        },
        
        onInteract: function(dt, player, input) {
            if (input.forward && !this.state.isOpen) {
                this.state.openAmount += dt * this.state.speed;
                if (this.state.openAmount >= this.state.maxOpen) {
                    this.state.openAmount = this.state.maxOpen;
                    this.state.isOpen = true;
                }
            }
            
            if (input.backward && this.state.openAmount > 0) {
                this.state.openAmount -= dt * this.state.speed;
                if (this.state.openAmount <= 0) {
                    this.state.openAmount = 0;
                    this.state.isOpen = false;
                }
            }
            
            this.updateDrawer();
        },
        
        onUnfocus: function(){

        },
        
        updateDrawer: function() {
            this.mesh.position.z = this.state.openAmount;
        }
    }
    
    drawer1.updateDrawer();
    drawer2.updateDrawer();


    return { drawer1, drawer2, container: mainDrawer,lock1:drawerData.lock1Control,

        lock2:drawerData.lock2Control,lock3:drawerData.lock3Control,lock4:drawerData.lock4Control
     };

}







createDrawerLock(){


    const lockGroup = new THREE.Group();
    const lockPair= new THREE.Group();
    const faceGeometry = new THREE.CircleGeometry(1,32,0,2*Math.PI);
    const faceMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff,metalness: 0.3,roughness: 0.7,side: THREE.DoubleSide});

    const lockFace = new THREE.Mesh(faceGeometry, faceMaterial);
    lockFace.rotation.z = Math.PI / 2;

    const rimGeometry = new THREE.TorusGeometry(1,0.05,16,32,Math.PI * 1.5);
    const rimMaterial = new THREE.MeshStandardMaterial({ color: 0x333333,metalness: 0.8,roughness: 0.2});

    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.z = Math.PI / 2;

    lockGroup.add(rim);
    lockGroup.add(lockFace);




    const faceGeometryL = new THREE.CircleGeometry(1,32,0,Math.PI*1.5);
    const faceMaterialL = new THREE.MeshStandardMaterial({ color: 0xffffff,metalness: 0.3,roughness: 0.7,side: THREE.DoubleSide});

    const lockFaceL = new THREE.Mesh(faceGeometryL, faceMaterialL);
    lockFaceL.rotation.z = Math.PI / 2;

    const rimGeometryL = new THREE.TorusGeometry(1,0.05,16,32,Math.PI * 1.5);
    const rimMaterialL = new THREE.MeshStandardMaterial({ color: 0x333333,metalness: 0.8,roughness: 0.2});

    const rimL = new THREE.Mesh(rimGeometryL, rimMaterialL);
    rimL.rotation.z = Math.PI / 2;
   



    lockPair.add(lockFaceL);
    lockPair.add(rimL)
    lockGroup.position.set(0, 0, 0);
    lockPair.position.set(0, 0, 0);


    // const helper = new THREE.AxesHelper(2);
    // lockPair.add(helper);



    return {
        mesh:lockGroup,
        PairMesh:lockPair
    }

}


createBaseLock(){
const lockData= this.createDrawerLock();

 

const lockMechanism={
        mesh: lockData.PairMesh,
        type: 'wall',
        interactionType: 'lock',
        update: function(rotationAngle) {
            if (this.mesh) {
                this.mesh.rotation.z = -rotationAngle;
            }
        }

}


    const lockControl={
        mesh: lockData.mesh,
        type: 'interactable',
        interactionType: 'lock',
        rotationAngle:0,

        state:{
            angle:0,
            rotationSpeed:1.5
        },
        lockMechanism: lockMechanism,
        toleratableVariation:0.2,
       solutionAngle:0,
       solved:false,
       
       

    onFocus: function(){
        
    },

    onInteract: function(dt, player, input){

        this.lastAction = input.action;

        if (input.right){
            this.state.angle += dt * this.state.rotationSpeed;
            if (this.state.angle >=2*Math.PI) this.state.angle -=2*Math.PI;
        }

        if(input.left){
            this.state.angle -= dt * this.state.rotationSpeed;
             if (this.state.angle <0) this.state.angle += 2*Math.PI;

        }

        if (input.action && !this.lastAction){
            this.state.angle = Math.round(this.state.angle / 5) * 5;
            if (this.state.angle >= 2*Math.PI) this.state.angle = 0;
        }        

        this.updateLock();

    },
    onUnfocus: function(){

    },
    updateLock: function(){

            this.rotationAngle =this.state.angle;
            this.updateSolved();

            if(this.lockMechanism && this.lockMechanism.mesh){
           this.lockMechanism.update(this.rotationAngle)};          
            this.mesh.rotation.z= -this.rotationAngle;
                    
    },updateSolved: function(){


        const solutionRadians = this.solutionAngle;

        // console.log("s",solutionRadians)
        // console.log("r",this.rotationAngle)
        // console.log("d",this.rotationAngle-solutionRadians)
        

    if( Math.abs(this.rotationAngle-solutionRadians)<=this.toleratableVariation){

            this.solved=true;

    }else{
        this.solved=false;
    }

}   


    }


    lockControl.updateLock();
    return {lockControls:lockControl};

}


}