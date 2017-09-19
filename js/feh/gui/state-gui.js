class FehBattleStatusGui {

    /**
     * IMG
     * DIV
     *   LABEL(name)
     *   LABEL(hp)/LABEL(maxHp)
     *   LABEL(atk)  LABEL(spd)
     *   LABEL(def)  LABEL(res)
     */
    constructor() {
        this.htmlElement = document.createElement('div');
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

    }

    /**
     * 
     * @param {FehUnit} unit 
     */
    showUnitStatus(unit) {
        this.htmlElement.style.opacity = '1';
        this.nameElement.innerText = unit.name;
        this.hpElement.innerText = unit.hp;
        this.maxHpElement.innerText = '/ ' + unit.maxHp;
        this.atkElement.innerText = unit.atk;
        this.spdElement.innerText = unit.spd;
        this.defElement.innerText = unit.def;
        this.resElement.innerText = unit.res;
        this.portraitElement.style.backgroundImage = "url('" + unit.portrait + "')";
        this.weaponElement.innerText = unit.weapon ? unit.weapon.name : '';
        this.assistElement.innerText = unit.assist ? unit.assist.name : '';
        this.specialElement.innerText = unit.special ? unit.special.name : '';
    }

    hideCombatForecast() {
        this.forecastElement.classList.add('hidden');
    }

    /**
     * 
     * @param {FehCombat} combat 
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
        if (!combat.foeCanCounterAttack) foeDesc = '-';
        this.forecastFoeDescriptionElement.innerText = foeDesc;
    }
}