const GUISTATE_NULL = 'GUISTATE_NULL';
const GUISTATE_SHOWING_RANGE = 'GUISTATE_SHOWING_RANGE';
const GUISTATE_SHOWING_ACTIONS = 'GUISTATE_SHOWING_ACTIONS';
const GUISTATE_SHOWINT_ACTION_PREVIEW = 'GUISTATE_SHOWINT_ACTION_PREVIEW';

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
        this.state = GUISTATE_NULL;

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

        this.tiles = this.getNewGuiTileArray();
        this.tiles.forEach(row => row.forEach(tile => {
            this.mapInput.appendChild(tile.inputElement);
            this.mapTiles.appendChild(tile.visualElement);
        }));

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
                let tile = this.getGuiTileOf(hero);
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

        if (this.state == GUISTATE_SHOWINT_ACTION_PREVIEW) {

            if (
                this.currentActionRow == row &&
                this.currentActionColumn == column &&
                this.currentActionTarget == hero
            ) {
                // aqui está mal, el row y el column deberían de sacarse de un path finding, pero nos dá una idea, al menos para moverse
                this.controller.doAction(this.activeHero, row, column, this.currentActionTarget);
                this.onAction()
                return;
            }

        }

        if (this.state == GUISTATE_SHOWING_ACTIONS || this.state == GUISTATE_SHOWINT_ACTION_PREVIEW) {

            let tileInAttackRange = this.actionRange.attackRange.find(item => item.row == row && item.column == column);
            let tileInMoveRange = this.actionRange.moveRange.find(item => item.row == row && item.column == column);
            let actionableTile = hero ? tileInAttackRange : tileInMoveRange;

            if (actionableTile) {
                this.showActionPreview(hero, row, column, actionableTile.content);
                this.state = GUISTATE_SHOWINT_ACTION_PREVIEW;
            } else if (!tileInAttackRange) {
                this.clearTiles();
                this.state = GUISTATE_NULL;
            }

            return;
        }

        if (hero) {

            if (this.state == GUISTATE_NULL || this.state == GUISTATE_SHOWING_RANGE) {

                if (this.controller.owns(hero) || !hero.isWaiting) {
                    this.activeHero = hero;
                    this.state = GUISTATE_SHOWING_ACTIONS;
                    this.showActionsOf(hero);
                    return;
                }

                if (this.controller.isEnemy(hero) || (this.controller.owns(hero) && hero.isWaiting)) {
                    this.activeHero = hero;
                    this.state = GUISTATE_SHOWING_RANGE;
                    this.showRangeOf(hero);
                    return;
                }

            }

        } else {

            if (this.state == GUISTATE_SHOWING_RANGE) {
                this.state = GUISTATE_NULL;
                this.clearTiles();
                return;
            }

            if (this.state == GUISTATE_SHOWING_ACTIONS) {
                this.state = GUISTATE_NULL;
                this.clearTiles();
                return;
            }

        }

    }

    /**
     * 
     * @param {FehMapHero} hero 
     */
    showRangeOf(hero) {

        console.log('BattleGui::showRangeOf(FehMapHero)');

        this.clearTileColors();
        this.clearTileActionables();
        let range = this.controller.battle.getRangeOf(hero);
        range.attackRange.forEach(coordinate => {
            let tile = this.tiles[coordinate.row][coordinate.column];
            tile.turnRed();
        });
        range.moveRange.forEach(coordinate => {
            let tile = this.tiles[coordinate.row][coordinate.column];
            tile.turnBlue();
        });
    }

    /**
     * 
     * @param {FehMapHero} hero 
     */
    showActionsOf(hero) {

        console.log('BattleGui::showActionsOf(FehMapHero)');

        this.clearTileColors();
        this.clearTileActionables();
        let range = this.controller.battle.getRangeOf(hero);
        range.attackRange.forEach(coordinate => {
            let tile = this.tiles[coordinate.row][coordinate.column];
            tile.turnRed();
        });
        range.moveRange.forEach(coordinate => {
            let tile = this.tiles[coordinate.row][coordinate.column];

            // DIFERENCIA 1
            if (coordinate.validRestPosition)
                tile.setActionable();
            // DIFERENCIA 1 END

            tile.turnBlue();
        });
        // DIFERENCIA 2
        range.attackRange.forEach(coordinate => {
            let tile = this.tiles[coordinate.row][coordinate.column];
            if (coordinate.content == hero) return;
            if (coordinate.content) {
                tile.setActionable();
                if (coordinate.content.playerKey == hero.playerKey) {
                    tile.turnGreen();
                } else {
                    tile.turnRed();
                }
            }
        });
        // DIFERENCIA 2 END
        this.actionRange = range;
    }

    /**
     * 
     * @param {FehMapHero} hero 
     * @param {Number} row 
     * @param {Number} column 
     * @param {FehMapHero} target
     */
    showActionPreview(hero, row, column, target) {

        console.log('BattleGui::showActionPreview(FehMapHero, Number, Number, FehMapHero)');

        this.currentActionRow = row;
        this.currentActionColumn = column;
        this.currentActionTarget = target;

    }

    /**
     * 
     */
    clearTiles() {
        this.clearTileColors();
        this.clearTileFrames();
        this.clearTileActionables();
    }

    /**
     * 
     */
    clearTileActionables() {
        this.tiles.forEach(row => row.forEach(tile => tile.clearActionable()));
    }

    /**
     * 
     */
    clearTileColors() {
        this.tiles.forEach(row => row.forEach(tile => tile.clearColor()));
    }

    /**
     * 
     */
    clearTileFrames() {
        this.tiles.forEach(row => row.forEach(tile => tile.clearFrame()));
    }

    /**
     * 
     * @param {FehMapHero} hero 
     * @returns {FehTileGui}
     */
    getGuiTileOf(hero) {
        return this.getGuiTile(hero.row, hero.column);
    }

    /**
     * 
     * @param {Number} row
     * @param {Number} column 
     * @returns {FehTileGui}
     */
    getGuiTile(row, column) {
        return this.tiles[row][column];
    }

    /**
     * @returns {FehTileGui[][]}
     */
    getNewGuiTileArray() {
        let tiles = [];
        for (let row = 0; row < 8; row++) {
            tiles[row] = [];
            for (let column = 0; column < 6; column++)
                tiles[row][column] = new FehTileGui(this, row, column);
        }
        return tiles;
    }

}