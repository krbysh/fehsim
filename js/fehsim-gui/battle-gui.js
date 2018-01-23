//console.log("gui.js");

import * as feh from '../fehsim/module.js'
import { BattleUnitGui } from './unit-gui.js';
import { StatusGui } from './status-gui.js';
import { TileGui } from './tile-gui.js';

/**
 * @private
 * @param {HTMLElement} element
 * @param {feh.Map} map 
 */
function privateMapFill(element, map) {

    let mapForeground = element.querySelector('.map-foreground');
    let mapMiddleground = element.querySelector('.map-middleground');
    let mapBackground = element.querySelector('.map-background');

    mapForeground.style.backgroundImage = "url('" + map.foregroundImage + "')";
    mapMiddleground.style.backgroundImage = "url('" + map.middlegroundImage + "')";
    mapBackground.style.backgroundImage = map.backgroundImage ? "url('" + map.backgroundImage + "')" : null;
}

class UnitModifierEvent {
    /**
     * @param {feh.Unit} unit 
     * @param {feh.UnitModifier} modifier 
     * @param {boolean} added 
     */
    constructor(unit, modifier, added) {
        /** @type {feh.Unit} */
        this.unit = unit;
        /** @type {feh.UnitModifier} */
        this.modifier = modifier;
        /** @type {boolean} */
        this.added = added;
    }
}

class UnitHealingEvent {
    constructor(unit, amount, skill, source) {
        /** @type {feh.Unit} */this.unit = unit;
        /** @type {number} */this.amount = amount;
        /** @type {feh.Skill} */this.skill = skill;
        /** @type {feh.Unit} */ this.source = source;
    }
}

/**
 * @module fehsim-gui yeah3
 */
export class BattleGui {

    constructor() {

        /** @type {UnitModifierEvent[]} */
        this.unitModifierEventStack = [];

        /** @type {UnitHealingEvent[]} */
        this.unitHealingEventStack = [];

        /**
         * @type {feh.Battle}
         */
        this.battle = null;

        /**
         * @type {feh.UnitListener}
         */
        this.unitListener = new feh.UnitListener();
        this.unitListener.onaddmodifier = (u, m) => {
            //console.log('    ' + m + ' added to ' + u)
            if (m.isCombatModifier) return;
            this.unitModifierEventStack.push(new UnitModifierEvent(u, m, true))
        };
        this.unitListener.onremovemodifier = (u, m) => {
            //console.log('    '+m + ' removed from ' + u)
            if (m.isCombatModifier) return;
            this.unitModifierEventStack.push(new UnitModifierEvent(u, m, false))
        };
        this.unitListener.onheal = (u, a, s, so) => this.unitHealingEventStack.push(new UnitHealingEvent(u, a, s, so));

        /**
         * @type {feh.BattleListener}
         */
        this.listener = new feh.BattleListener();
        this.listener.onsetup = (/** @type {feh.Battle} */ battle) => {

            this.dialogElement.className = 'battle-dialog';

            /** @type {feh.Unit} */
            this.selectedUnit = null;
            /** @type {feh.Unit} */
            this.selectedTarget = null;

            battle.units.forEach(unit => unit.addUnitListener(this.unitListener));

            console.log('onsetup');

            this.battle = battle;
            this.controller = battle.controllers[feh.TACTICIAN.PLAYER];

            privateMapFill(this.htmlElement, battle.map);

            this.guiUnits.forEach(u => u.destroy());
            this.guiUnits = battle.units.map(unit => new BattleUnitGui(unit));
            this.guiUnits.forEach(u => this.unitsLayerElement.appendChild(u.htmlElement));

            this.showDefaultFrames();

            this.controller.fight();
        };
        this.listener.onphase = (phase, turn) => {

            console.log('onphase ' + phase);

            //console.log('ONPHASE => ' + phase)

            // MESSAGE AND AI_STEP
            let msg = document.createElement('div');
            msg.className = 'animate phase-change-msg';
            msg.innerHTML = '<h1>' + phase + '</h1><h2>Turn: ' + turn + '</h2><div class="phase-change-background"></div>'
            msg.addEventListener('animationend', e => {
                this.flushAnimationStack();
                if (phase === feh.PHASE.ENEMY) {
                    if (e.target !== msg) return;
                    msg.parentElement.removeChild(msg);
                    console.log('AI_STEP');
                    let enemyController = this.battle.controllers[feh.TACTICIAN.ENEMY];
                    enemyController.endTurn();
                }
            });
            this.htmlElement.appendChild(msg);

            //this.guiTiles.forEach(t => t.clear());
            //this.guiUnits.forEach(e => e.reset());

            if (phase === feh.PHASE.SWAP_SPACES) {
                this.selectUnit(null);
                this.showDefaultFrames();
            }

            if (phase === feh.PHASE.PLAYER) {
                this.endTurnButton.classList.remove('hidden');
                this.selectUnit(null);
                this.flushAnimationStack();
            }

            this.guiUnits.forEach(u => u.reset());

        };
        this.listener.onturnstart = turn => {
            console.log('onturnstart ' + turn);

        };
        this.listener.onswap = (a, b) => {

            console.log('onswap ' + a + ' for ' + b);

            this.guiUnits.find(e => e.unit === a).reset();
            this.guiUnits.find(e => e.unit === b).reset();
            this.selectUnit(null);
        }
        this.listener.oncombat = (combat) => {

            console.log('oncombat ' + combat.activeUnit + ' against ' + combat.passiveUnit);

            let stack = []
            for (let i = 0; i < combat.attacks.length; i++)
                stack.push(combat.attacks[i]);
            this.animateAttackStack(stack);

        }
        this.listener.onaftercombat = combat => {
            this.resetAfterCombatAnimations(combat);
        }
        this.listener.onassist = (unit, ally) => {
            console.log('onassist ' + unit + ' to ' + ally);

            // this.guiUnits.find(e => e.unit == unit).playSkillTriggerAnimation(unit.assist);
            this.guiUnits.find(e => e.unit == ally).playSkillTriggerAnimation(unit.assist);

            this.guiUnits.find(e => e.unit == unit).reset();
            this.guiUnits.find(e => e.unit == ally).reset();

            this.flushAnimationStack();
        }
        this.listener.onmove = (unit, row, col) => {
            console.log('onmove ' + unit + ' to ' + row + ', ' + col);
            this.guiUnits.find(e => e.unit == unit).setPosition(row, col);
            this.selectUnit(null);
        }
        this.listener.onwait = unit => {
            this.guiUnits.find(e => e.unit == unit).reset();
        }
        this.listener.onkill = unit => {
            //let e = this.guiUnits.find(e => e.unit == unit);
            //this.guiUnits.splice(this.guiUnits.indexOf(e), 1);
        };

        /**
         * @type {feh.Query}
         */
        this.query = new feh.Query();

        /**
         * @type {feh.Controller}
         */
        this.controller = null;
    }

    /**
     * 
     * @param {feh.Attack[]} stack 
     */
    animateAttackStack(stack) {
        console.log('animate attack stack with length ' + stack.length);
        if (stack.length) {

            let attack = stack.splice(0, 1)[0];

            let guiUnit = this.guiUnits.find(guiUnit => guiUnit.unit === attack.activeUnit);
            let guiFoe = this.guiUnits.find(guiUnit => guiUnit.unit === attack.passiveUnit);

            if (attack.priorityChangedBy) guiUnit.playSkillTriggerAnimation(attack.priorityChangedBy);

            let ele = guiUnit.rootElement;
            let ene = guiFoe.rootElement;

            let x0 = ele.getBoundingClientRect().left;
            let x1 = ene.getBoundingClientRect().left;
            let y0 = ele.getBoundingClientRect().top;
            let y1 = ene.getBoundingClientRect().top;
            let dirX = x1 - x0;
            let dirY = y1 - y0;
            let len = Math.sqrt(dirX * dirX + dirY * dirY);
            dirX /= len;
            dirY /= len;

            let animation = ele.animate(
                [
                    // keyframes
                    { transform: 'translate(0, 0)' },
                    { transform: 'translate(calc(var(--tile-size) * 0.25 * ' + dirX + 'px), calc(var(--tile-size) * 0.25 * ' + dirY + 'px))' },
                ],
                {
                    // timing options
                    duration: 100,
                    iterations: 1,
                    fill: 'forwards'
                });
            animation.playbackRate = 1;
            animation.play();
            animation.onfinish = () => {
                animation.playbackRate = -1;
                guiFoe.playHit(attack.dmg);
                animation.play();
                animation.onfinish = () => {
                    setTimeout(() => {
                        this.animateAttackStack(stack);
                    }, 500 - 100); // si el ataque es brave, entonces menos o nada
                };
            }

        } else {
            // this.guiUnits.forEach(u => u.reset());
            this.flushAnimationStack();
            this.autoend();
            this.playingAttackAnimation = false;
        }
    }

    resetAfterCombatAnimations(combat) {
        setTimeout(() => {
            if (this.playingAttackAnimation == true) this.resetAfterCombatAnimations(combat);
            else {
                this.guiUnits.find(e => e.unit == combat.activeUnit).reset();
                this.guiUnits.find(e => e.unit == combat.passiveUnit).reset();
            }
        }, 100);
    }

    autoend() {
        if (this.controller.units.filter(u => !u.waiting).length == 0 && this.battle.phase == feh.PHASE.PLAYER) {
            this.selectUnit(null);
            this.controller.endTurn();
        }
    }

    flushAnimationStack() {

        this.unitModifierEventStack.forEach(e => {
            if (e.added) {
                if (!this.battle.units.includes(e.unit)) return;
                // console.log('    "' + e.modifier + '" added to ' + e.unit);
                if (e.modifier.isBuff) {
                    console.log('        PLAY buff animation because "' + e.modifier + '" triggered');
                    this.guiUnits.find(guiUnit => guiUnit.unit === e.unit).playSkillTriggerAnimation(e.modifier.sourceSkill);
                }
                if (e.modifier.isDebuff) console.log('        PLAY debuff animation');
            } else {
                //console.log('    "' + e.modifier + '" removed from ' + e.unit);
            }
        });
        this.unitModifierEventStack.length = 0;

        this.unitHealingEventStack.forEach(e => {
            // AQUI EN LUGAR DE AL ICONO DEBERIA DE SALIR EL MONTO CURADO
            this.guiUnits.find(guiUnit => guiUnit.unit === e.unit).playSkillTriggerAnimation(e.skill);
        });
        this.unitHealingEventStack.length = 0;
    }

    /**
     * 
     * @param {HTMLElement} element 
     */
    init(element) {

        /**
         * @type {HTMLElement}
         */
        this.htmlElement = element;

        element.innerHTML = '';
        element.classList.add('battle-panel');

        // COLORED-TILES
        /**
         * @type {TileGui[][]}
         */
        this.guiTilesAsMatrix = [];

        /**
         * @type {TileGui[]}
         */
        this.guiTiles = [];

        // INIT
        document.battleGui = this;

        // TILES
        this.coloredTilesElement = document.createElement('div');
        this.coloredTilesElement.className = 'battle-tiles';
        for (let row = 0; row < 8; row++) {
            this.guiTilesAsMatrix[row] = [];
            for (let col = 0; col < 6; col++) {
                let tileGui = new TileGui(this.query.nodesAsMatrix[row][col]);
                this.coloredTilesElement.appendChild(tileGui.htmlElement);
                this.guiTiles.push(tileGui);
                this.guiTilesAsMatrix[row][col] = tileGui;
            }
        }
        element.appendChild(this.coloredTilesElement);

        // STATUS
        this.statusElement = document.createElement('div');
        this.statusElement.className = 'battle-status';
        this.statusGui = new StatusGui(this.statusElement);
        element.appendChild(this.statusElement);

        // MAP
        this.mapElement = document.createElement('div');
        let mapForeground = document.createElement('div');
        let mapMiddleground = document.createElement('div');
        let mapBackground = document.createElement('div');
        this.mapElement.appendChild(mapForeground);
        this.mapElement.appendChild(mapMiddleground);
        this.mapElement.appendChild(mapBackground);
        this.mapElement.className = 'battle-map';
        mapForeground.className = 'map-foreground';
        mapMiddleground.className = 'map-middleground';
        mapBackground.className = 'map-background';
        element.appendChild(this.mapElement);

        // SWAP-SPACES/FIGHT
        let fightButton = document.createElement('button');
        let swapSpacesButton = document.createElement('button');

        // FIGHT
        fightButton.innerText = 'Fight';
        fightButton.className = 'fight-button hidden';
        fightButton.onclick = () => {
            if (this.controller.battle.phase == feh.PHASE.SWAP_SPACES) {
                fightButton.classList.add('hidden');
                swapSpacesButton.classList.remove('hidden');
                this.controller.fight();
            }
        };
        element.appendChild(fightButton);

        // SWAP SPACES
        swapSpacesButton.innerText = 'Swap Spaces';
        swapSpacesButton.className = 'fight-button';
        swapSpacesButton.onclick = () => {
            if (this.controller.battle.turn == 1 && this.controller.battle.phase == feh.PHASE.PLAYER) {
                try {
                    this.selectUnit(null);
                    this.controller.swapSpaces();
                    fightButton.classList.remove('hidden');
                    swapSpacesButton.classList.add('hidden');
                } catch (ex) {
                    swapSpacesButton.classList.add('hidden');
                    throw ex;
                }
            }
        };
        element.appendChild(swapSpacesButton);

        // END-TURN-BUTTON
        let endTurnButton = document.createElement('button');
        endTurnButton.innerText = 'End Turn';
        endTurnButton.className = 'end-turn-button';
        endTurnButton.onclick = () => {
            endTurnButton.classList.add('hidden');
            swapSpacesButton.classList.add('hidden');
            fightButton.classList.add('hidden');
            this.controller.endTurn();
        };
        element.appendChild(endTurnButton);
        this.endTurnButton = endTurnButton;

        // INPUT
        this.inputElement = document.createElement('div');
        this.inputElement.className = 'battle-input';
        this.inputElement.onmousedown = (/** @type {MouseEvent} */ e) => {
            let col = (e.offsetX / this.inputElement.offsetWidth) * 6;
            let row = (e.offsetY / this.inputElement.offsetHeight) * 8;
            col = Math.trunc(col);
            row = Math.trunc(row);
            this.onTile(row, col);
        };
        element.appendChild(this.inputElement);

        // UNITS
        /**
         * @type {BattleUnitGui[]}
         */
        this.guiUnits = [];
        this.unitsLayerElement = document.createElement('div');
        this.unitsLayerElement.className = 'battle-units';
        element.appendChild(this.unitsLayerElement);

        // DIALOG
        this.dialogElement = document.createElement('div');
        this.dialogElement.className = 'battle-dialog';
        this.dialogElement.innerHTML = '<div></div>'
        this.unitsLayerElement.appendChild(this.dialogElement);

        /**
         * @type {Unit}
         */
        this.selectedUnit = null;

        /**
         * @type {Unit}
         */
        this.selectedUnit = null;

    }

    /**
     * 
     * @param {Unit} unit 
     */
    showStatsOf(unit) {
        this.statusGui.showUnitStatus(unit);
    }

    clearTiles() {
        this.guiTiles.forEach(tile => tile.clear());
    }

    showDefaultFrames() {
        if (this.battle.phase == feh.PHASE.SWAP_SPACES)
            this.controller.units.forEach(u => this.guiTilesAsMatrix[u.row][u.col].brightGreenFrame());
        if (this.battle.phase == feh.PHASE.PLAYER)
            this.controller.units.filter(u => !u.waiting).forEach(u => this.guiTilesAsMatrix[u.row][u.col].blueFrame());
    }

    /**
     * @param {Unit} unit 
     * @param {boolean} allowBrightTiles
     */
    showActionSpaceOf(unit, allowBrightTiles = false, ignoreAllies = true) {
        // console.log('mostrar espacio de acción para unidad ' + unit + ' con brightness ' + allowBrightTiles + ' e ignoreAllies ' + ignoreAllies);
        this.clearTiles();
        if (unit) {
            this.query.setup(this.battle, unit, ignoreAllies);
            this.guiTiles.forEach(tile => tile.refresh(allowBrightTiles));
        }
    }

    /**
     * @param {Unit} unit 
     */
    selectUnit(unit) {

        //console.log('seleccionando unidad ' + unit)

        if (this.battle.phase == feh.PHASE.SWAP_SPACES) {
            if (!unit) {
                this.clearTiles();
                this.showDefaultFrames();
            } else if (this.battle.phase == feh.PHASE.SWAP_SPACES) {
                this.showStatsOf(unit);
                this.showActionSpaceOf(unit);
                this.showDefaultFrames();
                this.controller.units.forEach(u => {
                    this.guiTilesAsMatrix[u.row][u.col].brightGreenFrame();
                    this.guiTilesAsMatrix[u.row][u.col].makeValid();
                });
                let t = this.guiTilesAsMatrix[unit.row][unit.col];
                t.brightSelectedBlueFrame();
            }
            this.selectedUnit = unit;
        }

        if (this.battle.phase == feh.PHASE.PLAYER) {
            if (!unit) {
                this.clearTiles();
                this.showDefaultFrames();
                if (this.selectedUnit) this.guiUnits.find(guiUnit => guiUnit.unit == this.selectedUnit).reset(false);
                this.selectedUnit = null;
                this.selectedRow = -1;
                this.selectedCol = -1;
                if (this.selectedTarget) this.selectTarget(null);
                this.showDefaultFrames();
            } else {
                this.selectedUnit = unit;
                this.clearTiles();
                this.showActionSpaceOf(unit, true, false);
                this.selectCoordinates(unit.row, unit.col);
            }

        }

    }

    /**
     * 
     * @param {number} row 
     * @param {number} col 
     */
    selectCoordinates(row, col) {

        // console.log('seleccionando coordenadas ' + row + ', ' + col)

        // FRAME
        if (this.selectedRow >= 0 && this.selectedCol >= 0) {
            let oldTile = this.guiTilesAsMatrix[this.selectedRow][this.selectedCol];
            oldTile.removeSelectedFramed();
        }
        let currentTile = this.guiTilesAsMatrix[row][col];
        currentTile.brightSelectedBlueFrame();
        this.selectedCol = col;
        this.selectedRow = row;

        // ARROWS
        this.guiTiles.forEach(t => t.clearArrow());
        let endNode = this.query.nodesAsMatrix[row][col];
        let toNode = null;
        let currentNode = endNode;
        while (currentNode != null) {
            let fromNode = currentNode.from;
            let fromTile = fromNode ? this.guiTilesAsMatrix[fromNode.row][fromNode.col] : null;
            let currentTile = this.guiTilesAsMatrix[currentNode.row][currentNode.col];
            let toTile = toNode ? this.guiTilesAsMatrix[toNode.row][toNode.col] : null;
            currentTile.setArrow(fromTile, toTile);
            toNode = currentNode;
            currentNode = fromNode;
        }
        this.guiUnits.find(guiUnit => guiUnit.unit == this.selectedUnit).setPosition(row, col);

        // FORECASST
        if (this.selectedTarget) {
            let targetIsEnemy = this.controller.tactician !== this.selectedTarget.tactician;
            let targetIsAlly = this.controller.tactician === this.selectedTarget.tactician;
            if (targetIsEnemy)
                this.showBattleForecast();
            // if (targetIsAlly)
            // this.showAssistForecast();
        }

    }

    /**
     * 
     * @param {feh.Unit} target 
     */
    selectTarget(target) {

        // console.log('seleccionando objetivo ' + target)

        // REMOVE OLD FRAME
        if (this.selectedTarget) {
            let oldTile = this.guiTilesAsMatrix[this.selectedTarget.row][this.selectedTarget.col];
            oldTile.removeSelectedFramed();
        }

        // ?
        if (target) {

            // ...
            this.selectedTarget = target;
            let isEnemy = this.controller.tactician !== target.tactician;
            let isAlly = !isEnemy;
            let currentTile = this.guiTilesAsMatrix[target.row][target.col];
            let slectedUnitNode = this.query.nodesAsMatrix[this.selectedRow][this.selectedCol];
            let targetNode = currentTile.node;

            // SWAP_SPACES_RETURN
            if (this.battle.phase == feh.PHASE.SWAP_SPACES) return;

            // SHOW DIALOG
            this.dialogElement.className = (isEnemy ? 'attack' : 'assist') + ' battle-dialog';
            this.dialogElement.style.left = "calc(var(--tile-size) * " + target.col + "px)";
            this.dialogElement.style.top = "calc(var(--tile-size) * " + target.row + "px)";
            if (target.row == 0) {
                if (target.col <= 2) this.dialogElement.classList.add('top-left');
                else this.dialogElement.classList.add('top-right');
            } else this.dialogElement.classList.add('normal');

            // BATTLE FORECAST
            if (isEnemy) {

                this.showBattleForecast();
                currentTile.brightSelectedRedFrame();

                // MOVE TO THE CLOSEST TILE FROM WHICH TARGET CAN BE ATTACKED
                if (!targetNode.attackableFrom.includes(slectedUnitNode)) {
                    let closestNode = targetNode.attackableFrom.reduce((a, b) => slectedUnitNode.getManhattanDistanceTo(a) < slectedUnitNode.getManhattanDistanceTo(b) ? a : b);
                    this.selectCoordinates(closestNode.row, closestNode.col);
                }

                // DIM TILES FROM WHICH TARGET CANNOT BE ATTACKED AND BRIGHT THE REST
                this.guiTiles.filter(t => !t.node.info.attackable && !targetNode.attackableFrom.includes(t.node)).forEach(t => t.removeBright());
                this.guiTiles.filter(t => targetNode.attackableFrom.includes(t.node)).forEach(t => t.bright());
            }

            // ASSIST FORECAST
            if (isAlly) {

                // this.showAssistForecast();
                currentTile.brightSelectedGreenFrame();

                // MOVE TO THE CLOSEST TILE FROM WHICH TARGET CAN BE ASSISTED
                if (!targetNode.assistableFrom.includes(slectedUnitNode)) {
                    let closestNode = targetNode.assistableFrom.reduce((a, b) => slectedUnitNode.getManhattanDistanceTo(a) < slectedUnitNode.getManhattanDistanceTo(b) ? a : b);
                    this.selectCoordinates(closestNode.row, closestNode.col);
                }

                // DIM TILES FROM WHICH TARGET CANNOT BE ATTACKED AND BRIGHT THE REST
                this.guiTiles.filter(t => !t.node.info.assistable && !targetNode.assistableFrom.includes(t.node)).forEach(t => t.removeBright());
                this.guiTiles.filter(t => targetNode.assistableFrom.includes(t.node)).forEach(t => t.bright());
            }

        } else {

            this.selectedTarget = null;

            // HIDE DIALOG
            this.dialogElement.className = 'battle-dialog';

            // HIDE BATTLE FORECAST
            this.statusGui.hideCombatForecast();
            if (this.selectedUnit) this.statusGui.showUnitStatus(this.selectedUnit);

            // BRIGHT VALID MOVEMENT TILES
            this.guiTiles.filter(t => t.node.info.moveable).forEach(t => t.bright());
        }
    }

    showBattleForecast() {
        let combat = new feh.Combat(this.selectedUnit, this.selectedTarget);
        this.statusGui.showCombatForecast(combat);
    }

    onTile(row, col) {

        console.log('onTile(' + row + ', ' + col + ')');

        if (this.playingAttackAnimation) return;
        if (this.battle.phase === feh.PHASE.ENEMY) return;

        let isDoubleClick = false;
        if (this.lastOnTile) {
            let t1 = new Date().getTime();
            let t0 = this.lastOnTile;
            let t = t1 - t0;
            if (t < 250) isDoubleClick = true;
            this.lastOnTile = t1;
        } else this.lastOnTile = new Date().getTime();

        let unit = this.battle.findUnitAt(row, col);
        let unitIsEnemy = unit && this.controller.tactician !== unit.tactician;
        let unitIsAlly = unit && this.controller.tactician === unit.tactician;

        let tileIsInAttackRange = this.query.nodesAsMatrix[row][col].info.inAttackRange;
        let tileIsInAssistRange = this.query.nodesAsMatrix[row][col].info.inAssistRange;
        let tileIsValidMovement = this.query.nodesAsMatrix[row][col].info.moveable;
        let tileIsValidAttack = this.query.nodesAsMatrix[row][col].info.attackable;
        let tileIsValidAssist = this.query.nodesAsMatrix[row][col].info.assistable;

        let tileIsSelectedCoordinates = this.selectedRow == row && this.selectedCol == col;

        let targetIsNotAttackableFromTile = false;
        let targetIsNotAssistableFromTile = false;
        if (this.selectedTarget || unitIsEnemy) {
            let ref = this.selectedTarget ? this.selectedTarget : unit;
            let targetNode = this.query.nodesAsMatrix[ref.row][ref.col];
            let selectedNode = this.query.nodesAsMatrix[row][col];
            if (!targetNode.attackableFrom.includes(selectedNode))
                targetIsNotAttackableFromTile = true;
            if (!targetNode.assistableFrom.includes(selectedNode))
                targetIsNotAssistableFromTile = true;
        }

        if (unitIsEnemy) {

            this.showStatsOf(unit);

            if (!this.selectedUnit) {
                this.showActionSpaceOf(unit);
                this.showDefaultFrames();
            } else if (this.selectedTarget == unit) {
                this.playingAttackAnimation = true;
                let this_selectedUnit = this.selectedUnit;
                let this_selectedRow = this.selectedRow;
                let this_selectedCol = this.selectedCol;
                let this_selectedTarget = this.selectedTarget;
                this.selectedUnit = null;
                this.selectUnit(null);
                let guiTile = this.guiTilesAsMatrix[this_selectedUnit.row][this_selectedUnit.col];
                guiTile.clear();
                this.controller.attack(this_selectedUnit, this_selectedRow, this_selectedCol, this_selectedTarget);
            } else if (tileIsValidAttack) {
                this.selectTarget(unit);
            }

        } else if (unitIsAlly) {

            this.showStatsOf(unit);

            if (this.battle.phase === feh.PHASE.SWAP_SPACES) {
                if (this.selectedUnit) {
                    this.controller.swap(this.selectedUnit, unit);
                    return;
                }
            }

            if (this.selectedUnit == unit && isDoubleClick) {
                this.controller.wait(unit);
                this.selectUnit(null);
                this.autoend();
                return;
            }

            if (!this.selectedUnit); // IMPORTANT
            else if (this.selectedTarget === unit) {
                this.controller.assist(this.selectedUnit, this.selectedRow, this.selectedCol, this.selectedTarget);
                this.selectUnit(null);
                this.autoend();
                return;
            } else if (tileIsValidAssist) this.selectTarget(unit);

            if (!this.selectedUnit && !unit.waiting) this.selectUnit(unit);
            else if (!this.selectedUnit) this.showActionSpaceOf(unit, false, true);
            else if (this.selectedUnit == unit && this.selectedTarget && tileIsSelectedCoordinates) this.selectTarget(null);
            else if (this.selectedUnit == unit && this.selectedTarget && !tileIsSelectedCoordinates) {
                if (this.selectedTarget) {
                    let targetIsEnemy = this.controller.tactician !== this.selectedTarget.tactician;
                    let targetIsAlly = this.controller.tactician === this.selectedTarget.tactician;
                    if (targetIsAlly && targetIsNotAssistableFromTile || targetIsEnemy && targetIsNotAttackableFromTile)
                        this.selectTarget(null);
                }
                this.selectCoordinates(row, col);
            }
            else if (this.selectedUnit == unit) this.selectUnit(null);

        } else {

            if (this.battle.phase === feh.PHASE.SWAP_SPACES) return;

            if (this.selectedTarget) {

                let targetIsEnemy = this.controller.tactician !== this.selectedTarget.tactician;
                let targetIsAlly = this.controller.tactician === this.selectedTarget.tactician;

                if (targetIsEnemy && targetIsNotAttackableFromTile) this.selectTarget(null);
                if (targetIsAlly && targetIsNotAssistableFromTile) this.selectTarget(null);

                if (tileIsSelectedCoordinates) this.selectTarget(null); // DIFF
                else if (tileIsValidMovement) this.selectCoordinates(row, col); // REPO1
                else if (tileIsInAttackRange) return; // REPO1
                else if (tileIsInAssistRange) return; // REPO1
                else this.selectUnit(null); // REPO1

            } else if (this.selectedUnit) {

                if (tileIsSelectedCoordinates) {
                    this.controller.move(this.selectedUnit, this.selectedRow, this.selectedCol); // DIFF
                    this.autoend();
                } else if (tileIsValidMovement) this.selectCoordinates(row, col); // REPO1
                else if (tileIsInAttackRange) return; // REPO1
                else if (tileIsInAssistRange) return; // REPO1
                else this.selectUnit(null); // REPO1

            } else {

                this.showActionSpaceOf(null);
                this.showDefaultFrames();
            }

        }

    }


}