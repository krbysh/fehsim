import { Unit, UnitModifier } from './unit.js';
import { Skill, WEAPON } from './skill.js';

var COLOR = {
    RED: 'Red',
    BLUE: 'Blue',
    GREEN: 'Green',
    GRAY: 'Gray',
}

function isPhysicalWeapon(weaponType) {
    return weaponType == WEAPON.SWORD ||
        weaponType == WEAPON.LANCE ||
        weaponType == WEAPON.AXE ||
        weaponType == WEAPON.BOW ||
        weaponType == WEAPON.DAGGER;
}

function getColor(weaponType) {
    switch (weaponType) {
        case WEAPON.SWORD:
        case WEAPON.RED_TOME:
        case WEAPON.RED_DRAGON_STONE:
            return COLOR.RED;
        case WEAPON.LANCE:
        case WEAPON.BLUE_TOME:
        case WEAPON.BLUE_DRAGON_STONE:
            return COLOR.BLUE;
        case WEAPON.AXE:
        case WEAPON.GREEN_TOME:
        case WEAPON.GREEN_DRAGON_STONE:
            return COLOR.GREEN;
        case WEAPON.BOW:
        case WEAPON.DAGGER:
        case WEAPON.STAFF:
            return COLOR.GRAY;
    }
}

function thereIsAdvantage(unitWeaponType, foeWeaponType) {
    let unitColor = getColor(unitWeaponType);
    let foeColor = getColor(foeWeaponType);
    switch (unitColor) {
        case COLOR.RED: return foeColor === COLOR.GREEN;
        case COLOR.GREEN: return foeColor === COLOR.BLUE;
        case COLOR.BLUE: return foeColor === COLOR.RED;
        default: return false;
    }
}

function thereIsDisadvantage(unitWeaponType, foeWeaponType) {
    let unitColor = getColor(unitWeaponType);
    let foeColor = getColor(foeWeaponType);
    switch (unitColor) {
        case COLOR.RED: return foeColor === COLOR.BLUE;
        case COLOR.GREEN: return foeColor === COLOR.RED;
        case COLOR.BLUE: return foeColor === COLOR.GREEN;
        default: return false;
    }
}

/**
 * 
 * @param {Unit} unit 
 * @private
 */
function addBuffModifier(unit) {
    let m = new UnitModifier('Buffs and Debuffs Modifier', unit, null);
    let atkBuff = unit.atkBuff - unit.atkDebuff;
    let spdBuff = unit.spdBuff - unit.spdDebuff;
    let defBuff = unit.defBuff - unit.defDebuff;
    let resBuff = unit.resBuff - unit.resDebuff;
    m.apply = u => {
        u.atk += atkBuff;
        u.spd += spdBuff;
        u.def += defBuff;
        u.res += resBuff;
    };
    m.oncombatend = (c, u, f) => u.removeModifier(m);
    unit.addModifier(m);
}

class CombatStep {
    constructor(activeUnitAttack, description, priority) {
        this.activeUnitAttack = activeUnitAttack;
        this.description = description;
        this.priority = priority;
    }
}

/**
 * A combat is an ordered set of directed attacks that involve two units.
 * The order and amount of attacks is determined by the units's stats and skills.
 */
export class Combat {
    /**
     * This is not thread safe (but this is js so it doesn't matter right? right!?)
     * @param {Unit} unit the unit starting the combat
     * @param {Unit} foe the other unit
     * @param {boolean} test flag that indicates this combat is a test and should not affect neither unit or foe
     */
    constructor(unit, foe, test = true) {

        // PARAMS
        /** @type {Unit} */ this.activeUnit = unit;
        /** @type {Unit} */ this.passiveUnit = foe;

        // VARS FOR TEST MODE
        /** @type {number} */ this.activeUnitHpBeforeCombat = this.activeUnit.hp;
        /** @type {number} */ this.passiveUnitHpBeforeCombat = this.passiveUnit.hp;

        // FLAGS
        /** @type {boolean} */ this.foeCanCounterattack = foe.attackRange == unit.attackRange;
        /** @type {boolean} */ this.desperateAttacker = false;
        /** @type {boolean} */ this.vantageDefender = false;

        // EXTRA
        /** @type {Skill} */ this.vantageDefenderSkill = null;
        /** @type {Skill} */ this.desperateAttackerSkill = null;

        // ADD BUFFS AND DEBUFFS AS MODIFIERS
        addBuffModifier(unit);
        addBuffModifier(foe);

        // =========================================================

        // FOLLOW-UP VARS
        this.unitGuarantedFollowUpAttacks = 0;
        this.unitPreventedFollowUpAttacks = 0;
        this.foeGuarantedFollowUpAttacks = 0;
        this.foePreventedFollowUpAttacks = 0;

        // SEND EVENT MESSAGES FOR START AND STARTLATE
        unit.onCombatStart(this, foe);
        foe.onCombatStart(this, unit);
        unit.onCombatStartLate(this, foe);
        foe.onCombatStartLate(this, unit);

        // "ORGANIC" FOLLOW-UP ATTACKS
        let unitFollowUpAttacks = this.unitGuarantedFollowUpAttacks - this.unitPreventedFollowUpAttacks;
        let foeFollowUpAttacks = this.foeGuarantedFollowUpAttacks - this.foePreventedFollowUpAttacks;
        if (unitFollowUpAttacks == 0 && unit.spd - foe.spd >= 5) unitFollowUpAttacks = 1;
        if (foeFollowUpAttacks == 0 && foe.spd - unit.spd >= 5) foeFollowUpAttacks = 1;

        // ATTACK, COUNTERATTACK AND FOLLOW-UP ATTACKS
        this.initialAttack = new CombatStep(true, 'Attack', 4000);
        this.counterAttack = this.foeCanCounterattack ? new CombatStep(false, 'Counteratack', 3000) : null;
        this.unitFollowUpAttack = unitFollowUpAttacks > 0 ? new CombatStep(true, 'Unit Follow-Up Attack', 2000) : null;
        this.foeFollowUpAttack = foeFollowUpAttacks > 0 && this.foeCanCounterattack ? new CombatStep(false, 'Foe Follow-Up Attack', 1000) : null;

        // STEPS
        /** @type {CombatStep[]} */ let steps = []
        if (this.initialAttack) steps.push(this.initialAttack);
        if (this.counterAttack) steps.push(this.counterAttack);
        if (this.unitFollowUpAttack) steps.push(this.unitFollowUpAttack);
        if (this.foeFollowUpAttack) steps.push(this.foeFollowUpAttack);

        if (this.desperateAttacker && this.unitFollowUpAttack) {
            this.unitFollowUpAttack.priority += 1100;
            this.unitFollowUpAttack.priorityChangedBy = this.desperateAttackerSkill;
        }        
        if (this.vantageDefender && this.counterAttack) {
            this.counterAttack.priority += 1100;
            this.counterAttack.priorityChangedBy = this.vantageDefenderSkill;
        }

        steps = steps.sort((a, b) => b.priority - a.priority);
        steps.forEach(e => console.log(e.description));

        // ATTACKS
        /** @type {Attack[]} */ this.attacks = [];        
        steps.forEach(step => {
            let attacker = step.activeUnitAttack ? this.activeUnit : this.passiveUnit;
            let defender = step.activeUnitAttack ? this.passiveUnit : this.activeUnit;
            let attack = new Attack(attacker, defender, this, step.description);
            step.attack = attack;
            if (step.priorityChangedBy) attack.priorityChangedBy = step.priorityChangedBy;
            if (this.passiveUnit.hp > 0 && this.activeUnit.hp > 0) {
                this.attacks.push(attack);
                attack.apply();
            }
        });

        // SEND EVENT MESSAGES FOR END
        unit.onCombatEnd(this, foe);
        foe.onCombatEnd(this, unit);

        // =========================================================

        // FIX
        if (this.activeUnit.hp < 0) this.activeUnit.hp = 0;
        if (this.passiveUnit.hp < 0) this.passiveUnit.hp = 0;

        // DEBUG AND PREVIEW TOO ?
        /** @type {number} */ this.activeUnitFirstAttackDamage = this.initialAttack.attack.dmg;
        /** @type {number} */ this.passiveUnitFirstAttackDamage = this.counterAttack ? this.counterAttack.attack.dmg : 0;           
        /** @type {number} */ this.activeUnitHpAfterCombat = this.activeUnit.hp;
        /** @type {number} */ this.passiveUnitHpAfterCombat = this.passiveUnit.hp;
        /** @type {number} */ this.activeUnitAttackCount = this.initialAttack ? (this.unitFollowUpAttack ? 2 : 1) : 0;
        /** @type {number} */ this.passiveUnitAttackCount = this.counterAttack ? (this.foeFollowUpAttack ? 2 : 1) : 0;

        // RESTORE THE STATE BEFORE ATTACKS
        if (test) {
            unit.hp = this.activeUnitHpBeforeCombat;
            foe.hp = this.passiveUnitHpBeforeCombat;
        }

        // DEBUG
        console.log('Combat initiated by ' + unit + ' against ' + foe);
        this.attacks.forEach(a => console.log('    ' + a));
    }

}

/**
 * An attack its an process involving two units: an attacker (active unit) who inflicts the damage, 
 * and a defender (passive unit) who receives damage.
 */
export class Attack {
    /**
     * An attack exists in a vacum and is not aware of the rest of the combat, 
     * hence the foe in an attack may not be the foe from the combat perspective.
     * @param {Unit} unit the unit inflicting the damage
     * @param {Unit} foe the unit receiving and mitigating the damage
     * @param {Combat} combat combat where the attack got generated
     * @param {string} notes of use only in the debug section
     */
    constructor(unit, foe, combat, notes) {

        this.notes = notes;
        this.priorityChangedBy = null;

        /**
         * Source combat
         * @type {Combat}
         */
        this.combat = combat;

        /**
         * Extra advantage multiplier caused by unit skills
         * @type {number} 
         */
        this.extraAdvantageByUnit = 0;

        /**
         * Extra advantage multiplier caused by foe skills
         * @type {number} 
         */
        this.extraAdvantageByFoe = 0;

        /**
         * The Effectivity multiplier a unit receives when using a weapon effective against an enemy. 
         * Either 1 for normal attacks or 1.5 for effective attacks.
         * @type {number} 
         */
        this.isEffectiveAgainst = false;

        /**
         * The class modifier. This value is 1 for all classes except for staff users who have a ClassMod of 0.5. 
         * Units equipped with Wrathful Staff use the value 1.
         * @type {number} 
         */
        this.classMod = 1;

        /**
         * The decimal value describing by how many percent the opponent's Def or Res is lowered.
         * @type {number} 
         */
        this.mitMod = 0;

        /**
         * The value of the stat which is being used by the Special move, such as Res for Glacies. 
         * The Dragon Fang family of specials also work like this, for the SpcStat Atk.
         * @type {number} 
         */
        this.spcStat = 0;

        /**
         * The decimal value by which said stat will affect the attack damage, such as 0.8 for Glacies.
         * @type {number} 
         */
        this.spcMod = 0;

        /**
         * The decimal value by which the final damage dealt will be increased by the special, 
         * such as 0.5 for Night Sky and Glimmer, or 1.5 for Astra.
         * @type {number} 
         */
        this.offMult = 0;

        /**
         * The decimal value by which the final damage dealt will be decreased by the special, 
         * such as 0.3 for Buckler, or 0.5 for Pavise.
         * @type {number} 
         */
        this.defMult = 0;

        /**
         * Flat damage added by skills such as Wo Dao+ or Dark Excalibur.
         * @type {number} 
         */
        this.offFlat = 0;

        /**
         * Flat damage mitigated by skills such as Shield Pulse.
         * @type {number} 
         */
        this.defFlat = 0;

        /**
         * The combat initiator.
         * @type {Unit}
         */
        this.activeUnit = unit;

        /**
         * The unit that is being attacked.
         * @type {Unit}
         */
        this.passiveUnit = foe;

        /**
         * Additional special cooldown charge per attack, for the active Unit
         * @type {number}
         */
        this.activeExtraCooldown = 0;

        /**
         * Additional NEGATIVE special cooldown charge per attack, for the active Unit
         * @type {number}
         */
        this.activeCooldownPenalty = 0;

        /**
         * Additional special cooldown charge per attack, for the passive Unit
         * @type {number}
         */
        this.passiveExtraCooldown = 0;

        /**
         * Additional NEGATIVE special cooldown charge per attack, for the passive Unit
         * @type {number}
         */
        this.passiveCooldownPenalty = 0;

        unit.onAttackStart(this, foe);
        foe.onAttackStart(this, unit);

        let physical = isPhysicalWeapon(unit.weaponType);

        this.thereIsAdvantage = thereIsAdvantage(unit.weaponType, foe.weaponType);
        this.thereIsDisadvantage = thereIsDisadvantage(unit.weaponType, foe.weaponType);

        let atk = unit.atk;
        let mit = physical ? foe.def : foe.res;

        let adv = 0;
        if (this.thereIsAdvantage) adv = 0.2 + this.extraAdvantageByUnit + this.extraAdvantageByFoe;
        if (this.thereIsDisadvantage) adv = -(0.2 + this.extraAdvantageByUnit + this.extraAdvantageByFoe);

        let eff = this.isEffectiveAgainst ? 1.5 : 1.0;

        this.dmg =
            roundAwayFromZero(
                (
                    truncate(
                        truncate(
                            (
                                + truncate(atk * eff)
                                + truncate(truncate(atk * adv) * eff)
                                + truncate(this.spcStat * this.spcMod)
                                - mit
                                - truncate(mit * this.mitMod)
                            ) * this.classMod
                        ) * (1 + this.offMult)
                    ) + this.offFlat
                ) * (1 - this.defMult)
                - this.defFlat
            );
        if (this.dmg < 0) this.dmg = 0;

        // LOG?
        this.tentativeActiveHp = this.activeUnit.hp;
        this.tentativePassiveHp = this.passiveUnit.hp - this.dmg;

        this.activeUnit.cooldownCount -= 1 + (this.activeExtraCooldown - this.activeCooldownPenalty);
        this.passiveUnit.cooldownCount -= 1 + (this.passiveExtraCooldown - this.passiveCooldownPenalty);
        if (this.activeUnit.cooldownCount < 0) activeUnit.cooldownCount = 0;
        if (this.passiveUnit.cooldownCount < 0) passiveUnit.cooldownCount = 0;

        foe.onAttackEnd(this);
        unit.onAttackEnd(this);

    }

    apply() {
        this.passiveUnit.hp -= this.dmg;
    }

    toString() {
        return this.activeUnit + ' attacked ' + this.passiveUnit + ' making ' + this.dmg + ' damage' + (this.notes ? '; ' + this.notes : '');
    }

}

/**
 * BLA2.1
 * @param {Number} n 
 * @private
 */
function truncate(n) { return Math.trunc(n); }

/**
 * BLA2.2
 * @param {Number} n 
 * @private
 */
function roundTowardsZero(n) {
    if (n < 0) return Math.ceil(n);
    return Math.floor(n);
}

/**
 * BLA2.3
 * @param {Number} n 
 * @private
 */
function roundAwayFromZero(n) {
    if (n > 0) return Math.ceil(n);
    return Math.floor(n);
}