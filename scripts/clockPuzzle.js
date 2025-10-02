import * as THREE from "three";

export class ClockPuzzle extends THREE.Group{

constructor(radius){
    super();
    this.radius=radius

}

solved=false;
solutionAngle={hour:245*Math.PI/360,minute:Math.PI/6}
hourHandAngle=0;
minuteHandAngle=0;
toleratableVariation=0.5;


setMinuteHand(newRandAngle){
    this.minuteHandAngle=newRandAngle;
}

setHourHand(newRandAngle){
    this.hourHandAngle=newRandAngle;
}

checkSolve(){
    return this.solved;
}

updateSolved(){

    if( Math.abs(this.hourHandAngle-this.solutionAngle.hour)<=this.toleratableVariation && 
        Math.abs(this.minuteHandAngle-this.solutionAngle.minute)<=this.toleratableVariation){
            this.solved=true;
    }else{
        this.solved=false;
    }

}

createBaseClock(){

    const faceGeometry = new THREE.CircleGeometry(this.radius, 64);
    const faceMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.face = new THREE.Mesh(faceGeometry, faceMaterial);
    this.add(this.face);

    const hourGeometry = new THREE.BoxGeometry(this.radius * 0.4, 0.1, 0.1);
    const hourMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.hourHand = new THREE.Mesh(hourGeometry, hourMaterial);
    this.hourHand.position.x = this.radius * 0.2;
    this.add(this.hourHand);

    const minuteGeometry = new THREE.BoxGeometry(this.radius * 0.7, 0.05, 0.05);
    const minuteMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.minuteHand = new THREE.Mesh(minuteGeometry, minuteMaterial);
    this.minuteHand.position.x = this.radius * 0.35;
    this.add(this.minuteHand);

 }


updateClockhands(hourAngle,minuteAngle){

    this.setHourHand(hourAngle);
    this.setMinuteHand(minuteAngle); 
    this.updateSolved();
    
    // the following 2 lines needs to be updated ...
    this.hourHand.rotation.z = -this.hourHandAngle;
    this.minuteHand.rotation.z = -this.minuteHandAngle;

    
    
}

}