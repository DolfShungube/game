import * as THREE from "three";



export class CombinationLockPuzzle extends THREE.Group{

constructor(){
    super();

}

createCombinationLock(textureArray){


    const wheelFrame = this.createFrame(1,0.7)
    wheelFrame.position.set(0,0,0.7)
    const wheelGroup = new THREE.Group();
 

    const wheelGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 32);
    const wheelMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2c3e50,
        metalness: 0.6,
        roughness: 0.4
    });


    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    
    wheelGroup.add(wheel);
    wheelGroup.add(wheelFrame)



    const radius = 0.8;
    const numbers = [];    



    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        

        const texture = textureArray[i];
        const numberMaterial = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true
        });
        
        const numberGeometry = new THREE.PlaneGeometry(0.25, 0.25);
        const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
        

        
        numberMesh.position.x = Math.sin(angle) * radius;
        numberMesh.position.z = Math.cos(angle) * radius;
        numberMesh.scale.set(3,3,3) 
        numberMesh.position.y = 0;
        

        numberMesh.rotation.z = -Math.PI / 2;
        numberMesh.rotation.y = angle;
        
        wheel.add(numberMesh);
        numbers.push(numberMesh);
    }

    const colliderGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32); // important fix,
    const colliderMaterial = new THREE.MeshBasicMaterial({ 
        visible: false
    });
    const collider = new THREE.Mesh(colliderGeometry, colliderMaterial);
    wheelGroup.add(collider);
    wheelGroup.position.set(0, 0, 0);
    
    
    return {
        mesh: wheelGroup,
        wheel: wheel,
        numbers: numbers,
        frame: wheelFrame
    };


}


createBaseCombinationLock(textureArray=this.baseTexture()){

    const lockData = this.createCombinationLock(textureArray);
    const lock = {
        mesh: lockData.mesh,
        wheel: lockData.wheel,
        frame: lockData.frame,
        type: 'interactable',
        interactionType: 'lock',

        unlocked:false,

    state: {
            currentNumber: 0,   
            rotationSpeed: 2,    
            anglePerNumber: (Math.PI * 2) / 10 
        },
        
    solutionNumber: 7, 
    solved: false,
    toleranceAngle: 0.01,

    // onFocus: function() {
    //         console.log(`Current number: ${this.state.currentNumber} | Solution: ${this.solutionNumber}`);
    //     },

     onInteract: function(dt, player, input) {
        let moved = false;

        if(this.unlocked){
            

         if (input.right && !this.lastRight) {
                this.state.currentNumber = (this.state.currentNumber + 1) % 10;
                moved = true;
            }
            

            if (input.left && !this.lastLeft) {
                this.state.currentNumber = (this.state.currentNumber - 1 + 10) % 10;
                moved = true;
            }
            
            if (moved) {
                this.updateWheel();


            }
            

            if (input.action && !this.lastAction) {
                this.checkSolution();
            }
            
            this.lastRight = input.right;
            this.lastLeft = input.left;
            this.lastAction = input.action;
        }
    }, 
        
        
        // onUnfocus: function() {
        //     if (this.solved) {
        //         console.log('✓ Lock unlocked!');
        //     } else {
        //         console.log(`Lock at ${this.state.currentNumber}`);
        //     }
        // }, 
        
        
        updateWheel: function() {

            const targetAngle = -this.state.currentNumber * this.state.anglePerNumber;
            this.wheel.rotation.y= targetAngle;
            this.checkSolution();
        },
        
        
        checkSolution: function() {
            if (this.state.currentNumber === this.solutionNumber && !this.solved) {
                this.solved = true;
                

            } else if (this.state.currentNumber !== this.solutionNumber) {
                this.solved = false;
            } 
        }        


    }

    lock.updateWheel();
    return lock;   


}


createFrame(width = 4, height = 3, thickness = 0.2, depth = 0.1){

    const frameGroup = new THREE.Group();
    const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.2
    });


    const topGeometry = new THREE.BoxGeometry(width, thickness, depth); //top bar
    const top = new THREE.Mesh(topGeometry, frameMaterial);
    top.position.y = height / 2;
    frameGroup.add(top);
    
    const bottom = new THREE.Mesh(topGeometry, frameMaterial); // bottom bar
    bottom.position.y = -height / 2;
    frameGroup.add(bottom);


    const sideGeometry = new THREE.BoxGeometry(thickness, height, depth); // left bar
    const left = new THREE.Mesh(sideGeometry, frameMaterial);
    left.position.x = -width / 2;
    frameGroup.add(left);
    
    
    const right = new THREE.Mesh(sideGeometry, frameMaterial); // right bar
    right.position.x = width / 2;
    frameGroup.add(right);

    return frameGroup



}

baseTexture(){
    //let L=["A",'B','C','D','E','F','G','H','I','J']

        let textureArray=[]

        for (let i = 0; i < 10; i++) {



        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        
        context.fillStyle = '#ffffff';
        context.font = 'bold 80px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(i.toString(), 64, 64);
        const texture = new THREE.CanvasTexture(canvas);
        textureArray.push(texture)
        }

        return textureArray


}

letterTexture(textureArray1){
    //let L=["A",'B','C','D','E','F','G','H','I','J']

        let textureArray=[]

        for (let i = 0; i < 10; i++) {



        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        
        context.fillStyle = '#ffffff';
        context.font = 'bold 80px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(textureArray1[i].toString(), 64, 64);
        const texture = new THREE.CanvasTexture(canvas);
        textureArray.push(texture)
        }

        return textureArray


}




}