import * as feh from '../fehsim/module.js';

let ROTATEL = 0;

/**
 * @module fehsim-gui yeah1
 */
export class BattleUnitGui {

    /**
     * @param {feh.Unit} unit 
     */
    constructor(unit) {

        this.htmlElement = document.createElement('div');
        this.htmlElement.innerHTML = `
            <div class='unit-root-element'>
                <div class='unit-weapon'></div>
                <div class='unit-cooldown'></div>
                <div class='unit-hp-a'></div>
                <div class='unit-hp-b'></div>
                <div class='unit-sprite'></div>
            </div>
        `;
        this.htmlElement.className = 'battle-unit';
        this.htmlElement.classList.add(unit.tactician.toLowerCase());

        this.rootElement = this.htmlElement.querySelector('.unit-root-element');
        this.weaponElement = this.htmlElement.querySelector('.unit-weapon');
        this.spriteElement = this.htmlElement.querySelector('.unit-sprite');

        this.animationNodeElement = this.htmlElement.querySelector('.unit-animation-node');

        /**
         * @type {feh.Unit}
         */
        this.unit = unit;
        this.reset();

    }

    playHit(dmg) {
        let div = document.createElement('div');
        div.innerHTML = '<div style="width:100%; height:100%; position:absolute; transform:rotate(' + ((ROTATEL += 50) % 180) + 'deg);"><div></div><div></div><div></div></div>';
        div.className = 'unit-hit-node';
        div.addEventListener('animationend', ev => { if (div.parentElement) div.parentElement.removeChild(div); });
        this.htmlElement.appendChild(div);
    }

    destroy() {

        if (this.unit === null) return;

        this.htmlElement.parentElement.removeChild(this.htmlElement);
        this.htmlElement = null;
        this.weaponElement = null;
        this.spriteElement = null;
        this.unit = null;
    }

    reset(allowkill = true) {

        if (this.unit === null) return;

        this.setPosition(this.unit.row, this.unit.col);
        this.spriteElement.style.backgroundImage = "url('" + this.unit.sprite + "')";;
        if (this.unit.waiting) this.htmlElement.classList.add('waiting');
        else this.htmlElement.classList.remove('waiting');
        this.weaponElement.className = 'unit-weapon ' + this.unit.weaponType.toLowerCase().replace(/\s/g, "-");

        if (this.unit.hp <= 0 && allowkill) {
            this.htmlElement.classList.add('dying');
            this.htmlElement.addEventListener('animationend', ev => {
                if (ev.animationName == 'dying-animation')
                    this.destroy();
            });
        }
    }

    setPosition(row, col) {
        //this.htmlElement.style.left = "calc(var(--tile-size) * " + col + "px)";
        //this.htmlElement.style.bottom = "calc(var(--tile-size) * " + (7 - row) + "px)";
        this.htmlElement.style.transform = "translate(calc(var(--tile-size) * " + col + "px), calc(var(--tile-size) * " + row + "px))";
    }

    /**
     * 
     * @param {feh.Skill} skill 
     */
    playSkillTriggerAnimation(skill) {
        let e = document.createElement('div');
        e.className = 'unit-animation-node';
        e.style.backgroundImage = 'url(' + skill.sprite + ')';
        if (skill.type == feh.SKILL.ASSIST) e.classList.add('assist');
        if (skill.type == feh.SKILL.WEAPON) e.classList.add('weapon');
        e.addEventListener('animationend', ev => e.parentElement.removeChild(e));
        this.htmlElement.appendChild(e);
    }
}