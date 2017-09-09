const GUISTATE_NULL = 'GUISTATE_NULL';
const GUISTATE_SHOWING_RANGE = 'GUISTATE_SHOWING_RANGE';
const GUISTATE_SHOWING_ACTIONS = 'GUISTATE_SHOWING_ACTIONS';
const GUISTATE_SHOWINT_ACTION_PREVIEW = 'GUISTATE_SHOWINT_ACTION_PREVIEW';

class FehBattleGui extends FehBattleListener {

    /**
     * 
     * @param {HTMLElement} gameElement
     * @param {FehController} controller 
     * @param {FehMapHeroGui[]} guiHeroes
     */
    constructor(gameElement, controller, guiHeroes) {
        super();
        this.aiStepFunction = null;
        this.rootElement = gameElement;
        this.controller = controller;
        this.guiHeroes = guiHeroes;
        this.rebuild();
    }

    rebuild() {

        let battle = this.controller.battle;
        this.state = GUISTATE_NULL;

        // CLEAR
        this.rootElement.classList.add('game');
        this.rootElement.innerHTML = '';

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
        this.endTurnButton.onclick = () => {

            // CLEAR?
            this.clearTiles();
            if (this.activeHero)
                this.getGuiMapHeroForMapHero(this.activeHero).reset();
            this.state = GUISTATE_NULL;
            this.actionPreviewRow = null;
            this.actionPreviewColumn = null;

            this.controller.endTurn();
        };
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
        // this.rootElement.appendChild(this.msg);

        this.guiHeroes = [];

        /**
         * @type {FehTileGui[][]}
         */
        this.guiTiles = this.getNewGuiTileArray();
        this.guiTiles.forEach(row => row.forEach(tile => {
            this.mapInput.appendChild(tile.inputElement);
            this.mapTiles.appendChild(tile.visualElement);
        }));

        // BUILD MAP WALLS
        for (let row = 0; row < 8; row++) {
            for (let column = 0; column < 6; column++) {
                let tileGui = this.guiTiles[row][column];
                let tile = this.controller.battle.map.tiles[row][column];
                if (tile == TERRAIN_BLOCK || tile == TERRAIN_WALL1) {
                    tileGui.setWall();
                }
            }
        }

    }

    onStart() {

        let battle = this.controller.battle;

        this.mapHeroesElement.innerHTML = '';

        let playerTeam = this.controller.getTeam();
        let enemyTeam = this.controller.getEnemyTeam();

        let heroes = [];
        playerTeam.forEach(hero => heroes.push(hero));
        enemyTeam.forEach(hero => heroes.push(hero));

        heroes.forEach(hero => this.guiHeroes.push(new FehMapHeroGui(this, hero)));

        this.guiHeroes.forEach(hero => this.mapHeroesElement.appendChild(hero.element))
        this.guiHeroes.forEach(hero => hero.reset());
    }

    /**
     * 
     * @param {String} phase 
     * @param {Number} turn 
     */
    onPhase(phase, turn) {

        if (phase !== PHASE_SWAP_SPACES) {

            // MESSAGE
            let msg = document.createElement('div');
            msg.className = 'animate phase-change-msg';
            msg.innerHTML = '<h1>' + phase + '</h1><h2>Turn: ' + turn + '</h2><div class="phase-change-background"></div>'
            msg.addEventListener('animationend', e => {
                if (e.target !== msg) return;
                msg.parentElement.removeChild(msg);
                if (this.aiStepFunction)
                    this.aiStepFunction();
            });
            this.rootElement.appendChild(msg);

            // FIX para swap_spaces a medias
            this.activeHero = null;

        }

        let battle = this.controller.battle;

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
        this.guiHeroes.forEach(guiHero => guiHero.reset());
        this.updateDangerZone();

        if (phase == PHASE_SWAP_SPACES) {
            this.clearTiles();
            this.enableSwapStyles();
        }
    }

    /**
     * 
     * @param {FehUnit} hero 
     * @param {FehUnit} target 
     */
    onSwap(hero, target) {
        this.getGuiMapHeroForMapHero(hero).reset();
        this.getGuiMapHeroForMapHero(target).reset();
        this.clearTiles();
        this.enableSwapStyles();
    }

    enableSwapStyles() {
        this.guiHeroes.forEach(guiHero => guiHero.reset());
        this.controller.getTeam().forEach(unit => {
            let tile = this.getGuiTileWithHero(unit);
            tile.showGreenFrame();
            tile.turnGreen();
        });
    }

    /**
     * 
     * @param {FehUnit} hero 
     * @param {Number} row 
     * @param {Number} column 
     */
    onMove(hero, row, column) {

        // ACTUALIZAR LA POSICIÓN
        this.getGuiMapHeroForMapHero(hero).reset();

        this.updateDangerZone();

        // PARCHE PARA LIMPIAR
        if (this.state == GUISTATE_SHOWING_ACTIONS || this.state == GUISTATE_SHOWINT_ACTION_PREVIEW) {
            this.clearTiles();
            this.getGuiMapHeroForMapHero(this.activeHero).reset();
            this.state = GUISTATE_NULL;
            this.actionPreviewRow = null;
            this.actionPreviewColumn = null;
        }

        // AUTO-END-TURN
        let actionsLeft = this.controller.getTeam().filter(hero => !hero.isWaiting).length;
        if (actionsLeft == 0) {
            this.controller.endTurn();
            return;
        }

        // AI_STEP
        if (!this.controller.isPlayerPhase()) {
            setTimeout(() => {
                this.aiStepFunction();
            }, 300);
        }

    }

    /**
     * 
     * @param {Number} row 
     * @param {Number} column 
     */
    onTile(row, column) {

        let hero = this.controller.battle.getHeroAt(row, column);

        if (this.controller.battle.phase == PHASE_SWAP_SPACES) {

            // CLEAN EVERYTHING
            this.clearTiles();

            // SHOW RANGE OF CLICKED HEROES
            if (hero) this.showRangeOf(hero);

            // TURN ALLY TILES GREEN
            this.enableSwapStyles();

            // DID WE PICK OUR SECOND HERO TO SWAP? SWAP THEM!
            if (this.activeHero && hero && !this.controller.isEnemy(hero)) {
                let temp = this.activeHero;
                this.activeHero = null;
                this.controller.doAction(temp, null, null, hero);
                return;
            }

            // DID WE PICK OUR FIRST HERO TO SWAP? SELECT IT!
            if (this.activeHero == null && hero && !this.controller.isEnemy(hero))
                this.activeHero = hero;

            // DID WE TOUCH NOTHING? CANCEL FIRST HERO TO SWAP
            if (hero == null)
                this.activeHero = null;

            // DO WE HAVE A HERO TO SWAP SELECTED?
            if (this.activeHero) {

                // SHOW ALLY TILES AS ACTIONABLE
                this.controller.getTeam().forEach(ally => {
                    let tile2 = this.getGuiTileWithHero(ally);
                    tile2.clear();
                    tile2.setActionable();
                    tile2.showGreenFrame();
                    tile2.turnGreen();
                })

                // SHOW FIRST HERO AS BLUE
                let target = this.getGuiTileWithHero(this.activeHero);
                target.showBlueFrame();
                target.turnBlue();
            }

            return;
        }

        if (this.state == GUISTATE_SHOWING_ACTIONS || this.state == GUISTATE_SHOWINT_ACTION_PREVIEW) {

            let node = this.queryResult.getNodeAt(row, column);
            let isInAttackRange = this.queryResult.tilesInAttackRange.indexOf(node) >= 0;
            let isInMovementRange = this.queryResult.validMovementTiles.indexOf(node) >= 0;

            if (isInMovementRange) {

                if (this.actionPreviewRow != row || this.actionPreviewColumn != column) {

                    // clicked bright blue tile for the first time
                    this.showActionPreview(this.activeHero, node.row, node.column, hero);
                    this.actionPreviewRow = row;
                    this.actionPreviewColumn = column;
                    return;

                } else {

                    // clicked bright blue tile again
                    this.controller.doAction(this.activeHero, row, column, null);
                    this.actionPreviewRow = null;
                    this.actionPreviewColumn = null;

                    return;

                }
            }

            if (!isInAttackRange && !isInMovementRange) {
                // clicked empty tile
                this.clearTiles();
                this.getGuiMapHeroForMapHero(this.activeHero).reset();
                this.state = GUISTATE_NULL;
                this.actionPreviewRow = null;
                this.actionPreviewColumn = null;
                return;
            }

            return;
        }

        if (hero) {

            if (this.state == GUISTATE_NULL || this.state == GUISTATE_SHOWING_RANGE) {

                if (this.controller.owns(hero) && !hero.isWaiting) {
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

    updateDangerZone() {

        // ACTUALIZAR DANGER ZONE
        this.guiTiles.forEach(row => row.forEach(tile => tile.clearDanger()));
        this.controller.getEnemyTeam().forEach(enemy => {
            let query = new FehActionQuery();
            let result = query.movementQuery(this.controller.battle, enemy, true);
            result.tilesInAttackRange.forEach(node => {
                this.guiTiles[node.row][node.column].setDanger();
            });
        });

    }

    /**
     * 
     * @param {FehUnit} hero 
     */
    showRangeOf(hero) {
        console.log('BattleGui::showRangeOf(FehMapHero)');
        let result = this.controller.battle.getRangeOf(hero, true);
        this.clearTileColors();
        this.clearTileActionables();
        result.tilesInAttackRange.forEach(node => this.guiTiles[node.row][node.column].turnRed());
        result.traversableTiles.forEach(node => this.guiTiles[node.row][node.column].turnBlue());
    }

    /**
     * 
     * @param {FehUnit} hero 
     */
    showActionsOf(hero) {
        console.log('BattleGui::showActionsOf(FehMapHero)');
        let result = this.controller.battle.getRangeOf(hero, false);
        this.clearTileColors();
        this.clearTileFrames();
        this.clearTileActionables();
        this.getGuiTileWithHero(this.activeHero).showBlueFrame();
        result.tilesInAttackRange.forEach(node => this.guiTiles[node.row][node.column].turnRed());
        result.traversableTiles.forEach(node => this.guiTiles[node.row][node.column].turnBlue());
        result.validMovementTiles.forEach(node => {
            let tile = this.guiTiles[node.row][node.column];
            tile.turnBlue();
            tile.setActionable();
        });
        result.validAttackTargetTiles.forEach(node => {
            let tile = this.guiTiles[node.row][node.column];
            tile.turnRed();
            tile.setActionable();
        });
        result.validAssistTargetTiles.forEach(node => {
            let tile = this.guiTiles[node.row][node.column];
            tile.turnGreen();
            tile.setActionable();
        });
        this.queryResult = result;
    }

    /**
     * 
     * @param {FehUnit} hero 
     * @param {Number} row 
     * @param {Number} column 
     * @param {FehUnit} target
     */
    showActionPreview(hero, row, column, target) {

        console.log('BattleGui::showActionPreview(FehMapHero, Number, Number, FehMapHero)');

        let endNode = this.queryResult.getNodeAt(row, column);

        // MOVEMENT ACTION PREVIEW
        if (this.queryResult.validMovementTiles.indexOf(endNode) >= 0) {

            // ARROWS
            this.clearTileArrows();
            let toNode = null;
            let currentNode = endNode;
            while (currentNode != null) {

                let fromNode = currentNode.from;

                let fromTile = fromNode ? this.getGuiTile(fromNode.row, fromNode.column) : null;
                let currentTile = this.getGuiTile(currentNode.row, currentNode.column);
                let toTile = toNode ? this.getGuiTile(toNode.row, toNode.column) : null;

                currentTile.setArrow(fromTile, toTile);

                toNode = currentNode;
                currentNode = fromNode;
            }

            // FRAME
            this.clearTileFrames();
            let guiTile = this.getGuiTile(row, column);
            guiTile.showBlueFrame();

            // HERO
            let guiHero = this.getGuiMapHeroForMapHero(hero);
            guiHero.setPosition(row, column);

        }

    }

    /**
     * 
     * @param {FehUnit} hero 
     * @returns {FehMapHeroGui}
     */
    getGuiMapHeroForMapHero(hero) {
        return this.guiHeroes.find(guiHero => guiHero.hero == hero)
    }

    /**
     * 
     */
    clearTiles() {
        this.clearTileColors();
        this.clearTileFrames();
        this.clearTileActionables();
        this.clearTileArrows();
        if (this.controller.isPlayerPhase()) {
            this.controller.getTeam().forEach(hero => {
                if (hero.isWaiting) return;
                let tile = this.getGuiTileWithHero(hero);
                tile.showBlueFrame();
            })
        }
    }

    /**
     * 
     */
    clearTileActionables() {
        this.guiTiles.forEach(row => row.forEach(tile => tile.clearActionable()));
    }

    /**
     * 
     */
    clearTileColors() {
        this.guiTiles.forEach(row => row.forEach(tile => tile.clearColor()));
    }

    /**
     * 
     */
    clearTileFrames() {
        this.guiTiles.forEach(row => row.forEach(tile => tile.clearFrame()));
    }

    /**
     * 
     */
    clearTileArrows() {
        this.guiTiles.forEach(row => row.forEach(tile => tile.clearArrow()));
    }

    /**
     * 
     * @param {FehUnit} hero 
     * @returns {FehTileGui}
     */
    getGuiTileWithHero(hero) {
        return this.getGuiTile(hero.row, hero.column);
    }

    /**
     * 
     * @param {Number} row
     * @param {Number} column 
     * @returns {FehTileGui}
     */
    getGuiTile(row, column) {
        return this.guiTiles[row][column];
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