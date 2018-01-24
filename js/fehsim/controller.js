//console.log("controller.js");

import { Unit, UnitModifier } from './unit.js';
import { Battle } from './battle.js';
import { Build } from './build.js';

/**
 * A command layer between one player and the battle
 */
export class Controller {

    /**
     * 
     * @param {Battle} battle 
     * @param {string} tactician 
     */
    constructor(battle, tactician) {

        /**
         * The battle uppon which commands will be sent
         * @type {Battle}
         */
        this.battle = battle;

        /**
         * The commands sent to the battle object will be sent in the name of this tactician
         * @type {string}
         */
        this.tactician = tactician;

        /**
         * The units of this controller tactician
         * @type {Unit[]}
         */
        this.units = null;

    }

    /**
     * 
     * @param {Unit} unit 
     */
    owns(unit) {
        return this.units.includes(unit);
    }

    /**
     * 
     */
    swapSpaces() {
        this.battle.swapSpaces(this.tactician);
    }

    /**
     * @param {Unit} unit 
     * @param {Unit} target 
     */
    swap(unit, target) {
        this.battle.swap(this.tactician, unit, target);
    }

    /**
     * 
     */
    fight() {
        this.battle.fight(this.tactician);
    }

    /**
     * 
     * @param {Unit} unit 
     */
    wait(unit) {
        this.battle.wait(this.tactician, unit);
    }

    /**
     * 
     * @param {Unit} unit 
     * @param {number} row 
     * @param {number} col 
     */
    move(unit, row, col) {
        this.battle.move(this.tactician, unit, row, col);
    }

    /**
     * 
     * @param {Unit} unit 
     * @param {number} row 
     * @param {number} col 
     * @param {Unit} ally 
     */
    assist(unit, row, col, ally) {
        this.battle.assist(this.tactician, unit, row, col, ally);
    }

    /**
     * 
     * @param {Unit} unit 
     * @param {number} row 
     * @param {number} col 
     * @param {Unit} foe 
     */
    attack(unit, row, col, foe) {
        this.battle.attack(this.tactician, unit, row, col, foe);
    }

    /**
     * 
     */
    endTurn() {
        this.battle.endTurn(this.tactician)
    }
}