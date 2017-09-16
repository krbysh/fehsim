/**
 * BLA3
 * @module Combat
 * */

class FehCombat {

    /**
     * 
     * @param {FehUnit} unit attacker unit
     * @param {FehUnit} foe defender unit
     */
    constructor(unit, foe, testing = false) {

        if (!unit) throw new FehException(EX_MISSING_PARAM, 'Active unit is missing');
        if (!foe) throw new FehException(EX_MISSING_PARAM, 'Pasive unit is missing');

        this.activeUnit = unit;
        this.passiveUnit = foe;

        // backup states
        let activeHp0 = this.activeUnit.hp;
        let passiveHp0 = this.passiveUnit.hp;

        /**
         * @type {FehAttack[]}
         */
        this.attacks = [];

        // first attack
        let firstAttack = new FehAttack(unit, foe);
        firstAttack.passiveUnit.hp = firstAttack.tentativePassiveHp;
        this.attacks.push(firstAttack);

        // counter-attack
        let counterAttack = new FehAttack(foe, unit);
        counterAttack.passiveUnit.hp = counterAttack.tentativePassiveHp;
        this.attacks.push(counterAttack);

        // follow-up attack
        if (unit.spd - foe.spd >= 5) {
            let followUpAttack = new FehAttack(unit, foe);
            followUpAttack.passiveUnit.hp = followUpAttack.tentativePassiveHp;
            this.attacks.push(followUpAttack);
        } else if (foe.spd - unit.spd >= 5) {
            let followUpCounterAttack = new FehAttack(foe, unit);
            followUpCounterAttack.passiveUnit.hp = followUpCounterAttack.tentativePassiveHp;
            this.attacks.push(followUpCounterAttack);
        }

        // restore states
        if (testing) {
            this.passiveUnit.hp = passiveHp0;
            this.activeUnit.hp = activeHp0;
        }

    }

    debug() {
        console.log("Combat: " + this.activeUnit + " initiates");
        this.attacks.forEach(attack => {

            if (attack.thereIsAdvantage)
                console.log(attack.activeUnit + "'s attack is multiplied by 1.2 because of weapon advantage");

            if (attack.thereIsDisadvantage)
                console.log(attack.activeUnit + "'s attack is multiplied by 0.8 because of weapon advantage");

            console.log(attack.activeUnit + "'s attacks " + attack.passiveUnit + " for " + attack.dmg + " damage");

            if (this.activeUnit == attack.activeUnit)
                console.log(attack.activeUnit + " " + attack.tentativeActiveHp + " : " + attack.passiveUnit + " " + attack.tentativePassiveHp);
            else
                console.log(attack.passiveUnit + " " + attack.tentativePassiveHp + " : " + attack.activeUnit + " " + attack.tentativeActiveHp);
        });
    }
}

/**
 * PIN1
 */
class FehAttack {

    /**
     * 
     * @param {FehUnit} unit attacker unit
     * @param {FehUnit} foe defender unit
     */
    constructor(unit, foe) {

        /**
         * Extra advantage multiplier
         * @type {number} 
         */
        this.extraAdvantage = 0;

        /**
         * The Effectivity multiplier a unit receives when using a weapon effective against an enemy. 
         * Either 1 for normal attacks or 1.5 for effective attacks.
         * @type {number} 
         */
        this.eff = 1;

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
         * @type {FehUnit}
         */
        this.activeUnit = null;

        /**
         * The unit that is being attacked.
         * @type {FehUnit}
         */
        this.passiveUnit = null;

        /**
         * @type {FehUnit}
         */
        this.activeUnit = unit;

        /**
         * @type {FehUnit}
         */
        this.passiveUnit = foe;

        unit.onAttackStart(this);
        foe.onAttackStart(this);

        let isPhysical = false;
        if (unit.weaponType == WEAPON_SWORD ||
            unit.weaponType == WEAPON_LANCE ||
            unit.weaponType == WEAPON_AXE ||
            unit.weaponType == WEAPON_BOW ||
            unit.weaponType == WEAPON_DAGGER)
            isPhysical = true;

        this.thereIsAdvantage = false;
        this.thereIsDisadvantage = false;

        if (unit.weaponType == WEAPON_LANCE)
            this.thereIsAdvantage = foe.weaponType == WEAPON_SWORD;

        if (unit.weaponType == WEAPON_SWORD)
            this.thereIsDisadvantage = foe.weaponType == WEAPON_LANCE;

        let atk = unit.atk;
        let mit = isPhysical ? foe.def : foe.res;

        let adv = 0;
        if (this.thereIsAdvantage) adv = 0.2 + this.extraAdvantage;
        if (this.thereIsDisadvantage) adv = -0.2 - this.extraAdvantage;

        this.dmg =
            roundAwayFromZero(
                (
                    truncate(
                        truncate(
                            (
                                + truncate(atk * this.eff)
                                + truncate(truncate(atk * adv) * this.eff)
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

        this.tentativeActiveHp = this.activeUnit.hp;
        this.tentativePassiveHp = this.passiveUnit.hp - this.dmg;

        foe.onAttackEnd(this);
        unit.onAttackEnd(this);

        if (this.tentativeActiveHp < 0) this.tentativeActiveHp = 0;
        if (this.tentativePassiveHp < 0) this.tentativePassiveHp = 0;
    }

}

class FehCombatQuery {



}