import * as THREE from "three";
import { FXAAShader } from "three/examples/jsm/Addons.js";
import { abs } from "three/tsl";

export class DailPuzzle extends THREE.Group{

constructor(){
    super();

}

createDail(){

    const dialGroup = new THREE.Group();

    const baseGeometry = new THREE.CylinderGeometry(0.9, 0.9, 0.1, 64);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2c3e50,
        metalness: 0.5,
        roughness: 0.5
    });

    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.rotation.x = Math.PI / 2;
    dialGroup.add(base);
    
for (let i = 0; i < 90; i += 10) {
        const angle = (i / 90) * Math.PI * 2;
        const radius = 0.85;
        
        const isMain = i % 20 === 0;
        const tickGeometry = new THREE.BoxGeometry(
            0.02, 
            isMain ? 0.1 : 0.05, 
            0.03
        );
        const tickMaterial = new THREE.MeshStandardMaterial({ 
            color: isMain ? 0xffffff : 0x888888 
        });
        const tick = new THREE.Mesh(tickGeometry, tickMaterial);
        
        tick.position.x = Math.sin(angle) * radius;
        tick.position.y = Math.cos(angle) * radius;
        tick.position.z = 0.06;
        tick.rotation.z = -angle;
        
        dialGroup.add(tick);
        
        if (isMain) {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const context = canvas.getContext('2d');
            
            context.fillStyle = '#ffffff';
            context.font = 'bold 50px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(i.toString(), 64, 64);
            
            const texture = new THREE.CanvasTexture(canvas);
            const numberMaterial = new THREE.MeshBasicMaterial({ 
                map: texture,
                transparent: true
            });
            
            const numberGeometry = new THREE.PlaneGeometry(0.25, 0.25);
            const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
            
            const labelRadius = 0.65;
            numberMesh.position.x = Math.sin(angle) * labelRadius;
            numberMesh.position.y = Math.cos(angle) * labelRadius;
            numberMesh.position.z = 0.06;
            
            dialGroup.add(numberMesh);
        }
    }
    
    
    const needleGroup = new THREE.Group();
    
    const needleGeometry = new THREE.BoxGeometry(0.05, 0.7, 0.02);
    const needleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.3
    });

    const needle = new THREE.Mesh(needleGeometry, needleMaterial);
    needle.position.y = 0.35;
    needleGroup.add(needle);
    
    const capGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 32);
    const capMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x444444,
        metalness: 0.8,
        roughness: 0.2
    });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.rotation.x = Math.PI / 2;
    cap.position.z = 0.08;
    needleGroup.add(cap);
    
    needleGroup.position.z = 0.1;
    dialGroup.add(needleGroup);
        const colliderGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 32); // important fix,
        const colliderMaterial = new THREE.MeshBasicMaterial({ 
            visible: false
        });
        const collider = new THREE.Mesh(colliderGeometry, colliderMaterial);
        dialGroup.add(collider);
    
    dialGroup.position.set(0, 2, -3);
  

    return {
        mesh: dialGroup,
        needle: needleGroup
    };
}

createBaseDail(){

    const dailData= this.createDail()

    const dail={
        mesh:dailData.mesh,
        needle: dailData.needle,
        type: 'interactable',
        interactionType: 'dial',
        state: {
            value: 0,
            rotationSpeed: 3.5
        },
        solved:false,
        targetValue:75,
        tolerance:1,
        onFocus: function(){

        },
        onUnFocus: function(){

        },
        onInteract: function(dt, player, input){
            if (input.right) {
                this.state.value -= this.state.rotationSpeed * dt;
                if (this.state.value < 0) this.state.value = 90+this.state.value;
            }
            

            if (input.left) {
                this.state.value += this.state.rotationSpeed * dt;
                if (this.state.value > 90) this.state.value = 0;

            }
            

            if (input.action && !this.lastAction) {
                this.state.value = Math.round(this.state.value / 5) * 5;
                if (this.state.value > 90) this.state.value = 0;
                console.log(`Snapped to: ${this.state.value}`);
            }
            
            this.lastAction = input.action;
            this.updateDial();

    },
            updateDial: function() {

            const angle =  (this.state.value /90) * Math.PI * 2
            

            this.needle.rotation.z = -angle;
            
            const difference = Math.abs(this.state.value - this.targetValue);
            if (difference <= this.tolerance && !this.solved) {
                this.solved = true;
                // this.needle.children[0].material.color.setHex(0x00ff00);
                // this.needle.children[0].material.emissive.setHex(0x00ff00);
            } else if (difference > this.tolerance) {
                this.solved = false;
            }
        }




    }

    return dail




}

}


