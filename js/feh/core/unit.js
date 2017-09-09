/**
 * BLA3
 * @module Units
 * */

class FehUnitModifier {

    /**
     * 
     * @param {FehUnit} unit 
     */
    apply(unit) {
    }
}

/**
 * Ni idea
 * */
class FehOverwriteModifier extends FehUnitModifier {

    /**
     * @param {string} name 
     * @param {string} sprite 
     * @param {string} weaponType
     * @param {string} movementType
     * @param {number} hp 
     * @param {number} atk 
     * @param {number} spd 
     * @param {number} def 
     * @param {number} res 
     */
    constructor(name, sprite, weaponType, movementType, hp, atk, spd, def, res) {
        super();
        this.name = name;
        this.sprite = sprite;
        this.weaponType = weaponType;
        this.movementType = movementType;
        this.assistRange = 1;
        this.hp = hp;
        this.atk = atk;
        this.spd = spd;
        this.def = def;
        this.res = res;
        switch (this.movementType) {
            case MOVEMENT_ARMOR:
                this.maxSteps = 1; break;
            case MOVEMENT_INFANTRY:
            case MOVEMENT_FLIER:
                this.maxSteps = 2; break;
            case MOVEMENT_CAVALRY:
                this.maxSteps = 3; break;
        }
    }

    /**
     * 
     * @param {FehUnit} unit 
     */
    apply(unit) {
        unit.name = this.name;
        unit.sprite = this.sprite;
        unit.weaponType = this.weaponType;
        unit.assistRange = this.assistRange;
        unit.movementType = this.movementType;
        unit.maxSteps = this.maxSteps;
        unit.hp = this.hp;
        unit.atk = this.atk;
        unit.spd = this.spd;
        unit.def = this.def;
        unit.res = this.res;
    }
}

class FehWeaponModifier extends FehUnitModifier {

    /**
     * 
     * @param {FehWeapon} weapon 
     */
    constructor(weapon) {
        super();
        this.weapon = weapon;
    }

    /**
     * 
     * @param {FehUnit} unit 
     */
    apply(unit) {
        unit.atk += this.weapon.might;
        unit.attackRange = this.weapon.range;
    }
}

const WEAPON_SWORD = 'WEAPON_SWORD';
const WEAPON_LANCE = 'WEAPON_LANCE';
const WEAPON_AXE = 'WEAPON_AXE';
const WEAPON_BOW = 'WEAPON_BOW';
const WEAPON_DAGGER = 'WEAPON_DAGGER';

const WEAPON_GREEN_TOME = 'WEAPON_GREEN_TOME';
const WEAPON_BLUE_TOME = 'WEAPON_BLUE_TOME';
const WEAPON_RED_TOME = 'WEAPON_RED_TOME';

const MOVEMENT_FLIER = 'MOVEMENT_FLYER';
const MOVEMENT_ARMOR = 'MOVEMENT_ARMOR';
const MOVEMENT_CAVALRY = 'MOVEMENT_CAVALRY';
const MOVEMENT_INFANTRY = 'MOVEMENT_INFANTRY';

/**
 * What is this? A crossover episode?
 */
class FehUnit {

    constructor() {

        /**
         * 
         * @type {string}
         */
        this.name = "Unit";

        /**
         * 
         * @type {string}
         */
        this.sprite = null;

        /**
         * 
         * @type {boolean}
         */
        this.isWaiting = false;

        /**
         * @type {string}
         */
        this.playerKey = null;

        /**
         * @type {number}
         */
        this.row = 0;

        /**
         * @type {number}
         */
        this.column = 0;

        /**
         * @type {number}
         */
        this.maxSteps = 0;

        /**
         * @type {number}
         */
        this.attackRange = 0;

        /**
         * @type {number}
         */
        this.assistRange = 0;

        /**
         * @type {string}
         */
        this.movementType = MOVEMENT_INFANTRY;

        /**
         * @type {string}
         */
        this.weaponType = WEAPON_SWORD;

        /**
         * @type {number}
         */
        this.teamIndex = 1;

        /**
         * @type {FehMapHeroModifier[]}
         */
        this.modifiers = [];

        /**
         * @type {number}
         */
        this.hp = 0;

        /**
         * @type {number}
         */
        this.atk = 0;

        /**
         * @type {number}
         */
        this.spd;

        /**
         * @type {number}
         */
        this.def;

        /**
         * @type {number}
         */
        this.res;

        /**
         * @type {Skill}
         */
        this.weapon = null;
        /**
         * @type {Skill}
         */
        this.special = null;
        /**
         * @type {Skill}
         */
        this.passiveA = null;
        /**
         * @type {Skill}
         */
        this.passiveB = null;
        /**
         * @type {Skill}
         */
        this.passiveC = null;
        /**
         * @type {Skill}
         */
        this.sacredSeal = null;

        this.reset();
    }

    reset() {

        this.isWaiting = false;

        this.playerKey = null;
        this.teamIndex = 0;
        this.column = 0;
        this.row = 0;

        this.assistRange = 0;
        this.attackRange = 1;

        this.movementType = MOVEMENT_INFANTRY;
        this.maxSteps = 2;

        this.hp = 0;
        this.atk = 0;
        this.spd = 0;
        this.def = 0;
        this.res = 0;

        for (let i = 0; i < this.modifiers.length; i++)
            this.modifiers[i].apply(this);

    }

    /**
     * 
     * @param {FehMapHeroModifier} modifier 
     */
    addModifier(modifier) {
        this.modifiers.push(modifier);
        this.reset();
    }

    onAttackStart() {
    }

    onAttackEnd() {
    }

    toString() {
        return this.name;
    }
}