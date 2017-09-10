/**
 * BLA3
 * @module Skills
 * */

const SKILL_WEAPON = "SKILL_WEAPON";
const SKILL_ASSIST = "SKILL_ASSIST";

class FehSkill {

    constructor(type, name) {
        this.type = type;
        this.name = name;
    }

    /**
     * This is called immediatly after the skill has been built.
     * Stat changes modifiers such as those of the "Fury" or "Life and Death" skills should be applied here.
     * @param {FehUnit} unit 
     */
    onBuild(unit) {
    }
}

/**
 * 
 */
class FehWeapon extends FehSkill {

    /**
     * 
     * @param {string} name 
     * @param {number} might 
     * @param {number} range 
     */
    constructor(name, might, range) {
        super(SKILL_WEAPON, name);
        this.might = might;
        this.range = range;
    }
}

/**
 * 
 */
class FehAssist extends FehSkill {

    /**
     * 
     * @param {string} name 
     * @param {number} range
     * @param {function(FehUnit, FehUnit)} onAssist
     * @param {function(FehUnit, FehUnit)} isValidTarget
     */
    constructor(name, range, onAssist = null, isValidTarget = null) {
        super(SKILL_ASSIST, name);
        this.range = range;
        if (onAssist) this.onAssist = onAssist;

        /**
         * @type {function(FehUnit, number, number, FehUnit)}
         */
        this.isValidTarget = (unit, unitRow, unitColumn, target) => true;

        if (isValidTarget) this.isValidTarget = isValidTarget;

    }

    /**
     * 
     * @param {FehUnit} unit 
     */
    onBuild(unit) {
        unit.assistRange = this.range;
    }

    /**
     * 
     * @param {FehUnit} unit 
     * @param {FehUnit} target 
     */
    onAssist(unit, target) {
    }

}

const ARDENT_SACRIFICE = new FehAssist("Ardent Sacrifice", 1, (unit, target) => {
    unit.heal(-10);
    target.heal(10);
});

const RECIPROCAL_AID = new FehAssist("Reciprocal Aid", 1, (unit, target) => {
    let temp = unit.hp;
    unit.hp = target.hp;
    target.hp = temp;
    unit.fixHp();
    target.fixHp();
});

const HEAL = new FehAssist("Heal", 1, (unit, target) => taret.heal(5));

const MARTYR = new FehAssist("Martyr", 1, (unit, target) => target.heal(7 + unit.maxHp - unit.hp));
MARTYR.onBuild = (/** @type {FehUnit} */ unit) => {
    MARTYR.range = this.range;
    let modifier = new FehStatModifier();
    modifier.maxCoolCount = 1;
    unit.addModifier(modifier);
};

const MEND = new FehAssist("Mend", 1, (unit, target) => taret.heal(10));

const PHYSIC = new FehAssist("Physic", 2, (unit, target) => taret.heal(8));

const RECONSILE = new FehAssist("Reconcile", 2, (unit, target) => {
    unit.heal(8);
    taret.heal(8);
});

const RECOVER = new FehAssist("Recover", 1, (unit, target) => target.heal(15));
RECOVER.onBuild = (/** @type {FehUnit} */ unit) => {
    RECOVER.range = this.range;
    let modifier = new FehStatModifier();
    modifier.maxCoolCount = 1;
    unit.addModifier(modifier);
};

const REHABILITATE = new FehAssist("Rehabilitate", 1, (unit, target) => {
    if (target.hp >= target.maxHp * 0.5) target.heal(7);
    else target.heal(truncate(7 + (2 * (0.5 * target.maxHp - target.hp))));
});
REHABILITATE.onBuild = (/** @type {FehUnit} */ unit) => {
    REHABILITATE.range = this.range;
    let modifier = new FehStatModifier();
    modifier.maxCoolCount = 1;
    unit.addModifier(modifier);
};

const DANCE = new FehAssist("Dance", 1,
    (unit, target) => target.isWaiting = false,
    (unit, unitRow, unitColumn, target) => {
        if (!target.isWaiting) return false;
        if (target.assist == DANCE || target.assist == SING) return false;
        return true;
    }
);

const SING = new FehAssist("Sing", 1,
    (unit, target) => target.isWaiting = false,
    (unit, unitRow, unitColumn, target) => {
        if (!target.isWaiting) return false;
        if (target.assist == DANCE || target.assist == SING) return false;
        return true;
    }
);

const DRAW_BACK = new FehAssist("Draw Back", 1,
    (unit, target) => {
        let backRow = unitRow - target.row + unitRow;
        let backColumn = unitColumn - target.column + unitColumn;
        let formerRow = unitRow;
        let formerColumn = unitColumn;;
        unit.row = backRow;
        unit.column = backColumn;
        target.row = formerRow;
        target.column = formerColumn;
    },
    (/** @type {FehUnit} */unit, unitRow, unitColumn, target) => {

        console.log('DRAW BACK :: isValidTarget(' + unit.name + ', ' + target.name + ')')
        let backRow = unitRow - target.row + unitRow;
        let backColumn = unitColumn - target.column + unitColumn;
        let formerRow = unitRow;
        let formerColumn = unitColumn;

        console.log('(' + backRow + ', ' + backColumn + ') & (' + formerRow + ', ' + formerColumn + ')')

        if (backRow < 0 || backColumn < 0 || backColumn >= 6 || backRow >= 8) return false;

        let otherUnit = unit.battle.getHeroAt(backRow, backColumn);
        if (otherUnit == unit || otherUnit == target)
            otherUnit = null;

        return unit.isTraversableTerrain(unit.battle.map.tiles[backRow][backColumn]) &&
            target.isTraversableTerrain(unit.battle.map.tiles[formerRow][formerColumn]) &&
            !otherUnit;
    }
);

const GRADIVUS = new FehWeapon("Gradivus", 16, 1);
const GRONBLADE_PLUS = new FehWeapon("Gronblade+", 13, 2);
const BLARBLADE_PLUS = new FehWeapon("Blarblade+", 13, 2);
const ROGUE_DAGGER_PLUS = new FehWeapon("Rogue Dagger+", 7, 2);
const SILVER_SWORD_PLUS = new FehWeapon("Silver Sword+", 15, 1);
const SEIGLINDE = new FehWeapon("Seiglinde", 16, 1);
const SEIGMUND = new FehWeapon("Seigmund", 16, 1);