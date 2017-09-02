const ARROW_ORIGIN_ONLY = 'arrow-root';

const ARROW_ORIGIN_TO_TOP = 'arrow-root-to-top';
const ARROW_ORIGIN_TO_RIGHT = 'arrow-root-to-right';
const ARROW_ORIGIN_TO_BOTTOM = 'arrow-root-to-bottom';
const ARROW_ORIGIN_TO_LEFT = 'arrow-root-to-left';

const ARROW_HORIZONTAL = 'arrow-horizontal';
const ARROW_VERTICAL = 'arrow-vertical';

const ARROW_TOP_TO_END = 'arrow-top-to-end';
const ARROW_RIGHT_TO_END = 'arrow-right-to-end';
const ARROW_BOTTOM_TO_END = 'arrow-bottom-to-end';
const ARROW_LEFT_TO_END = 'arrow-left-to-end';

const ARROW_HORIZONTAL_TO_BOTTOM = 'arrow-horizontal-to-bottom';
const ARROW_VERTICAL_TO_LEFT = 'arrow-vertical-to-left';
const ARROW_HORIZONTAL_TO_TOP = 'arrow-horizontal-to-top';
const ARROW_VERTICAL_TO_RIGHT = 'arrow-vertical-right';

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

    /**
     * 
     * @param {FehTileGui} from 
     * @param {FehTileGui} to
     */
    setArrow(from, to) {

        // this.clearArrow(); //TODO
        if (from == null && to == null) arrow = ARROW_ORIGIN_ONLY;

        let m = null;
        m.estabas_poniendole_la_clase_a_los_tiles_para_que_aparezcan_las_flechas(); 

        // MIRA HASTA ARRIBA DEL DOCUMENTO

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