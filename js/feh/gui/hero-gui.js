class FehMapHeroGui {

    /**
     * @param {FehBattleGui} gui
     * @param {FehMapHero} hero 
     */
    constructor(gui, hero) {

        this.gui = gui;

        this.hero = hero;
        this.element = document.createElement('div');
        this.element.classList.add('hero');

        if (hero.teamIndex == 0) this.element.classList.add('ltr');
        if (hero.teamIndex == 1) this.element.classList.add('rtl');

        this.weaponIconElement = document.createElement('div');
        this.weaponIconElement.classList.add('weapon-icon');
        this.element.appendChild(this.weaponIconElement);

        this.hpElement = document.createElement('p');
        this.hpElement.classList.add('hp');
        this.hpElement.textContent = '42';
        this.element.appendChild(this.hpElement);

        this.lifeBarElement = document.createElement('div');
        this.lifeBarElement.classList.add('life-bar');
        let lifeBarSubElement = document.createElement('div');
        this.lifeBarElement.appendChild(lifeBarSubElement);
        this.element.appendChild(this.lifeBarElement);

        let img = document.createElement('img');
        img.src = '/res/img/heroes/Map_Lance_Cavalier.png';
        this.element.appendChild(img);

        // this.element.addEventListener("transitionend", function (event) {
        // gui.onTransitionEnd(this);
        // }, false);
    }

    reset() {
        this.setPosition(this.hero.row, this.hero.column);

        // waiting
        if (this.hero.isWaiting) {
            this.element.classList.add('waiting');
        } else {
            this.element.classList.remove('waiting');
        }
    }

    setPosition(row, column) {
        this.element.style.transform = "translate(calc(var(--tile-size) * " + column + "), calc(var(--tile-size) * " + row + "))";
    }
}