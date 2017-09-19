class FehMapHeroGui {

    /**
     * @param {FehBattleGui} gui
     * @param {FehUnit} unit 
     */
    constructor(gui, unit) {

        this.gui = gui;

        this.unit = unit;
        this.htmlElement = document.createElement('div');
        this.htmlElement.classList.add('hero');

        this.rootElement = document.createElement('div');

        if (unit.teamIndex == 0) this.htmlElement.classList.add('ltr');
        if (unit.teamIndex == 1) this.htmlElement.classList.add('rtl');

        this.weaponIconElement = document.createElement('div');
        this.weaponIconElement.classList.add('weapon-icon');
        this.weaponIconElement.classList.add(unit.weaponType);

        this.hpElement = document.createElement('p');
        this.hpElement.classList.add('hp');
        this.hpElement.textContent = '42';

        this.lifeBarElement = document.createElement('div');
        this.lifeBarElement.classList.add('life-bar');
        this.lifeBarSubElement = document.createElement('div');
        this.lifeBarElement.appendChild(this.lifeBarSubElement);

        this.spriteElement = document.createElement('img');
        if (!this.spriteElement.src) this.spriteElement.src = '/res/img/heroes/Map_Lance_Cavalier.png';
        this.spriteElement.src = unit.sprite;

        this.imgCointainer = document.createElement('div');
        this.imgCointainer.classList.add('sprite-container');
        this.imgCointainer.appendChild(this.spriteElement);

        let dialog = document.createElement('div')
        dialog.className = 'tile-dialog';

        // ***

        this.htmlElement.appendChild(this.rootElement);
        this.rootElement.appendChild(this.weaponIconElement);
        this.rootElement.appendChild(this.hpElement);
        this.rootElement.appendChild(this.lifeBarElement);
        this.rootElement.appendChild(this.imgCointainer);
        this.rootElement.appendChild(dialog);

        // this.element.addEventListener("transitionend", function (event) {
        // gui.onTransitionEnd(this);
        // }, false);

        this.unit = unit;

        this.buildAnimations();

        this.gui = gui;
    }

    /**
     * 
     * @param {number} hp 
     */
    setHp(hp) {
        this.hpElement.textContent = hp;
        this.lifeBarSubElement.style.width = (hp / this.unit.maxHp) * 100 + '%';
    }


    reset() {

        this.setPosition(this.unit.row, this.unit.column);
        this.setHp(this.unit.hp);

        // waiting
        if (this.unit.isWaiting) {
            this.htmlElement.classList.add('waiting');
        } else {
            this.htmlElement.classList.remove('waiting');
        }

        if (this.unit.isDead) {
            this.htmlElement.style.opacity = 0;
        }
    }

    setPosition(row, column) {
        this.htmlElement.style.transform = "translate(calc(var(--tile-size) * " + column + "), calc(var(--tile-size) * " + row + "))";
    }

    buildAnimations() {

        /**
         * @type {Animation}
         */
        this.attackAnimations = [];
        for (let i = 0; i < 8; i++) {
            let disp = 0.25;
            let deg = 360 * i / 8;
            let rad = deg * (Math.PI / 180);
            let x = Math.cos(rad) * disp;
            let y = Math.sin(rad) * disp;
            let animation = this.rootElement.animate([
                { transform: 'translate3D(0px, 0px, 0)' },
                { transform: 'translate3D(calc(var(--tile-size)*' + x + '), calc(var(--tile-size)*' + y + '), 0)' },
            ], {
                    duration: 125,
                    iterations: 1,
                    fill: 'forwards'
                });
            animation.cancel();
            this.attackAnimations[deg] = animation;
        }

    }

    /**
     * 
     * @param {FehAttack} attack 
     * @param {function()} onanimationend 
     */
    playAttack(attack, onanimationend) {

        let dstRow = attack.passiveUnit.row;
        let dstCol = attack.passiveUnit.column;

        let col = this.unit.column;
        let row = this.unit.row;

        let a = null;

        if (dstRow == row && dstCol > col) a = this.attackAnimations[0];
        if (dstRow == row && dstCol < col) a = this.attackAnimations[180];
        if (dstRow < row && dstCol == col) a = this.attackAnimations[270];
        if (dstRow > row && dstCol == col) a = this.attackAnimations[90];

        if (dstRow > row && dstCol > col) a = this.attackAnimations[45];
        if (dstRow > row && dstCol < col) a = this.attackAnimations[225 - 90];
        if (dstRow < row && dstCol > col) a = this.attackAnimations[225 + 90];
        if (dstRow < row && dstCol < col) a = this.attackAnimations[225];

        if (!a) throw new FehException('RAN', 'RAN_RAN_RAN');

        a.playbackRate = 1;
        a.onfinish = () => {
            this.gui.onAnimationAttackHit(attack);
            a.reverse();
            a.onfinish = () => {
                if (onanimationend) setTimeout(() => onanimationend(), 400);
                a.onfinish = null;
            }
        };
        a.play();

        console.log('home');
    }
}