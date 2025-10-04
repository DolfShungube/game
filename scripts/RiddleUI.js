export class RiddleUI {
    constructor(riddleText,onSubmitCallback){
        this.container = document.createElement('div');
        this.container.id = 'riddle-ui';
        this.container.style.cssText = `
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 400px; padding: 20px; background-color: rgba(0, 0, 0, 0.85);
            color: white; border: 2px solid #00ff00; z-index: 1000;
            display: none; font-family: sans-serif; text-align: center;
        `;

        // Riddle Text Display
        const pRiddle = document.createElement('p');
        pRiddle.innerHTML = `**Riddle:** ${riddleText}`;
        this.container.appendChild(pRiddle);

        // Feedback Message (Correct/Incorrect)
        this.messageElement = document.createElement('p');
        this.container.appendChild(this.messageElement);

        // Text Input Field
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Type your answer here...';
        this.input.style.cssText = 'width: 90%; padding: 8px; margin: 10px 0;';
        this.container.appendChild(this.input);


        // Submit Button
        this.button = document.createElement('button');
        this.button.textContent = 'Submit Answer';
        this.button.onclick = () => {
            onSubmitCallback(this.input.value); // Calls checkAnswer in RiddlePuzzle
        };
        this.container.appendChild(this.button);

        document.body.appendChild(this.container);

    }

      show() {
        this.container.style.display = 'block';
        this.input.focus();
    }

    hide() {
        this.container.style.display = 'none';
        this.setMessage("", 'white');
        this.input.value = "";
    }
    
    setMessage(text, color) {
        this.messageElement.textContent = text;
        this.messageElement.style.color = color;
    }

}