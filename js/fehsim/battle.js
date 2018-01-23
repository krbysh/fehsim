//console.log("battle.js");

import { Node, Query } from './query.js';
import { Combat } from './combat.js';
import { MOVEMENT, STAT, TERRAIN } from './enums.js';
import { Unit, UnitModifier } from './unit.js';
import { Controller } from './controller.js';
import { Exception, EX } from './exception.js';
import { Map } from './map.js';
import { Build } from './build.js';

/**
 * So far in every battle there are two roles, the player and the enemy
 * @readonly
 * @enum {string}
 */
var TACTICIAN = {
    PLAYER: 'Player',
    ENEMY: 'Enemy'
};

/**
 * Possible phases of the battle
 * @readonly
 * @enum {string}
 */
var PHASE = {
    SWAP_SPACES: 'Swap Spaces',
    PLAYER: 'Player',
    ENEMY: 'Enemy'
};

export { TACTICIAN, PHASE };

/**
 * 
 * @param {string} tactician
 * @private
 */
function validateTactician(tactician) {
    if (tactician == TACTICIAN.ENEMY) return;
    if (tactician == TACTICIAN.PLAYER) return;
    throw new Exception(EX.INVALID_PARAM, "'" + tactician + "' is not a valid tactician");
}

/**
 * 
 * @param {Battle} battle 
 * @param {Unit} unit 
 * @private
 */
function validateUnit(battle, unit) {
    Unit.validate(unit);
    if (!battle.units.includes(unit)) throw new Exception(EX.INVALID_PARAM, "The unit doesn't belong to the battle")
}

/**
 * 
 * @param {Battle} battle 
 * @param {string} tactician 
 * @param {Unit} unit 
 * @private
 */
function validateOwnership(battle, tactician, unit) {
    validateTactician(tactician);
    validateUnit(battle, unit);
    let ctrl = battle.controllers[tactician];
    if (!ctrl.owns(unit)) throw new Exception(EX.INVALID_PARAM, "The controller doesn't own the unit")
}

/**
 * @param {number} row 
 * @param {number} col 
 * @private
 */
function validateCoordinates(row, col) {
    // TODO
}

/**
 * 
 * @param {Battle} battle 
 * @param {Unit} unit 
 * @param {number} row 
 * @param {number} col 
 * @private
 */
function validateMovement(battle, unit, row, col) {
    validateUnit(battle, unit);
    validateCoordinates(row, col);

}

/**
 * 
 * @param {Battle} battle 
 * @param {string} tactician 
 * @private
 */
function validatePhase(battle, tactician) {
    if (!tactician) throw new Exception(EX.MISSING_PARAM, "The tactician parameter is missing");
    if (!battle) throw new Exception(EX.MISSING_PARAM, "The battle parameter is missing");
    if (tactician !== TACTICIAN.ENEMY && tactician !== TACTICIAN.PLAYER)
        throw new Exception(EX.INVALID_PARAM, "'" + tactician + "' is not a valid TACTICIAN value");
    if (tactician === TACTICIAN.PLAYER && (battle.phase !== PHASE.PLAYER && battle.phase !== PHASE.SWAP_SPACES))
        throw new Exception(EX.BAD_TIMING, "'" + tactician + "' is outside of his/her phase");
    if (tactician === TACTICIAN.ENEMY && battle.phase !== PHASE.ENEMY)
        throw new Exception(EX.BAD_TIMING, "'" + tactician + "' is outside of his/her phase");
}

export class BattleListener {
    /**
     * This is called when the battle is built.
     */
    onsetup(battle) { }

    /**
     * This is called when the player controller swap units before the fight.
     * @param {Unit} unit 
     * @param {Unit} target 
     */
    onswap(unit, target) { }

    /**
     * This is called when the phase changes
     * @param {string} phase
     * @param {number} turn
     */
    onphase(phase, turn) { }

    /**
     * This is called after phase changes
     * @param {phase}
     * @param {number} turn 
     */
    onturnstart(phase, turn) { }

    /**
     * This is called after phase onturnstart
     * @param {phase}
     * @param {number} turn 
     */
    onturnstartlate(phase, turn) { }

    /**
     * This is called when a phase end
     */
    onendturn() { }

    /**
     * This is called when the owner but his/her unit to wait
     * @param {Unit} unit 
     */
    onwait(unit) { }

    /**
     * This is called when a unit moved without attacking or assisting any other action
     * @param {Unit} unit
     * @param {number} row 
     * @param {number} col
     */
    onmove(unit, row, col) { }

    /**
     * This is called when a unit assists an ally
     * @param {Unit} unit 
     * @param {Unit} ally 
     */
    onassist(unit, ally) { }

    /**
     * This is called after a combat
     * @param {Combat} combat
     */
    oncombat(combat) { }

    /**
     * This is called after a combat, when the units with 0 hp have been killed
     * @param {Combat} combat
     */
    onaftercombat(combat) { }

    /**
     * This is called after a unit is killed
     * @param {Unit} unit 
     */
    onkill(unit) { }
}

/**
 * The most important object in the library
 */
export class Battle {

    constructor() {

        /** @type {Controller[]} */ this.controllers = [];
        /** @type {BattleListener[]} */ this.listeners = [];

        /** @type {Unit[]} */ this.units = [];
        /** @type {Unit[]} */ this.playerUnits = [];
        /** @type {Unit[]} */ this.enemyUnits = [];
        /** @type {string} */ this.phase = null;
        /** @type {number} */ this.turn = 0;

        /** @type {Map} */ this.map = null;
        /** @type {Build[]} */ this.playerTeamBuilds = null;
        /** @type {Build[]} */ this.enemyTeamBuilds = null;

        this.controllers[TACTICIAN.PLAYER] = new Controller(this, TACTICIAN.PLAYER);
        this.controllers[TACTICIAN.ENEMY] = new Controller(this, TACTICIAN.ENEMY);
    }

    /**
     * 
     * @param {Map} map
     * @param {Build[]} playerTeam 
     * @param {Build[]} enemyTeam 
     */
    setup(map, playerTeam, enemyTeam) {

        // BUILDS
        this.playerTeamBuilds = playerTeam;
        this.enemyTeamBuilds = enemyTeam;

        // TURN
        this.turn = 1;
        this.allowSwapSpaces = true;

        // BUILD UNITS
        this.units.length = 0;
        this.playerUnits = playerTeam.map(build => build.build());
        this.enemyUnits = enemyTeam.map(build => build.build());
        this.playerUnits.concat(this.enemyUnits).forEach(e => this.units.push(e));
        this.units.forEach(u => u.hp = u.maxHp);

        // UPDATE TEAM MATES
        this.playerUnits.forEach(u => u.tactician = TACTICIAN.PLAYER);
        this.enemyUnits.forEach(u => u.tactician = TACTICIAN.ENEMY);

        // UPDATE CONTROLLERS
        this.controllers[TACTICIAN.PLAYER].units = this.playerUnits;
        this.controllers[TACTICIAN.ENEMY].units = this.enemyUnits;

        // POSITION THEM
        if (this.playerUnits.length > map.playerStartingPositions.length)
            throw new Exception(EX.INVALID_PARAM, 'The map only support ' + map.playerStartingPositions.length + ' starting player units');
        if (this.enemyUnits.length > map.playerStartingPositions.length)
            throw new Exception(EX.INVALID_PARAM, 'The map only support ' + map.enemyStartingPositions.length + ' starting enemy units');
        this.map = map;
        for (let i = 0; i < this.playerUnits.length; i++) {
            this.playerUnits[i].row = map.playerStartingPositions[i][0];
            this.playerUnits[i].col = map.playerStartingPositions[i][1];
        }
        for (let i = 0; i < this.enemyUnits.length; i++) {
            this.enemyUnits[i].row = map.enemyStartingPositions[i][0];
            this.enemyUnits[i].col = map.enemyStartingPositions[i][1];
        }

        // BEGIN
        this.phase = PHASE.SWAP_SPACES;

        //console.warn('PRUEBA PARA BRAVATAS');
        //this.units.forEach(u => u.hp = 1);

        this.units.forEach(u => u.battle = this);

        this.listeners.forEach(e => e.onsetup(this));

    }

    /**
     * Transitions to the swap spaces phase prior to the first player phase
     * @param {string} tactician controller tactician (player tactician)
     * @throws {Exception} Will throw an exception if tactician is not a valid controller tactician
     */
    swapSpaces(tactician) {
        validatePhase(this, tactician);
        if (this.phase !== PHASE.PLAYER || this.turn !== 1 || !this.allowSwapSpaces) throw new Exception(EX.BAD_TIMING,
            "You can only call swap spaces during the first turn Player phase and before making any actions");
        this.phase = PHASE.SWAP_SPACES;
        this.units.forEach(unit => unit.onSwapSpaces());
        this.units.forEach(unit => unit.reset());
        this.listeners.forEach(e => e.onphase(this.phase, 1));
    }

    /**
     * @param {string} tactician 
     * @param {Unit} unit 
     * @param {Unit} target 
     */
    swap(tactician, unit, target) {
        if (this.phase !== PHASE.SWAP_SPACES) throw new Exception(EX.BAD_TIMING, "You can only call swap during the Swap Spaces phase");
        validateOwnership(this, tactician, unit);
        validateOwnership(this, tactician, target);
        let row = unit.row;
        let col = unit.col;
        unit.row = target.row;
        unit.col = target.col;
        target.row = row;
        target.col = col;
        this.listeners.forEach(e => e.onswap(unit, target));
    }

    /**
     * @param {string} tactician 
     */
    fight(tactician) {
        validatePhase(this, tactician);
        if (this.phase !== PHASE.SWAP_SPACES) throw new Exception(EX.BAD_TIMING, "You can only call fight during the Swap Spaces phase");
        this.phase = PHASE.PLAYER;
        //
        this.listeners.forEach(e => e.onphase(this.phase, this.turn));
        this.playerUnits.forEach(unit => unit.onTurnStart());
        this.listeners.forEach(e => e.onturnstart(this.phase, this.turn));
        this.playerUnits.forEach(unit => unit.onTurnStartLate());
        this.listeners.forEach(e => e.onturnstartlate(this.phase, this.turn));
    }

    /**
     * 
     * @param {string} tactician 
     * @param {Unit} unit 
     */
    wait(tactician, unit) {
        // TODO check phases and so
        validateOwnership(this, tactician, unit);
        // TODO validate unit is not waiting
        unit.waiting = true;
        this.allowSwapSpaces = false;
        unit.onWait();
        this.listeners.forEach(e => e.onwait(unit));
    }

    /**
     * 
     * @param {string} tactician 
     * @param {Unit} unit 
     * @param {number} row 
     * @param {number} col 
     */
    move(tactician, unit, row, col) {
        validatePhase(this, tactician);
        validateOwnership(this, tactician, unit);
        if (unit.waiting) throw new Exception(EX.ILLEGAL_MOVEMENT, 'The unit is waiting and cannot move for the rest of the turn');

        let query = new Query();
        query.setup(this, unit, false);
        if (!query.nodesAsMatrix[row][col].info.moveable) throw new Exception(EX.ILLEGAL_MOVEMENT, 'The coordinates are unreachable');

        unit.row = row;
        unit.col = col;
        unit.waiting = true;
        this.allowSwapSpaces = false;
        unit.onMove();
        this.listeners.forEach(e => e.onmove(unit, row, col));
    }

    /**
     * 
     * @param {string} tactician 
     * @param {Unit} unit 
     * @param {number} row 
     * @param {number} col 
     * @param {Unit} ally 
     */
    assist(tactician, unit, row, col, ally) {

        validatePhase(this, tactician);
        validateUnit(this, unit);
        validateUnit(this, ally);
        validateOwnership(this, tactician, unit);
        validateOwnership(this, tactician, ally);
        if (unit.waiting) throw new Exception(EX.ILLEGAL_MOVEMENT, 'The unit is waiting and cannot move for the rest of the turn');

        let query = new Query();
        query.setup(this, unit, false);
        if (!query.nodesAsMatrix[row][col].info.moveable) throw new Exception(EX.ILLEGAL_MOVEMENT, 'The coordinates are unreachable');
        if (!query.nodesAsMatrix[ally.row][ally.col].info.assistable) throw new Exception(EX.ILLEGAL_MOVEMENT, 'The ally is unassistable');

        unit.row = row;
        unit.col = col;
        unit.assist.assist(unit, ally);
        unit.onAssist(ally);
        unit.waiting = true;

        this.allowSwapSpaces = false;
        this.listeners.forEach(e => e.onassist(unit, ally));
    }

    /**
     * 
     * @param {string} tactician 
     * @param {Unit} unit 
     * @param {number} row 
     * @param {number} col 
     * @param {Unit} foe 
     */
    attack(tactician, unit, row, col, foe) {

        validatePhase(this, tactician);
        validateUnit(this, unit);
        validateUnit(this, foe);
        validateOwnership(this, tactician, unit);
        if (unit.waiting) throw new Exception(EX.ILLEGAL_MOVEMENT, 'The unit is waiting and cannot move for the rest of the turn');

        let query = new Query();
        query.setup(this, unit, false);
        let unitNode = query.nodesAsMatrix[row][col];
        let foeNode = query.nodesAsMatrix[foe.row][foe.col];
        if (!unitNode.info.moveable) throw new Exception(EX.ILLEGAL_MOVEMENT, 'The coordinates are unreachable');
        if (!foeNode.info.attackable) throw new Exception(EX.ILLEGAL_MOVEMENT, 'The foe is not attackable');
        if (!foeNode.attackableFrom.includes(unitNode)) throw new Exception(EX.ILLEGAL_MOVEMENT, 'The foe is not attackable from the unit node');

        unit.row = row;
        unit.col = col;
        let combat = new Combat(unit, foe, false);
        unit.waiting = true;

        this.allowSwapSpaces = false;
        this.listeners.forEach(e => e.oncombat(combat));

        if (unit.hp <= 0) this.kill(unit);
        if (foe.hp <= 0) this.kill(foe);

        unit.onAfterCombat(combat, foe);
        foe.onAfterCombat(combat, unit);

        this.listeners.forEach(e => e.onaftercombat(combat));
    }

    /**
     * @param {Unit} unit 
     */
    kill(unit) {
        this.units.splice(this.units.indexOf(unit), 1);

        let c0 = this.controllers[TACTICIAN.PLAYER];
        let c1 = this.controllers[TACTICIAN.ENEMY];
        if (c0.units.includes(unit)) c0.units.splice(c0.units.indexOf(unit), 1);
        if (c1.units.includes(unit)) c1.units.splice(c1.units.indexOf(unit), 1);

        this.listeners.forEach(e => e.onkill(unit));
    }

    /**
     * 
     * @param {string} tactician 
     */
    endTurn(tactician) {

        validatePhase(this, tactician);

        if (tactician == TACTICIAN.PLAYER) this.playerUnits.filter(u => !u.waiting).forEach(unit => this.wait(tactician, unit));
        if (tactician == TACTICIAN.ENEMY) this.enemyUnits.filter(u => !u.waiting).forEach(unit => this.wait(tactician, unit));

        if (tactician == TACTICIAN.PLAYER) this.playerUnits.forEach(unit => unit.waiting = false);
        if (tactician == TACTICIAN.ENEMY) this.enemyUnits.forEach(unit => unit.waiting = false);

        if (this.phase === PHASE.ENEMY) this.playerUnits.forEach(unit => unit.onTurnEnd());
        if (this.phase === PHASE.PLAYER) this.enemyUnits.forEach(unit => unit.onTurnEnd());

        this.listeners.forEach(l => { if (l.onendturn) l.onendturn(); });

        if (tactician == TACTICIAN.PLAYER) {
            this.phase = PHASE.ENEMY;
        } else if (tactician == TACTICIAN.ENEMY) {
            this.phase = PHASE.PLAYER;
            this.turn++;
        }

        this.listeners.forEach(l => { if (l.onphase) l.onphase(this.phase, this.turn); });

        if (this.phase === PHASE.PLAYER) {

            // The Defiant passives trigger before any start-of-turn healing...
            this.playerUnits.forEach(u => u.onTurnStart());
            this.listeners.forEach(e => e.onturnstart(this.phase, this.turn));

            // ... such as that from an equipped Falchion, or Renewal.
            this.playerUnits.forEach(u => u.onTurnStartLate());
            this.listeners.forEach(e => e.onturnstartlate(this.phase, this.turn));

        } else if (this.phase === PHASE.ENEMY) {

            this.enemyUnits.forEach(u => u.onTurnStart());
            this.listeners.forEach(e => e.onturnstart(this.phase, this.turn));

            this.enemyUnits.forEach(u => u.onTurnStartLate());
            this.listeners.forEach(e => e.onturnstartlate(this.phase, this.turn));
        }




    }

    /**
     * 
     * @param {number} row 
     * @param {number} col 
     * @returns {Unit} The unit at the given coordinates
     */
    findUnitAt(row, col) { return this.units.find(unit => unit.row == row && unit.col == col); }

    /**
     * 
     * @param {Unit} unit 
     * @param {Unit} target 
     */
    areFoes(unit, target) {
        validateUnit(this, unit);
        validateUnit(this, target);
        return unit.tactician !== target.tactician;
    }

    /**
     * 
     * @param {BattleListener} listener 
     */
    addBattleListener(listener) {
        if (!this.listeners.includes(listener))
            this.listeners.push(listener);
    }

    /**
     * 
     * @param {BattleListener} listener 
     */
    removeBattleListener(listener) {
        if (!this.listeners.includes(listener))
            this.listeners.splice(this.listeners.indexOf(listener), 1);
    }
}