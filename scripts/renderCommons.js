import * as THREE from "three";
export class worldBuilder extends THREE.Group{

        constructor(){
            super();
            this.renderer = null;
            this.scene = null;
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


    startAnimation(player,LevelLogic = null){
        let prevTime = performance.now();

        const animate = () => {
            const currTime = performance.now();
            const dt = (currTime - prevTime) / 1000;

            player.applyInputs(dt);
            player.checkLookingAt();
            player.updateFocus(dt);

            if (LevelLogic && typeof LevelLogic === 'function') {
            LevelLogic();
            }

            this.renderer.render(this.scene, player.camera);

            prevTime = currTime;
            requestAnimationFrame(animate);
        };

        animate();
    }



}