
import { Unit, UnitModifier } from './unit.js';
import { Combat } from './combat.js';
import { Query } from './query.js';

//console.log("skill.js");


/**
 * @readonly
 * @enum {string}
 */
var SKILL = {
    WEAPON: 'Weapon',
    ASSIST: 'Assist',
    SPECIAL: 'Special',
    PASSIVE_A: 'Passive A',
    PASSIVE_B: 'Passive B',
    PASSIVE_C: 'Passive C',
    SACRED_SEAL: 'Sacred Seal'
}

/**
 * @readonly
 * @enum {string}
 */
var WEAPON = {
    SWORD: 'Sword',
    LANCE: 'Lance',
    AXE: 'Axe',
    BOW: 'Bow',
    DAGGER: 'Dagger',
    RED_TOME: 'Red Tome',
    BLUE_TOME: 'Blue Tome',
    GREEN_TOME: 'Green Tome',
    STAFF: 'Staff',
    RED_DRAGON_STONE: 'Red Breath',
    BLUE_DRAGON_STONE: 'Blue Breath',
    GREEN_DRAGON_STONE: 'Green Breath'
};

export { SKILL, WEAPON };


/**
 * 
 */
class Skill {
    /**
     * 
     * @param {string} type 
     * @param {string} name 
     */
    constructor(type, name) {
        /**
         * @type {string}
         */
        this.type = type;
        /**
         * @type {string}
         */
        this.name = name;
        /**
         * @type {string}
         */
        this.sprite = "res/img/skills/" + name.replace(/\s/g, "_") + ".png";
    }

    /**
     * Called at before battle, used by weapons and skills like Fury or Life and Death
     * @param {Unit} unit 
     */
    onbuild(unit) { }

    /**
     * Called at the beginning of a combat and before any attack takes place
     * @param {Combat} combat
     * @param {Unit} unit 
     * @param {Unit} foe 
     */
    oncombatstart(combat, unit, foe) { }

    /**
     * Called after oncombatstart and before any attack takes place
     * @param {Combat} combat
     * @param {Unit} unit 
     * @param {Unit} foe 
     */
    oncombatstartlate(combat, unit, foe) { }

    /**
     * Called at the end of a combat, after all attacks took place
     * @param {Combat} combat
     * @param {Unit} unit 
     * @param {Unit} foe 
     */
    oncombatend(combat, unit, foe) { }

    /**
     * Called after the combat
     * @param {Combat} combat 
     * @param {Unit} unit 
     * @param {Unit} foe 
     */
    onaftercombat(combat, unit, foe) { }

    /**
     * Called at the beginning of an attack
     * @param {attack} attack
     * @param {Unit} unit 
     * @param {Unit} foe 
     */
    onattackstart(attack, unit, foe) { }

    /**
     * Called at the end of an attack
     * @param {Attack} attack
     * @param {Unit} unit 
     * @param {Unit} foe 
     */
    onattackend(attack, unit, foe) { }

    /**
     * Called at the beggining of the unit's turn (player phase)
     * @param {Unit} unit 
     */
    onturnstart(unit) { }

    /**
     * Called at the beggining of the unit's turn (player phase), but after onturnstart has been called
     * @param {Unit} unit 
     */
    onturnstartlate(unit) { }

    /**
     * Called at the end of the turn (after de enemy phase)
     * @param {Unit} unit 
     */
    onturnend(unit) { }

    /**
     * Called when a unit assists other unit
     * @param {Unit} unit the unit assisting, skill owner
     * @param {Assist} assist the unit assist skill
     * @param {Unit} target the target of the assist. The unit ally.
     */
    onassist(unit, assist, target) {}

    /**
     * 
     * @param {Unit} unit 
     * @param {Query} query 
     */
    onquery(unit, query) {}

    /**
     * Similar to onquery but in this case the query is not being made for the unit but for another unit (queryUnit).
     * This method is used by skills such as Obstruct.
     * @param {Unit} unit 
     * @param {Unit} queryUnit 
     * @param {Query} query 
     */
    onunitquery(unit, queryUnit, query) {}

     /**
     * Called whe a unit is healed
     * @param {feh.Unit} unit The owner of this skill
     * @param {number} amount The amount healed
     * @param {feh.Skill} skill The skill that produced the healing if any
     * @param {feh.Unit} source The owner of the skill producing the healing if any
     */
    onheal(unit, amount, skill, source) {}

    /**
     * Called when the unit heals the target by the amount by means of the skill
     * @param {Unit} unit The owner of this skill
     * @param {number} amount The amount of healing
     * @param {Skill} skill The skill used to heal the target
     * @param {Unit} target The healed target
     */
    oncausedhealing(unit, amount, skill, target) {}

    /**
     * Called afte onaftercombat or onwait or onmove
     * @param {Unit} unit 
     */
    onafteraction(unit) {}
}

/**
 * @extends Skill
 */
class Weapon extends Skill {

    /**
     * 
     * @param {string} weaponType 
     * @param {string} name 
     * @param {number} might How strong a weapon is. This value will be added to a character's base attack to determine damage.
     * @param {number} range The range of a weapon. Determines where a weapon can and cannot attack. (1 is melee, 2 is ranged)
     */
    constructor(weaponType, name, might, range) {
        super(SKILL.WEAPON, name);
        this.weaponType = weaponType;
        /**
         * How strong a weapon is. 
         * This value will be added to a character's base attack to determine damage.
         * @type {number}
         */
        this.might = might;
        /**
         * The range of a weapon. 
         * Determines where a weapon can and cannot attack. (1 is melee, 2 is ranged)
         * @type {number}
         */
        this.range = range;
    }

    /**
     * 
     * @param {Unit} unit 
     */
    onbuild(unit) {
        let modifier = new UnitModifier(this.name + ' Weapon Modifier', unit, this);
        modifier.apply = u => {
            u.atk += this.might;
            u.attackRange += this.range;
        };
        unit.onSwapSpaces = () => { };
        unit.addModifier(modifier);
    }

}

/**
 * @extends Skill
 */
class Assist extends Skill {

    /**
     * @param {string} name 
     * @param {number} range
     * @param {string} isStaffHealingAssist
     */
    constructor(name, range, isStaffHealingAssist = false) {
        super(SKILL.ASSIST, name);
        /**
         * @type {number}
         */
        this.range = range;
        this.isStaffHealingAssist = isStaffHealingAssist;
    }

    /**
     * 
     * @param {Unit} unit 
     */
    onbuild(unit) {
        let modifier = new UnitModifier(this.name + ' Assist Modifier', unit, this);
        modifier.apply = u => u.assistRange += this.range;
        unit.onSwapSpaces = () => { };
        unit.addModifier(modifier);
    }

    /**
     * 
     * @param {Unit} unit 
     * @param {number} unitRow 
     * @param {number} unitColumn 
     * @param {Unit} ally 
     */
    isAssistable(unit, unitRow, unitColumn, ally) { return true; }

    /**
     * 
     * @param {Unit} unit 
     * @param {Unit} ally
     */
    assist(unit, ally) {

    }
}

/**
 * @extends Skill
 */
class Special extends Skill {

    /**
     * @param {string} name 
     */
    constructor(name) {
        super(SKILL.SPECIAL, name);
        this.triggersBasedOnFoesAttack = false;
        this.triggersByAttacking = false;
    }

}

export { Skill, Weapon, Assist, Special};