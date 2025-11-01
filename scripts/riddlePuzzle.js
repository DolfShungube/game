import * as THREE from 'three';
import {RiddleUI} from './RiddleUI'; 
import { TextureLoader } from 'three';
 

const loader = new TextureLoader();
const PAPER_TEXTURE_PATH = '../src/textures/tx3.webp'; // Path to your paper texture image
export class RiddlePuzzle extends THREE.Group{
    constructor(riddleText,correctAnswer, position = new THREE.Vector3(-37.0, 3.2, -36.0)){
        super();
        this.name = 'RiddleMachine'; // Used for raycasting detection
        this.riddleText=riddleText;
        this.correctAnswer=correctAnswer.toLowerCase().trim();
        this.isSolved=false;
        this.isTargeted = false;
        this.papeprDropped =false;
        this.paperMesh = null; // To hold the paper mesh when created

        this.isUIVisible = false;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        //1. Paper Content and UI setup
        this.paperContent = 
            `I thought the house would sleep… but the walls have a memory of their own.<br>
            A moment passes unnoticed—hands frozen, breath held.<br>
            Look where the long hand meets the short at 9:58.<br>
            Only then does it whisper the path forward.`;
        this.paperUI =this.createPaperUI();

        // Initialize 3D model (always visible)
        this.createMachineModel();
        this.position.copy(position);
        

        // 3. Puzzle UI
        this.ui=new RiddleUI(this.riddleText,this.checkAnswer.bind(this));
        this.ui.hide();
        
    }


        updateInteractionPrompt(show) {
         // Access the DOM element directly when needed in the animation loop
         const prompt = document.getElementById('interaction-prompt');
         if (prompt) {
         prompt.style.display = show ? 'block' : 'none';
         }
         }

    // -------------------------------------- Interaction Setup ---------------------------------//

    setupInteraction(playerCamera,player){
        this.camera = playerCamera;
        this.player = player;

        //keyboard keys

        document.addEventListener('keydown',(event)=>{
            const key = event.key.toLowerCase();
            if(!this.isTargeted && event.code==player.Setcontrols.interact) return;

            if(event.code==player.Setcontrols.interact && !this.isUIVisible){
                this.activate();
            }
            if(this.paperUI && this.paperUI.style.display === 'block'){
                this.hidePaper(); // hides paper
            }
            else if(event.code=== player.Setcontrols.exitInteract && this.isUIVisible){
                this.deactivate();
                //this.hidePaper(); //I am thinking maybe is for hiding the paperUI

            }
        });

        //mouse clicks for paper

        document.addEventListener('keydown', (event) => {
            // don’t trigger while UI is open
            if(event.code==player.Setcontrols.interact){

            if (this.isUIVisible) return;



            const cameraPos = this.camera.position;
            const cameraDir = new THREE.Vector3();
            this.camera.getWorldDirection(cameraDir);

            // known paper world position (you can also store this dynamically)
           const paperWorldPos = new THREE.Vector3();
           this.paperMesh.getWorldPosition(paperWorldPos);

            // compute direction and distance to paper
            const toPaper = paperWorldPos.clone().sub(cameraPos);
            const distance = toPaper.length();
            toPaper.normalize();

            // how closely player is looking at the paper
            const facingDot = cameraDir.dot(toPaper);

            // ---- tweak these thresholds ----
            const closeEnough = distance < 5.0;     // within ~6 units
            const lookingAt = facingDot > 0.92;     // looking roughly toward it

            if (closeEnough && lookingAt) {
                console.log("Player clicked near the paper area — showing paper UI!");
                this.showPaper();
            } else {
                console.log("Click ignored (too far or not looking at paper).");
            }
        }
        });

    }

     // ---------- Called each frame ----------
    updateInteraction() {
        if (!this.camera || this.isUIVisible) return;

        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera); // center of screen
        const intersects = this.raycaster.intersectObject(this.interactiveMesh,true);

        console.log('intersects', intersects.length);


        if ( !this.isSolved && intersects.length > 0  && !this.papeprDropped) {
            this.isTargeted = true;
            this.updateInteractionPrompt(true); // show "Press E"
          
        } else {
            this.isTargeted = false;
            this.updateInteractionPrompt(false); // hide
            // Optionally hide prompt
        }
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
        

        div.innerHTML = `
            <h2>Paper Note</h2>
            <p>${this.paperContent}</p>
            
        `;
        document.body.appendChild(div);

        // Add event listener to the close button (must be done after appendChild)
        
        
        return div;
    }

   createMachineModel() {
    const loader = new THREE.TextureLoader();

    // Machine body texture
    const machineTexture = loader.load('../src/textures/machine.jpg');
    machineTexture.wrapS = machineTexture.wrapT = THREE.RepeatWrapping;
    machineTexture.repeat.set(1, 1);
    machineTexture.anisotropy = 16;

    const machineGeometry = new THREE.BoxGeometry(2, 2, 1);
    const machineMaterial = new THREE.MeshStandardMaterial({
        map: machineTexture,
        roughness: 0.8,
        metalness: 0.2
    });
    const body = new THREE.Mesh(machineGeometry, machineMaterial);
    body.position.y = 1.5 / 2;
    this.add(body);

    // Screen/Interactive panel mesh
    const screenGeo = new THREE.PlaneGeometry(2.0, 1.5);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.name = 'RiddleScreen';
    screen.position.set(0, 1.0, 0.25 + 0.01); 
    this.add(screen);
    this.interactiveMesh = screen; 

    // Paper Mesh
    const paperGeo = new THREE.PlaneGeometry(0.9, 1.3);
    const paperTexture = loader.load(PAPER_TEXTURE_PATH); 
    paperTexture.colorSpace = THREE.SRGBColorSpace; 
    const paperMat = new THREE.MeshBasicMaterial({ 
        map: paperTexture,
        color: 0xffffff,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -4,
    }); 
    this.paperMesh = new THREE.Mesh(paperGeo, paperMat);
    this.paperMesh.name = 'RiddlePaper';
    this.paperMesh.visible = false;
    this.add(this.paperMesh); 
}


    // Call this method when the player submits an answer
        getDroppedPaper(){
        if(this.paperDropped) return this.paperMesh;


        const LOCAL_Y_OFFSET = 3.03 - 3.2; // Result is -0.17

        this.paperMesh.position.set(
            2,
            LOCAL_Y_OFFSET+0.1,
            0.0
        );
        this.paperMesh.rotation.x = -Math.PI / 2 ; // Lie flat on the table
        this.paperMesh.visible = true;
        this.paperDropped = true;

        const paperWorldPos = new THREE.Vector3();
    this.paperMesh.getWorldPosition(paperWorldPos);
    console.log(`📜 Paper dropped at world position: (${paperWorldPos.x.toFixed(2)}, ${paperWorldPos.y.toFixed(2)}, ${paperWorldPos.z.toFixed(2)})`);
        
        return this.paperMesh;
    }


    checkAnswer(submittedAnswer){
        if(this.isSolved){
            return true; // Already solved
        }
        if(submittedAnswer.toLowerCase().trim() === "map"){
            this.isSolved=true;
            this.ui.setMessage("SUCCESS! The riddle is solved.Check the table!", 'green');

             if (!this.paperDropped) {
                this.getDroppedPaper();
                this.deactivate(); 

                const worldPos = new THREE.Vector3();
                this.paperMesh.getWorldPosition(worldPos);
                console.log("Paper Dropped at World Position:", worldPos.toArray());
                // Expected output (approx): [0, 3.03, 0]
                
            }
          
            this.deactivate()
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
            //if(this.player && this.player.controls){
            //this.player.controls.enabled = false
        //}

            return true;
        } 
        return false;    
    }

    hidePaper(){
        if(!this.paperUI) return;
        this.paperUI.style.display = 'none';
        this.isUIVisible = false; // important to stop other loops reopening it
        //if(this.player && this.player.controls){
            //this.player.controls.enabled = true;
        //}
    }

    //show the UI when player interacts
    activate(){
        if(!this.isSolved){
            this.ui.show();
            this.isUIVisible=true;
            // TODO: Temporarily disable player movement/camera controls here
            //if(this.player && this.player.controls){
                //this.player.controls.enabled = false;
                //this.player.controls.lock()
            //}
        }
    }

    deactivate(){
        this.ui.hide();
        this.isUIVisible=false;
        // TODO: Re-enable player movement/camera controls here
        //if(this.player && this.player.controls){
                //this.player.controls.enabled = true;
                //this.player.controls.unlock()
            //}
    }





}
