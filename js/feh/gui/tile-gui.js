const ARROW_ORIGIN_ONLY = 'o';

const ARROW_ORIGIN_TO_TOP = 'o2t';
const ARROW_ORIGIN_TO_RIGHT = 'o2r';
const ARROW_ORIGIN_TO_BOTTOM = 'o2b';
const ARROW_ORIGIN_TO_LEFT = 'o2l';

const ARROW_HORIZONTAL = 'h';
const ARROW_VERTICAL = 'v';

const ARROW_TOP_TO_END = 'e2t';
const ARROW_RIGHT_TO_END = 'e2r';
const ARROW_BOTTOM_TO_END = 'e2b';
const ARROW_LEFT_TO_END = 'e2l';

const ARROW_LEFT_TO_BOTTOM = 'l2b';
const ARROW_TOP_TO_LEFT = 't2l';
const ARROW_RIGHT_TO_TOP = 'r2t';
const ARROW_BOTTOM_TO_RIGHT = 'b2r';

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

        let wall = document.createElement('wall')
        wall.className = 'tile-wall';

        let arrow = document.createElement('div')
        arrow.className = 'tile-arrow';

        let danger = document.createElement('wall')
        danger.className = 'tile-danger';

        this.visualElement.appendChild(background);
        this.visualElement.appendChild(frame);
        this.visualElement.appendChild(arrow);
        this.visualElement.appendChild(wall);
        this.visualElement.appendChild(danger);

        this.clear();
    }

    setDanger() {
        this.visualElement.classList.add('danger');
    }

    clearDanger() {
        this.visualElement.classList.remove('danger');
    }

    setWall() {
        this.visualElement.classList.add('wall-eu');
    }

    onclick() { this.gui.onTile(this.row, this.column); }

    clear() {
        this.visualElement.className = 'tile';
    }

    clearArrow() {

        this.visualElement.classList.remove('arrow');

        this.visualElement.classList.remove(ARROW_ORIGIN_ONLY);

        this.visualElement.classList.remove(ARROW_ORIGIN_TO_TOP);
        this.visualElement.classList.remove(ARROW_ORIGIN_TO_RIGHT);
        this.visualElement.classList.remove(ARROW_ORIGIN_TO_BOTTOM);
        this.visualElement.classList.remove(ARROW_ORIGIN_TO_LEFT);

        this.visualElement.classList.remove(ARROW_HORIZONTAL);
        this.visualElement.classList.remove(ARROW_VERTICAL);

        this.visualElement.classList.remove(ARROW_TOP_TO_END);
        this.visualElement.classList.remove(ARROW_RIGHT_TO_END);
        this.visualElement.classList.remove(ARROW_BOTTOM_TO_END);
        this.visualElement.classList.remove(ARROW_LEFT_TO_END);

        this.visualElement.classList.remove(ARROW_LEFT_TO_BOTTOM);
        this.visualElement.classList.remove(ARROW_TOP_TO_LEFT);
        this.visualElement.classList.remove(ARROW_RIGHT_TO_TOP);
        this.visualElement.classList.remove(ARROW_BOTTOM_TO_RIGHT);

    }

    /**
     * 
     * @param {FehTileGui} from 
     * @param {FehTileGui} to
     */
    setArrow(from, to) {

        let fromTop = false;
        let fromRight = false;
        let fromBottom = false;
        let fromLeft = false;

        let toTop = false;
        let toRight = false;
        let toBottom = false;
        let toLeft = false;

        if (from) {
            if (from.row < this.row) fromTop = true;
            if (from.column > this.column) fromRight = true;
            if (from.column < this.column) fromLeft = true;
            if (from.row > this.row) fromBottom = true;
        }

        if (to) {
            if (to.row < this.row) toTop = true;
            if (to.column < this.column) toLeft = true;
            if (to.column > this.column) toRight = true;
            if (to.row > this.row) toBottom = true;
        }

        this.clearArrow();

        let arrow = 'something-went-wrong';

        if (from == null && to == null) arrow = ARROW_ORIGIN_ONLY;

        // ORIGIN_TO_ ...
        if (from == null) {
            if (toTop) arrow = ARROW_ORIGIN_TO_TOP;
            if (toRight) arrow = ARROW_ORIGIN_TO_RIGHT;
            if (toBottom) arrow = ARROW_ORIGIN_TO_BOTTOM;
            if (toLeft) arrow = ARROW_ORIGIN_TO_LEFT;
        }

        // ... _TO_END
        if (to == null) {
            if (fromTop) arrow = ARROW_TOP_TO_END;
            if (fromRight) arrow = ARROW_RIGHT_TO_END;
            if (fromBottom) arrow = ARROW_BOTTOM_TO_END;
            if (fromLeft) arrow = ARROW_LEFT_TO_END;
        }

        // ETC
        if (from && to) {
            
            if ((fromLeft && toRight) || (fromRight && toLeft)) arrow = ARROW_HORIZONTAL;
            if ((fromBottom && toTop) || (fromTop && toBottom)) arrow = ARROW_VERTICAL;
            
            if (fromLeft && toBottom || fromBottom && toLeft) arrow = ARROW_LEFT_TO_BOTTOM;
            if (fromLeft && toTop || fromTop && toLeft) arrow = ARROW_TOP_TO_LEFT;

            if (fromRight && toBottom || fromBottom && toRight) arrow = ARROW_BOTTOM_TO_RIGHT;
            if (fromRight && toTop || fromTop && toRight) arrow = ARROW_RIGHT_TO_TOP;
        }

        this.visualElement.classList.add('arrow');
        this.visualElement.classList.add(arrow);
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