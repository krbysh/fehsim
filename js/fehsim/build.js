//console.log("build.js");

import { MOVEMENT, STAT, TERRAIN } from './enums.js';
import { Unit, UnitModifier, HeroModifier } from './unit.js';
import { Hero } from './hero.js';
import { Skill } from './skill.js';
import { Exception, EX } from './exception.js';

/**
 * A build is a template for "building" a Unit, 
 * it includes everything from the hero and his/her stat variations, rarity and level to the equipment, skills and sacred seal.
 */
export class Build {

    constructor() {

        /** @type {Hero} */ this.hero = null;
        /** @type {number} */ this.rarity = 5;
        /** @type {number} */ this.merges = 0;
        /** @type {number} */ this.level = 40;
        /** @type {string} */ this.boon = null;
        /** @type {string} */ this.bane = null;
        /** @type {Skill} */ this.weapon = null;
        /** @type {Skill} */ this.assist = null;
        /** @type {Skill} */ this.special = null;
        /** @type {Skill} */ this.passiveA = null;
        /** @type {Skill} */ this.passiveB = null;
        /** @type {Skill} */ this.passiveC = null;
        /** @type {Skill} */ this.sacredSeal = null;
    }

    /**
     * Creates a new unit and applies the respective modifiers for the hero and each skill (weapon, assist, special, passives and sacred seal)
     * @returns {Unit}
     */
    build() {

        let unit = new Unit();

        
        unit.equip(this.weapon);
        unit.equip(this.assist);
        unit.equip(this.special);
        unit.equip(this.passiveA);
        unit.equip(this.passiveB);
        unit.equip(this.passiveC);
        unit.equip(this.sacredSeal);

        unit.addModifier(new HeroModifier(this.hero, this.rarity, this.merges, this.level, this.boon, this.bane))

        if (unit.weapon) unit.weapon.onbuild(unit);
        if (unit.assist) unit.assist.onbuild(unit);
        if (unit.special) unit.special.onbuild(unit);
        if (unit.passiveA) unit.passiveA.onbuild(unit);
        if (unit.passiveB) unit.passiveB.onbuild(unit);
        if (unit.passiveC) unit.passiveC.onbuild(unit);
        if (unit.sacredSeal) unit.sacredSeal.onbuild(unit);

        return unit;
    }

    /**
     * Validates each field of the given Build object
     * @param {Build} build to be validated
     * @throws Will throw an exception if the build is not a valid build object
     */
    static validate(build) {
        if (!build) throw new Exception(EX.MISSING_PARAM, 'The build is null or undefined');
        if (!(build instanceof Build)) throw new Exception(EX.BAD_PARAM, 'The build is not an instance of Build');
        Hero.validate(build.hero);
        if (build.weapon) Skill.validate(build.weapon);
        if (build.assist) Skill.validate(build.assist);
        if (build.special) Skill.validate(build.special);
        if (build.passiveA) Skill.validate(build.passiveA);
        if (build.passiveB) Skill.validate(build.passiveB);
        if (build.passiveC) Skill.validate(build.passiveC);
        if (build.sacredSeal) Skill.validate(build.sacredSeal);
    }
}

