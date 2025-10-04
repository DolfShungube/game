import * as THREE from "three";
const raycaster = new THREE.Raycaster();
const interactionDistance = 30; // Distance within which interaction is possible
let isUIVisible = false;// Prevents raycasting while UI is active
const mouse = new THREE.Vector2(); // Defined globally

// This is the exported class from your file
export class worldBuilder extends THREE.Group{

    updateInteractionPrompt(show) {
        // Access the DOM element directly when needed in the animation loop
        const prompt = document.getElementById('interaction-prompt');
        if (prompt) {
            prompt.style.display = show ? 'block' : 'none';
        }
    }

        constructor(){
            super();
            this.renderer = null;
            this.scene = null;
            this.targetedObject = null;
            
            //-- key Listeners for interaction (RiddleScreen & Escape) --
            document.addEventListener('keydown',(event)=>{
                const key = event.key.toLowerCase();

                if(!this.riddleMachine) return;

                if(key === 'e'){
                    // E key only works if the center-screen raycast hit the RiddleScreen
                    if(!isUIVisible && this.targetedObject && this.targetedObject.name === "RiddleScreen"){

                        this.riddleMachine.activate() //Shows the HTML Tiddle UI
                        this.updateInteractionPrompt(false);// to hide the "Press E to interact" prompt
                        isUIVisible = true;
                    }
                }else if(key === 'escape'){
                    if(isUIVisible){
                        this.riddleMachine.deactivate();
                        this.riddleMachine.hidePaper();
                        isUIVisible=false;
                    }
                }
            })

// --- In worldBuilder.js ---

// ... inside constructor() ...

            /// The paper is opened only by a mouse click, regardless of the center-screen raycast.
            document.addEventListener('click',(event)=>{
                
                // 1. Check if the game is in an interactive state or if machine is loaded
                if(isUIVisible) {
                    // This is expected if the player clicks while a UI is open
                    console.log("DEBUG CLICK ERROR: UI is currently visible.");
                    return; 
                }
                
                if (!this.riddleMachine) {
                    console.error("DEBUG CLICK ERROR: riddleMachine object is undefined.");
                    return;
                }
                
                if (!this.riddleMachine.paperMesh) {
                    console.error("DEBUG CLICK ERROR: riddleMachine.paperMesh is undefined. Paper not initialized correctly.");
                    return;
                }

               
                if (!this.riddleMachine.paperMesh.visible) {
                    console.log("DEBUG CLICK ERROR: Paper is not yet visible (riddle likely not solved).");
                    return;
                }
                
                // 2. Compute normalized mouse coordinates
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

                // 3. Set raycaster from the accurate mouse position. 
                raycaster.setFromCamera(mouse, this.riddleMachine.camera); 

                // 4. Check for intersection with ONLY the paper mesh
                const intersects = raycaster.intersectObject(this.riddleMachine.paperMesh, false); 

                if(intersects.length > 0){
                    
                    // 5. Check distance explicitly
                    if (intersects[0].distance < interactionDistance) {
                        // 6. Success! Open the paper UI
                        console.log("DEBUG CLICK SUCCESS: Paper was clicked and opened.");
                        this.riddleMachine.showPaper(); 
                        isUIVisible = true;
                        this.updateInteractionPrompt(false); 
                    } else {
                        console.log(`DEBUG CLICK FAIL: Hit Paper Mesh, but distance (${intersects[0].distance.toFixed(2)}) is outside the interaction range (${interactionDistance}).`);
                    }
                } else {
                     console.log("DEBUG CLICK FAIL: Mouse raycast did not hit the Paper Mesh.");
                }
            });


        }

        ititialiseRenderer(){
            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setClearColor(0x80a0e0);
            document.body.appendChild(this.renderer.domElement);
            return this.renderer;
        }

    initializeScene(){
        this.scene = new THREE.Scene();
        return this.scene;
    }


        addBaseLighting(){
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            this.scene.add(ambientLight);

            const pointLight = new THREE.PointLight(0xffffff, 0.8);
            pointLight.position.set(2, 4, 2);
            this.scene.add(pointLight);
        }

    startAnimation(player,riddleMachine){
        let prevTime = performance.now();
        this.riddleMachine = riddleMachine;
        this.riddleMachine.camera = player.camera; // CRITICAL: Pass camera reference for mouse clicks
        const camera = player.camera;


         //const interactiveMeshes = [
           // riddleMachine.interactiveMesh,  
            //riddleMachine.paperMesh         
        //];

        const animate = () => {
            const currTime = performance.now();
            const dt = (currTime - prevTime) / 1000;
            
            player.applyInputs(dt);
            camera.updateMatrixWorld(); 

            // Raycasting logic inside the animation loop (ONLY for showing the prompt)
            if(!isUIVisible){
                   riddleMachine.updateWorldMatrix(true, true);
                raycaster.setFromCamera({ x: 0, y: 0 }, camera); // Center-screen raycast

                // Check intersection with all interactive meshes
                 const intersects = raycaster.intersectObjects([riddleMachine.interactiveMesh], true);

                const isTargeting = intersects.length > 0 && intersects[0].distance < interactionDistance;

                if (isTargeting) {
                    this.targetedObject = intersects[0].object;

                    riddleMachine.isTargeted = true;
                    this.updateInteractionPrompt(true); // Show prompt
                    
                }else{
                    this.targetedObject = null;
                    riddleMachine.isTargeted = false;
                    this.updateInteractionPrompt(false); // Hide prompt
                }
            }else{
                this.updateInteractionPrompt(false); // Hide prompt when UI is active
            }

            this.renderer.render(this.scene, player.camera);

            prevTime = currTime;
            requestAnimationFrame(animate);
        };

        animate();
    }
}