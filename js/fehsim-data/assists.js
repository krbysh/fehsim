import * as feh from '../fehsim/module.js';

export let assists = [];

/**
* @private
* @param {feh.Skill} e
*/
function reg(e) {
    assists[e.name] = e;
}

// =================================== //

class PenalyHealingAssist extends feh.Assist {

    /**
     * 
     * @param {string} name 
     * @param {number} range 
     * @param {number} specialCooldownCountPenalty 
     */
    constructor(name, range, specialCooldownCountPenalty) {
        super(name, range, true);
        this.specialCooldownCountPenalty = specialCooldownCountPenalty;
    }

    onbuild(unit) {
        super.onbuild(unit);
        let modifier = new feh.UnitModifier(recover.name + ' Assist Penalty Modifier', unit, recover);
        modifier.apply = u => u.maxSpecialCooldownCount += this.specialCooldownCountPenalty;
        unit.addModifier(modifier);
    }
}

// =================================== //

let ardentSacrifice = new feh.Assist('Ardent Sacrifice', 1);
ardentSacrifice.assist = (u, a) => {
    u.heal(-10, ardentSacrifice, u);
    a.heal(10, ardentSacrifice, u);
}

let reciprocalAid = new feh.Assist('Reciprocal Aid', 1);
reciprocalAid.isAssistable = (u,r,c,a) => {
    if (u.hp == a.hp) return;
    if (u.hp == u.maxHp && a.hp == a.maxHp) return false;
    return true;
}
reciprocalAid.assist = (u, a) => {
    let allyHeal = u.hp - a.hp;
    let unitHeal = -allyHeal;
    a.heal(allyHeal, reciprocalAid, u);
    u.heal(unitHeal, reciprocalAid, u);
}

let heal = new feh.Assist('Heal', 1, true);
heal.assist = (u, a) => a.heal(5, heal, u);

let martyr = new feh.Assist('Martyr', 1, true);
martyr.assist = (u, a) => {
    let unitSufferedDamage = u.maxHp - u.hp;
    a.heal(7 + unitSufferedDamage, martyr, u);
    u.heal(Math.floor(unitSufferedDamage / 2), martyr, u);
};

let mend = new feh.Assist('Mend', 1, true);
heal.assist = (u, a) => a.heal(10, mend, u);

let physic = new feh.Assist('Physic', 2, true);
physic.assist = (u, a) => a.heal(8, physic, u);

let reconcile = new feh.Assist('Reconcile', 1, true);
reconcile.assist = (u, a) => {
    u.heal(7, reconcile, u);
    a.heal(7, reconcile, u);
}

let recover = new PenalyHealingAssist('Recover', 1, 1, true);
recover.assist = (u, a) => a.heal(15, recover, u);

let rehabilitate = new PenalyHealingAssist('Rehabilitate', 1, 1, true);
rehabilitate.assist = (u, a) => {
    if (a.hp > a.maxHp * 0.5) a.heal(7, rehabilitate, u);
    else a.heal(Math.floor(7 + (2 * (0.5 * a.maxHp - a.hp))), rehabilitate, u);
}

let dance = new feh.Assist('Dance', 1);
dance.isAssistable = (u, r, c, a) => a.waiting;
dance.assist = (u, a) => a.waiting = false;

let sing = new feh.Assist('Sing', 1);
sing.isAssistable = (u, r, c, a) => a.waiting;
sing.assist = (u, a) => a.waiting = false;

let drawBack = new feh.Assist('Draw Back', 1);
drawBack.isAssistable = (unit, fromRow, fromcol, target) => {
    let backRow = fromRow - target.row + fromRow;
    let backCol = fromcol - target.col + fromcol;
    let formerRow = fromRow;
    let formercol = fromcol;
    if (backRow < 0 || backCol < 0 || backCol >= 6 || backRow >= 8) return false;
    let o = unit.battle.findUnitAt(backRow, backCol);
    if (o == unit || o == target) o = null;
    return unit.isAbleToTraverseTerrain(unit.battle.map.terrain[backRow][backCol]) &&
        target.isAbleToTraverseTerrain(unit.battle.map.terrain[formerRow][formercol]) &&
        !o;
};
drawBack.assist = (unit, target) => {
    let backRow = unit.row - target.row + unit.row;
    let backcol = unit.col - target.col + unit.col;
    let formerRow = unit.row;
    let formercol = unit.col;
    unit.row = backRow;
    unit.col = backcol;
    target.row = formerRow;
    target.col = formercol;
};

let pivot = new feh.Assist('Pivot', 1);
pivot.isAssistable = (unit, r0, c0, target) => {
    let or = 2 * (target.row - r0) + r0;
    let oc = 2 * (target.col - c0) + c0;
    if (or < 0 || oc < 0 || oc >= 6 || or >= 8) return false;
    let ou = unit.battle.findUnitAt(or, oc);
    if (ou === unit) ou = null;
    return unit.isAbleToTraverseTerrain(unit.battle.map.terrain[or][oc]) && !ou;
};
pivot.assist = (unit, target) => {
    let or = 2 * (target.row - unit.row) + unit.row;
    let oc = 2 * (target.col - unit.col) + unit.col;
    unit.row = or;
    unit.col = oc;
};

let reposition = new feh.Assist('Reposition', 1);
reposition.isAssistable = (unit, fromRow, fromcol, target) => {
    let backRow = fromRow - target.row + fromRow;
    let backCol = fromcol - target.col + fromcol;
    if (backRow < 0 || backCol < 0 || backCol >= 6 || backRow >= 8) return false;
    let o = unit.battle.findUnitAt(backRow, backCol);
    if (o == unit) o = null; // ignore unit
    return target.isAbleToTraverseTerrain(unit.battle.map.terrain[backRow][backCol]) && !o;
};
reposition.assist = (unit, target) => {
    let backRow = unit.row - target.row + unit.row;
    let backcol = unit.col - target.col + unit.col;
    target.row = backRow;
    target.col = backcol;
};

let shove = new feh.Assist('Shove', 1);
shove.isAssistable = (unit, r0, c0, target) => {
    let or = (target.row - r0) * 1 + target.row;
    let oc = (target.col - c0) * 1 + target.col;
    if (or < 0 || oc < 0 || oc >= 6 || or >= 8) return false;
    let ou = unit.battle.findUnitAt(or, oc);
    if (ou === unit) ou = null;
    return target.isAbleToTraverseTerrain(unit.battle.map.terrain[or][oc]) && !ou;
};
shove.assist = (unit, target) => {
    let or = (target.row - unit.row) * 1 + target.row;
    let oc = (target.col - unit.col) * 1 + target.col;
    target.row = or;
    target.col = oc;
};

let smite = new feh.Assist('Smite', 1);
smite.isAssistable = (unit, r0, c0, target) => {
    let or = (target.row - r0) * 2 + target.row;
    let oc = (target.col - c0) * 2 + target.col;
    if (or < 0 || oc < 0 || oc >= 6 || or >= 8) return false;
    let ou = unit.battle.findUnitAt(or, oc);
    if (ou === unit) ou = null;
    if (!(target.isAbleToTraverseTerrain(unit.battle.map.terrain[or][oc]) && !ou)) return false;
    let mr = (target.row - r0) * 1 + target.row;
    let mc = (target.col - c0) * 1 + target.col;
    let mu = unit.battle.findUnitAt(mr, mc);
    let terrain = unit.battle.map.terrain[mr][mc];
    let isSmiteable = !mu && (
        terrain == TERRAIN______ ||
        terrain == TERRAIN_MNTIN ||
        terrain == TERRAIN_TREES ||
        terrain == TERRAIN__WW__);
    return isSmiteable;
};
smite.assist = (unit, target) => {
    let or = (target.row - unit.row) * 2 + target.row;
    let oc = (target.col - unit.col) * 2 + target.col;
    target.row = or;
    target.col = oc;
};

let swap = new feh.Assist('Swap', 1);
swap.isAssistable = (unit, fromRow, fromcol, target) => {
    return unit.isAbleToTraverseTerrain(unit.battle.map.terrain[target.row][target.col]) &&
        target.isAbleToTraverseTerrain(unit.battle.map.terrain[unit.row][unit.col]);
};
swap.assist = (unit, target) => {
    let formerRow = unit.row;
    let formercol = unit.col;;
    unit.row = target.row;
    unit.col = target.col;
    target.row = formerRow;
    target.col = formercol;
};

// HEALING
reg(ardentSacrifice);
reg(reciprocalAid);
reg(heal);
reg(martyr);
reg(mend);
reg(physic);
reg(reconcile);
reg(recover);
reg(rehabilitate);

// POSITIONING
reg(dance);
reg(sing);
reg(drawBack);
reg(pivot);
reg(reposition);
reg(shove);
reg(smite);
reg(swap);

// STAT MODIFIER