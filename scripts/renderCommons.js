import * as THREE from "three";
export class worldBuilder extends THREE.Group{


    levelComplete=false
    currentLevel=''

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
        this.Player=player
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
        this.Player.removeReticle()
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

    if(this.levelComplete==true){
        this.stopAnimation();
        this.Complete();
    }

    const elapsed = (currTime - this.lastTimerUpdate) / 1000;
    if (elapsed >= 1) {
        this.remainingTime -= Math.floor(elapsed);
        this.lastTimerUpdate = currTime;
        const timer = document.getElementById("game-timer");
        if (timer) timer.textContent = `${Math.max(this.remainingTime, 0)}`;
        if (this.remainingTime <= 0) {

            this.stopAnimation();
            this.timesUp()

        }
    }
}


removeTimerOverlay() {
    const timer = document.getElementById("game-timer");
    if (timer) timer.remove();
}


timesUp(){

    const existing =document.getElementById('timeup-overlay');
    if (existing) existing.remove();

    const overlay =document.createElement('div');
    overlay.id ='timeup-overlay';
    overlay.style.position ='fixed';
    overlay.style.top ='0';
    overlay.style.left ='0';
    overlay.style.width ='100vw';
    overlay.style.height ='100vh';
    overlay.style.background ='rgba(0, 0, 0, 0.8)';
    overlay.style.display ='flex';
    overlay.style.flexDirection ='column';
    overlay.style.justifyContent ='center';
    overlay.style.alignItems ='center';
    overlay.style.color ='white';
    overlay.style.fontFamily ='Arial, sans-serif';
    overlay.style.zIndex ='10000';

    const message = document.createElement('h1');
    message.textContent = 'Time’s Up!';
    message.style.fontSize = '48px';
    message.style.marginBottom = '30px';

    const button = document.createElement('button');
    button.textContent = 'Return to Menu';
    button.style.padding = '12px 24px';
    button.style.fontSize = '20px';
    button.style.cursor = 'pointer';
    button.style.border = 'none';
    button.style.borderRadius = '8px';
    button.style.background = '#4CAF50';
    button.style.color = 'white';
    button.style.transition = 'background 0.2s ease';
    button.onmouseover = () => (button.style.background = '#45A049');
    button.onmouseout = () => (button.style.background = '#4CAF50');

    button.addEventListener('click', () => {
        overlay.remove();
        this.clearSceneAndReturnToMenu();
    });

    overlay.appendChild(message);
    overlay.appendChild(button);
    document.body.appendChild(overlay);
}


Complete(){

    const timeTaken= this.worldTimer-this.remainingTime

    const existing =document.getElementById('timeup-overlay');
    if (existing) existing.remove();

    const overlay =document.createElement('div');
    overlay.id ='timeup-overlay';
    overlay.style.position ='fixed';
    overlay.style.top ='0';
    overlay.style.left ='0';
    overlay.style.width ='100vw';
    overlay.style.height ='100vh';
    overlay.style.background ='rgba(0, 0, 0, 0.8)';
    overlay.style.display ='flex';
    overlay.style.flexDirection ='column';
    overlay.style.justifyContent ='center';
    overlay.style.alignItems ='center';
    overlay.style.color ='white';
    overlay.style.fontFamily ='Arial, sans-serif';
    overlay.style.zIndex ='10000';

    const message = document.createElement('h1');
    message.textContent = "Level complete, completionTime: "+ timeTaken.toString()+"seconds";
    message.style.fontSize = '48px';
    message.style.marginBottom = '30px';

    const button = document.createElement('button');
    button.textContent = 'Return to Menu';
    button.style.padding = '12px 24px';
    button.style.fontSize = '20px';
    button.style.cursor = 'pointer';
    button.style.border = 'none';
    button.style.borderRadius = '8px';
    button.style.background = '#4CAF50';
    button.style.color = 'white';
    button.style.transition = 'background 0.2s ease';
    button.onmouseover = () => (button.style.background = '#45A049');
    button.onmouseout = () => (button.style.background = '#4CAF50');

    button.addEventListener('click', () => {
        overlay.remove();
        this.clearSceneAndReturnToMenu();
    });

    overlay.appendChild(message);
    overlay.appendChild(button);
    document.body.appendChild(overlay);
}

clearSceneAndReturnToMenu() {
    const app =document.getElementById('app');
    const menu =document.getElementById('menu-container');
    const backButton =document.getElementById('backButton');

    if (app) app.innerHTML = '';
    if (menu) menu.style.display = 'block';
    if (backButton) backButton.click() = true;

    const oldCanvas =document.querySelector('canvas');
    if (oldCanvas) oldCanvas.remove();

    this.removeTimerOverlay();
}   




}