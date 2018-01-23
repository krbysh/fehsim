import * as feh from '../fehsim/module.js'

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

/**
 * @module fehsim-gui yeah2
 */
export class TileGui {

    /**
     * 
     * @param {feh.Node} node 
     */
    constructor(node) {
        this.htmlElement = document.createElement('div');
        this.htmlElement.className = 'battle-tile';
        this.htmlElement.innerHTML = `
            <div class="tile-frame"></div>
            <div class="tile-background"></div>
            <div class="tile-arrow"></div>
            <div class="tile-foreground"></div>
        `;
        this.frame = this.htmlElement.querySelector('.tile-frame');
        this.background = this.htmlElement.querySelector('.tile-background');
        this.arrow = this.htmlElement.querySelector('.tile-arrow');
        this.node = node;
    }

    refresh(flag = true) {
        console.log("REFRESH");
        let c = '';
        if (this.node.info.inAssistRange) c = 'green';
        if (this.node.info.inAttackRange) c = 'red';
        if (this.node.info.inMoveRange) c = 'blue';
        if (flag) {
            if (this.node.info.moveable) c = 'bright blue';
            if (this.node.info.attackable) c = 'bright red';
            if (this.node.info.assistable) c = 'bright green';
        }
        if (this.node.isEnabledBySkill) c = 'cyan';
        this.htmlElement.className = 'battle-tile ' + c;
    }

    makeValid() {
        this.htmlElement.classList.add('valid');
    }

    brightGreenFrame() {
        this.htmlElement.className = 'bright green framed battle-tile';
    }

    brightSelectedBlueFrame() {
        this.htmlElement.className = 'bright selected blue framed battle-tile';
        if (this.node.isEnabledBySkill) this.htmlElement.className = 'bright selected cyan framed battle-tile';
    }

    brightSelectedRedFrame() {
        this.htmlElement.className = 'bright selected red framed battle-tile';
    }

    brightSelectedGreenFrame() {
        this.htmlElement.className = 'bright selected green framed battle-tile';
    }

    removeSelectedFramed() {
        this.htmlElement.classList.remove('selected');
        this.htmlElement.classList.remove('framed');
    }

    removeBright() {
        this.htmlElement.classList.remove('bright');
    }

    bright() {
        this.htmlElement.classList.add('bright');
    }

    blueFrame() {
        this.htmlElement.className = 'blue framed clear battle-tile';
    }

    clear() {
        this.htmlElement.className = 'battle-tile';
    }

    clearArrow() {

        this.htmlElement.classList.remove('arrow');

        this.htmlElement.classList.remove(ARROW_ORIGIN_ONLY);

        this.htmlElement.classList.remove(ARROW_ORIGIN_TO_TOP);
        this.htmlElement.classList.remove(ARROW_ORIGIN_TO_RIGHT);
        this.htmlElement.classList.remove(ARROW_ORIGIN_TO_BOTTOM);
        this.htmlElement.classList.remove(ARROW_ORIGIN_TO_LEFT);

        this.htmlElement.classList.remove(ARROW_HORIZONTAL);
        this.htmlElement.classList.remove(ARROW_VERTICAL);

        this.htmlElement.classList.remove(ARROW_TOP_TO_END);
        this.htmlElement.classList.remove(ARROW_RIGHT_TO_END);
        this.htmlElement.classList.remove(ARROW_BOTTOM_TO_END);
        this.htmlElement.classList.remove(ARROW_LEFT_TO_END);

        this.htmlElement.classList.remove(ARROW_LEFT_TO_BOTTOM);
        this.htmlElement.classList.remove(ARROW_TOP_TO_LEFT);
        this.htmlElement.classList.remove(ARROW_RIGHT_TO_TOP);
        this.htmlElement.classList.remove(ARROW_BOTTOM_TO_RIGHT);

    }

    /**
     * 
     * @param {TileGui} from 
     * @param {TileGui} to
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
            if (from.node.row < this.node.row) fromTop = true;
            if (from.node.col > this.node.col) fromRight = true;
            if (from.node.col < this.node.col) fromLeft = true;
            if (from.node.row > this.node.row) fromBottom = true;
        }

        if (to) {
            if (to.node.row < this.node.row) toTop = true;
            if (to.node.col < this.node.col) toLeft = true;
            if (to.node.col > this.node.col) toRight = true;
            if (to.node.row > this.node.row) toBottom = true;
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

        this.htmlElement.classList.add('arrow');
        this.htmlElement.classList.add(arrow);
    }
}