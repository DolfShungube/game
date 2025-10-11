import * as THREE from "three";

export class ClockPuzzle extends THREE.Group{

constructor(){
    super();

}


createClock(){

    const clockGroup = new THREE.Group();
    

    const faceGeometry = new THREE.CylinderGeometry(1, 1, 0.1, 32);
    const faceMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        metalness: 0.3,
        roughness: 0.7
    });
    const clockFace = new THREE.Mesh(faceGeometry, faceMaterial);
    clockFace.rotation.x = Math.PI / 2; 
    

    const rimGeometry = new THREE.TorusGeometry(1, 0.05, 16, 32);
    const rimMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        metalness: 0.8,
        roughness: 0.2
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.x = Math.PI / 2;
    clockFace.add(rim);
    
    clockGroup.add(clockFace);
    
    for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12;
        

        const markerGeometry = new THREE.BoxGeometry(0.06, 0.2, 0.04);
        const markerMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        
        
        marker.position.x = Math.sin(angle) * 0.85;
        marker.position.y = Math.cos(angle) * 0.85;
        marker.position.z = 0.06;
        
        clockGroup.add(marker);
    }
    
    
    const hourPivot = new THREE.Group();
    hourPivot.position.z = 0.08; 
    
    const hourGeometry = new THREE.BoxGeometry(0.08, 0.5, 0.06);
    const hourMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x222222,
        metalness: 0.5,
        roughness: 0.5
    });
    const hourHand = new THREE.Mesh(hourGeometry, hourMaterial);
    hourHand.position.y = 0.25;
    
    hourPivot.add(hourHand);
    clockGroup.add(hourPivot);
    
   
    const minutePivot = new THREE.Group();
    minutePivot.position.z = 0.10; 
    
    const minuteGeometry = new THREE.BoxGeometry(0.06, 0.8, 0.05);
    const minuteMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x444444,
        metalness: 0.5,
        roughness: 0.5
    });
    const minuteHand = new THREE.Mesh(minuteGeometry, minuteMaterial);
    minuteHand.position.y = 0.4;
    
    minutePivot.add(minuteHand);
    clockGroup.add(minutePivot);
    

    const pinGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16);
    const pinMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xaa0000,
        metalness: 0.8,
        roughness: 0.2
    });
    const pin = new THREE.Mesh(pinGeometry, pinMaterial);
    pin.rotation.x = Math.PI / 2;
    pin.position.z = 0.14;
    clockGroup.add(pin);
    

    clockGroup.position.set(0, 0, 0);

    return {
        mesh: clockGroup,
        hourPivot: hourPivot,
        minutePivot: minutePivot
    };
}


createBaseClock(){

    
    const clockData=this.createClock();
    const clock={
        mesh: clockData.mesh,
        type: 'interactable',
        interactionType: 'clock',

    state: {
        hours: 3, 
        minutes: 15,
        selectedHand: 'minute',
        rotationSpeed: 1.5
    },

    hourPivot: clockData.hourPivot,
    minutePivot: clockData.minutePivot,
    toleratableVariation:0.1,
    solutionAngle:{hour:3*Math.PI/2,minute:29*Math.PI/15},
    solved:false,

    onFocus: function() {
        this.updateHandHighlight();
    },

    onInteract: function(dt, player, input){

        if (input.left && !this.lastLeft) {
        this.state.selectedHand = 'hour';
        this.updateHandHighlight();
        }

        if (input.right && !this.lastRight) {
        this.state.selectedHand = 'minute';
        this.updateHandHighlight();
        }

        this.lastLeft = input.left;
        this.lastRight = input.right;
        this.lastAction = input.action;

        


        if (this.state.selectedHand === 'hour') {

            if (input.forward){
                this.state.hours += dt * this.state.rotationSpeed;
                if (this.state.hours >= 12) this.state.hours -= 12;
            }

            if (input.backward) {
                this.state.hours -= dt * this.state.rotationSpeed;
                if (this.state.hours < 0) this.state.hours += 12;
            }

            if (input.action && !this.lastAction) {
                this.state.hours = Math.round(this.state.hours) % 12;
            }

        }else{


            if (input.forward) {
                    this.state.minutes += dt * this.state.rotationSpeed * 12;
                    if (this.state.minutes >= 60) this.state.minutes -= 60;
            }

            if (input.backward) {
                this.state.minutes -= dt * this.state.rotationSpeed * 12;
                if (this.state.minutes < 0) this.state.minutes += 60;
            }

            if (input.action && !this.lastAction) {
                this.state.minutes = Math.round(this.state.minutes / 5) * 5;
                if (this.state.minutes >= 60) this.state.minutes = 0;
            }

        }

    this.updateHands();
    },
    onUnfocus: function(){
        this.removeHandHighlight();
    },

    updateHands: function(){

        if(!this.solved){

        this.hourHandAngle = (this.state.hours / 12) * Math.PI * 2;
        this.minuteHandAngle = (this.state.minutes / 60) * Math.PI * 2;

        this.updateSolved();
    
        this.hourPivot.rotation.z = -this.hourHandAngle;
        this.minutePivot.rotation.z = -this.minuteHandAngle;
        }

        
    },

  updateHandHighlight: function(){
        this.removeHandHighlight();
    
        const selectedPivot = this.state.selectedHand === 'hour' 
            ? this.hourPivot 
            : this.minutePivot;
    
        const hand = selectedPivot.children[0];
        if (!this.originalMaterials) {
            this.originalMaterials = {
            hour: this.hourPivot.children[0].material.clone(),
            minute: this.minutePivot.children[0].material.clone()
        };
        }
    

        hand.material = hand.material.clone();
        hand.material.emissive = new THREE.Color(0x4444ff);
        hand.material.emissiveIntensity = 0.5;
  },
  
    removeHandHighlight: function(){
        if (this.originalMaterials) {
        this.hourPivot.children[0].material = this.originalMaterials.hour;
        this.minutePivot.children[0].material = this.originalMaterials.minute;
    }
  },updateSolved: function(){



    if( Math.abs(this.hourHandAngle-this.solutionAngle.hour)<=this.toleratableVariation && 
        Math.abs(this.minuteHandAngle-this.solutionAngle.minute)<=this.toleratableVariation){
            this.solved=true;

    }else{
        this.solved=false;
    }

}

    }

    clock.updateHands();
    return clock;
    

}

}