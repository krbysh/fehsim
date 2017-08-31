class FehHeroGui {

    /**
     * 
     * @param {FehMapHero} hero 
     */
    constructor(hero) {
        this.hero = hero;
        this.element = document.createElement('div');
        this.element.classList.add('hero');
    }

    update() {
        this.element.style.transform = "translate(calc(var(--tile-size) * " + this.hero.column + "), calc(var(--tile-size) * " + this.hero.row + "))";
    }
}