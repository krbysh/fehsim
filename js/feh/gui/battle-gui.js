const GUISTATE_SHOWING_RANGE = 'GUISTATE_SHOWING_RANGE';

class FehBattleGui extends FehBattleListener {

    /**
     * 
     * @param {HTMLElement} gameElement
     * @param {FehController} controller 
     */
    constructor(gameElement, controller) {
        super();
        this.aiStepFunction = null;
        this.rootElement = gameElement;
        this.controller = controller;
        this.rebuild();
    }

    rebuild() {

        let battle = this.controller.battle;

        // CLEAR
        this.rootElement.classList.add('game');
        this.rootElement.innerHTML = '';

        // BUILD MESSAGE ELEMENTS
        this.msg = document.createElement('div');
        this.msg.classList.add('phase-change-msg');
        this.msg.addEventListener('animationend', e => {
            if (e.target !== this.msg) return;
            this.msg.classList.remove('animate');
            setTimeout(() => {
                if (this.aiStepFunction)
                    this.aiStepFunction();
            }, 125);
        });
        this.h1 = document.createElement('h1');
        this.h2 = document.createElement('h2');
        let msgBackground = document.createElement('div');
        msgBackground.classList.add('phase-change-background');
        this.msg.appendChild(this.h1);
        this.msg.appendChild(this.h2);
        this.msg.appendChild(msgBackground);

        // BUILD BOTTOM NAV
        this.swapSpacesButton = document.createElement('button');
        this.dangerZoneButton = document.createElement('button');
        this.endTurnButton = document.createElement('button');
        this.fightButton = document.createElement('button');
        this.menuButton = document.createElement('button');

        this.swapSpacesButton.textContent = 'Swap Spaces';
        this.dangerZoneButton.textContent = 'Danger Zone';
        this.endTurnButton.textContent = 'End Turn';
        this.fightButton.textContent = 'Fight';
        this.menuButton.textContent = 'Menu';

        this.swapSpacesButton.onclick = () => this.controller.swapSpaces();
        this.dangerZoneButton.onclick = () => { };
        this.endTurnButton.onclick = () => this.controller.endTurn();
        this.fightButton.onclick = () => this.controller.fight();
        this.menuButton.onclick = () => { };

        this.bottomNav = document.createElement('div');
        this.bottomNav.classList.add('bottom-nav');
        this.bottomNav.appendChild(this.menuButton);
        this.bottomNav.appendChild(this.dangerZoneButton);
        this.bottomNav.appendChild(this.swapSpacesButton);
        this.bottomNav.appendChild(this.endTurnButton);
        this.bottomNav.appendChild(this.fightButton);

        // BUILD MAP
        this.mapInput = document.createElement('div');
        this.mapTiles = document.createElement('div');
        this.mapForeground = document.createElement('div');
        this.mapBackground = document.createElement('div');
        this.mapHeroesElement = document.createElement('div');
        this.mapBackgroundPattern = document.createElement('div');

        this.mapInput.classList.add('map-input');
        this.mapTiles.classList.add('map-tiles');
        this.mapForeground.classList.add('map-foreground-image');
        this.mapBackground.classList.add('map-background-image');
        this.mapHeroesElement.classList.add('map-heroes');
        this.mapBackgroundPattern.classList.add('map-background-pattern');

        this.mapForeground.style.backgroundImage = 'url(' + battle.map.foregroundImageUri + ')';
        this.mapBackground.style.backgroundImage = 'url(' + battle.map.backgroundImageUri + ')';
        this.mapBackgroundPattern.style.backgroundImage = 'url(' + battle.map.backgroundPatternUri + ')';

        this.mapElement = document.createElement('div');
        this.mapElement.classList.add('map');
        this.mapElement.appendChild(this.mapInput);
        this.mapElement.appendChild(this.mapTiles);
        this.mapElement.appendChild(this.mapHeroesElement);
        this.mapElement.appendChild(this.mapForeground);
        this.mapElement.appendChild(this.mapBackground);
        this.mapElement.appendChild(this.mapBackgroundPattern);

        // BUILD
        this.rootElement.appendChild(this.mapElement);
        this.rootElement.appendChild(this.bottomNav);
        this.rootElement.appendChild(this.msg);

        this.guiHeroes = [];

        this.tiles = this.getNewTileArray();
        this.tiles.forEach(row => row.forEach(tile => {
            this.mapInput.appendChild(tile.inputElement);
            this.mapTiles.appendChild(tile.visualElement);
        }));

    }

    /**
     * 
     * @param {FehMapHero} hero 
     * @returns {FehTileGui}
     */
    getTileFor(hero) {
        return this.getTile(hero.row, hero.column);
    }

    /**
     * 
     * @param {Number} row
     * @param {Number} column 
     * @returns {FehTileGui}
     */
    getTile(row, column) {
        return this.tiles[row][column];
    }

    /**
     * @returns {FehTileGui[][]}
     */
    getNewTileArray() {
        let tiles = [];
        for (let row = 0; row < 8; row++) {
            tiles[row] = [];
            for (let column = 0; column < 6; column++)
                tiles[row][column] = new FehTileGui(this, row, column);
        }
        return tiles;
    }

    onStart() {

        let battle = this.controller.battle;

        this.mapHeroesElement.innerHTML = '';

        let playerTeam = this.controller.getTeam();
        let enemyTeam = this.controller.getEnemyTeam();

        let heroes = [];
        playerTeam.forEach(hero => heroes.push(hero));
        enemyTeam.forEach(hero => heroes.push(hero));

        heroes.forEach(hero => this.guiHeroes.push(new FehHeroGui(hero)));

        this.guiHeroes.forEach(hero => this.mapHeroesElement.appendChild(hero.element))
        this.guiHeroes.forEach(hero => hero.update());
    }

    /**
     * 
     * @param {String} phase 
     * @param {Number} turn 
     */
    onPhase(phase, turn) {

        let battle = this.controller.battle;

        this.h1.innerText = phase;
        this.h2.innerText = "Turno: " + turn;
        this.msg.classList.add('animate');

        if (battle.canSwapSpaces && battle.phase == PHASE_PLAYER && battle.turn == 1) {
            this.swapSpacesButton.style.display = 'inline-block';
        } else {
            this.swapSpacesButton.style.display = 'none';
        }

        if (battle.phase == PHASE_SWAP_SPACES) {
            this.endTurnButton.style.display = 'none';
            this.fightButton.style.display = 'inline-block';
        } else {
            this.fightButton.style.display = 'none';
            this.endTurnButton.style.display = 'inline-block';
        }

        this.clearTiles();
        if (this.controller.isPlayerPhase()) {
            this.controller.getTeam().forEach(hero => {
                let tile = this.getTileFor(hero);
                tile.showBlueFrame();
            })
        }
    }

    /**
     * 
     * @param {Number} row 
     * @param {Number} column 
     */
    onTile(row, column) {
        let hero = this.controller.battle.getTileContent(row, column);
        if (hero) {
            if (this.controller.isEnemyHero(hero) || (this.controller.isPlayerHero(hero) && hero.isWaiting)) {
                this.activeHero = hero;
                this.state = GUISTATE_SHOWING_RANGE;
                this.showRangeOf(hero);
            }
        }
    }

    /**
     * 
     */
    clearTiles() {
        this.clearTilesColors();
        this.clearTilesFrames();
    }

    /**
     * 
     */
    clearTilesColors() {
        this.tiles.forEach(row => row.forEach(tile => tile.clearColor()));
    }

    /**
     * 
     */
    clearTilesFrames() {
        this.tiles.forEach(row => row.forEach(tile => tile.clearFrame()));
    }

    /**
     * 
     * @param {FehMapHero} hero 
     */
    showRangeOf(hero) {
        this.clearTilesColors();
        console.log('show range of ' + hero)
        let tile = this.getTileFor(hero);
        tile.turnBlue();
    }

}