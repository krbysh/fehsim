import * as feh from '../fehsim/module.js';
import * as data from '../fehsim-data/data.js';

class TeamBuild {
    /**
     * 
     * @param {string} name 
     * @param {feh.Build[]} builds
     */
    constructor(name, builds) {
        /**
         * @type {string}
         */
        this.name = name;
        /**
         * @type {feh.Build[]}
         */
        this.builds = builds;
    }

    getSimpleObject() {
        let pjso = {
            name: this.name,
            builds: this.builds.map(e => {
                return {
                    hero: e.hero ? e.hero.name : null,
                    rarity: e.rarity ? e.rarity : 5,
                    merges: e.merges ? e.merges : 0,
                    level: e.level ? e.level : 40,
                    boon: e.boon,
                    bane: e.bane,
                    weapon: e.weapon ? e.weapon.name : null,
                    assist: e.assist ? e.assist.name : null,
                    special: e.special ? e.special.name : null,
                    passiveA: e.passiveA ? e.passiveA.name : null,
                    passiveB: e.passiveB ? e.passiveB.name : null,
                    passiveC: e.passiveC ? e.passiveC.name : null,
                    sacredSeal: e.sacredSeal ? e.sacredSeal.name : null
                }
            })
        };
        return pjso;
    }
}



class TeamBuildElement {
    /**
     * 
     * @param {TeamBuild} team 
     */
    constructor(team) {

        /** @type {feh.Battle} */
        this.battle = null;

        /** @type {TeamBuild} */
        this.team = team;

        /** @type {feh.Build} */
        this.selectedBuild = null;

        /** @type {HTMLElement} */
        this.htmlElement = document.createElement('div');
        this.htmlElement.className = 'app-team';
        this.htmlElement.innerHTML = `
            <div class="app-header">
                <input name="team-name">
                <button name="delete">delete</button>
                <button name="use">use</button>
                <button name="expand">+</button></div>
                <div class="app-team-content"></div>
                <div class="app-team-member-editor">
            </div>`;

        /** @type {HTMLInputElement} */
        this.nameInputElement = this.htmlElement.querySelector('input[name="team-name"]');

        /** @type {HTMLElement} */
        this.contentElement = this.htmlElement.querySelector('.app-team-content');

        /** @type {HTMLElement} */
        this.editorElement = this.htmlElement.querySelector('.app-team-member-editor');

        /** @type {HTMLButtonElement} */ this.expandButton = this.htmlElement.querySelector('[name=expand]');
        this.expandButton.onclick = () => {
            this.htmlElement.classList.toggle('expanded');
            this.htmlElement.classList.contains('expanded')
            this.expandButton.innerText = this.htmlElement.classList.contains('expanded') ? '-' : '+';
            if (this.htmlElement.classList.contains('expanded')) this.renderContent();
            else this.destroyContent();
        }

        /** @type {HTMLButtonElement} */ this.useButton = this.htmlElement.querySelector('[name=use]');
        this.useButton.onclick = () => this.battle.setup(this.battle.map, team.builds, this.battle.enemyTeamBuilds);

        /** @type {HTMLButtonElement} */ this.deleteButton = this.htmlElement.querySelector('[name=delete]');
        this.deleteButton.onclick = () => {
            let result = confirm('You are about to delete the team named "' + team.name + '"');
            if (result) {
                console.log('DELETE');
            }
        };

        this.nameInputElement.value = this.team.name;
        this.nameInputElement.onchange = e => this.team.name = this.nameInputElement.value;
    }



    renderContent() {

        /** @type {HTMLImageElement[]} */
        this.arregloDeRetratos = [];

        this.contentElement.innerHTML = '';
        for (let i = 0; i < this.team.builds.length; i++) {
            let element = document.createElement('div');
            element.className = 'app-team-member';
            element.innerHTML = '<img></img>'
            element.onclick = () => this.editBuild(this.team.builds[i]);
            element.build = this.team.builds[i];
            this.contentElement.appendChild(element);

            this.arregloDeRetratos[i] = element.querySelector('img');
        }

        this.refreshTeamBuildImages();
    }

    refreshTeamBuildImages() {
        for (let i = 0; i < this.team.builds.length; i++) {
            let src = "res/img/heroes/" + this.team.builds[i].hero.name + '.png';
            this.arregloDeRetratos[i].src = src;
        }
    }

    /**
     * @param {feh.Build} build 
     */
    editBuild(build) {

        if (build == this.selectedBuild) {
            this.selectedBuild = null;
            this.cancelEdit();
            return;
        }

        /**
         * @type {feh.Build} build 
         */
        this.selectedBuild = build;
        this.htmlElement.classList.add('editing');
        this.htmlElement.querySelectorAll('.app-team-member').forEach(e => {
            e.classList.remove('current');
            if (e.build == build) e.classList.add('current');
        });

        if (!this.editorIsRendered) this.renderEditor();
        if (this.editorIsRendered) this.refreshEditorValues();
    }

    refreshEditorValues() {

        console.log('REFRESH');

        this.heroSelect.value = this.selectedBuild.hero.name;
        this.passiveASelect.value = this.selectedBuild.passiveA ? this.selectedBuild.passiveA.name : null;
        this.passiveBSelect.value = this.selectedBuild.passiveB ? this.selectedBuild.passiveB.name : null;

        return;

        this.editorElement.querySelector('[name="name"]').innerHTML = this.selectedBuild.hero.name;
        for (let varname in this.selectedBuild) {
            let label = this.editorElement.querySelector('[name="' + varname + '"]');
            if (!label) continue;
            let prop = this.selectedBuild[varname];
            console.log(prop)
            if (prop && prop.name) label.innerHTML = prop.name;
            else label.innerHTML = '-';
        }
    }

    renderEditor() {

        console.log('RENDER');

        this.editorElement.innerHTML = `
            <div class="summary">
            </div>
        `;
        let summary = this.editorElement.querySelector('.summary');

        /** @type {HTMLSelectElement} */ this.heroSelect = document.createElement('select');
        /** @type {HTMLSelectElement} */ this.weaponSelect = document.createElement('select');
        /** @type {HTMLSelectElement} */ this.assistSelect = document.createElement('select');
        /** @type {HTMLSelectElement} */ this.specialSelect = document.createElement('select');
        /** @type {HTMLSelectElement} */ this.passiveASelect = document.createElement('select');
        /** @type {HTMLSelectElement} */ this.passiveBSelect = document.createElement('select');
        /** @type {HTMLSelectElement} */ this.passiveCSelect = document.createElement('select');
        /** @type {HTMLSelectElement} */ this.sacredSealSelect = document.createElement('select');



        let heroes = [];
        for (let heroName in data.heroes) heroes.push(data.heroes[heroName]);
        heroes.sort((a, b) => a.name < b.name ? -1 : (a.name > b.name ? 1 : 0));

        // HEROES
        heroes.forEach(hero => {
            /** @type {HTMLOptionElement} */
            let option = document.createElement('option');
            let name = hero.name;
            option.value = name;
            option.innerText = name;
            this.heroSelect.appendChild(option);
        });

        let passiveA = [];
        let passiveB = [];
        let passiveC = [];
        for (let passiveName in data.passives) {
            let skill = data.passives[passiveName];
            switch (skill.type) {
                case feh.SKILL.PASSIVE_A: passiveA.push(skill); break;
                case feh.SKILL.PASSIVE_B: passiveB.push(skill); break;
                case feh.SKILL.PASSIVE_C: passiveC.push(skill); break;
            }
        }

        let createNothing = () => {
            /** @type {HTMLOptionElement} */
            let nullOption = document.createElement('option');
            nullOption.value = '(nothing)';
            nullOption.innerText = '(nothing)';
            return nullOption;
        };

        // PASSIVE_A        
        this.passiveASelect.appendChild(createNothing());
        passiveA.forEach(skill => {
            /** @type {HTMLOptionElement} */
            let option = document.createElement('option');
            let name = skill.name;
            option.value = name;
            option.innerText = name;
            this.passiveASelect.appendChild(option);
            console.log(name);
        });

        // PASSIVE_A
        this.passiveBSelect.appendChild(createNothing());
        passiveB.forEach(skill => {
            /** @type {HTMLOptionElement} */
            let option = document.createElement('option');
            let name = skill.name;
            option.value = name;
            option.innerText = name;
            this.passiveBSelect.appendChild(option);
            console.log(name);
        });

        // EVENTS ===================================================

        this.heroSelect.onchange = e => {
            let name = this.heroSelect.value;
            this.selectedBuild.hero = data.heroes[name];
            this.refreshTeamBuildImages();
        };
        
        this.passiveASelect.onchange = e => {
            let name = this.passiveASelect.value;
            this.selectedBuild.passiveA = data.passives[name];
        };

        this.passiveBSelect.onchange = e => {
            let name = this.passiveBSelect.value;
            this.selectedBuild.passiveB = data.passives[name];
        };

        // APPENDS ==================================================

        summary.appendChild(this.heroSelect);
        summary.appendChild(this.weaponSelect);
        summary.appendChild(this.assistSelect);
        summary.appendChild(this.specialSelect);
        summary.appendChild(this.passiveASelect);
        summary.appendChild(this.passiveBSelect);
        summary.appendChild(this.passiveCSelect);
        summary.appendChild(this.sacredSealSelect);

        this.editorIsRendered = true;
    }

    cancelEdit() {
        this.editorIsRendered = false;
        this.htmlElement.classList.remove('editing');
        this.editorElement.innerHTML = '';
    }

    destroyContent() {
        this.htmlElement.classList.remove('editing');
        this.contentElement.innerHTML = '';
        this.editorElement.innerHTML = '';
        this.editorIsRendered = false;
        this.selectedBuild = null;
    }

    destroy() { this.htmlElement.parentElement.removeChild(this.htmlElement); }
}

export class TeamMenuGui {

    constructor() {
        /**
         * @type {feh.Battle}
         */
        this.battle = null;

        /**
         * @type {TeamBuild}
         */
        this.build = null;

        /**
         * @type {TeamBuild[]}
         */
        this.teamBuilds = [];

        /**
         * @type {TeamBuildElement[]}
         */
        this.teamBuildElements = [];
    }

    /**
     * 
     * @param {HTMLElement} element 
     */
    init(element) {

        element.innerHTML = `
            <div class='app-header'>
                <button>Restore teams</button>
                <button>Save teams</button>
                <button onclick='this.parentElement.parentElement.classList.toggle("hidden")'>=</button>
            </div>
            <div class='app-container'>
            </div>
            `;

        let restoreTeamsButton = element.querySelector('button:nth-of-type(1)');
        restoreTeamsButton.onclick = () => { this.reloadTeams(); this.rebuildElements(); }

        let saveTeamsButton = element.querySelector('button:nth-of-type(2)');
        saveTeamsButton.onclick = () => this.saveTeams();

        this.appContainer = element.querySelector('.app-container');
        this.data = null;
        data.DATA_PROMISE.then(data => {
            this.data = data;
            this.reloadTeams();
            this.rebuildElements();
        })
    }

    saveTeams() {
        let json = JSON.stringify(this.teamBuilds.map(b => b.getSimpleObject()), 4);
        localStorage.setItem('feh.TeamBuilds', json);
        alert('Saved');
    }

    reloadTeams() {

        // CLEAR
        this.teamBuilds.length = 0;

        // READ JSON OR CREATE DEFAULT JSON AND SAVE IT
        let json = localStorage.getItem('feh.TeamBuilds');
        if (!json) {
            let defaultTeams = [];
            for (let i = 0; i < 10; i++) {
                defaultTeams.push({
                    name: 'Default Team',
                    builds: [
                        { hero: 'Nino', level: 40, rarity: 5 },
                        { hero: 'Nino', level: 40, rarity: 5 },
                        { hero: 'Nino', level: 40, rarity: 5 },
                        { hero: 'Nino', level: 40, rarity: 5 }
                    ]
                });
            }
            console.log('CREATING DEFAULT TEAMS');
            json = JSON.stringify(defaultTeams);
            localStorage.setItem('feh.TeamBuilds', json);
        }

        // PARSE IT
        let parsedArray = JSON.parse(json);
        for (let i = 0; i < parsedArray.length; i++) {
            let parsedItem = parsedArray[i];
            let team = new TeamBuild(parsedItem.name);
            team.builds = [];
            for (let j = 0; j < parsedItem.builds.length; j++) {
                let parsedUnit = parsedItem.builds[j];
                let build = new feh.Build();
                build.hero = parsedUnit.hero ? this.data.findHero(parsedUnit.hero) : null;
                build.rarity = Number.parseInt(parsedUnit.rarity);
                build.merges = Number.parseInt(parsedUnit.merges);
                build.level = Number.parseInt(parsedUnit.level);
                build.boon = parsedUnit.boon;
                build.bane = parsedUnit.bane;
                build.weapon = parsedUnit.weapon ? this.data.findSkill(parsedUnit.weapon) : null;
                build.assist = parsedUnit.assist ? this.data.findSkill(parsedUnit.assist) : null;
                build.special = parsedUnit.special ? this.data.findSkill(parsedUnit.special) : null;
                build.passiveA = parsedUnit.passiveA ? this.data.findSkill(parsedUnit.passiveA) : null;
                build.passiveB = parsedUnit.passiveB ? this.data.findSkill(parsedUnit.passiveB) : null;
                build.passiveC = parsedUnit.passiveC ? this.data.findSkill(parsedUnit.passiveC) : null;
                build.sacredSeal = parsedUnit.sacredSeal ? this.data.findSacredSeal(parsedUnit.sacredSeal) : null;
                team.builds.push(build);
            }
            this.teamBuilds.push(team);
        }
    }

    rebuildElements() {
        this.teamBuildElements.forEach(e => e.destroy());
        this.teamBuildElements = this.teamBuilds.map(b => {
            let e = new TeamBuildElement(b);
            e.battle = this.battle;
            this.appContainer.appendChild(e.htmlElement);
            return e;
        });
    }

    /**
     * @param {TeamBuild} team 
     */
    setTeam(team) {
        this.build = team;
    }
}