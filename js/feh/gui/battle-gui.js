const GUISTATE_HOME = 'GUISTATE_HOME';
const GUISTATE_SELECTED_UNIT = 'GUISTATE_SELECTED_UNIT';
const GUISTATE_SELECTED_COORDINATES = 'GUISTATE_SELECTED_COORDINATES';
const GUISTATE_SELECTED_TARGET = 'GUISTATE_SELECTED_TARGET';
const GUISTATE_SWAP = 'GUISTATE_SWAP';
const GUISTATE_COMBAT = 'GUISTATE_COMBAT';

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
        this.htmlElement.innerHTML = `
            <div class='unit-portrait'>
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
    }
}

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

        /**
         * @type {FehUnit}
         */
        this.selectedUnit = null;

        /**
         * @type {FehMovementQueryResult}
         */
        this.queryResult = null;

        /**
         * @type {number}
         */
        this.lastOnTileEvent = new Date().getTime();

        this.rebuild();
    }

    rebuild() {

        let battle = this.controller.battle;
        this.state = GUISTATE_HOME;

        // CLEAR
        this.rootElement.classList.add('game');

        // BUILS STATUS DIV
        this.statusPanel = new FehBattleStatusGui();

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
            /*
            this.clearTiles();
            if (this.activeHero)
                this.getGuiMapHeroForMapHero(this.activeHero).reset();
            this.state = GUISTATE_NULL;
            this.actionPreviewRow = null;
            this.actionPreviewColumn = null;/** */

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
        this.rootElement.appendChild(this.statusPanel.htmlElement);
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
        /**
         * @type {FehTileGui[]}
         */
        this.guiTileSet = this.guiTiles.reduce((a, b) => a.concat(b));

        // BUILD MAP WALLS
        for (let row = 0; row < 8; row++) {
            for (let column = 0; column < 6; column++) {
                let tileGui = this.guiTiles[row][column];
                let tile = this.controller.battle.map.tiles[row][column];
                if (tile == TERRAIN_BLOCK || tile == TERRAIN_WALL1) {
                    // tileGui.setWall();
                }
            }
        }

        this.dialogElement = document.createElement('div');
        let dialogElementIcon = document.createElement('div');
        this.dialogElement.appendChild(dialogElementIcon);
        this.mapElement.appendChild(this.dialogElement);
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

        this.guiHeroes.forEach(hero => this.mapHeroesElement.appendChild(hero.htmlElement))
        this.guiHeroes.forEach(hero => hero.reset());
    }

    /**
     * 
     * @param {String} phase 
     * @param {Number} turn 
     */
    onPhase(phase, turn) {

        this.selectedUnit = null;
        this.selectedTarget = null;
        this.selectedRow = -1;
        this.selectedColumn = -1;

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

            // STATE
            this.state = GUISTATE_HOME;

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

            // CANCEL MOVEMENT ------------------------------------
            /*
            this.clearTiles();
            if (this.activeHero)
                this.getGuiMapHeroForMapHero(this.activeHero).reset();
            this.state = GUISTATE_NULL;
            this.actionPreviewRow = null;
            this.actionPreviewColumn = null;/
            */
            // ----------------------------------------------------

            this.state = GUISTATE_SWAP;
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

        // QUEMADO DESPUES DE LA PRIMERA VEZ
        this.swapSpacesButton.style.display = 'none';

        // ACTUALIZAR LA POSICIÓN
        this.getGuiMapHeroForMapHero(hero).reset();

        this.updateDangerZone();

        // PARCHE PARA LIMPIAR
        if (this.state == GUISTATE_SELECTED_UNIT)
            this.setSelectedUnit(null);

        // QUIZAS ESTO DEBERIA IR EN OTRO LADO
        this.onAfterAction();
    }

    /**
     * 
     * @param {FehUnit} unit 
     * @param {FehUnit} target 
     */
    onAssist(unit, target) {
        this.getGuiMapHeroForMapHero(unit).reset();
        this.getGuiMapHeroForMapHero(target).reset();
        this.setSelectedUnit(null);

        // QUIZAS ESTO DEBERIA IR EN OTRO LADO
        this.onAfterAction();
    }

    /**
     * 
     * @param {FehCombat} combat 
     */
    onCombat(combat) {
        console.log(combat);
        //this.setSelectedUnit(null);
        this.state = GUISTATE_COMBAT;
        this.clearTiles();
        //lynBraveHeroes.isWaiting = false;
        this.playAttackAnimations(combat.attacks, 0, () => {
            this.state = GUISTATE_HOME;
            this.selectedUnit = null;
            this.selectedTarget = null;
            this.getGuiMapHeroForMapHero(combat.activeUnit).reset();
            this.getGuiMapHeroForMapHero(combat.passiveUnit).reset();
            this.clearTiles();
        });
    }

    /**
     * 
     * @param {FehAttack[]} attacks 
     * @param {number} index 
     * @param {function()} onfinish
     */
    playAttackAnimations(attacks, index, onfinish) {

        if (index >= attacks.length) {
            if (onfinish) onfinish();
            return;
        }

        let attack = attacks[index];
        let guiUnit = this.getGuiMapHeroForMapHero(attack.activeUnit);
        guiUnit.playAttack(attack, () => {
            console.log();
            this.playAttackAnimations(attacks, index + 1, onfinish);
        })

    }

    /**
     * 
     * @param {FehAttack} attack 
     */
    onAnimationAttackHit(attack) {
        let a = attack.activeUnit;
        let p = attack.passiveUnit;
        let guiA = this.getGuiMapHeroForMapHero(a);
        let guiP = this.getGuiMapHeroForMapHero(p);
        guiA.setHp(attack.tentativeActiveHp);
        guiP.setHp(attack.tentativePassiveHp);
        console.log(attack.tentativeActiveHp + ', ' + attack.tentativePassiveHp + ', ' + attack.dmg
        );
    }

    onAfterAction() {
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

        let t1 = new Date().getTime();
        let t0 = this.lastOnTileEvent;
        let t = t1 - t0;
        this.lastOnTileEvent = t1;
        let doubleTap = t < 200;

        let unit = this.controller.battle.getUnitAt(row, column);

        if (this.state == GUISTATE_HOME) {

            if (unit && !unit.isWaiting && this.controller.owns(unit)) this.setSelectedUnit(unit);
            if (unit && (unit.isWaiting || !this.controller.owns(unit))) this.showStatusOf(unit);
            if (!unit) this.clearTiles();

        } else if (this.state == GUISTATE_SWAP) {

            console.log('SWAPITY SWAP')

            if (unit && this.controller.owns(unit) && this.selectedUnit) {

                this.clearTiles();
                this.enableSwapStyles();
                this.controller.doAction(this.selectedUnit, null, null, unit);
                this.selectedUnit = null;

            } else if (unit && this.controller.owns(unit)) {

                this.selectedUnit = unit;

                this.showStatusOf(unit);
                let srcTile = this.getGuiTileWithHero(unit);
                srcTile.turnBlue();
                srcTile.setActionable();
                srcTile.showBlueFrame();
                this.controller.getTeam().forEach(ally => {
                    if (ally === unit) return;
                    let dstTile = this.getGuiTileWithHero(ally);
                    dstTile.turnGreen();
                    dstTile.clearActionable();
                    dstTile.showGreenFrame();
                });

            } else if (!unit) {

                this.clearTiles();
                this.enableSwapStyles();
                this.selectedUnit = null;
            }

        } else if (this.state == GUISTATE_SELECTED_UNIT) {

            let result = this.queryResult;
            let node = result.getNodeAt(row, column);

            // DUPLICATED_CODE
            let emptyIrrelevantTile =
                !unit &&
                result.traversableTiles.indexOf(node) < 0 &&
                result.tilesInAttackRange.indexOf(node) < 0 &&
                result.tilesInAssistRange.indexOf(node) < 0;

            // DUPLICATED_CODE
            let originalSelectedTile =
                this.selectedUnitRow0 === row &&
                this.selectedUnitColumn0 === column;

            let unitNotInValidAttackOrAssistTile =
                unit &&
                result.tilesInAttackRange.indexOf(node) < 0 &&
                result.tilesInAssistRange.indexOf(node) < 0;

            // DUPLICATED_CODE
            let validMovementTile =
                result.validMovementTiles.indexOf(node) >= 0;

            let confirmationTile =
                this.selectedRow === row &&
                this.selectedColumn === column;

            // DUPLICATED_CODE
            let unitInValidAssistOrAttackRange =
                result.validAttackTargetTiles.indexOf(node) >= 0 ||
                result.validAssistTargetTiles.indexOf(node) >= 0;

            if (emptyIrrelevantTile || originalSelectedTile && !doubleTap) this.setSelectedUnit(null);
            else if (originalSelectedTile && doubleTap) this.controller.doAction(this.selectedUnit);
            else if (unitInValidAssistOrAttackRange) this.setSelectedTarget(unit);
            else if (confirmationTile) this.controller.doAction(this.selectedUnit, this.selectedRow, this.selectedColumn, null);
            else if (unitNotInValidAttackOrAssistTile) this.showStatusOf(unit);
            else if (validMovementTile) this.setSelectedPosition(row, column);

        } else if (this.state == GUISTATE_SELECTED_TARGET) {

            let result = this.queryResult;

            let targetNode = result.getNodeAt(this.selectedTarget.row, this.selectedTarget.column);
            let node = result.getNodeAt(row, column);

            let actionConfirmationTile =
                this.selectedTarget.row === row &&
                this.selectedTarget.column === column;

            let attacking = this.selectedTarget && !this.controller.owns(this.selectedTarget);
            let assisting = this.selectedTarget && this.controller.owns(this.selectedTarget);

            // DUPLICATED_CODE
            let emptyIrrelevantTile =
                !unit &&
                result.traversableTiles.indexOf(node) < 0 &&
                result.tilesInAttackRange.indexOf(node) < 0 &&
                result.tilesInAssistRange.indexOf(node) < 0;

            // DUPLICATED_CODE
            let validMovementTile =
                result.validMovementTiles.indexOf(node) >= 0;

            // DUPLICATED_CODE
            let originalSelectedTile =
                this.selectedUnitRow0 === row &&
                this.selectedUnitColumn0 === column;

            // DUPLICATED CODE
            let confirmationTile =
                this.selectedRow === row &&
                this.selectedColumn === column;

            let targetIsAssistableOrAttackableFromTile =
                (assisting && targetNode.assistableFrom.indexOf(node) >= 0) ||
                (attacking && targetNode.attackableFrom.indexOf(node) >= 0);

            // DUPLICATED_CODE (cambiar de target)
            let unitInValidAssistOrAttackRange =
                result.validAttackTargetTiles.indexOf(node) >= 0 ||
                result.validAssistTargetTiles.indexOf(node) >= 0;

            if (emptyIrrelevantTile) this.setSelectedUnit(null);
            else if (confirmationTile) this.setSelectedTarget(null);
            else if (actionConfirmationTile) this.controller.doAction(this.selectedUnit, this.selectedRow, this.selectedColumn, this.selectedTarget);
            else if (unitInValidAssistOrAttackRange) this.setSelectedTarget(unit);
            else if (targetIsAssistableOrAttackableFromTile) this.setSelectedPosition(row, column);
            else if (validMovementTile) {
                this.setSelectedTarget(null);
                this.setSelectedPosition(row, column);
            }

        }

    }

    /**
     * Actualiza el panel de estado de unidad y si el estado de la interfáz es GUISTATE_HOME muestra su rango de acción.
     * @param {FehUnit} unit 
     */
    showStatusOf(unit) {
        if (this.state == GUISTATE_HOME || this.state == GUISTATE_SWAP) {
            let result = this.controller.battle.getRangeOf(unit, true);
            this.clearTileColors();
            this.clearTileActionables();
            result.tilesInAttackRange.forEach(node => this.guiTiles[node.row][node.column].turnRed());
            result.traversableTiles.forEach(node => this.guiTiles[node.row][node.column].turnBlue());
        }
    }

    /**
     * Muestra los movimientos posibles de la unidad seleccionada.
     * Si unit es null, limpia la interfáz.
     * @param {FehUnit} unit 
     */
    setSelectedUnit(unit) {

        if (unit) {

            this.selectedUnit = unit;
            this.selectedUnitRow0 = this.selectedUnit.row;
            this.selectedUnitColumn0 = this.selectedUnit.column;
            this.selectedRow = this.selectedUnitRow0;
            this.selectedColumn = this.selectedUnitColumn0;
            this.showStatusOf(this.selectedUnit);

            let result = this.controller.battle.getRangeOf(this.selectedUnit, false);
            this.clearTileColors();
            this.clearTileFrames();
            this.clearTileActionables();
            this.getGuiTileWithHero(this.selectedUnit).showBlueFrame();
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

            this.state = GUISTATE_SELECTED_UNIT;

        } else {

            if (this.selectedTarget) this.setSelectedTarget(null);
            if (this.selectedUnit) this.getGuiMapHeroForMapHero(this.selectedUnit).reset();
            this.clearTiles();
            this.selectedUnit = null;
            this.selectedTarget = null;
            this.state = GUISTATE_HOME;

        }
    }

    /**
     * 
     * @param {number} row 
     * @param {number} column 
     */
    setSelectedPosition(row, column) {

        if (this.state !== GUISTATE_SELECTED_UNIT && this.state !== GUISTATE_SELECTED_TARGET)
            throw new FehException(EX_WRONG_TIMING, "Bad timing, you can't set the selected position at this time");

        this.selectedRow = row;
        this.selectedColumn = column;

        let endNode = this.queryResult.getNodeAt(row, column);

        // MOVEMENT ACTION PREVIEW
        if (this.queryResult.validMovementTiles.indexOf(endNode) >= 0) {

            this.clearTileArrows();
            this.clearTileFrames();
            this.getGuiTile(row, column).showBlueFrame();
            this.getGuiMapHeroForMapHero(this.selectedUnit).setPosition(row, column);

            if (this.selectedTarget) {
                let tile = this.getGuiTileWithHero(this.selectedTarget);
                tile.setActionable();
                if (this.controller.owns(this.selectedTarget)) tile.showGreenFrame();
                else tile.showRedFrame();
            }

            // ARROWS
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
        }

    }

    /**
     * 
     * @param {FehUnit} target 
     */
    setSelectedTarget(target) {

        if (this.state !== GUISTATE_SELECTED_UNIT && this.state !== GUISTATE_SELECTED_TARGET && this.state !== GUISTATE_COMBAT)
            throw new FehException(EX_WRONG_TIMING, "Bad timing, you can't set the selected target at this time");

        this.selectedTarget = target;

        if (this.selectedTarget) {

            this.guiTileSet.forEach(tile => {
                tile.clearActionable();
                tile.clearFrame();
            });

            this.clearDialog();

            let selectedNode = this.queryResult.getNodeAt(this.selectedRow, this.selectedColumn);
            let targetNode = this.queryResult.getNodeAt(target.row, target.column);

            let targetTile = this.getGuiTileWithHero(this.selectedTarget);
            if (this.controller.owns(this.selectedTarget)) {
                targetNode.assistableFrom.forEach(m => {
                    let tile = this.getGuiTile(m.row, m.column);
                    tile.setActionable();
                });
                if (targetNode.assistableFrom.indexOf(selectedNode) < 0) {
                    let closestNode = targetNode.assistableFrom.sort((a, b) => selectedNode.getManhathanDistanceTo(a) - selectedNode.getManhathanDistanceTo(b))[0];
                    this.setSelectedPosition(closestNode.row, closestNode.column);
                }
                targetTile.showGreenFrame();
                targetTile.setActionable();
                this.showAssistDialog(this.selectedTarget.row, this.selectedTarget.column);
            } else {
                targetNode.attackableFrom.forEach(m => {
                    let tile = this.getGuiTile(m.row, m.column);
                    tile.setActionable();
                });
                if (targetNode.attackableFrom.indexOf(selectedNode) < 0) {
                    let closestNode = targetNode.attackableFrom.sort((a, b) => selectedNode.getManhathanDistanceTo(a) - selectedNode.getManhathanDistanceTo(b))[0];
                    this.setSelectedPosition(closestNode.row, closestNode.column);
                }
                targetTile.showRedFrame();
                targetTile.setActionable();
                this.showAttackDialog(this.selectedTarget.row, this.selectedTarget.column);
            }

            let selectedUnitTile = this.getGuiTile(this.selectedRow, this.selectedColumn);
            selectedUnitTile.setActionable();
            selectedUnitTile.showBlueFrame();

            this.state = GUISTATE_SELECTED_TARGET;

        } else {

            this.clearDialog();

            this.queryResult.validMovementTiles.forEach(node => {
                let tile = this.getGuiTile(node.row, node.column);
                tile.setActionable();
            });
            this.state = GUISTATE_SELECTED_UNIT;

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
     * @returns {FehMapHeroGui}
     */
    getGuiMapHeroForMapHero(hero) {
        return this.guiHeroes.find(guiHero => guiHero.unit == hero)
    }

    /**
     * 
     */
    clearTiles() {
        this.clearTileColors();
        this.clearTileFrames();
        this.clearTileActionables();
        this.clearTileArrows();
        this.clearDialog();
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

    clearDialog() {
        this.dialogElement.className = '';
    }

    showAttackDialog(row, col) {
        this.dialogElement.classList.add('attack');
        this.dialogElement.classList.add('dialog');
        this.temp1(row, col);
    }

    showAssistDialog(row, col) {
        this.dialogElement.classList.add('assist');
        this.dialogElement.classList.add('dialog');
        this.temp1(row, col);
    }

    temp1(row, col) {
        if (row == 0 && col <= 2) {
            this.dialogElement.classList.add('top-left');
            this.dialogElement.style.right = "auto";
            this.dialogElement.style.left = "calc(var(--tile-size) * (1 + " + col + "))";
            this.dialogElement.style.top = "calc(var(--tile-size) * " + row + " - 53px + var(--tile-size) * 0.5)";
        } else if (row == 0 && col >= 3) {
            this.dialogElement.classList.add('top-right');
            this.dialogElement.style.left = "auto";
            this.dialogElement.style.right = "calc(var(--tile-size) * (6 - " + col + "))";
            this.dialogElement.style.top = "calc(var(--tile-size) * " + row + " - 53px + var(--tile-size) * 0.5)";
        } else {
            this.dialogElement.style.right = "auto";
            this.dialogElement.style.left = "calc(var(--tile-size) * " + col + " - 120px + var(--tile-size) / 2)";
            this.dialogElement.style.top = "calc(var(--tile-size) * " + row + " - 120px + var(--tile-size) / 2 + 60px)";
        }
    }


}