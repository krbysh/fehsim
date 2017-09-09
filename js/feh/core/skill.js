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
}

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



class FehAssist extends FehSkill {

    /**
     * 
     * @param {*} name 
     * @param {*} range 
     * @param {*} onAssist 
     */
    constructor(name, range, onAssist) {
        super(SKILL_ASSIST, name);
        this.range = range;
        if (onAssist) this.onAssist = onAssist;
    }

    /**
     * @param {FehUnit} unit 
     * @param {FehUnit} target 
     */
    onAssist(unit, target) {
    }

    /**
     * @param {FehUnit} unit 
     * @param {FehUnit} target 
     */
    isTargetValid(unit, target) {
        return true;
    }
}

const ARDENT_SACRIFICE = new FehAssist("Ardent Sacrifice", 1,
    (unit, target) => {
        unit.hp -= 10;
        target.hp += 10;
        if (unit.hp < 1) unit.hp = 1; // FIX
        if (target.hp > target.maxHp) target.hp = target.maxHp; // FIX
    }
);

const RECIPROCAL_AID = new FehAssist("Reciprocal Aid", 1,
    (unit, target) => {
        let unit_hp = unit.hp;
        unit.hp = target.hp;
        target.hp = unit_hp;
        if (unit.hp < 1) unit.hp = 1; // FIX
        if (target.hp > target.maxHp) target.hp = target.maxHp; // FIX
    }
);

const HEAL = new FehAssist("Heal", 1,
    (unit, target) => {
        target.hp += 5;
        if (target.hp > target.maxHp) target.hp = target.maxHp; // FIX
    }
);

const MARTYR = new FehAssist("Martyr", 1,
    (unit, target) => {
        let sufferedDamage = unit.maxHp - unit.hp;
        target.hp += 7 + sufferedDamage;
        if (target.hp > target.maxHp) target.hp = target.maxHp; // FIX
    }
);



const GRADIVUS = new FehWeapon("Gradivus", 16, 1);
const GRONBLADE_PLUS = new FehWeapon("Gronblade+", 13, 2);
const BLARBLADE_PLUS = new FehWeapon("Blarblade+", 13, 2);
const ROGUE_DAGGER_PLUS = new FehWeapon("Rogue Dagger+", 7, 2);
const SILVER_SWORD_PLUS = new FehWeapon("Silver Sword+", 15, 1);
const SEIGLINDE = new FehWeapon("Seiglinde", 16, 1);
const SEIGMUND = new FehWeapon("Seigmund", 16, 1);