class FehMapHeroGui {

    /**
     * @param {FehBattleGui} gui
     * @param {FehUnit} hero 
     */
    constructor(gui, hero) {

        this.gui = gui;

        this.hero = hero;
        this.visualElement = document.createElement('div');
        this.visualElement.classList.add('hero');

        if (hero.teamIndex == 0) this.visualElement.classList.add('ltr');
        if (hero.teamIndex == 1) this.visualElement.classList.add('rtl');

        this.weaponIconElement = document.createElement('div');
        this.weaponIconElement.classList.add('weapon-icon');
        this.visualElement.appendChild(this.weaponIconElement);

        this.hpElement = document.createElement('p');
        this.hpElement.classList.add('hp');
        this.hpElement.textContent = '42';
        this.visualElement.appendChild(this.hpElement);

        this.lifeBarElement = document.createElement('div');
        this.lifeBarElement.classList.add('life-bar');
        let lifeBarSubElement = document.createElement('div');
        this.lifeBarElement.appendChild(lifeBarSubElement);
        this.visualElement.appendChild(this.lifeBarElement);

        let img = document.createElement('img');
        img.src = hero.sprite;
        if (!img.src) img.src = '/res/img/heroes/Map_Lance_Cavalier.png';
        this.visualElement.appendChild(img);


        let dialog = document.createElement('div')
        dialog.className = 'tile-dialog';
        this.visualElement.appendChild(dialog);

        // this.element.addEventListener("transitionend", function (event) {
        // gui.onTransitionEnd(this);
        // }, false);
    }


    reset() {
        
        this.setPosition(this.hero.row, this.hero.column);

        // waiting
        if (this.hero.isWaiting) {
            this.visualElement.classList.add('waiting');
        } else {
            this.visualElement.classList.remove('waiting');
        }
    }

    setPosition(row, column) {
        this.visualElement.style.transform = "translate(calc(var(--tile-size) * " + column + "), calc(var(--tile-size) * " + row + "))";
    }
}