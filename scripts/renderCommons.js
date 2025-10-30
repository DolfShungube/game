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

        this.initTimer()
        this.remainingTime= this.worldTimer
        


        if (this.isAnimating) return;
        let prevTime = performance.now();
        this.isAnimating=true
        this.pause=false
        this.lastTimerUpdate = prevTime;
        this.createTimerOverlay();


        const animate = () => {
            if (!this.isAnimating) return;
            
            const currTime = performance.now();
            const dt = (currTime - prevTime) / 1000;
            if(!this.pause){

            player.applyInputs(dt);
            player.checkLookingAt();
            player.updateFocus(dt);
             this.updateTimer(currTime);
            this.renderer.render(this.scene, player.camera);
                    
        }
            if (LevelLogic && typeof LevelLogic === 'function') {
            LevelLogic();
            }                    
            prevTime = currTime;
           
            this.animationId=requestAnimationFrame(animate);
        };

      
        player.controls.enabled=true;
        animate();
    }

stopAnimation(){
    this.isAnimating=false;
    this.removeTimerOverlay();
    if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
        
    }
}

initTimer(secondTime=300){

    this.worldTimer=secondTime

}

pauseAnimation(){
    this.pause=true
}

unPauseAnimation(){
    this.pause=false
    this.lastTimerUpdate = performance.now();
}


createTimerOverlay() {
    let timer = document.getElementById("game-timer");
    if (!timer) {
        timer = document.createElement("div");
        timer.id = "game-timer";
        timer.style.position = "fixed";
        timer.style.top = "20px";
        timer.style.right = "30px";
        timer.style.padding = "10px 20px";
        timer.style.background = "rgba(0,0,0,0.6)";
        timer.style.color = "white";
        timer.style.fontSize = "24px";
        timer.style.fontFamily = "monospace";
        timer.style.borderRadius = "8px";
        timer.style.zIndex = "9999";
        document.body.appendChild(timer);
    }
    timer.textContent = `${this.remainingTime}`;
}


updateTimer(currTime) {

    const elapsed = (currTime - this.lastTimerUpdate) / 1000;
    if (elapsed >= 1) {
        this.remainingTime -= Math.floor(elapsed);
        this.lastTimerUpdate = currTime;
        const timer = document.getElementById("game-timer");
        if (timer) timer.textContent = `${Math.max(this.remainingTime, 0)}`;
        if (this.remainingTime <= 0) {
            this.stopAnimation();

        }
    }
}


removeTimerOverlay() {
    const timer = document.getElementById("game-timer");
    if (timer) timer.remove();
}




}