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
     * @param {function(FehUnit, number, number, FehUnit)} isValidTarget
     */
    constructor(name, range, onAssist = null, isValidTarget = null) {
        super(SKILL_ASSIST, name);
        this.range = range;

        /**
         * @type {function(FehUnit, number, number, FehUnit)}
         */
        this.isAssistable = (unit, unitRow, unitColumn, target) => true;
        /**
         * @type {function(FehUnit, FehUnit)}
         */
        this.onAssist = (unit, target) => { };

        if (onAssist) this.onAssist = onAssist;
        if (isValidTarget) this.isAssistable = isValidTarget;

    }

    /**
     * 
     * @param {FehUnit} unit 
     * @param {number} row 
     * @param {number} column 
     * @param {FehUnit} target 
     */
    assist(unit, target) {
        this.onAssist(unit, target);
    }

    /**
     * 
     * @param {FehUnit} unit 
     */
    onBuild(unit) {
        unit.assistRange = this.range;
    }

}

const ARDENT_SACRIFICE = new FehAssist("Ardent Sacrifice", 1, (u, t) => { u.heal(-10); u.heal(10); });

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

        let backRow = unit.row - target.row + unit.row;
        let backColumn = unit.column - target.column + unit.column;
        let formerRow = unit.row;
        let formerColumn = unit.column;;
        unit.row = backRow;
        unit.column = backColumn;
        target.row = formerRow;
        target.column = formerColumn;

    },
    (unit, fromRow, fromColumn, target) => {

        let backRow = fromRow - target.row + fromRow;
        let backCol = fromColumn - target.column + fromColumn;
        let formerRow = fromRow;
        let formerColumn = fromColumn;

        if (backRow < 0 || backCol < 0 || backCol >= 6 || backRow >= 8) return false;

        let o = unit.battle.getUnitAt(backRow, backCol);
        if (o == unit || o == target) o = null;

        return unit.isTraversableTerrain(unit.battle.map.tiles[backRow][backCol]) &&
            target.isTraversableTerrain(unit.battle.map.tiles[formerRow][formerColumn]) &&
            !o;
    }
);

/**
 * Unit moves to opposite side of adjacent ally.
 */
const PIVOT = new FehAssist("Pivot", 1,
    (unit, target) => {
        let or = 2 * (target.row - unit.row) + unit.row;
        let oc = 2 * (target.column - unit.column) + unit.column;
        unit.row = or;
        unit.column = oc;
    },
    (unit, r0, c0, target) => {
        let or = 2 * (target.row - r0) + r0;
        let oc = 2 * (target.column - c0) + c0;
        if (or < 0 || oc < 0 || oc >= 6 || or >= 8) return false;
        let ou = unit.battle.getUnitAt(or, oc);
        if (ou === unit) ou = null;
        return unit.isTraversableTerrain(unit.battle.map.tiles[or][oc]) && !ou;
    }
);

/**
 * Moves adjacent ally to opposite side of unit.
 * It's like a DRAW_BACK where the target moves to the back tile.
 */
const REPOSITION = new FehAssist("Reposition", 1,
    (unit, target) => {
        let backRow = unit.row - target.row + unit.row;
        let backColumn = unit.column - target.column + unit.column;
        target.row = backRow;
        target.column = backColumn;
    },
    (unit, fromRow, fromColumn, target) => {
        let backRow = fromRow - target.row + fromRow;
        let backCol = fromColumn - target.column + fromColumn;
        if (backRow < 0 || backCol < 0 || backCol >= 6 || backRow >= 8) return false;
        let o = unit.battle.getUnitAt(backRow, backCol);
        return target.isTraversableTerrain(unit.battle.map.tiles[backRow][backCol]) && !o;
    }
);

/**
 * Push adjacent ally 1 space farther away.
 * It's like a PIVOT where the target moves to the opposite side.
 */
const SHOVE = new FehAssist("Shove", 1,
    (unit, target) => {
        let or = (target.row - unit.row) * 1 + target.row;
        let oc = (target.column - unit.column) * 1 + target.column;
        target.row = or;
        target.column = oc;
    },
    (unit, r0, c0, target) => {
        let or = (target.row - r0) * 1 + target.row;
        let oc = (target.column - c0) * 1 + target.column;
        if (or < 0 || oc < 0 || oc >= 6 || or >= 8) return false;
        let ou = unit.battle.getUnitAt(or, oc);
        if (ou === unit) ou = null;
        return target.isTraversableTerrain(unit.battle.map.tiles[or][oc]) && !ou;
    }
);

/**
 * Push adjacent ally 2 spaces farther away.
 */
const SMITE = new FehAssist("Smite", 1,
    (unit, target) => {
        let or = (target.row - unit.row) * 2 + target.row;
        let oc = (target.column - unit.column) * 2 + target.column;
        target.row = or;
        target.column = oc;
    },
    (unit, r0, c0, target) => {

        let or = (target.row - r0) * 2 + target.row;
        let oc = (target.column - c0) * 2 + target.column;
        if (or < 0 || oc < 0 || oc >= 6 || or >= 8) return false;
        let ou = unit.battle.getUnitAt(or, oc);
        if (ou === unit) ou = null;

        if (!(target.isTraversableTerrain(unit.battle.map.tiles[or][oc]) && !ou)) return false;

        let mr = (target.row - r0) * 1 + target.row;
        let mc = (target.column - c0) * 1 + target.column;
        let mu = unit.battle.getUnitAt(mr, mc);
        let terrain = unit.battle.map.tiles[mr][mc];
        let isSmiteable = !mu && (
            terrain == TERRAIN_PLAIN ||
            terrain == TERRAIN_MNTIN ||
            terrain == TERRAIN_TREES ||
            terrain == TERRAIN_WATER);

        return isSmiteable;
    }
);

/**
 * Swap places with an adjacent ally.
 */
const SWAP = new FehAssist("Swap", 1,
    (unit, target) => {
        let formerRow = unit.row;
        let formerColumn = unit.column;;
        unit.row = target.row;
        unit.column = target.column;
        target.row = formerRow;
        target.column = formerColumn;
    },
    (unit, fromRow, fromColumn, target) => {
        return unit.isTraversableTerrain(unit.battle.map.tiles[target.row][target.column]) &&
            target.isTraversableTerrain(unit.battle.map.tiles[unit.row][unit.column]);
    }
);

const GRADIVUS = new FehWeapon("Gradivus", 16, 1);
const GRONBLADE_PLUS = new FehWeapon("Gronblade+", 13, 2);
const BLARBLADE_PLUS = new FehWeapon("Blarblade+", 13, 2);
const ROGUE_DAGGER_PLUS = new FehWeapon("Rogue Dagger+", 7, 2);
const SILVER_SWORD_PLUS = new FehWeapon("Silver Sword+", 15, 1);
const SEIGLINDE = new FehWeapon("Seiglinde", 16, 1);
const SEIGMUND = new FehWeapon("Seigmund", 16, 1);