class FehBuild {

    /**
     * 
     * @param {FehHero} hero 
     * @param {number} rarity 
     * @param {number} boonStat 
     * @param {number} baneStat 
     * @param {number} level 
     * @param {FehWeapon} weapon 
     * @param {FehSkill} assist 
     * @param {FehPassive} special 
     * @param {FehSkill} passiveA 
     * @param {FehSkill} passiveB 
     * @param {FehSkill} passiveC 
     */
    constructor(hero, rarity, boonStat, baneStat, level, weapon, assist, special, passiveA, passiveB, passiveC, sacredSeal) {
        this.hero = hero;
        this.rarity = rarity;
        this.boonStat = boonStat;
        this.baneStat = baneStat;
        this.level = level;
        this.weapon = weapon;
        this.assist = assist;
        this.special = special;
        this.passiveA = passiveA;
        this.passiveB = passiveB;
        this.passiveC = passiveC;
        this.sacredSeal = sacredSeal;
    }

    /**
     * @returns {FehMapHero} 
     */
    createInstance() {

        console.log('creating instance of ' + this);

        let instance = new FehMapHero();
        instance.stats = new FehStats(40, 20, 15, 10, 10);
        return instance;
    }

}