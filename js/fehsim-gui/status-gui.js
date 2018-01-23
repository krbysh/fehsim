import * as feh from '../fehsim/module.js';

/**
 * 
 * @param {HTMLElement} element 
 * @param {number} amount 
 * @param {number} buff 
 * @param {number} debuff 
 */
function tempName1(element, amount, buff, debuff) {
    element.innerText = amount + buff - debuff;
    if (buff == debuff) element.className = '';
    else if (buff > debuff) element.className = 'buff';
    else element.className = 'debuff';
}

export class StatusGui {

    /**
     * 
     * @param {HTMLElement} htmlElement the element that will contain the status elements
     */
    constructor(htmlElement) {
        this.htmlElement = htmlElement;
        this.htmlElement.classList.add('status-panel');
        this.htmlElement.style.opacity = '0';
        this.htmlElement.innerHTML = `
            <div class='unit-portrait' name='main-portrait'>
            </div>
            <div class='combat-forecast hidden'>

                <div name='ld'></div>
                <div name='ed'></div>

                <div class='unit-portrait'>
                </div>

                <div class='foe-portrait'>
                </div>

                <label name='unit-name'>Cherche</label>
                <label name='unit-from'>52</label>
                <label name='unit-arrow'>→</label>
                <label name='unit-to'>52</label>
                <label name='unit-cooldown'>2</label>
                <label name='unit-description'>30x4</label>

                <label name='triangle'>Atk</label>
                <label name='hp'>HP</label>

                <label name='foe-name'>Cab. Espada</label>
                <label name='foe-from'>23</label>
                <label name='foe-arrow'>→</label>
                <label name='foe-to'>0</label>
                <label name='foe-cooldown'>1</label>
                <label name='foe-description'>6</label>
                
            </div>
            <div class='unit-status'>

                <label name='name'>Virion</label>
                
                <label name='hpTxt'>HP</label>
                <label name='hp'>18</label>
                <label name='maxHp'>/18</label>

                <label name='atk'>11</label>
                <label name='spd'>7</label>
                <label name='def'>6</label>
                <label name='res'>1</label>

                <label name='atkTxt'>Atk</label>
                <label name='spdTxt'>Spd</label>
                <label name='defTxt'>Def</label>
                <label name='resTxt'>Res</label>

            </div>
            <div class='unit-equipment'>

                <div name='passiveA'><label>A</label></div>
                <div name='passiveB'><label>B</label></div>
                <div name='passiveC'><label>C</label></div>
                <div name='sacredSeal'><label>S</label></div>

                <label name='weapon'>Iron Bow</label>
                <label name='assist'>Repositon</label>
                <label name='special'>Moonbow</label>

            </div>
        `;

        let us = this.htmlElement.querySelector('.unit-status');

        this.nameElement = us.querySelector('[name=name]');
        this.hpElement = us.querySelector('[name=hp]');
        this.maxHpElement = us.querySelector('[name=maxHp]');
        this.atkElement = us.querySelector('[name=atk]');
        this.spdElement = us.querySelector('[name=spd]');
        this.defElement = us.querySelector('[name=def]');
        this.resElement = us.querySelector('[name=res]');

        let ue = this.htmlElement.querySelector('.unit-equipment');
        this.weaponElement = ue.querySelector('[name=weapon]');
        this.assistElement = ue.querySelector('[name=assist]');
        this.specialElement = ue.querySelector('[name=special]');
        this.passiveAElement = ue.querySelector('[name=passiveA]');
        this.passiveBElement = ue.querySelector('[name=passiveB]');
        this.passiveCElement = ue.querySelector('[name=passiveC]');
        this.sacredSealElement = ue.querySelector('[name=sacredSeal]');

        this.portraitElement = this.htmlElement.querySelector('[name="main-portrait"]');

        this.forecastElement = this.htmlElement.querySelector('.combat-forecast');

        this.forecastUnitDescriptionElement = this.forecastElement.querySelector('[name=unit-description]');
        this.forecastUnitPortraitElement = this.forecastElement.querySelector('.unit-portrait');
        this.forecastUnitBeforeElement = this.forecastElement.querySelector('[name=unit-from]');
        this.forecastUnitAfterElement = this.forecastElement.querySelector('[name=unit-to]');

        this.forecastFoeDescriptionElement = this.forecastElement.querySelector('[name=foe-description]');
        this.forecastFoePortraitElement = this.forecastElement.querySelector('.foe-portrait');
        this.forecastFoeBeforeElement = this.forecastElement.querySelector('[name=foe-from]');
        this.forecastFoeAfterElement = this.forecastElement.querySelector('[name=foe-to]');

        this.forecastTriangle = this.forecastElement.querySelector('[name=triangle]');

    }

    /**
     * 
     * @param {feh.Unit} unit 
     */
    showUnitStatus(unit) {

        this.htmlElement.style.opacity = '1';
        this.nameElement.innerText = unit.name;
        this.hpElement.innerText = unit.hp;
        this.maxHpElement.innerText = '/ ' + unit.maxHp;

        tempName1(this.atkElement, unit.atk, unit.atkBuff, unit.atkDebuff);
        tempName1(this.spdElement, unit.spd, unit.spdBuff, unit.spdDebuff);
        tempName1(this.defElement, unit.def, unit.defBuff, unit.defDebuff);
        tempName1(this.resElement, unit.res, unit.resBuff, unit.resDebuff);

        this.portraitElement.style.backgroundImage = "url('" + unit.portrait + "')";
        this.weaponElement.innerText = unit.weapon ? unit.weapon.name : '';
        this.assistElement.innerText = unit.assist ? unit.assist.name : '';
        this.specialElement.innerText = unit.special ? unit.special.name : '';

        this.passiveAElement.style.backgroundImage = unit.passiveA ? 'url("' + unit.passiveA.sprite + '")' : null;
        this.passiveBElement.style.backgroundImage = unit.passiveB ? 'url("' + unit.passiveB.sprite + '")' : null;
        this.passiveCElement.style.backgroundImage = unit.passiveC ? 'url("' + unit.passiveC.sprite + '")' : null;
        this.sacredSealElement.style.backgroundImage = unit.sacredSeal ? 'url("' + unit.sacredSeal.sprite + '")' : null;


        this.passiveAElement.classList.add('empty');
        this.passiveBElement.classList.add('empty');
        this.passiveCElement.classList.add('empty');
        this.sacredSealElement.classList.add('empty');

        if (unit.passiveA) this.passiveAElement.classList.remove('empty');
        if (unit.passiveB) this.passiveBElement.classList.remove('empty');
        if (unit.passiveC) this.passiveCElement.classList.remove('empty');
        if (unit.sacredSeal) this.sacredSealElement.classList.remove('empty');

    }

    hideCombatForecast() {
        this.forecastElement.classList.add('hidden');
    }

    /**
     * 
     * @param {feh.Combat} combat 
     */
    showCombatForecast(combat) {

        // quizas deberíamos guardar hp0 del combate de ambas unidades

        this.forecastElement.classList.remove('hidden');
        this.forecastUnitPortraitElement.style.backgroundImage = "url('" + combat.activeUnit.portrait + "')";
        this.forecastFoePortraitElement.style.backgroundImage = "url('" + combat.passiveUnit.portrait + "')";

        this.forecastUnitBeforeElement.innerText = combat.activeUnitHpBeforeCombat;
        this.forecastFoeBeforeElement.innerText = combat.passiveUnitHpBeforeCombat;

        this.forecastUnitAfterElement.innerText = combat.activeUnitHpAfterCombat;
        this.forecastFoeAfterElement.innerText = combat.passiveUnitHpAfterCombat;

        let unitDesc = '' + combat.activeUnitFirstAttackDamage;
        if (combat.activeUnitAttackCount > 1) unitDesc += 'x' + combat.activeUnitAttackCount;
        this.forecastUnitDescriptionElement.innerText = unitDesc;

        let foeDesc = '' + combat.passiveUnitFirstAttackDamage;
        if (combat.passiveUnitAttackCount > 1) foeDesc += 'x' + combat.passiveUnitAttackCount;
        if (!combat.foeCanCounterattack) foeDesc = '-';
        this.forecastFoeDescriptionElement.innerText = foeDesc;

        /*
        if (combat.attacks[0].thereIsAdvantage) {
            this.forecastTriangle.innerHTML = '<span>↑</span>Atk<span>↓</span>';
        } else if (combat.attacks[0].thereIsDisadvantage) {
            this.forecastTriangle.innerHTML = '<span>↓</span>Atk<span>↑</span>';
        } else {
            this.forecastTriangle.innerHTML = 'Atk';
        }
        */

    }
}