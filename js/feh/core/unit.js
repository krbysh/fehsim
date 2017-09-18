/**
 * BLA3
 * @module Units
 * */

class FehHero {

    /**
     * 
     * @param {string} name 
     * @param {string} weaponType 
     * @param {string} movementType 
     */
    constructor(name, weaponType, movementType) {

        /**
         * @type {String}
         */
        this.name = name;

        /**
         * @type {String}
         */
        this.weaponType = weaponType;

        /**
         * @type {String}
         */
        this.movementType = movementType;

        /**
         * @type {String}
         */
        this.sprite = "res/img/heroes/Icon_Portrait_" + name.replace(/\s/g, "_") + ".png";

        /**
         * @type {String}
         */
        this.portrait = "res/img/heroes/Icon_Portrait_" + name.replace(/\s/g, "_") + ".png";
    }

    /**
     * 
     * @param {FehUnit} unit 
     */
    onBuild(unit) {

    }
}

class FehOverwriteHero extends FehHero {

    constructor(name, weaponType, movementType, hp, atk, spd, def, res, sprite) {
        super(name, weaponType, movementType);
        this.hp = hp;
        this.atk = atk;
        this.spd = spd;
        this.def = def;
        this.res = res;
        if (sprite) this.sprite = sprite;
        if (sprite) this.portrait = sprite;
    }

    /**
     * 
     * @param {FehUnit} unit 
     */
    onBuild(unit) {
        let modifier = new FehUnitModifier();
        modifier.apply =
            (/** @type {FehUnit} */ unit) => {
                unit.maxHp = this.hp;
                unit.hp = this.hp;
                unit.atk = this.atk;
                unit.spd = this.spd;
                unit.def = this.def;
                unit.res = this.res;
                unit.weaponType = this.weaponType;
                unit.movementType = this.movementType;
                unit.maxSteps = 0;
                switch (this.movementType) {
                    case MOVEMENT_CAVALRY:
                        unit.maxSteps++;
                    case MOVEMENT_FLIER:
                    case MOVEMENT_INFANTRY:
                        unit.maxSteps++;
                    case MOVEMENT_ARMOR:
                        unit.maxSteps++;
                }
                unit.sprite = this.sprite;
                unit.portrait = this.portrait;
                unit.name = this.name;
            };
        unit.addModifier(modifier);
    }

}

/**
 * 
 */
class FehUnitModifier {

    constructor() {
        /**
         * @type {function(FehUnit)}
         */
        this.apply = unit => { };
    }
}

/**
 * 
 */
class FehStatModifier extends FehUnitModifier {


    constructor() {
        super();
        this.hp = 0;
        this.atk = 0;
        this.spd = 0;
        this.def = 0;
        this.res = 0;
        this.maxCoolCount = 0;
    }

    /**
     * 
     * @param {FehUnit} unit 
     */
    apply(unit) {
        unit.maxHp += this.hp;
        unit.atk += this.atk;
        unit.spd += this.spd;
        unit.def += this.def;
        unit.res += this.res;
        unit.maxCoolCount += this.maxCoolCount;
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

/** ============== */

const WEAPON_SWORD = 'WEAPON_SWORD';
const WEAPON_LANCE = 'WEAPON_LANCE';
const WEAPON_AXE = 'WEAPON_AXE';
const WEAPON_BOW = 'WEAPON_BOW';
const WEAPON_DAGGER = 'WEAPON_DAGGER';

const WEAPON_GREEN_TOME = 'WEAPON_GREEN_TOME';
const WEAPON_BLUE_TOME = 'WEAPON_BLUE_TOME';
const WEAPON_RED_TOME = 'WEAPON_RED_TOME';

const WEAPON_GREEN_BREATH = 'WEAPON_GREEN_BREATH';
const WEAPON_BLUE_BREATH = 'WEAPON_BLUE_BREATH';
const WEAPON_RED_BREATH = 'WEAPON_RED_BREATH';

const MOVEMENT_FLIER = 'MOVEMENT_FLYER';
const MOVEMENT_ARMOR = 'MOVEMENT_ARMOR';
const MOVEMENT_CAVALRY = 'MOVEMENT_CAVALRY';
const MOVEMENT_INFANTRY = 'MOVEMENT_INFANTRY';

/**
 * What is this? A crossover episode?
 */
class FehUnit {

    /**
     * 
     * @param {FehHero} hero 
     * @param {FehWeapon} weapon
     */
    constructor(hero = null, weapon = null) {

        /**
         * @type {FehBattle}
         */
        this.battle = null;

        /**
         * @type {FehHero}
         */
        this.hero = hero;

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
         * @type {string}
         */
        this.portrait = null;

        /**
         * 
         * @type {boolean}
         */
        this.isWaiting = false;

        /**
         * 
         * @type {boolean}
         */
        this.isDead = false;

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
         * @type {FehUnitModifier[]}
         */
        this.modifiers = [];

        /**
         * @type {number}
         */
        this.maxCoolCount = 0;

        /**
         * @type {number}
         */
        this.coolDownCount = 0;

        /**
         * @type {number}
         */
        this.hp = 0;

        /**
         * @type {number}
         */
        this.maxHp = 0;

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
         * @type {FehWeapon}
         */
        this.weapon = weapon;

        /**
         * @type {FehAssist}
         */
        this.assist = null;

        /**
         * @type {FehSkill}
         */
        this.special = null;

        /**
         * @type {FehSkill}
         */
        this.passiveA = null;

        /**
         * @type {FehSkill}
         */
        this.passiveB = null;

        /**
         * @type {FehSkill}
         */
        this.passiveC = null;

        /**
         * @type {FehSkill}
         */
        this.sacredSeal = null;

        /**
         * @type {FehSkill[]}
         */
        this.skills = [];

        this.update();

    }

    rebuild() {
        this.modifiers = [];
        if (this.hero) this.skills.push(this.hero);
        if (this.weapon) this.skills.push(this.weapon);
        if (this.assist) this.skills.push(this.assist);
        if (this.special) this.skills.push(this.special);
        if (this.passiveA) this.skills.push(this.passiveA);
        if (this.passiveB) this.skills.push(this.passiveB);
        if (this.passiveC) this.skills.push(this.passiveC);
        if (this.sacredSeal) this.skills.push(this.sacredSeal);
        this.skills.forEach(skill => skill.onBuild(this));
    }

    update() {

        this.isWaiting = false;

        this.playerKey = null;
        this.teamIndex = 0;
        this.column = 0;
        this.row = 0;

        this.assistRange = 1;
        this.attackRange = 0;

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
     * @param {FehSkill} skill 
     */
    equip(skill) {
        if (!skill || !(skill instanceof FehSkill)) throw new FehException(EX_INVALID_TYPE, "'" + skill + "' is not a valid FehSkill and cannot be equiped");
        switch (skill.type) {
            case SKILL_WEAPON: this.weapon = skill; break;
            case SKILL_ASSIST: this.assist = skill; break;
            case SKILL_SPECIAL: this.special = skill; break;
            case SKILL_PASSIVE_A: this.passiveA = skill; break;
            case SKILL_PASSIVE_B: this.passiveB = skill; break;
            case SKILL_PASSIVE_C: this.passiveC = skill; break;
            case SKILL_SACRED_SEAL: this.sacredSeal = skill; break;
        }
    }

    /**
     * 
     * @param {number} row 
     * @param {number} column 
     * @param {FehUnit} target 
     */
    isValidAssistTarget(row, column, target) {
        if (!this.assist) return false;
        if (!target) return false;
        return this.assist.isAssistable(this, row, column, target);
    }

    /**
     * 
     * @param {FehUnitModifier} modifier 
     */
    addModifier(modifier) {
        this.modifiers.push(modifier);
        this.update();
    }

    /**
     * 
     * @param {number} hp 
     */
    heal(hp) {
        this.hp += hp;
        this.fixHp();
    }

    /**
     * 
     */
    fixHp() {
        if (this.hp < 1) this.hp = 1;
        if (this.hp > this.maxHp) this.hp = this.maxHp;
    }

    /**
     * 
     * @param {string} terrainType 
     * @param {boolean} forMovement 
     * @param {boolean} isAdjacent 
     */
    isTraversableTerrain(terrainType, forMovement, isAdjacent) {
        switch (this.movementType) {
            case MOVEMENT_ARMOR:
            case MOVEMENT_INFANTRY:
                if (forMovement) {
                    if (isAdjacent && terrainType === TERRAIN_TREES) return true;
                    if (terrainType === TERRAIN______) return true;
                } else {
                    if (terrainType === TERRAIN______ || terrainType === TERRAIN_TREES) return true;
                }
                return false;
            case MOVEMENT_CAVALRY:
                if (terrainType === TERRAIN______) return true;
                return false;
            case MOVEMENT_FLIER:
                if (terrainType !== TERRAIN_BLOCK) return true;
                return false;
            default:
                return false;
        }
    }

    onAttackStart() {
    }

    onAttackEnd() {
    }

    toString() {
        return this.name;
    }

    /**
     * Abel (5★)  
        Weapon: Brave Lance+  
        Special: Aegis  
        A: HP 5  
        B: Swordbreaker 3  

     */
    print() {
        let str = this.name + '\n';
        if (this.weapon) str += 'Weapon: ' + this.weapon + '\n';
        if (this.assist) str += 'Assist: ' + this.assist + '\n';
        if (this.special) str += 'Special: ' + this.special + '\n';
        if (this.passiveA) str += 'A: ' + this.passiveA + '\n';
        if (this.passiveB) str += 'B: ' + this.passiveB + '\n';
        if (this.passiveC) str += 'C: ' + this.passiveC + '\n';
        if (this.sacredSeal) str += 'S: ' + this.sacredSeal + '\n';

        str += 'HP : ' + this.hp + '/' + this.maxHp + '\n';
        str += 'CD : ' + this.coolDownCount + '/' + this.maxCoolCount + '\n';
        str += 'ATK: ' + this.atk + '\n';
        str += 'SPD: ' + this.spd + '\n';
        str += 'DEF: ' + this.def + '\n';
        str += 'RES: ' + this.res + '\n';

        console.log(str);
    }
}