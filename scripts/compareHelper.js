


import * as THREE from "three";


export class ComparePuzzle extends THREE.Group{

    // takes in list of items and the correct one
    // helper class for anything we will have that involves a password like puzzle eg the riddle one

    solved=false;
    currentIndex=0;

    constructor(values,solutionItem){
        this.values=values;
        this.solution=solutionItem;
        this.size=values.length;

    }



    checkSolve(){
        return this.solved;
        }

    getNextValue(){
        this.currentIndex+=1;
        if (this.currentIndex>=this.size-1){
            this.currentIndex=0;
        }

         return this.values[this.currentIndex];
    }

    updateSolved(tolerance=0){


        if(tolerance!=0){
            // this works with just numerical values when we have some allowed tollerance :)
        if(Math.abs(this.values[currentIndex]-this.solution)<=tolerance){
                this.solved=true;
        }else{
           
            this.solved=false;
        }
        }else{

            // works with everything

        if(this.values[currentIndex]==this.solution){
                this.solved=true;
        }else{
           
            this.solved=false;
        }
    }

    }    

}