//console.log("unit.js");

import { MOVEMENT, STAT, TERRAIN } from './enums.js';
import { Battle } from './battle.js';
import { Query } from './query.js';
import { Combat } from './combat.js';
import { Skill, Weapon, Assist, Special, SKILL } from './skill.js';
import { Exception, EX } from './exception.js';

function pseudosafeforeach(array, foreach) {
    for (let i = array.length - 1; i >= 0; i--) {
        let e = array[i];
        foreach(e);
    }
}

let ID_CONSECUTIVE = 1000;

export class UnitModifier {

    /**
     * 
     * @param {string} description
     * @param {Unit} sourceUnit
     * @param {Skill} sourceSkill 
     */
    constructor(description, sourceUnit, sourceSkill) {

        this.t = new Date();

        /**
         * Text representation of the modifier
         * @type {string}
         */
        this.description = description;

        /**
         * Unit owning the skill generating the modifier
         * @type {Unit}
         */
        this.sourceUnit = sourceUnit;

        /**
         * Skill generating the modifier
         * @type {Skill}
         */
        this.sourceSkill = sourceSkill;

        /**
         * Flag indicating that this modifier is a buff (field buff). 
         * GUI can use this to play a buff animation.
         * @type {boolean}
         */
        this.isBuff = false;

        /**
         * Flag indicating that this modifier is a debuff (field debuff). 
         * GUI can use this to play a debuff animation.
         * @type {boolean}
         */
        this.isDebuff = false;

        /**
         * Flag indicating that this modifier was added during a combat and will be removed before it ends
         * @type {boolean}
         */
        this.isCombatModifier = false;

        /** @type {function(Unit)} */
        this.onswapspaces = unit => unit.removeModifier(this);

        /** @type {function(Combat, Unit, Unit)} */
        this.oncombatstart = null;

        /** @type {function(Combat, Unit, Unit)} */
        this.oncombatstartlate = null;

        /** @type {function(Combat, Unit, Unit)} */
        this.oncombatend = null;

        /** @type {function(Unit)} */
        this.onturnstart = null;

        /** @type {function(Combat, Unit, Unit)} */
        this.onaftercombat = null;

        /** @type {function(Combat, Unit, Unit)} */
        this.onattackstart = null;

        /** @type {function(Combat, Unit, Unit)} */
        this.onattackend = null;

        /** @type {function(Unit)} */
        this.onturnstartlate = null;

        /** @type {function(Unit)} */
        this.onturnend = null;

        /** @type {function(Unit, Query)} */
        this.onquery = null;

        /** @type {function(Unit)} */
        this.onafteraction = null;
    }

    /**
     * 
     * @param {Unit} unit 
     */
    apply(unit) {
    }

    toString() {
        return this.description;
    }
}

export class UnitListener {

    /**
     * 
     * @param {Unit} unit 
     * @param {Modifier} modifier 
     */
    onaddmodifier(unit, modifier) { }

    /**
     * 
     * @param {Unit} unit 
     * @param {Modifier} modifier 
     */
    onremovemodifier(unit, modifier) { }

    /**
     * Called when the unit gets healed because of the skill owned by the skillOwner by a given amount
     * @param {Unit} unit 
     * @param {number} amount 
     * @param {Skill} skill
     * @param {Unit} skillOwner
     */
    onheal(unit, amount, skill, skillOwner) { }

    /**
     * Called when the unit heals the target by the amount by means of the skill
     * @param {Unit} unit 
     * @param {number} amount 
     * @param {Skill} skill 
     * @param {Unit} target 
     */
    oncausedhealing(unit, amount, skill, target) { }
}

/**
 * 
 */
export class Unit {

    constructor() {

        /** @type {Weapon} */ this.weapon = null;
        /** @type {Assist} */ this.assist = null;
        /** @type {Special} */ this.special = null;
        /** @type {Skill} */ this.passiveA = null;
        /** @type {Skill} */ this.passiveB = null;
        /** @type {Skill} */ this.passiveC = null;
        /** @type {Skill} */ this.sacredSeal = null;

        /** 
         * @type {string} 
         */
        this.tactician = null;

        /** 
         * @type {string} 
         */
        this.name = null;

        /**
         * Movement is split into Infantry, Armored, Flying and Cavalry. 
         * @type {string} 
         */
        this.weaponType = null;

        /** 
         * @type {number} 
         */
        this.attackRange = false;

        /** 
         * @type {number}
         */
        this.assistRange = false;

        /**
         * Movement is split into Infantry, Armored, Flying and Cavalry. 
         * @type {string} 
         */
        this.movementType = null;

        /** 
         * @type {number} 
         */
        this.steps = false;

        /**
         * @type {number} 
         */
        this.row = -1;

        /** 
         * @type {number} 
         */
        this.col = -1;

        /**
         *  @type {boolean} 
         */
        this.waiting = false;

        /**
         * @type {number}
         */
        this.specialCooldownCount = 0;

        /**
         * @type {number}
         */
        this.maxSpecialCooldownCount = 0;

        /**
         * This is the unit's health. If this hits zero, they are KO'd 
         * @type {number} 
         */
        this.hp = 0;

        /**
         * This is the maximun hp that the unit can have.
         * @type {number}
         */
        this.maxHp = 0;

        /**
         * This is the unit's overall damage stat regardless of what type of weapon they use. 
         * @type {number} 
         */
        this.atk = 0;

        /** 
         * This is the unit's speed. 
         * If a unit has 5 or more SPD over an opponent, then that hero can attack the enemy twice. 
         * This does not affect a unit's movement distance.
         * @type {number} 
         */
        this.spd = 0;

        /**
         * This is the unit's physical-based damage reduction stat.
         * This reduces how much damage a unit will take from physical damage.
         * @type {number}
         */
        this.def = 0;

        /**
         * This is the unit's magical-based damage reduction stat.
         * This reduces how much damage a unit will take from magic damage.
         * @type {number}
         */
        this.res = 0;

        /**
         * Attack Buff
         * @type {number}
         */
        this.atkBuff = 0;
        /**
         * Speed Buff
         * @type {number}
         */
        this.spdBuff = 0;
        /**
         * Defense Buff
         * @type {number}
         */
        this.defBuff = 0;
        /**
         * Resistance Buff
         * @type {number}
         */
        this.resBuff = 0;

        /**
         * Attack Debuff
         * @type {number}
         */
        this.atkDebuff = 0;
        /**
         * Speed Debuff
         * @type {number}
         */
        this.spdDebuff = 0;
        /**
         * Defense Debuff
         * @type {number}
         */
        this.defDebuff = 0;
        /**
         * Resistance Debuff
         * @type {number}
         */
        this.resDebuff = 0;

        /**
         * @type {Modifier[]}
         */
        this.modifiers = [];

        /**
         * @type {string}
         */
        this.sprite = null;

        /**
         * @type {string}
         */
        this.portrait = null;

        /**
         * @type {Skill[]}
         */
        this.skills = [];

        /**
         * @type {Battle}
         */
        this.battle = null;

        this.random = ID_CONSECUTIVE++;

        /** @type {UnitListener[]} */ this.listeners = [];

    }

    /**
     * 
     * @param {Skill} skill 
     */
    equip(skill) {

        if (!skill) return;

        let oldSkill = this.skills.find(s => s.type == skill.type);
        if (oldSkill) this.unequip(skill);

        if (skill.type === SKILL.WEAPON) this.weapon = skill;
        if (skill.type === SKILL.ASSIST) this.assist = skill;
        if (skill.type === SKILL.SPECIAL) this.special = skill;
        if (skill.type === SKILL.PASSIVE_A) this.passiveA = skill;
        if (skill.type === SKILL.PASSIVE_B) this.passiveB = skill;
        if (skill.type === SKILL.PASSIVE_C) this.passiveC = skill;
        if (skill.type === SKILL.SACRED_SEAL) this.sacredSeal = skill;

        this.skills.push(skill);

    }

    /**
    * 
    * @param {Skill} skill 
    */
    unequip(skill) {
        if (this.skills.includes(skill))
            this.skills.splice(this.skills.indexOf(skill), 1);
    }

    /**
     * asd
     * @param {string} terrain 
     */
    isAbleToTraverseTerrain(terrain) {
        if (terrain == TERRAIN.BLOCK) return false;
        if (terrain == TERRAIN.VOID && this.movementType !== MOVEMENT.FLYING) return false;
        if (terrain == TERRAIN.FOREST && this.movementType === MOVEMENT.CAVALRY) return false;
        return true;
    }

    /**
     * 
     * @param {Modifier} modifier 
     */
    addModifier(modifier) {
        if (!this.modifiers.includes(modifier))
            this.modifiers.push(modifier);
        this.updateModifers();
        this.listeners.forEach(l => l.onaddmodifier(this, modifier));
    }

    /**
     * 
     * @param {Modifier} modifier 
     */
    removeModifier(modifier) {
        if (this.modifiers.includes(modifier)) {
            this.modifiers.splice(this.modifiers.indexOf(modifier), 1);
            this.updateModifers();
            this.listeners.forEach(l => l.onremovemodifier(this, modifier));
        } else {
            console.error('WTF');
        }
    }

    /**
     * 
     */
    updateModifers() {
        this.steps = 0;
        this.movementType = this.weaponType = null;
        this.assistRange = this.attackRange = 0;
        this.maxSpecialCooldownCount = 0;
        this.maxHp = this.atk = this.def = this.res = this.spd = 0;
        this.atkBuff = this.defBuff = this.spdBuff = this.resBuff = 0;
        this.atkDebuff = this.defDebuff = this.spdDebuff = this.resDebuff = 0;
        this.modifiers.forEach(m => m.apply(this));
    }

    /**
     * @param {Unit} unit 
     */
    static validate(unit) {
        if (!unit) throw new Exception(EX.MISSING_PARAM, 'Unit is missing');
        if (!(unit instanceof Unit)) throw new Exception(EX.BAD_PARAM, "'" + unit + "' is not an instance of Unit");
    }

    /**
     * Called when the player enters (or returns) to the Swap Spaces phase, used to clear first turn modifiers.
     */
    onSwapSpaces() {
        this.modifiers.forEach(m => { if (m.onswapspaces) m.onswapspaces(this); });
    }

    /**
     * Reestablishes hp and ... to their default value
     */
    reset() {
        this.hp = this.maxHp;
        this.specialCooldownCount = this.maxSpecialCooldownCount;
    }



    /**
     * 
     */
    onTurnStart() {
        this.skills.forEach(s => { if (s) s.onturnstart(this); })
        pseudosafeforeach(this.modifiers, m => { if (m.onturnstart) m.onturnstart(combat, this, foe) });
    }

    /**
     * 
     */
    onTurnStartLate() {
        this.skills.forEach(s => { if (s) s.onturnstartlate(this); })
        pseudosafeforeach(this.modifiers, m => { if (m.onturnstartlate) m.onturnstartlate(combat, this, foe) });
    }

    /**
     * 
     */
    onTurnEnd() {
        this.skills.forEach(s => { if (s) s.onturnend(this); })
        pseudosafeforeach(this.modifiers, m => { if (m.onturnend) m.onturnend(this); });
    }

    /**
     * 
     * @param {Combat} combat
     * @param {Unit} foe 
     */
    onCombatStart(combat, foe) {
        this.skills.forEach(s => { if (s) s.oncombatstart(combat, this, foe); })
        pseudosafeforeach(this.modifiers, m => { if (m.oncombatstart) m.oncombatstart(combat, this, foe) });
    }

    /**
     * 
     * @param {Combat} combat
     * @param {Unit} foe 
     */
    onCombatStartLate(combat, foe) {
        this.skills.forEach(s => { if (s) s.oncombatstartlate(combat, this, foe); })
        pseudosafeforeach(this.modifiers, m => { if (m.oncombatstartlate) m.oncombatstartlate(combat, this, foe) });
    }

    /**
     * 
     * @param {Combat} combat
     * @param {Unit} foe 
     */
    onCombatEnd(combat, foe) {
        this.skills.forEach(s => { if (s) s.oncombatend(combat, this, foe); });
        pseudosafeforeach(this.modifiers, m => { if (m.oncombatend) m.oncombatend(combat, this, foe) });
    }

    /**
     * 
     * @param {Combat} combat
     * @param {Unit} foe 
     * @param {boolean} unitInitiatedCombat Used to indicate that this unit initiated the combat
     */
    onAfterCombat(combat, foe, unitInitiatedCombat = false) {
        this.skills.forEach(s => { if (s) s.onaftercombat(combat, this, foe); });
        pseudosafeforeach(this.modifiers, m => { if (m.onaftercombat) m.onaftercombat(combat, this, foe) });
        if (unitInitiatedCombat)
            this.onAfterAction();
    }

    /**
     * 
     * @param {Attack} attack
     * @param {Unit} foe 
     */
    onAttackStart(attack, foe) {
        this.skills.forEach(s => { if (s) s.onattackstart(attack, this, foe); });
        pseudosafeforeach(this.modifiers, m => { if (m.onattackstart) m.onattackstart(attack, this, foe) });
    }

    /**
     * 
     * @param {Attack} attack 
     * @param {Unit} foe 
     */
    onAttackEnd(attack, foe) {
        this.skills.forEach(s => { if (s) s.onattackend(attack, this, foe); });
        pseudosafeforeach(this.modifiers, m => { if (m.onattackend) m.onattackend(attack, this, foe) });
    }

    /**
     * @param {Unit} target 
     */
    onAssist(target) {
        this.skills.forEach(s => { if (s) s.onassist(this, this.assist, target); });
        pseudosafeforeach(this.modifiers, m => { if (m.onassist) m.onassist(this, this.assist, target) });
        this.onAfterAction();
    }

    /**
     * Called when an action query for this unit is about to be calculated.
     * Called before the path finding algorithm solves and after the traversable terrain and occupied tiles are defined.
     * @param {Query} query 
     */
    onQuery(query) {
        this.skills.forEach(s => { if (s) s.onquery(this, query); });
        pseudosafeforeach(this.modifiers, m => { if (m.onquery) m.onquery(this, query) });
    }

    /**
     * Called when an action query for another unit is about to be calculated.
     * Called before the path finding algorithm solves and after the traversable terrain and occupied tiles are defined.
     * @param {Unit} unit 
     * @param {Query} query 
     */
    onUnitQuery(unit, query) {
        this.skills.forEach(s => { if (s) s.onunitquery(this, unit, query); });
        pseudosafeforeach(this.modifiers, m => { if (m.onunitquery) m.onunitquery(this, unit, query) });
    }

    /**
     * 
     * @param {UnitListener} listener 
     */
    addUnitListener(listener) {
        if (!this.listeners.includes(listener))
            this.listeners.push(listener);
    }

    onMove() {
        this.onAfterAction();
    }

    onWait() {
        console.log('Unit.onWait');
        this.onAfterAction();
    }

    onAfterAction() {
        console.log(this + ' Unit.onAfterAction');
        this.skills.forEach(s => { if (s) s.onafteraction(this); });
        pseudosafeforeach(this.modifiers, m => {
            console.log('    ' + m + ' pseudosafeforeach')
            if (m.onafteraction) {
                m.onafteraction(this)
            }
        });
    }

    /**
     * 
     * @param {UnitListener} listener 
     */
    removeUnitListener(listener) {
        if (!this.listeners.includes(listener))
            this.listeners.splice(this.listeners.indexOf(listener), 1);
    }

    /**
     * Called to both heal the unit (positive amount parameter) and to inflict non-combat damage (negative amount parameter)
     * @param {number} amount the amount healed
     * @param {Skill} skill the skill causing the healing
     * @param {Unit} skillOwner the owner of the skill causing the healing
     */
    heal(amount, skill, skillOwner) {
        this.hp += amount;
        if (this.hp < 1) this.hp = 1;
        if (this.hp > this.maxHp) this.hp = this.maxHp;

        if (skillOwner) skillOwner.onCausedHealing(this, amount, skill);

        this.skills.forEach(s => { if (s) s.onheal(this, amount, skill, skillOwner); });
        this.listeners.forEach(l => l.onheal(this, amount, skill, skillOwner));
    }

    /**
     * This is called when a unit is healed because of this unit
     * @param {Unit} target The unit being healed
     * @param {number} amount The amount healed
     * @param {Skill} skill The skill responsible for the heal
     */
    onCausedHealing(target, amount, skill) {
        this.skills.forEach(s => { if (s) s.oncausedhealing(this, amount, skill, target); });
        this.listeners.forEach(l => l.oncausedhealing(this, amount, skill, target));
    }

    /**
     * @returns {Unit[]}
     */
    getAllies() {
        return this.battle.units.filter(ally => ally.tactician == this.tactician && ally !== this);
    }

    /**
     * @returns {Unit[]}
     */
    getEnemies() {
        return this.battle.units.filter(enemy => enemy.tactician !== this.tactician);
    }

    /**
     * The distance between two points in a grid based on a strictly horizontal and/or vertical path (that is, along the grid lines), 
     * as opposed to the diagonal or "as the crow flies" distance. 
     * @param {Unit} unit the unit to which manhattan distance will be calculated
     * @returns {number} The manhattan distance from this to node
     */
    getManhattanDistanceTo(unit) { return Math.abs(unit.row - this.row) + Math.abs(unit.col - this.col); }

    toString() {
        return this.name;
    }

}

/**
 * @private
 */
export class HeroModifier extends UnitModifier {

    /**
     * 
     * @param {Hero} hero 
     * @param {number} rarity 
     * @param {number} merges 
     * @param {number} level 
     * @param {string} boonStat 
     * @param {string} baneStat 
     */
    constructor(hero, rarity, merges, level, boonStat, baneStat) {
        super('Build Modifier', null, null);
        this.name = hero.name;
        this.stats = hero.calculateStats(rarity, merges, level, boonStat, baneStat);
        this.weaponType = hero.weaponType;
        this.movementType = hero.movementType;
        this.steps = 0; // console.warn('DEBERIA SER CERO');
        switch (this.movementType) {
            case MOVEMENT.CAVALRY:
                this.steps++;
            case MOVEMENT.FLYING:
            case MOVEMENT.INFANTRY:
                this.steps++;
            case MOVEMENT.ARMORED:
                this.steps++;
        }
        this.onswapspaces = null;
    }

    /**
     * 
     * @param {Unit} unit 
     */
    apply(unit) {
        unit.sprite = "res/img/heroes/" + this.name + ".png";
        unit.portrait = "res/img/heroes/" + this.name + ".png";
        unit.name = this.name;
        unit.weaponType = this.weaponType;
        unit.movementType = this.movementType;
        unit.steps = this.steps;
        unit.maxHp = this.stats[0];
        unit.atk = this.stats[1];
        unit.spd = this.stats[2];
        unit.def = this.stats[3];
        unit.res = this.stats[4];
    }
}