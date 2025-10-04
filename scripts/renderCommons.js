import * as THREE from "three";
const raycaster = new THREE.Raycaster();
const interactionDistance = 20; // Distance within which interaction is possible
let isUIVisible = false;// Prevents raycasting while UI is active



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
            this.targetedObkject = null;
            //-- key Listeners for interaction --
            document.addEventListener('keydown',(event)=>{
                const key = event.key.toLowerCase();

                if(!this.riddleMachine) return;

                if(key === 'e'){
                    if(!isUIVisible && this.riddleMachine.isTargeted){
                        this.riddleMachine.activate() //Shows the HTML Tiddle UI
                        this.updateInteractionPrompt(false);// to hide the "Press E to interact" prompt
                        isUIVisible = true;
                    }
                }else if(key === 'escape'){
                    if(isUIVisible){
                        this.riddleMachine.deactivate();
                        isUIVisible=false;
                
                        
                    }
                }
            })


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

    // I am adding the riddlemachine here to allow interaction with the player, if you had something in mind you can savely change it
    startAnimation(player,riddleMachine){
        let prevTime = performance.now();
        this.riddleMachine = riddleMachine;
        const camera = player.camera;

        const animate = () => {
            const currTime = performance.now();
            const dt = (currTime - prevTime) / 1000;
            
            //if(riddleMachine.isSolved && riddleMachine.paperMesh && !riddleMachine.paperMesh.parent){
                //const paperMesh = riddleMachine.getDroppedPaper();
                //this.scene.add(paperMesh); // Add paper to the main scene!
                //console.log("Paper Dropped at:", paperMesh.position.toArray());
            //}

            player.applyInputs(dt);
            camera.updateMatrixWorld(); 

            // Raycasting logic inside the animation loop
            if(!isUIVisible){
                   riddleMachine.updateWorldMatrix(true, true);
                raycaster.setFromCamera({ x: 0, y: 0 }, camera);

                // Check intersection with the riddle machine's interactive mesh (the screen plane)
                const intersects = raycaster.intersectObjects([riddleMachine.interactiveMesh], true);

                // === DEBUGGING: LOG THE INTERSECTS ===
                if (intersects.length > 0) {
                console.log("Raycast Hit! Distance:", intersects[0].distance, "Object:", intersects[0].object.name || intersects[0].object.type);
                } else {
                console.log("Raycast Miss."); // Only uncomment if hits are rare, otherwise too spammy
                }

                const isTargeting = intersects.length > 0 && intersects[0].distance < interactionDistance;

                if (isTargeting) {
                    riddleMachine.isTargeted = true;
                    this.updateInteractionPrompt(true);
                    
                }else{
                    riddleMachine.isTargeted = false;
                    this.updateInteractionPrompt(false); 
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