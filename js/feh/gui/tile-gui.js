class FehTileGui {

    /**
     * 
     * @param {FehBattleGui} gui
     * @param {Number} row 
     * @param {Number} column 
     */
    constructor(gui, row, column) {
        this.gui = gui;
        this.row = row;
        this.column = column;

        this.inputElement = document.createElement('div');
        this.inputElement.className = 'tile-input';
        this.inputElement.onclick = e => this.onclick();

        this.visualElement = document.createElement('div')
        this.visualElement.className = 'tile';

        let background = document.createElement('div')
        background.className = 'tile-background';

        let frame = document.createElement('div')
        frame.className = 'tile-frame';

        this.visualElement.appendChild(background);
        this.visualElement.appendChild(frame);

        this.clear();
    }

    onclick() { this.gui.onTile(this.row, this.column); }

    clear() {
        this.visualElement.className = 'tile';
    }

    setActionable() {
        this.visualElement.classList.add('action');
    }

    clearActionable() {
        this.visualElement.classList.remove('action');
    }

    clearColor() {
        this.visualElement.classList.remove('red-background');
        this.visualElement.classList.remove('green-background');
        this.visualElement.classList.remove('blue-background');
    }

    turnBlue() {
        this.clearColor();
        this.visualElement.classList.add('blue-background');
    }

    turnRed() {
        this.clearColor();
        this.visualElement.classList.add('red-background');
    }

    turnGreen() {
        this.clearColor();
        this.visualElement.classList.add('green-background');
    }

    clearFrame() {
        this.visualElement.classList.remove('red-frame');
        this.visualElement.classList.remove('green-frame');
        this.visualElement.classList.remove('blue-frame');
        this.visualElement.classList.remove('purple-frame');
    }

    showRedFrame() {
        this.clearFrame();
        this.visualElement.classList.add('red-frame');
    }

    showGreenFrame() {
        this.clearFrame();
        this.visualElement.classList.add('green-frame');
    }

    showBlueFrame() {
        this.clearFrame();
        this.visualElement.classList.add('blue-frame');
    }

    showPurpleFrame() {
        this.clearFrame();
        this.visualElement.classList.add('purple-frame');
    }

    toString() { return '(' + this.row + ', ' + this.column + ')'; }
}