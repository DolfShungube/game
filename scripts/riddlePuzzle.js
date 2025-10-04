import * as THREE from 'three';
import {RiddleUI} from './riddleUI'; 
import { TextureLoader } from 'three';
 
 // simply just create comparePuzzle objects, one for each letter of the answer 
 // and pass in the array for, which is gonna be list of letters
 // link each puzzle items update to the rotation of corresponding dail,(3-d object)
 // puzzle is solved if all puzzle objects return solved==true;


 //I am just going to modify it to make a riddle machine so this below code will be independent of the compareHelper.js
const loader = new TextureLoader();
const PAPER_TEXTURE_PATH = '../src/textures/tx1.png'; // Path to your paper texture image
export class RiddlePuzzle extends THREE.Group{
    constructor(riddleText,correctAnswer){
        super();
        this.name = 'RiddleMachine'; // Used for raycasting detection
        this.riddleText=riddleText;
        this.correctAnswer=correctAnswer.toLowerCase().trim();
        this.isSolved=false;
        this.isTargeted = false;
        this.papeprDropped =false;
        this.paperMesh = null; // To hold the paper mesh when created


        //1. Paper Content and UI setup
        this.paperContent = 
            `I thought the house would sleep… but the walls have a memory of their own.<br>
            A moment passes unnoticed—hands frozen, breath held.<br>
            Look where the long hand meets the short at 9:58.<br>
            Only then does it whisper the path forward.`;
        this.paperUI =this.createPaperUI();

        // Initialize 3D model (always visible)
        this.createMachineModel();

        this.ui=new RiddleUI(this.riddleText,this.checkAnswer.bind(this));
        this.ui.hide();
        
    }
        // Create the paper UI element (hidden by default)
    createPaperUI() {
        const div = document.createElement('div');
        div.id = 'paper-readout';
        div.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            background: rgba(10, 10, 10, 0.9);
            color: white;
            border: 2px solid #ccc;
            width: 400px;
            height: 300px;
            font-family: monospace;
            z-index: 1000;
            display: none; /* Starts hidden */
        `;
        
        // Use an arrow function for the inline click handler to ensure 'this' refers to the class instance if needed, 
        // but here we just hide the element.
        div.innerHTML = `
            <h2>Paper Note</h2>
            <p>${this.paperContent}</p>
            <button id="close-paper-ui">Close</button>
        `;
        document.body.appendChild(div);

        // Add event listener to the close button (must be done after appendChild)
        div.querySelector('#close-paper-ui').addEventListener('click', () => {
            this.hidePaper();
        });
        
        return div;
    }

    createMachineModel(){
        const machineGeometry = new THREE.BoxGeometry(2, 2, 1);
        const machineMaterial = new THREE.MeshStandardMaterial({ color: 0x333333  });
        const body = new THREE.Mesh(machineGeometry, machineMaterial);
        body.position.y = 1.5 / 2;
        this.add(body);

         
         // Screen/Interactive panel mesh
        const screenGeo = new THREE.PlaneGeometry(2.0, 1.5);
        const screenMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.name = 'RiddleScreen';
        screen.position.set(0, 1.0, 0.25 + 0.01); // Position slightly in front of the body
        this.add(screen);
        
        // This mesh is what the player's raycaster hits to activate the puzzle
        this.interactiveMesh = screen; 

        // 3. Piece of Paper Mesh
        const paperGeo = new THREE.PlaneGeometry(0.7, 1); // Small piece of paper

        const paperTexture = loader.load(PAPER_TEXTURE_PATH); 
        paperTexture.colorSpace = THREE.SRGBColorSpace; 

        const paperMat = new THREE.MeshBasicMaterial({ 
        map: paperTexture,
        color: 0xffffff,
        specular: 0x111111,
        shininess: 30,
        side: THREE.DoubleSide,
        // Z-FIGHTING FIX: ensures it renders on top of the table
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -4,
    }); 


        this.paperMesh = new THREE.Mesh(paperGeo, paperMat);
        this.paperMesh.name = 'RiddlePaper'; // Useful for later interaction/collection
        this.paperMesh.visible = false;  
        
    }

    // Call this method when the player submits an answer
        getDroppedPaper(){
        if(this.paperDropped) return this.paperMesh;

        // Global Y position of the tabletop surface (3.0 - 0.1/2 = 2.95m).
        //const localYOnTable = -0.25 + 0.03;
        
        // RiddlePuzzle is at Y=3.2. Table surface (Y=3.0) + Z-fight offset (0.03) = 3.03.
        const LOCAL_Y_OFFSET = 3.03 - 3.2; // Result is -0.17

        this.paperMesh.position.set(
            5, // Local X: 1.5m to the right of the machine's center
            LOCAL_Y_OFFSET, // Local Y: -0.17 (Places it at world Y=3.03)
            0.0 // Local Z: Centered with the machine
        );
        this.paperMesh.rotation.x = -Math.PI / 2; // Lie flat on the table
        this.paperMesh.visible = true;
        this.paperDropped = true;
        
        return this.paperMesh;
    }


    checkAnswer(submittedAnswer){
        if(this.isSolved){
            return true; // Already solved
        }
        if(submittedAnswer.toLowerCase().trim() === "map"){
            this.isSolved=true;
            this.ui.setMessage("SUCCESS! The riddle is solved.Check the table!", 'green');

            // TODO: GAME STATE CHANGE LOGIC GOES HERE ***
             if (!this.paperDropped) {
                this.getDroppedPaper();
                this.add(this.paperMesh); // Sets its position and sets this.paperDropped = true

                   // === NEW: LOG WORLD POSITION AFTER ADDING TO PARENT ===
                const worldPos = new THREE.Vector3();
                this.paperMesh.getWorldPosition(worldPos);
                console.log("Paper Dropped at World Position:", worldPos.toArray());
                // Expected output (approx): [0, 3.03, 0]
                
            }
            setTimeout(() => {
                this.deactivate(); // Call deactivate to hide the UI and re-enable controls
            }, 1000);

            console.log("Riddle Solved!");
            return true;  
        }else{
            this.ui.setMessage("Incorrect answer. Try again.", 'red');
            return false;
        }
    }

    showPaper(){
        if(this.isSolved && this.paperDropped){
            this.paperUI.style.display = 'block';
            //TODO: disable player controls here

            return true;
        } 
        return false;    
    }

    hidePaper(){
        this.paperUI.style.display = 'none';
        //TODO: re-enable player controls here
    }

    //show the UI when player interacts
    activate(){
        if(!this.isSolved){
            this.ui.show();
            // TODO: Temporarily disable player movement/camera controls here
        }
    }

    deactivate(){
        this.ui.hide();
        // TODO: Re-enable player movement/camera controls here
    }





}
