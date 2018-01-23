import * as feh from '../fehsim/module.js';

/**
 * @type {feh.Skill[]} 
 */
export let passives = [];

/**
* @private
* @param {feh.Skill} e 
*/
function reg(e) {
    passives[e.name] = e;
}

// =================================== //

class CombatSkill extends feh.Skill {

    /**
     * 
     * @param {string} name 
     * @param {function(feh.Unit)} applybuff 
     * @param {function(feh.Combat, feh.Unit, feh.Unit)} condition 
     */
    constructor(name, applybuff, condition = null) {
        super(feh.SKILL.PASSIVE_A, name);
        this.applybuff = applybuff;
        this.condition = condition;
    }

    /**
     * @param {feh.Combat} combat
     * @param {feh.Unit} unit 
     * @param {feh.Unit} foe 
     */
    oncombatstart(combat, unit, foe) {
        if (!this.condition(combat, unit, foe)) return;
        let m = new feh.UnitModifier(this.name + ' Modifier', unit, this);
        m.isCombatModifier = true;
        m.apply = u => this.applybuff(u);
        m.oncombatend = (c, u, f) => u.removeModifier(m);
        unit.addModifier(m);
    }
}

class CombatInitiatorSkill extends CombatSkill {
    /**
     * @param {string} name 
     * @param {function(feh.Unit)} applybuff 
     */
    constructor(name, applybuff) { super(name, applybuff, (c, u, f) => c.activeUnit === u); }
}

class BuildSkill extends feh.Skill {

    /**
     * @param {string} name 
     * @param {function(feh.Unit)} applybuff 
     */
    constructor(name, applybuff) {
        super(feh.SKILL.PASSIVE_A, name);
        this.applybuff = applybuff;
    }

    /**
     * Grants ...
     * @param {feh.Unit} unit 
     */
    onbuild(unit) {
        let m = new feh.UnitModifier(this.name + ' Modifier', unit, this);
        m.apply = u => this.applybuff(u);
        unit.addModifier(m);
    }
}

class CounterattackEnabler extends feh.Skill {

    /**
     * 
     * @param {string} name
     */
    constructor(name) {
        super(feh.SKILL.PASSIVE_A, name);
    }

    /**
     * Enables unit to counterattack regardless of distance to attacker.
     * @param {feh.Combat} combat
     * @param {feh.Unit} unit 
     * @param {feh.Unit} foe 
     */
    oncombatstart(combat, unit, foe) {
        if (combat.passiveUnit !== unit) return;
        combat.foeCanCounterattack = true;
    }

}

class TurnSkill extends feh.Skill {

    /**
     * 
     * @param {string} name 
     * @param {function(feh.Unit)} apply 
     * @param {function(feh.Unit)} condition 
     */
    constructor(name, apply, condition) {
        super(feh.SKILL.PASSIVE_A, name);
        this.apply = apply;
        this.condition = condition;
    }

    /**
     * 
     * @param {feh.Unit} unit 
     */
    onturnstart(unit) { if (this.condition(unit)) this.apply(unit); }
}

class DefiantSkill extends TurnSkill {

    /**
     * @param {string} name 
     * @param {string} stat 
     * @param {number} amount 
     */
    constructor(name, stat, amount) {
        super(name,
            u => {
                let m = new feh.UnitModifier(this.name + ' Modifier', u, this);
                m.isBuff = true;
                m.apply = u => {
                    switch (stat) {
                        case feh.STAT.ATK: u.atkBuff = Math.max(u.atkBuff, amount); break;
                        case feh.STAT.SPD: u.spdBuff = Math.max(u.spdBuff, amount); break;
                        case feh.STAT.DEF: u.defBuff = Math.max(u.defBuff, amount); break;
                        case feh.STAT.RES: u.resBuff = Math.max(u.resBuff, amount); break;
                    }
                };
                m.onturnend = u => u.removeModifier(m);
                u.addModifier(m);
            },
            u => u.hp < u.maxHp * 0.5
        );
    }
}

class FurySkill extends BuildSkill {

    /**
     * 
     * @param {function(feh.Unit)} applybuff 
     * @param {function(feh.Unit)} inflictdamage
     */
    constructor(name, applybuff, inflictdamage) {
        super(name);
        this.applybuff = applybuff;
        this.inflictdamage = inflictdamage;
    }

    onaftercombat(combat, unit, foe) { this.inflictdamage(unit); }
}

class AttackSkill extends feh.Skill {

    /**
     * 
     * @param {string} name 
     * @param {function(feh.Attack, feh.Unit, feh.Unit)} applybuff 
     * @param {function(feh.Attack, feh.Unit, feh.Unit)} condition 
     */
    constructor(name, applybuff, condition = null) {
        super(feh.SKILL.PASSIVE_A, name);
        this.applybuff = applybuff;
        // ... if unit initiates the attack.
        if (!condition) condition = (a, u, f) => true;
        this.condition = condition;
    }

    /**
     * @param {feh.Attack} attack
     * @param {feh.Unit} unit 
     * @param {feh.Unit} foe 
     */
    onattackstart(attack, unit, foe) {
        if (!this.condition(attack, unit, foe)) return;
        let m = new feh.UnitModifier(this.name + ' Modifier', unit, this);
        m.isCombatModifier = true;
        m.apply = u => this.applybuff(u);
        m.onattackend = (a, u) => u.removeModifier(m);
        unit.addModifier(m);
    }
}


class Shield extends AttackSkill {

    /**
     * @param {string} name 
     */
    constructor(name) {
        super(name, (a, u, f) => a.isEffectiveAgainst = true, (a, u, f) => a.passiveUnit === u);
    }
}

class HeavyBlade extends AttackSkill {

    /**
     * @param {string} name 
     * @param {number} diff
     */
    constructor(name, diff) {
        super(name,
            (a, u, f) => a.activeExtraCooldown = Math.max(1, a.activeExtraCooldown),
            (a, u, f) => a.activeUnit === u && u.atk - f.atk >= diff);
    }
}

class SteadyBreath extends AttackSkill {

    constructor() {
        super('Steady Breath', (a, u, f) => {
            a.activeExtraCooldown = Math.max(1, a.activeExtraCooldown);
            let m = new feh.UnitModifier(this.name + ' Modifier', u, this);
            m.onattackend = (a, u, f) => u.removeModifier(m);
            m.apply = u => u.def += 4;
            u.addModifier(m);
        }, (a, u, f) => a.passiveUnit === u);
    }
}

// =================================== //

let armoredBlow1 = new CombatInitiatorSkill('Armored Blow 1', u => u.def += 2);
let armoredBlow2 = new CombatInitiatorSkill('Armored Blow 2', u => u.def += 4);
let armoredBlow3 = new CombatInitiatorSkill('Armored Blow 3', u => u.def += 6);

let attackDefPlus1 = new BuildSkill('Attack Def +1', u => { u.atk += 1; u.def += 1; });
let attackDefPlus2 = new BuildSkill('Attack Def +2', u => { u.atk += 2; u.def += 2; });

let attackPlus1 = new BuildSkill('Attack +1', u => u.atk += 1);
let attackPlus2 = new BuildSkill('Attack +2', u => u.atk += 2);
let attackPlus3 = new BuildSkill('Attack +3', u => u.atk += 3);

let attackRes1 = new BuildSkill('Attack Res 1', u => { u.atk += 1; u.res += 1; });
let attackRes2 = new BuildSkill('Attack Res 2', u => { u.atk += 2; u.res += 2; });

let attackSpd1 = new BuildSkill('Attack Spd 1', u => { u.atk += 1; u.spd += 1; });
let attackSpd2 = new BuildSkill('Attack Spd 2', u => { u.atk += 2; u.spd += 2; });

let closeCounter = new CounterattackEnabler('Close Counter');

let closeDefCondition = (c, u, f) => c.passiveUnit === u && (
    f.weaponType === feh.WEAPON.SWORD ||
    f.weaponType === feh.WEAPON.AXE ||
    f.weaponType === feh.WEAPON.LANCE ||
    f.weaponType === feh.WEAPON.RED_DRAGON_STONE ||
    f.weaponType === feh.WEAPON.GREEN_DRAGON_STONE ||
    f.weaponType === feh.WEAPON.BLUE_DRAGON_STONE);
let closeDef1 = new CombatSkill('Close Def 1', u => { u.def += 2; u.res += 2; }, closeDefCondition);
let closeDef2 = new CombatSkill('Close Def 2', u => { u.def += 4; u.res += 4; }, closeDefCondition);
let closeDef3 = new CombatSkill('Close Def 3', u => { u.def += 6; u.res += 6; }, closeDefCondition);

let dartingBlow1 = new CombatInitiatorSkill('Darting Blow 1', u => u.spd += 2);
let dartingBlow2 = new CombatInitiatorSkill('Darting Blow 2', u => u.spd += 4);
let dartingBlow3 = new CombatInitiatorSkill('Darting Blow 3', u => u.spd += 6);

let deathBlow1 = new CombatInitiatorSkill('Death Blow 1', u => u.atk += 2);
let deathBlow2 = new CombatInitiatorSkill('Death Blow 2', u => u.atk += 4);
let deathBlow3 = new CombatInitiatorSkill('Death Blow 3', u => u.atk += 6);

let defensePlus1 = new BuildSkill('Defense +1', u => u.def += 1);
let defensePlus2 = new BuildSkill('Defense +2', u => u.def += 2);
let defensePlus3 = new BuildSkill('Defense +3', u => u.def += 3);

//  u => u.atkBuff = Math.max(3, u.atkBuff)
let defiantAtk1 = new DefiantSkill('Defiant Atk 1', feh.STAT.ATK, 3);
let defiantAtk2 = new DefiantSkill('Defiant Atk 2', feh.STAT.ATK, 5);
let defiantAtk3 = new DefiantSkill('Defiant Atk 3', feh.STAT.ATK, 7);

let defiantDef1 = new DefiantSkill('Defiant Def 1', feh.STAT.DEF, 3);
let defiantDef2 = new DefiantSkill('Defiant Def 2', feh.STAT.DEF, 5);
let defiantDef3 = new DefiantSkill('Defiant Def 3', feh.STAT.DEF, 7);

let defiantRes1 = new DefiantSkill('Defiant Res 1', feh.STAT.RES, 3);
let defiantRes2 = new DefiantSkill('Defiant Res 2', feh.STAT.RES, 5);
let defiantRes3 = new DefiantSkill('Defiant Res 3', feh.STAT.RES, 7);

let defiantSpd1 = new DefiantSkill('Defiant Spd 1', feh.STAT.SPD, 3);
let defiantSpd2 = new DefiantSkill('Defiant Spd 2', feh.STAT.SPD, 5);
let defiantSpd3 = new DefiantSkill('Defiant Spd 3', feh.STAT.SPD, 7);

let distantCounter = new CounterattackEnabler('Distant Counter');

let distantDefCondition = (c, u, f) => c.passiveUnit === u && (
    f.weaponType === feh.WEAPON.STAFF ||
    f.weaponType === feh.WEAPON.RED_TOME ||
    f.weaponType === feh.WEAPON.GREEN_TOME ||
    f.weaponType === feh.WEAPON.BLUE_TOME);
let distantDef1 = new CombatSkill('Distant Def 1', u => { u.def += 2; u.res += 2; }, distantDefCondition);
let distantDef2 = new CombatSkill('Distant Def 2', u => { u.def += 4; u.res += 4; }, distantDefCondition);
let distantDef3 = new CombatSkill('Distant Def 3', u => { u.def += 6; u.res += 6; }, distantDefCondition);

let elementalBoostCondition = (c, u, f) => u.hp >= f.hp + 3;

let earthBoost1 = new CombatSkill('Earth Boost 1', u => u.def += 2, elementalBoostCondition);
let earthBoost2 = new CombatSkill('Earth Boost 2', u => u.def += 4, elementalBoostCondition);
let earthBoost3 = new CombatSkill('Earth Boost 3', u => u.def += 6, elementalBoostCondition);

let fireBoost1 = new CombatSkill('Fire Boost 1', u => u.atk += 2, elementalBoostCondition);
let fireBoost2 = new CombatSkill('Fire Boost 2', u => u.atk += 4, elementalBoostCondition);
let fireBoost3 = new CombatSkill('Fire Boost 3', u => u.atk += 6, elementalBoostCondition);

let fortressDef1 = new BuildSkill('Fortress Def 1', u => { u.def += 3; u.atk -= 3; });
let fortressDef2 = new BuildSkill('Fortress Def 2', u => { u.def += 4; u.atk -= 3; });
let fortressDef3 = new BuildSkill('Fortress Def 3', u => { u.def += 5; u.atk -= 3; });

let fortressRes1 = new BuildSkill('Fortress Res 1', u => { u.res += 3; u.atk -= 3; });
let fortressRes2 = new BuildSkill('Fortress Res 2', u => { u.res += 4; u.atk -= 3; });
let fortressRes3 = new BuildSkill('Fortress Res 3', u => { u.res += 5; u.atk -= 3; });

let fury1 = new FurySkill('Fury 1', u => { u.atk += 1; u.spd += 1; u.def += 1; u.res += 1; }, u => u.hp = u.hp > 2 ? u.hp - 2 : 1);
let fury2 = new FurySkill('Fury 2', u => { u.atk += 2; u.spd += 2; u.def += 2; u.res += 2; }, u => u.hp = u.hp > 4 ? u.hp - 4 : 1);
let fury3 = new FurySkill('Fury 3', u => { u.atk += 3; u.spd += 3; u.def += 3; u.res += 3; }, u => u.hp = u.hp > 6 ? u.hp - 6 : 1);

let granisShield = new Shield("Grani's Shield");

let hpDef1 = new BuildSkill('HP Def 1', u => { u.maxHp += 3; u.def += 1; });
let hpDef2 = new BuildSkill('HP Def 2', u => { u.maxHp += 4; u.def += 2; });

let hpPlus3 = new BuildSkill('HP +3', u => u.maxHp += 3);
let hpPlus4 = new BuildSkill('HP +4', u => u.maxHp += 4);
let hpPlus5 = new BuildSkill('HP +5', u => u.maxHp += 5);

let hpSpd1 = new BuildSkill('HP Spd 1', u => { u.maxHp += 3; u.spd += 1; });
let hpSpd2 = new BuildSkill('HP Spd 2', u => { u.maxHp += 4; u.spd += 2; });

let heavyBlade1 = new HeavyBlade('Heavy Blade 1', 5);
let heavyBlade2 = new HeavyBlade('Heavy Blade 1', 3);
let heavyBlade3 = new HeavyBlade('Heavy Blade 1', 1);

let iotesShield = new Shield("Iote's Shield");

let lifeAndDeath1 = new BuildSkill('Life and Death 1', u => { u.atk += 3; u.spd += 3; u.def -= 3; u.res -= 3; });
let lifeAndDeath2 = new BuildSkill('Life and Death 2', u => { u.atk += 4; u.spd += 4; u.def -= 4; u.res -= 4; });
let lifeAndDeath3 = new BuildSkill('Life and Death 3', u => { u.atk += 5; u.spd += 5; u.def -= 5; u.res -= 5; });

let mirrorStrike1 = new CombatInitiatorSkill('Mirror Strike 1', u => { u.atk += 2; u.res += 2; });
let mirrorStrike2 = new CombatInitiatorSkill('Mirror Strike 2', u => { u.atk += 4; u.res += 4; });

let resistancePlus1 = new BuildSkill('Resistance +1', u => u.res += 1);
let resistancePlus2 = new BuildSkill('Resistance +2', u => u.res += 2);
let resistancePlus3 = new BuildSkill('Resistance +3', u => u.res += 3);

let spdDef1 = new BuildSkill('Spd Def 1', u => { u.spd += 1; u.def += 1; });
let spdDef2 = new BuildSkill('Spd Def 2', u => { u.spd += 2; u.def += 2; });

let speedPlus1 = new BuildSkill('Speed +1', u => u.spd += 1);
let speedPlus2 = new BuildSkill('Speed +2', u => u.spd += 2);
let speedPlus3 = new BuildSkill('Speed +3', u => u.spd += 3);

let spdRes1 = new BuildSkill('Spd Res 1', u => { u.spd += 1; u.res += 1; });
let spdRes2 = new BuildSkill('Spd Res 2', u => { u.spd += 2; u.res += 2; });

let steadyBlow1 = new CombatInitiatorSkill('Steady Blow 1', u => { u.spd += 2; u.res += 2; });
let steadyBlow2 = new CombatInitiatorSkill('Steady Blow 2', u => { u.spd += 4; u.res += 4; });

let steadyBreath = new SteadyBreath();

let steadyStance1 = new CombatSkill('Steady Stance 1', u => u.def += 2, (c, u, f) => c.passiveUnit === u);
let steadyStance2 = new CombatSkill('Steady Stance 2', u => u.def += 4, (c, u, f) => c.passiveUnit === u);
let steadyStance3 = new CombatSkill('Steady Stance 3', u => u.def += 6, (c, u, f) => c.passiveUnit === u);

let sturdyBlow1 = new CombatInitiatorSkill('Sturdy Blow 1', u => { u.atk += 2; u.def += 2; });
let sturdyBlow2 = new CombatInitiatorSkill('Sturdy Blow 2', u => { u.atk += 4; u.def += 4; });

let svalinnShield = new Shield('SvalinnShield');

let swiftSparrow1 = new CombatInitiatorSkill('Swift Sparrow 1', u => { u.atk += 2; u.spd += 2; });
let swiftSparrow2 = new CombatInitiatorSkill('Swift Sparrow 2', u => { u.atk += 4; u.spd += 4; });

let swiftStrike1 = new CombatInitiatorSkill('Swift Strike 1', u => { u.res += 2; u.spd += 2; });
let swiftStrike2 = new CombatInitiatorSkill('Swift Strike 2', u => { u.res += 4; u.spd += 4; });

let triangleAdept1 = new AttackSkill('Triangle Adept 1', a => a.extraAdvantageByUnit = 0.10);
let triangleAdept2 = new AttackSkill('Triangle Adept 2', a => a.extraAdvantageByUnit = 0.15);
let triangleAdept3 = new AttackSkill('Triangle Adept 3', a => a.extraAdvantageByUnit = 0.20);

let wardingBlow1 = new CombatInitiatorSkill('Warding Blow 1', u => u.res += 2);
let wardingBlow2 = new CombatInitiatorSkill('Warding Blow 2', u => u.res += 4);
let wardingBlow3 = new CombatInitiatorSkill('Warding Blow 3', u => u.res += 6);

let waterBoost1 = new CombatSkill('Water Boost 1', u => u.res += 2, elementalBoostCondition);
let waterBoost2 = new CombatSkill('Water Boost 2', u => u.res += 4, elementalBoostCondition);
let waterBoost3 = new CombatSkill('Water Boost 3', u => u.res += 6, elementalBoostCondition);

let windBoost1 = new CombatSkill('Wind Boost 1', u => u.spd += 2, elementalBoostCondition);
let windBoost2 = new CombatSkill('Wind Boost 2', u => u.spd += 4, elementalBoostCondition);
let windBoost3 = new CombatSkill('Wind Boost 3', u => u.spd += 6, elementalBoostCondition);

// COMBAT BUFFS
reg(armoredBlow1);
reg(armoredBlow2);
reg(armoredBlow3);
reg(closeDef1);
reg(closeDef2);
reg(closeDef3);
reg(dartingBlow1);
reg(dartingBlow2);
reg(dartingBlow3);
reg(deathBlow1);
reg(deathBlow2);
reg(deathBlow3);
reg(distantDef1);
reg(distantDef2);
reg(distantDef3);
reg(earthBoost1);
reg(earthBoost2);
reg(earthBoost3);
reg(fireBoost1);
reg(fireBoost2);
reg(fireBoost3);
reg(heavyBlade1);
reg(heavyBlade2);
reg(heavyBlade3);
reg(mirrorStrike1);
reg(mirrorStrike2);
reg(steadyBlow1);
reg(steadyBlow2);
reg(steadyBreath);
reg(steadyStance1);
reg(steadyStance2);
reg(steadyStance3);
reg(swiftSparrow1);
reg(swiftSparrow2);
reg(swiftStrike1);
reg(swiftStrike2);
reg(triangleAdept1);
reg(triangleAdept2);
reg(triangleAdept3);
reg(wardingBlow1);
reg(wardingBlow2);
reg(wardingBlow3);
reg(waterBoost1);
reg(waterBoost2);
reg(waterBoost3);
reg(windBoost1);
reg(windBoost2);
reg(windBoost3);

// COUNTERS
reg(closeCounter);
reg(distantCounter);

// FIELD BUFFS
reg(defiantAtk1);
reg(defiantAtk2);
reg(defiantAtk3);
reg(defiantDef1);
reg(defiantDef2);
reg(defiantDef3);
reg(defiantRes1);
reg(defiantRes2);
reg(defiantRes3);
reg(defiantSpd1);
reg(defiantSpd2);
reg(defiantSpd3);

// SHIELDS
reg(granisShield);
reg(iotesShield);

// SINGLE STAT INCREASE
reg(attackPlus1);
reg(attackPlus2);
reg(attackPlus3);
reg(defensePlus1);
reg(defensePlus2);
reg(defensePlus3);
reg(fortressDef1);
reg(fortressDef2);
reg(fortressDef3);
reg(fortressRes1);
reg(fortressRes2);
reg(fortressRes3);
reg(hpPlus3);
reg(hpPlus4);
reg(hpPlus5);
reg(hpSpd1);
reg(hpSpd2);
reg(resistancePlus1);
reg(resistancePlus2);
reg(resistancePlus3);
reg(speedPlus1);
reg(speedPlus2);
reg(speedPlus3);

// MULTIPLE STAT INCREASE
reg(attackDefPlus1);
reg(attackDefPlus2);
reg(attackRes1);
reg(attackRes2);
reg(attackSpd1);
reg(attackSpd2);
reg(fury1);
reg(fury2);
reg(fury3);
reg(hpDef1);
reg(hpDef2);
reg(lifeAndDeath1);
reg(lifeAndDeath2);
reg(lifeAndDeath3);
reg(spdDef1);
reg(spdDef2);
reg(spdRes1);
reg(spdRes2);

// =====================

class WeaponBreakerSkill extends feh.Skill {
    /**
     * @param {string} name 
     * @param {number} level
     * @param {string} weaponType
     */
    constructor(name, level, weaponType) {
        super(feh.SKILL.PASSIVE_B, name + ' ' + level);
        /** @type {number} */ this.level = level;
        /** @type {string} */ this.weaponType = weaponType;
    }

    /**
     * @param {feh.Combat} combat 
     * @param {feh.Unit} unit 
     * @param {feh.Unit} foe 
     */
    oncombatstart(combat, unit, foe) {
        if (this.weaponType !== foe.weaponType || unit.hp < unit.maxHp * (1.10 - 0.20 * this.level)) return false;
        else if (combat.activeUnit === unit) {
            // combat.activeUnitIsBreakingWeapon = true;
            combat.unitGuarantedFollowUpAttacks = 1;
            combat.foePreventedFollowUpAttacks = 1;
        } else if (combat.passiveUnit === unit) {
            // combat.passiveUnitIsBreakingWeapon = true;
            combat.foeGuarantedFollowUpAttacks = 1;
            combat.unitPreventedFollowUpAttacks = 1;
        }
    }
}

// =====================

let axebreaker1 = new WeaponBreakerSkill('Axebreaker', 1, feh.WEAPON.AXE);
let axebreaker2 = new WeaponBreakerSkill('Axebreaker', 2, feh.WEAPON.AXE);
let axebreaker3 = new WeaponBreakerSkill('Axebreaker', 3, feh.WEAPON.AXE);

let beorcBlessing = new feh.Skill(feh.SKILL.PASSIVE_B, "Beorc's Blessing");
beorcBlessing.oncombatstart = (combat, unit, /** @type {feh.Unit} */ foe) => {
    if (foe.movementType === feh.MOVEMENT.CAVALRY || foe.movementType === feh.MOVEMENT.FLYING) {
        let modifier = new feh.UnitModifier(beorcBlessing.name + ' Modifier', unit, beorcBlessing);
        modifier.oncombatend = (c, /** @type {feh.Unit} */ u, f) => u.removeModifier(modifier);
        modifier.apply = (/** @type {feh.Unit} */ u) => u.atkBuff = u.spdBuff = u.defBuff = u.resBuff = 0;
        foe.addModifier(modifier);
    }
}

class DanceSkill extends feh.Skill {
    constructor(name, applyfunction) { super(feh.SKILL.PASSIVE_B, name); this.applyfunction = applyfunction; }
    /**
     * @param {feh.Unit} unit 
     * @param {feh.Assist} assist
     * @param {feh.Unit} target 
     */
    onassist(unit, assist, target) {
        if (!(assist.name === 'Dance' || assist.name === 'Sing')) return;
        let m = new feh.UnitModifier(this.name + ' Modifier', unit, this);
        m.apply = u => this.applyfunction(u);
        m.onturnend = u => u.removeModifier(m);
        m.isBuff = true;
        target.addModifier(m);
    }
}

let blazeDance1 = new DanceSkill('Blaze Dance 1', u => u.atkBuff = Math.max(u.atkBuff, 2));
let blazeDance2 = new DanceSkill('Blaze Dance 2', u => u.atkBuff = Math.max(u.atkBuff, 3));
let blazeDance3 = new DanceSkill('Blaze Dance 3', u => u.atkBuff = Math.max(u.atkBuff, 4));

let bTomeBreaker1 = new WeaponBreakerSkill('B Tomebreaker', 1, feh.WEAPON.BLUE_TOME);
let bTomeBreaker2 = new WeaponBreakerSkill('B Tomebreaker', 2, feh.WEAPON.BLUE_TOME);
let bTomeBreaker3 = new WeaponBreakerSkill('B Tomebreaker', 3, feh.WEAPON.BLUE_TOME);

let bowBreaker1 = new WeaponBreakerSkill('Bowbreaker', 1, feh.WEAPON.BOW);
let bowBreaker2 = new WeaponBreakerSkill('Bowbreaker', 2, feh.WEAPON.BOW);
let bowBreaker3 = new WeaponBreakerSkill('Bowbreaker', 3, feh.WEAPON.BOW);

class BrashAssault extends feh.Skill {
    constructor(level) { super(feh.SKILL.PASSIVE_B, 'Brash Assault ' + level); this.level = level; }
    /**
     * @param {feh.Combat} combat 
     * @param {feh.Unit} unit 
     * @param {feh.Unit} foe 
     */
    oncombatstartlate(combat, unit, foe) {
        if (!(combat.foeCanCounterattack && unit.hp < unit.maxHp * (0.20 + 0.10 * this.level))) return;
        combat.unitGuarantedFollowUpAttacks = 1;
    }
}
let brashAssault1 = new BrashAssault(1);
let brashAssault2 = new BrashAssault(2);
let brashAssault3 = new BrashAssault(3);

let cancelAffinity1 = new feh.Skill(feh.SKILL.PASSIVE_B, 'Cancel Affinity 1');
cancelAffinity1.onattackstart = (/** @type {feh.Attack} */attack, unit, foe) => {
    // Any weapon triangle affinity granted by unit's skills is negated.
    if (attack.activeUnit === unit) attack.extraAdvantageByUnit = 0;
    if (attack.passiveUnit === unit) attack.extraAdvantageByFoe = 0;
    // Also negates any weapon triangle affinity granted by foe's skills
    if (attack.activeUnit === foe) attack.extraAdvantageByUnit = 0;
    if (attack.passiveUnit === foe) attack.extraAdvantageByFoe = 0;
}
let cancelAffinity2 = new feh.Skill(feh.SKILL.PASSIVE_B, 'Cancel Affinity 2');
cancelAffinity2.onattackstart = (/** @type {feh.Attack} */attack, unit, foe) => {
    // Any weapon triangle affinity granted by unit's skills is negated.
    if (attack.activeUnit === unit) attack.extraAdvantageByUnit = 0;
    if (attack.passiveUnit === unit) attack.extraAdvantageByFoe = 0;
    // If affinity disadvantage exists, weapon triangle affinity granted by foe's skills is negated.
    if (attack.activeUnit === unit && attack.thereIsDisadvantage || attack.passiveUnit === unit && attack.thereIsAdvantage) {
        if (attack.activeUnit === foe) attack.extraAdvantageByUnit = 0;
        if (attack.passiveUnit === foe) attack.extraAdvantageByFoe = 0;
    }
}
let cancelAffinity3 = new feh.Skill(feh.SKILL.PASSIVE_B, 'Cancel Affinity 3');
cancelAffinity3.onattackstart = (/** @type {feh.Attack} */attack, unit, foe) => {
    // Any weapon triangle affinity granted by unit's skills is negated.
    if (attack.activeUnit === unit) attack.extraAdvantageByUnit = 0;
    if (attack.passiveUnit === unit) attack.extraAdvantageByFoe = 0;
    // If affinity disadvantage exists, weapon triangle affinity granted by foe's skills is reversed.
    if (attack.activeUnit === unit && attack.thereIsDisadvantage || attack.passiveUnit === unit && attack.thereIsAdvantage) {
        if (attack.activeUnit === foe) attack.extraAdvantageByUnit *= -1;
        if (attack.passiveUnit === foe) attack.extraAdvantageByFoe *= -1;
    }
}

let daggerBreaker1 = new WeaponBreakerSkill('Daggerbreaker', 1, feh.WEAPON.DAGGER);
let daggerBreaker2 = new WeaponBreakerSkill('Daggerbreaker', 2, feh.WEAPON.DAGGER);
let daggerBreaker3 = new WeaponBreakerSkill('Daggerbreaker', 3, feh.WEAPON.DAGGER);

class DazzlingStaff extends feh.Skill {
    constructor(level) { super(feh.SKILL.PASSIVE_B, 'Dazzling Staff ' + level); this.level = level; }
    /**
     * @param {feh.Combat} combat 
     * @param {feh.Unit} unit 
     * @param {feh.Unit} foe 
     */
    oncombatstartlate(combat, unit, foe) {
        if (combat.activeUnit !== unit) return;
        if (unit.hp < unit.maxHp * (1.50 - this.level * 0.50)) return;
        combat.foeCanCounterattack = false;
    }
}
let dazzlingStaff1 = new DazzlingStaff(1);
let dazzlingStaff2 = new DazzlingStaff(2);
let dazzlingStaff3 = new DazzlingStaff(3);

let desperation1 = new feh.Skill(feh.SKILL.PASSIVE_B, 'Desperation 1');
let desperation2 = new feh.Skill(feh.SKILL.PASSIVE_B, 'Desperation 2');
let desperation3 = new feh.Skill(feh.SKILL.PASSIVE_B, 'Desperation 3');
desperation1.oncombatstart = (c, u, foe) => { if (u.hp <= u.maxHp * 0.25) c.desperateAttacker = true; c.desperateAttackerSkill = desperation1; };
desperation2.oncombatstart = (c, u, foe) => { if (u.hp <= u.maxHp * 0.50) c.desperateAttacker = true; c.desperateAttackerSkill = desperation2; };
desperation3.oncombatstart = (c, u, foe) => { if (u.hp <= u.maxHp * 0.75) c.desperateAttacker = true; c.desperateAttackerSkill = desperation3; };

/**
 * If unit initiates attack, the unit moves 1 space away after combat.
 * Foe moves into unit's previous space.
 * @param {feh.Combat} combat 
 * @param {feh.Unit} unit 
 * @param {feh.Unit} foe 
 */
function dragBackCondition(combat, unit, foe) {
    let backRow = unit.row - foe.row + unit.row;
    let backCol = unit.col - foe.col + unit.col;
    let formerRow = unit.row;
    let formerCol = unit.col;
    if (backRow < 0 || backCol < 0 || backCol >= 6 || backRow >= 8) return false;
    let o = unit.battle.findUnitAt(backRow, backCol);
    if (o == unit || o == foe) o = null;
    return unit.isAbleToTraverseTerrain(unit.battle.map.terrain[backRow][backCol]) &&
        foe.isAbleToTraverseTerrain(unit.battle.map.terrain[formerRow][formerCol]) &&
        !o;
}
let dragBack = new feh.Skill(feh.SKILL.PASSIVE_B, 'Drag Back');
dragBack.onaftercombat = (/** @type {feh.Combat} */combat, /** @type {feh.Unit} */unit, /** @type {feh.Unit} */foe) => {
    if (!dragBackCondition(combat, unit, foe)) return;
    if (combat.activeUnit !== unit) return;
    if (unit.hp <= 0) return;
    let backRow = unit.row - foe.row + unit.row;
    let backCol = unit.col - foe.col + unit.col;
    let formerRow = unit.row;
    let formerCol = unit.col;
    unit.row = backRow;
    unit.col = backCol;
    foe.row = formerRow;
    foe.col = formerCol;
}

class EscapeRoute extends feh.Skill {
    constructor(level) { super(feh.SKILL.PASSIVE_B, 'Escape Route ' + level); this.level = level; }
    /**
     * 
     * @param {feh.Unit} unit 
     * @param {feh.Query} query 
     */
    onquery(unit, query) {
        if (unit.hp > unit.maxHp * (0.20 + 0.10 * this.level)) return;
        let allies = unit.getAllies();
        allies.forEach(ally => {
            let node = query.nodesAsMatrix[ally.row][ally.col];
            node.neighbours.forEach(adjacent => {
                if (!adjacent.isUntraversable && !adjacent.isOccupied) adjacent.isEnabledBySkill = true;
            });
        });
    }
}
let escapeRoute1 = new EscapeRoute(1);
let escapeRoute2 = new EscapeRoute(2);
let escapeRoute3 = new EscapeRoute(3);

class FlierFormation extends feh.Skill {
    constructor(level) { super(feh.SKILL.PASSIVE_B, 'Flier Formation ' + level); this.level = level; }
    /**
     * 
     * @param {feh.Unit} unit 
     * @param {feh.Query} query 
     */
    onquery(unit, query) {
        if (!(unit.hp >= unit.maxHp * (1.50 - 0.50 * this.level))) return;
        let allies = unit.getAllies();
        allies.forEach(ally => {
            if (ally.movementType !== feh.MOVEMENT.FLYING) return;
            if (ally.getManhattanDistanceTo(unit) > 2) return;
            let node = query.nodesAsMatrix[ally.row][ally.col];
            node.neighbours.forEach(adjacent => {
                if (!adjacent.isUntraversable && !adjacent.isOccupied) adjacent.isEnabledBySkill = true;
            });
        });
    }
}
let flierFormation1 = new FlierFormation(1);
let flierFormation2 = new FlierFormation(2);
let flierFormation3 = new FlierFormation(3);

let galeDance1 = new DanceSkill('Gale Dance 1', u => u.spdBuff = Math.max(u.spdBuff, 2));
let galeDance2 = new DanceSkill('Gale Dance 2', u => u.spdBuff = Math.max(u.spdBuff, 3));
let galeDance3 = new DanceSkill('Gale Dance 3', u => u.spdBuff = Math.max(u.spdBuff, 4));

let geyserDance1 = new DanceSkill('Geyser Dance 1', u => {
    u.defBuff = Math.max(u.defBuff, 3);
    u.resBuff = Math.max(u.resBuff, 3);
});
let geyserDance2 = new DanceSkill('Geyser Dance 2', u => {
    u.defBuff = Math.max(u.defBuff, 4);
    u.resBuff = Math.max(u.resBuff, 4);
});

let gTomeBreaker1 = new WeaponBreakerSkill('G Tomebreaker', 1, feh.WEAPON.GREEN_TOME);
let gTomeBreaker2 = new WeaponBreakerSkill('G Tomebreaker', 2, feh.WEAPON.GREEN_TOME);
let gTomeBreaker3 = new WeaponBreakerSkill('G Tomebreaker', 3, feh.WEAPON.GREEN_TOME);

class Guard extends feh.Skill {
    constructor(level) {
        super(feh.SKILL.PASSIVE_B, 'Guard ' + level);
        this.level = level;
    }
    /**
     * 
     * @param {feh.Attack} attack 
     * @param {feh.Unit} unit 
     * @param {feh.Unit} foe 
     */
    onattackstart(attack, unit, foe) {
        if (!(unit.hpAtStartOfCombat >= unit.maxHp * (1.10 - 0.10 * this.level))) return;
        if (attack.passiveUnit === foe) attack.passiveCooldownPenalty = Math.max(attack.passiveCooldownPenalty, 1);
        if (attack.activeUnit === foe) attack.activeCooldownPenalty = Math.max(attack.activeCooldownPenalty, 1);
    }
}
let guard1 = new Guard(1);
let guard2 = new Guard(2);
let guard3 = new Guard(3);

/**
 * If unit initiates attack, unit retreats 1 space after battle.
 * @param {feh.Combat} combat 
 * @param {feh.Unit} unit 
 * @param {feh.Unit} foe 
 */
function hitAndRunCondition(combat, unit, foe) {
    let backRow = unit.row - foe.row + unit.row;
    let backCol = unit.col - foe.col + unit.col;
    if (backRow < 0 || backCol < 0 || backCol >= 6 || backRow >= 8) return false;
    let o = unit.battle.findUnitAt(backRow, backCol);
    if (o == unit || o == foe) o = null;
    return unit.isAbleToTraverseTerrain(unit.battle.map.terrain[backRow][backCol]) && !o;
}
let hitAndRun = new feh.Skill(feh.SKILL.PASSIVE_B, 'Hit and Run');
hitAndRun.onaftercombat = (/** @type {feh.Combat} */combat, /** @type {feh.Unit} */unit, /** @type {feh.Unit} */foe) => {
    if (!hitAndRunCondition(combat, unit, foe)) return;
    if (combat.activeUnit !== unit) return;
    if (unit.hp <= 0) return;
    let backRow = unit.row - foe.row + unit.row;
    let backCol = unit.col - foe.col + unit.col;
    unit.row = backRow;
    unit.col = backCol;
}

/**
 * If unit initiates attack, foe is moved 1 space away after combat.
 * @param {feh.Combat} combat 
 * @param {feh.Unit} unit 
 * @param {feh.Unit} foe 
 */
function knockBackCondition(combat, unit, foe) {
    let backRow = foe.row - unit.row + foe.row;
    let backCol = foe.col - unit.col + foe.col;
    if (backRow < 0 || backCol < 0 || backCol >= 6 || backRow >= 8) return false;
    let o = foe.battle.findUnitAt(backRow, backCol);
    if (o == foe || o == unit) o = null;
    return foe.isAbleToTraverseTerrain(foe.battle.map.terrain[backRow][backCol]) && !o;
}
let knockBack = new feh.Skill(feh.SKILL.PASSIVE_B, 'Knock Back');
knockBack.onaftercombat = (/** @type {feh.Combat} */combat, /** @type {feh.Unit} */unit, /** @type {feh.Unit} */foe) => {
    if (!knockBackCondition(combat, unit, foe)) return;
    if (combat.activeUnit !== unit) return;
    if (unit.hp <= 0) return;
    let backRow = foe.row - unit.row + foe.row;
    let backCol = foe.col - unit.col + foe.col;
    foe.row = backRow;
    foe.col = backCol;
}

let lancebreaker1 = new WeaponBreakerSkill('Lancebreaker', 1, feh.WEAPON.LANCE);
let lancebreaker2 = new WeaponBreakerSkill('Lancebreaker', 2, feh.WEAPON.LANCE);
let lancebreaker3 = new WeaponBreakerSkill('Lancebreaker', 3, feh.WEAPON.LANCE);

let liveForBounty = new feh.Skill(feh.SKILL.PASSIVE_B, 'Live for Bounty');

let liveForHonor = new feh.Skill(feh.SKILL.PASSIVE_B, 'Live for Honor');

// When healing allies with a staff, unit also recovers 75% of the HP restored.
class LiveToServe extends feh.Skill {
    constructor(level) {
        super(feh.SKILL.PASSIVE_B, 'Live to Serve ' + level);
        this.level = level;
    }
    /**
     * @param {feh.Unit} unit 
     * @param {number} amount 
     * @param {feh.Skill} skill 
     * @param {feh.Unit} target 
     */
    oncausedhealing(unit, amount, skill, target) {
        if (this === skill) return;
        unit.heal(amount * (1.50 - 0.50 * this.level));
    }
}
let liveToServe1 = new LiveToServe(1);
let liveToServe2 = new LiveToServe(2);
let liveToServe3 = new LiveToServe(3);

/**
 * If unit initiates attack, after combat, unit and targeted foe swap places.	
 * @param {feh.Combat} combat 
 * @param {feh.Unit} unit 
 * @param {feh.Unit} foe 
 */
function lungeCondition(combat, unit, foe) {
    return unit.isAbleToTraverseTerrain(unit.battle.map.terrain[foe.row][foe.col]) &&
        foe.isAbleToTraverseTerrain(unit.battle.map.terrain[unit.row][unit.col]);
}
let lunge = new feh.Skill(feh.SKILL.PASSIVE_B, 'Lunge');
lunge.onaftercombat = (/** @type {feh.Combat} */combat, /** @type {feh.Unit} */unit, /** @type {feh.Unit} */foe) => {
    if (!lungeCondition(combat, unit, foe)) return;
    if (combat.activeUnit !== unit) return;
    if (unit.hp <= 0) return;
    let formerRow = unit.row;
    let formercol = unit.col;;
    unit.row = foe.row;
    unit.col = foe.col;
    foe.row = formerRow;
    foe.col = formercol;
}

// Prevents foes from moving through adjacent spaces while this unit's HP ≥ 90/70/20%.
// (No effect on foes with a Pass skill.)
class Obstruct extends feh.Skill {
    constructor(level) {
        super(feh.SKILL.PASSIVE_B, 'Obstruct ' + level);
        this.level = level;
    }
    /**
     * @param {feh.Unit} unit 
     * @param {feh.Unit} unitQuery 
     * @param {feh.Query} query 
     */
    onunitquery(unit, unitQuery, query) {
        if (!(unit.hp >= unit.maxHp * (1.10 - 0.20 * this.level))) return;
        let n = query.nodesAsMatrix[unitQuery.row][unitQuery.col];
        n.neighbours.forEach(m => m.landButDoNotTraverse = true);
    }
}
let obstruct1 = new Obstruct(1);
let obstruct2 = new Obstruct(2);
let obstruct3 = new Obstruct(3);

// Units can pass through foes if its own HP ≥ 50%.	
class Pass extends feh.Skill {
    constructor(level) {
        super(feh.SKILL.PASSIVE_B, 'Pass ' + level);
        this.level = level;
    }
    /**
     * @param {feh.Unit} unit 
     * @param {feh.Unit} unitQuery 
     * @param {feh.Query} query 
     */
    onquery(unit, query) {
        if (!(unit.hp >= unit.maxHp * (1.00 - 0.25 * this.level))) return;
        query.disableOccupiedByEnemyCheck = true;
    }
}
let pass1 = new Pass(1);
let pass2 = new Pass(2);
let pass3 = new Pass(3);

let poisonStrike1 = new feh.Skill(feh.SKILL.PASSIVE_B, 'Poison Strike 1');
let poisonStrike2 = new feh.Skill(feh.SKILL.PASSIVE_B, 'Poison Strike 2');
let poisonStrike3 = new feh.Skill(feh.SKILL.PASSIVE_B, 'Poison Strike 3');
poisonStrike1.onaftercombat = (combat, unit, /** @type {feh.Unit} */ foe) => { if (foe.hp > 0) foe.heal(-4, poisonStrike3, unit); }
poisonStrike2.onaftercombat = (combat, unit, /** @type {feh.Unit} */ foe) => { if (foe.hp > 0) foe.heal(-7, poisonStrike3, unit); }
poisonStrike3.onaftercombat = (combat, unit, /** @type {feh.Unit} */ foe) => { if (foe.hp > 0) foe.heal(-10, poisonStrike3, unit); }

class QuickRiposte extends feh.Skill {
    constructor(level) {
        super(feh.SKILL.PASSIVE_B, 'Quick Riposte ' + level);
        this.level = level;
    }
    /**
     * @param {feh.Combat} combat 
     * @param {feh.Unit} unit 
     * @param {feh.Unit} foe 
     */
    oncombatstart(combat, unit, foe) {
        if (combat.passiveUnit !== unit) return;
        if (!(unit.hp >= unit.maxHp * (1.00 - 0.10 * this.level))) return;
        combat.foeGuarantedFollowUpAttacks = 1;
    }
}
let quickRiposte1 = new QuickRiposte(1);
let quickRiposte2 = new QuickRiposte(2);
let quickRiposte3 = new QuickRiposte(3);

let rTomeBreaker1 = new WeaponBreakerSkill('R Tomebreaker', 1, feh.WEAPON.RED_TOME);
let rTomeBreaker2 = new WeaponBreakerSkill('R Tomebreaker', 2, feh.WEAPON.RED_TOME);
let rTomeBreaker3 = new WeaponBreakerSkill('R Tomebreaker', 3, feh.WEAPON.RED_TOME);

class Renewal extends feh.Skill {
    constructor(level) {
        super(feh.SKILL.PASSIVE_B, 'Renewal ' + level);
        this.level = level;
    }
    onturnstartlate(/** @type {feh.Unit} */unit) {
        let n = 5 - this.level;
        if ((unit.battle.turn - 1) % n == 0)
            unit.heal(10, renewal1, unit);
    }
}
let renewal1 = new Renewal(1);
let renewal2 = new Renewal(2);
let renewal3 = new Renewal(3);

let sacaesBlessing = new feh.Skill(feh.SKILL.PASSIVE_B, "Sacae's Blessing");
sacaesBlessing.oncombatstartlate = (/** @type {feh.Combat} */combat, unit,/** @type {feh.Unit} */ foe) => {
    if (foe.weaponType == feh.WEAPON.SWORD ||
        foe.weaponType == feh.WEAPON.LANCE ||
        foe.weaponType == feh.WEAPON.AXE) {
        combat.foeCanCounterattack = false;
    }
}

class SealSkill extends feh.Skill {
    /**
     * 
     * @param {string} name 
     * @param {function(feh.Unit)} apply 
     */
    constructor(name, apply) {
        super(feh.SKILL.PASSIVE_B, name);
        this.apply = apply;
    }
    /**
     * @param {feh.Unit} unit 
     */
    onaftercombat(combat, unit, foe) {
        let m = new feh.UnitModifier(this.name + ' Modifier', unit, this);
        m.isBuff = true;
        m.apply = (/** @type {feh.Unit} */u) => this.apply(u);
        m.onafteraction = (/** @type {feh.Unit} */u) => {
            console.log('REMOVE ME BITCH');
            console.log(m.description + " onafteraction");
            u.removeModifier(m);
        }
        foe.addModifier(m);
    }
}

let sealAtk1 = new SealSkill('Seal Atk 1', (/** @type {feh.Unit} */u) => u.atkDebuff = Math.max(u.atkDebuff, 3));
let sealAtk2 = new SealSkill('Seal Atk 2', (/** @type {feh.Unit} */u) => u.atkDebuff = Math.max(u.atkDebuff, 5));
let sealAtk3 = new SealSkill('Seal Atk 3', (/** @type {feh.Unit} */u) => u.atkDebuff = Math.max(u.atkDebuff, 7));

let sealAtkDef1 = new SealSkill('Seal Atk Def 1', (/** @type {feh.Unit} */u) => { u.atkDebuff = Math.max(u.atkDebuff, 3); u.defDebuff = Math.max(u.defBuff, 3) });
let sealAtkDef2 = new SealSkill('Seal Atk Def 2', (/** @type {feh.Unit} */u) => { u.atkDebuff = Math.max(u.atkDebuff, 5); u.defDebuff = Math.max(u.defBuff, 5) });

let sealAtkSpd1 = new SealSkill('Seal Atk Spd 1', (/** @type {feh.Unit} */u) => { u.atkDebuff = Math.max(u.atkDebuff, 3); u.spdDebuff = Math.max(u.spdDebuff, 3) });
let sealAtkSpd2 = new SealSkill('Seal Atk Spd 2', (/** @type {feh.Unit} */u) => { u.atkDebuff = Math.max(u.atkDebuff, 5); u.spdDebuff = Math.max(u.spdDebuff, 5) });

let sealDef1 = new SealSkill('Seal Def 1', (/** @type {feh.Unit} */u) => u.defDebuff = Math.max(u.defDebuff, 3));
let sealDef2 = new SealSkill('Seal Def 2', (/** @type {feh.Unit} */u) => u.defDebuff = Math.max(u.defDebuff, 5));
let sealDef3 = new SealSkill('Seal Def 3', (/** @type {feh.Unit} */u) => u.defDebuff = Math.max(u.defDebuff, 7));

let sealRes1 = new SealSkill('Seal Res 1', (/** @type {feh.Unit} */u) => u.resDebuff = Math.max(u.resDebuff, 3));
let sealRes2 = new SealSkill('Seal Res 2', (/** @type {feh.Unit} */u) => u.resDebuff = Math.max(u.resDebuff, 5));
let sealRes3 = new SealSkill('Seal Res 3', (/** @type {feh.Unit} */u) => u.resDebuff = Math.max(u.resDebuff, 7));

let sealSpd1 = new SealSkill('Seal Spd 1', (/** @type {feh.Unit} */u) => u.spdDebuff = Math.max(u.spdDebuff, 3));
let sealSpd2 = new SealSkill('Seal Spd 2', (/** @type {feh.Unit} */u) => u.spdDebuff = Math.max(u.spdDebuff, 5));
let sealSpd3 = new SealSkill('Seal Spd 3', (/** @type {feh.Unit} */u) => u.spdDebuff = Math.max(u.spdDebuff, 7));

class ShieldPulse extends feh.Skill {
    constructor(level) {
        super(feh.SKILL.PASSIVE_B, 'Shield Pulse ' + level);
        this.level = level;
    }
    /**
     * @param {feh.Unit} unit 
     */
    ontrunstart(unit) {
        if (unit.battle.turn !== 1) return;
        if (!unit.special || !unit.special.triggersBasedOnFoesAttack) return;
        // 1.-  If unit's Special triggers based on a foe's attack, Special cooldown count-1 at start of turn 1.
        // 2.-  If unit's Special triggers based on a foe's attack, Special cooldown count-1 at start of turn 1.
        // 3.-  If unit's Special triggers based on a foe's attack, Special cooldown count-2 at start of turn 1.
        let n = this.level == 3 ? 2 : 1;
        unit.specialCooldownCount -= n;
        if (unit.specialCooldownCount < 0) unit.specialCooldownCount = 0;
        // 2.-  Unit takes 5 less damage when Special triggers.
        // 2.-  Unit takes 5 less damage when Special triggers.
        console.warn('FALTA COLOCAL EL 5 LESS DAMAGE WHEN SPECIAL TRIGGERS')
    }
}
let shieldPulse1 = new ShieldPulse(1);
let shieldPulse2 = new ShieldPulse(2);
let shieldPulse3 = new ShieldPulse(3);

let swordbreaker1 = new WeaponBreakerSkill('Swordbreaker', 1, feh.WEAPON.SWORD);
let swordbreaker2 = new WeaponBreakerSkill('Swordbreaker', 2, feh.WEAPON.SWORD);
let swordbreaker3 = new WeaponBreakerSkill('Swordbreaker', 3, feh.WEAPON.SWORD);

let torrentDance1 = new DanceSkill('Torrent Dance 1', u => u.resBuff = Math.max(u.resBuff, 3));

class Vantage extends feh.Skill {
    constructor(level) {
        super(feh.SKILL.PASSIVE_B, 'Vantage ' + level);
        this.level = level;
    }
    /**
     * @param {feh.Combat} combat 
     * @param {feh.Unit} unit 
     * @param {feh.Unit} foe 
     */
    oncombatstart(combat, unit, foe) {
        if (combat.passiveUnit !== unit) return;
        if (!(unit.hp <= unit.maxHp * (0.25 * this.level))) return;
        combat.vantageDefender = true;
        combat.vantageDefenderSkill = this;
    }
}
let vantage1 = new Vantage(1);
let vantage2 = new Vantage(2);
let vantage3 = new Vantage(3);

class WaryFighter extends feh.Skill {
    /**
     * @param {number} level
     */
    constructor(level) {
        super(feh.SKILL.PASSIVE_B, 'Wary Fighter ' + level);
        /** @type {number} */ this.level = level;
    }

    /**
     * @param {feh.Combat} combat 
     * @param {feh.Unit} unit 
     * @param {feh.Unit} foe 
     */
    oncombatstart(combat, unit, foe) {
        if (unit.hp < unit.maxHp * (1.10 - 0.20 * this.level)) return false;
        combat.unitPreventedFollowUpAttacks = 1;
        combat.foePreventedFollowUpAttacks = 1;
    }
}
let waryFighter1 = new WaryFighter(1);
let waryFighter2 = new WaryFighter(2);
let waryFighter3 = new WaryFighter(3);

class Watersweep extends feh.Skill {
    constructor(level) { super(feh.SKILL.PASSIVE_B, 'Watersweep ' + level); this.level = level; }
    /**
     * @param {feh.Combat} c 
     * @param {feh.Unit} u 
     * @param {feh.Unit} f 
     */
    oncombatstart(c, u, f) {
        if (!(c.activeUnit == u)) return;
        if (!(
            f.weaponType == feh.WEAPON.RED_TOME ||
            f.weaponType == feh.WEAPON.BLUE_TOME ||
            f.weaponType == feh.WEAPON.GREEN_TOME ||
            f.weaponType == feh.WEAPON.RED_DRAGON_STONE ||
            f.weaponType == feh.WEAPON.BLUE_DRAGON_STONE ||
            f.weaponType == feh.WEAPON.GREEN_DRAGON_STONE ||
            f.weaponType == feh.WEAPON.STAFF
        )) return;
        let n = 7 - this.level * 2;
        c.foePreventedFollowUpAttacks = 1;
        c.unitPreventedFollowUpAttacks = 1;
        if (u.spd - f.spd >= n) c.foeCanCounterattack = false;
    }
}
let watersweep1 = new Watersweep(1);
let watersweep2 = new Watersweep(2);
let watersweep3 = new Watersweep(3);

class Windsweep extends feh.Skill {
    constructor(level) { super(feh.SKILL.PASSIVE_B, 'Windsweep ' + level); this.level = level; }
    /**
     * @param {feh.Combat} c 
     * @param {feh.Unit} u 
     * @param {feh.Unit} f 
     */
    oncombatstart(c, u, f) {
        if (!(c.activeUnit == u)) return;
        if (!(
            f.weaponType == feh.WEAPON.SWORD ||
            f.weaponType == feh.WEAPON.LANCE ||
            f.weaponType == feh.WEAPON.AXE ||
            f.weaponType == feh.WEAPON.BOW ||
            f.weaponType == feh.WEAPON.DAGGER
        )) return;
        let n = 7 - this.level * 2;
        c.foePreventedFollowUpAttacks = 1;
        c.unitPreventedFollowUpAttacks = 1;
        if (u.spd - f.spd >= n) c.foeCanCounterattack = false;
    }
}
let windsweep1 = new Windsweep(1);
let windsweep2 = new Windsweep(2);
let windsweep3 = new Windsweep(3);

class WingsOfMercy extends feh.Skill {
    constructor(level) { super(feh.SKILL.PASSIVE_B, 'Wings of Mercy ' + level); this.level = level; }
    /**
     * 
     * @param {feh.Unit} unit 
     * @param {feh.Query} query 
     */
    onquery(unit, query) {
        let allies = unit.getAllies();
        allies.forEach(ally => {
            if (ally.hp > ally.maxHp * (0.20 + 0.10 * this.level)) return;
            let node = query.nodesAsMatrix[ally.row][ally.col];
            node.neighbours.forEach(adjacent => {
                if (!adjacent.isUntraversable && !adjacent.isOccupied) adjacent.isEnabledBySkill = true;
            });
        });
    }
}
let wingsOfMercy1 = new WingsOfMercy(1);
let wingsOfMercy2 = new WingsOfMercy(2);
let wingsOfMercy3 = new WingsOfMercy(3);

class Wrath extends feh.Skill {
    constructor(level) {
        super(feh.SKILL.PASSIVE_B, 'Wrath ' + level);
        this.level = level;
    }
    /**
     * @param {feh.Unit} unit 
     */
    ontrunstart(unit) {
        if (!unit.special || !unit.special.triggersByAttacking) return;
        if (!(unit.hp <= unit.maxHp * (1.00 - 0.25 * this.level))) return;
        unit.specialCooldownCount -= 1;
        if (unit.specialCooldownCount < 0) unit.specialCooldownCount = 0;
        console.warn('FALTA COLOCAL EL If Special triggers, +10 damage from Special.')
    }
}
let wrath1 = new Wrath(1);
let wrath2 = new Wrath(2);
let wrath3 = new Wrath(3);

class WrathfulStaff extends feh.Skill {
    constructor(level) { super(feh.SKILL.PASSIVE_B, 'Wrathful Staff ' + level); this.level = level; }
    /**
     * 
     * @param {feh.Attack} attack 
     * @param {feh.Unit} unit 
     * @param {feh.Unit} foe 
     */
    onattackstart(attack, unit, foe) {
        if (!(attack.combat.activeUnitHpBeforeCombat >= unit.maxHp * (1.50 - 0.50 * this.level))) return;
        attack.classMod = 1;
    }
}
let wrathfulStaff1 = new WrathfulStaff(1);
let wrathfulStaff2 = new WrathfulStaff(2);
let wrathfulStaff3 = new WrathfulStaff(3);

// DEBUFFS
reg(sealAtk1);
reg(sealAtk2);
reg(sealAtk3);
reg(sealAtkDef1);
reg(sealAtkDef2);
reg(sealAtkSpd1);
reg(sealAtkSpd2);
reg(sealDef1);
reg(sealDef2);
reg(sealDef3);
reg(sealRes1);
reg(sealRes2);
reg(sealRes3);
reg(sealSpd1);
reg(sealSpd2);
reg(sealSpd3);

// EXCLUSIVE
reg(beorcBlessing);
reg(sacaesBlessing);

// FOLLOW-UP
reg(axebreaker1);
reg(axebreaker2);
reg(axebreaker3);
reg(bTomeBreaker1);
reg(bTomeBreaker2);
reg(bTomeBreaker3);
reg(bowBreaker1);
reg(bowBreaker2);
reg(bowBreaker3);
reg(brashAssault1);
reg(brashAssault2);
reg(brashAssault3);
reg(daggerBreaker1);
reg(daggerBreaker2);
reg(daggerBreaker3);
reg(desperation1);
reg(desperation2);
reg(desperation3);
reg(gTomeBreaker1);
reg(gTomeBreaker2);
reg(gTomeBreaker3);
reg(lancebreaker1);
reg(lancebreaker2);
reg(lancebreaker3);
reg(quickRiposte1);
reg(quickRiposte2);
reg(quickRiposte3);
reg(rTomeBreaker1);
reg(rTomeBreaker2);
reg(rTomeBreaker3);
reg(swordbreaker1);
reg(swordbreaker2);
reg(swordbreaker3);
reg(vantage1);
reg(vantage2);
reg(vantage3);
reg(waryFighter1);
reg(waryFighter2);
reg(waryFighter3);
reg(watersweep1);
reg(watersweep2);
reg(watersweep3);
reg(windsweep1);
reg(windsweep2);
reg(windsweep3);

// MOBILITY
reg(escapeRoute1);
reg(escapeRoute2);
reg(escapeRoute3);
reg(flierFormation1);
reg(flierFormation2);
reg(flierFormation3);
reg(obstruct1);
reg(obstruct2);
reg(obstruct3);
reg(pass1);
reg(pass2);
reg(pass3);
reg(wingsOfMercy1);
reg(wingsOfMercy2);
reg(wingsOfMercy3);

// MOVEMENT
reg(dragBack);
reg(hitAndRun);
reg(knockBack);
reg(lunge);

// RESOURCES
reg(liveForBounty);
reg(liveForHonor);

// DANCE
reg(blazeDance1);
reg(blazeDance2);
reg(blazeDance3);
reg(galeDance1);
reg(galeDance2);
reg(galeDance3);
reg(geyserDance1);
reg(geyserDance1);
reg(torrentDance1);

// STAVES
reg(dazzlingStaff1);
reg(dazzlingStaff2);
reg(dazzlingStaff3);
reg(liveToServe1);
reg(liveToServe2);
reg(liveToServe3);

// OTHER
reg(cancelAffinity1);
reg(cancelAffinity2);
reg(cancelAffinity3);
reg(guard1);
reg(guard2);
reg(guard3);
reg(poisonStrike1);
reg(poisonStrike2);
reg(poisonStrike3);
reg(renewal1);
reg(renewal2);
reg(renewal3);
reg(shieldPulse1);
reg(shieldPulse2);
reg(shieldPulse3);
reg(wrath1);
reg(wrath2);
reg(wrath3);

// ===================== TODO

// ------------

// Armor March 1
// Armor March 2
// Armor March 3
// Atk Ploy 1
// Atk Ploy 2
// Atk Ploy 3
// Atk Smoke 1
// Atk Smoke 2
// Atk Smoke 3
// Axe Experience 1
// Axe Experience 2
// Axe Experience 3
// Axe Valor 1
// Axe Valor 2
// Axe Valor 3
// B Tome Exp. 1
// B Tome Exp. 2
// B Tome Exp. 3
// B Tome Valor 1
// B Tome Valor 2
// B Tome Valor 3
// Bow Exp. 1
// Bow Exp. 2
// Bow Exp. 3
let breathOfLife1 = new feh.Skill(feh.SKILL.PASSIVE_C, 'Breath of Life 1');
let breathOfLife2 = new feh.Skill(feh.SKILL.PASSIVE_C, 'Breath of Life 2');
let breathOfLife3 = new feh.Skill(feh.SKILL.PASSIVE_C, 'Breath of Life 3');
// Def Ploy 1
// Def Ploy 2
// Def Ploy 3
// Drive Atk 1
// Drive Atk 2
// Drive Def 1
// Drive Def 2
// Drive Res 1
// Drive Res 2
// Drive Spd 1
// Drive Spd 2
// Fortify Armor
// Fortify Cavalry
let fortifyDef1 = new feh.Skill(feh.SKILL.PASSIVE_C, 'Fortify Def 1');
// Fortify Def 2
// Fortify Def 3
// Fortify Dragons
// Fortify Fliers
let fortifyRes1 = new feh.Skill(feh.SKILL.PASSIVE_C, 'Fortify Res 1');
let fortifyRes2 = new feh.Skill(feh.SKILL.PASSIVE_C, 'Fortify Res 2');
let fortifyRes3 = new feh.Skill(feh.SKILL.PASSIVE_C, 'Fortify Res 3');
// Goad Armor
// Goad Cavalry
// Goad Fliers
// G Tome Valor 1
// G Tome Valor 2
// G Tome Valor 3
let guidance3 = new feh.Skill(feh.SKILL.PASSIVE_C, 'Guidance 3');
// Guidance 1
// Guidance 2
// Guidance 3
// Hone Armor
// Hone Atk 1
// Hone Atk 2
let honeAtk3 = new feh.Skill(feh.SKILL.PASSIVE_C, 'Hone Atk 3');
// Hone Cavalry
// Hone Fliers
// Hone Spd 1
// Hone Spd 2
let honeSpd3 = new feh.Skill(feh.SKILL.PASSIVE_C, 'Hone Spd 3');
// Infantry Pulse 1
// Infantry Pulse 2
// Infantry Pulse 3
// Lance Valor 1
// Lance Valor 2
// Lance Valor 3
// Panic Ploy 1
// Panic Ploy 2
// Panic Ploy 3
// Res Ploy 1
// Res Ploy 2
// Res Ploy 3
// Savage Blow 1
// Savage Blow 2
// Savage Blow 3
// Spur Atk 1
// Spur Atk 2
// Spur Atk 3
// Spur Def 1
// Spur Def 2
// Spur Def 3
// Spur Def Res 1
// Spur Def Res 2
// Spur Res 1
// Spur Res 2
// Spur Res 3
// Spur Spd 1
// Spur Spd 2
// Spur Spd 3
// Spur Spd Def 1
// Spur Spd Def 2
// Sword Exp. 1
// Sword Exp. 2
// Sword Exp. 3
// Sword Valor 1
// Sword Valor 2
// Sword Valor 3
// Threaten Atk 1
// Threaten Atk 2
// Threaten Atk 3
// Threaten Def 1
// Threaten Def 2
// Threaten Def 3
// Threaten Res 1
// Threaten Res 2
// Threaten Res 3
// Threaten Spd 1
// Threaten Spd 2
// Threaten Spd 3
// Ward Armor
// Ward Cavalry
// Ward Fliers

reg(breathOfLife1);
reg(breathOfLife3);
reg(fortifyDef1);
reg(fortifyRes1);
reg(fortifyRes3);
reg(guidance3);
reg(honeAtk3);
reg(honeSpd3);