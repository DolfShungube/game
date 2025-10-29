
import * as THREE from "three";


export class ButtonPuzzle extends THREE.Group{

constructor(){
    super();

}

createButton(){

    const buttonGroup =new THREE.Group();

    const baseGeometry =new THREE.CylinderGeometry(0.4,0.4,0.1,32); // button base
    const baseMaterial =new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        metalness: 0.7,
        roughness: 0.3
    });

    const base = new THREE.Mesh(baseGeometry,baseMaterial);
    base.rotation.x = Math.PI/2;
    buttonGroup.add(base)


    const buttonGeometry = new THREE.CylinderGeometry(0.3,0.3,0.15,32); // button top
    const buttonMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff0000,
        metalness: 0.5,
        roughness: 0.5,
        emissive: 0xff0000,
        emissiveIntensity: 0.2
    });


    const button =new THREE.Mesh(buttonGeometry,buttonMaterial);
    button.rotation.x = Math.PI/2;
    button.position.z = 0.1;
    buttonGroup.add(button);


    const colliderGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32); // important fix,
    const colliderMaterial = new THREE.MeshBasicMaterial({ 
        visible: false
    });
    const collider = new THREE.Mesh(colliderGeometry, colliderMaterial);
    buttonGroup.add(collider);    

    buttonGroup.position.set(0,0,0);

    return {
        mesh: buttonGroup,
        button: button,
        baseMaterial: baseMaterial,
        buttonMaterial: buttonMaterial
    };



}


createBaseButton(){

    const buttonData = this.createButton();
    const button ={

        mesh: buttonData.mesh,
        button: buttonData.button,
        buttonMaterial: buttonData.buttonMaterial,
        type: 'interactable',
        interactionType: 'button',
        solved:false,

        state: {
            isPressed: false,
            pressDepth: 0,
            maxPress: 0.08,
            pressSpeed: 8
        },

        // onFocus: function(){
           
        // },

        onInteract: function(dt,player,input){

            if (input.action && !this.lastAction && !this.state.isPressed) {
                this.pressButton();
            }
            
            this.lastAction =input.action;
        }, 
        
        onUnfocus: function() {

        },
        
        pressButton: function(){
            if (!this.state.isPressed){
                this.state.isPressed =true;
                this.solved=true;
                

                this.button.position.z =0.1-this.state.maxPress;
                

                this.buttonMaterial.color.setHex(0x00ff00);
                this.buttonMaterial.emissive.setHex(0x00ff00);
                this.buttonMaterial.emissiveIntensity=0.5;
                

            }
        },
        
        
        releaseButton: function(){
            if(this.state.isPressed){
                this.state.isPressed =false;
                this.solved=false;
                

                this.button.position.z =0.1;
                

                this.buttonMaterial.color.setHex(0xff0000);
                this.buttonMaterial.emissive.setHex(0xff0000);
                this.buttonMaterial.emissiveIntensity =0.2;
            }
        }        

    }

    return button;



}







}