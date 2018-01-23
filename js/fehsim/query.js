import { MOVEMENT, STAT, TERRAIN } from './enums.js';
import { Unit, UnitModifier } from './unit.js';
import { Battle } from './battle.js';
import { Exception, EX } from './exception.js';

function merge(a, b) {
    let merged = [];
    a.concat(b).forEach(e => {
        if (!merged.includes(e))
            merged.push(e);
    });
    return merged;
}

/**
 * 
 * @param {Node} node 
 * @param {number} level
 * @returns {Node[]}
 * @private
 */
function propagate(node, level) {
    let propagation = [];
    let open = [node];
    for (let l = 0; l <= level; l++) {
        for (let i = open.length - 1; i >= 0; i--) {
            let n = removeFromArray(open, open[i]);
            n.neighbours.forEach(m => {
                if (!propagation.includes(m))
                    if (!open.includes(m))
                        open.push(m);
            });
            if (!propagation.includes(n))
                propagation.push(n);
        }
    }
    return propagation;
}

/**
 * 
 * @param {any[]} array 
 * @param {any} element 
 * @private
 */
function removeFromArray(array, element) {
    if (!array.includes(element)) return;
    let index = array.indexOf(element);
    array.splice(index, 1);
    return element;
}

/**
 * 
 * @param {Node} a 
 * @param {Node} b 
 * @private
 */
function link(a, b) {
    if (!a.neighbours.includes(b)) a.neighbours.push(b);
    if (!b.neighbours.includes(a)) b.neighbours.push(a);
}

/**
 * A node represents a tile in the battle map and its relation to the unit of interest in the query object
 */
export class Node {

    constructor(row = 0, col = 0) {

        /** @type {number} */ this.row = row;
        /** @type {number} */ this.col = col;
        /** @type {Node[]} */ this.neighbours = [];
        /** @type {Node[]} */ this.attackableFrom = [];
        /** @type {Node[]} */ this.assistableFrom = [];
        /** @type {Node} */ this.from = null;
        /** @type {Unit} */ this.unit = null;
        /** @type {boolean} */ this.isBlocked = false;
        /** @type {boolean} */ this.isUntraversable = false;
        /** @type {boolean} */ this.isOccupiedByEnemy = false;
        /** @type {boolean} */ this.isOccupied = false;
        /** @type {boolean} */ this.isEnabledBySkill = false;
        /** @type {boolean} */ this.landButDoNotTraverse = false;
        /** @type {number} */ this.traverseCost = 0;
        /** @type {number} */ this.g = 0;
        /** @type {number} */ this.f = 0;

        /** 
         * A convenient set of flags, mostly used for validation puposes.
         * @readonly
         * @enum {boolean}
         */
        this.info = {
            /**
             * Indicates that the node is in move range (not necessarily is a valid movement node) 
             * @type {boolean} */ inMoveRange: false,
            /** 
             * Indicates that the node is in assist range (not necessarely is a valid assist node)
             * @type {boolean} */ inAssistRange: false,
            /** 
             * Indicates that the node is in attack range (not necessarely is a valid attack node)
             * @type {boolean} */ inAttackRange: false,
            /** 
             * Indicates that the node is a valid movement node, and a movement action can be performed to this node.
             * @type {boolean} */ moveable: false,
            /** 
             * Indicates that the nodes is a valid assist node, and an assist action can be performed to this node.
             * @type {boolean} */ assistable: false,
            /** 
             * Indicates that the node is a valid attack node, and an attack action can be performed to this node.
             * @type {boolean} */ attackable: false
        }
    }

    /**
     * The distance between two points in a grid based on a strictly horizontal and/or vertical path (that is, along the grid lines), 
     * as opposed to the diagonal or "as the crow flies" distance. 
     * @param {Node} node the node to which manhattan distance will be calculated
     * @returns {number} The manhattan distance from this to node
     */
    getManhattanDistanceTo(node) { return Math.abs(node.row - this.row) + Math.abs(node.col - this.col); }
}

/**
 * Represents the action space of a unit:
 * what units can be attacked by it, what units can be assisted by it and where can it move to.
 */
export class Query {

    constructor() {

        /** 
         * All the nodes in the query (each node represents a tile in the battle map) in a convenient Matrix form.
         * If you want the node corresponding to the tile in the first row last column you would write: query.nodesAsMatrix[0][5]
         * @type {Node[][]} 
         * */
        this.nodesAsMatrix = [];
        for (let row = 0; row < 8; row++) {
            this.nodesAsMatrix[row] = [];
            for (let col = 0; col < 6; col++) {
                let node = new Node();
                node.row = row;
                node.col = col;
                if (col > 0) link(node, this.nodesAsMatrix[row][col - 1]);
                if (row > 0) link(node, this.nodesAsMatrix[row - 1][col]);
                this.nodesAsMatrix[row][col] = node;
            }
        }

        /**
         * User by skills such as Pass 1/2/3
         */
        this.disableOccupiedByEnemyCheck = false;

        /**
         * All the nodes in the query, each node represents a tile in the battle map
         * @type {Node[]} 
         * */
        this.nodes = this.nodesAsMatrix.reduce((a, b) => a.concat(b));

        /** Blue tiles 
         * @type {Node[]} */ this.traversableNodes = [];

        /** Bright blue tiles 
         * @type {Node[]} */ this.validMovementNodes = [];

        /** Red tiles 
         * @type {Node[]} */ this.nodesInAttackRange = [];

        /** Green tiles 
         * @type {Node[]} */ this.nodesInAssistRange = [];

        /** Bright red tiles, units in theese nodes can be attacked by the unit
         * @type {Node[]} */ this.validAttackNodes = [];

        /** Bright green tiles, units in theese nodes can be assisted by the unit
         * @type {Node[]} */ this.validAssistNodes = [];
    }

    /**
     * This method updates the action space in this instance for a given unit
     * @param {Battle} battle the battle to query from
     * @param {Unit} unit the unit to query for
     * @param {boolean} ignoreAllies this is set to true when you want to know possible enemy actions next turn
     */
    setup(battle, unit, ignoreAllies = false) {

        // falgs
        this.disableOccupiedByEnemyCheck = false;

        // update untraversable terrain flag and costs
        this.nodes.forEach(node => {
            let terrain = battle.map.terrain[node.row][node.col];
            node.isUntraversable = !unit.isAbleToTraverseTerrain(terrain);
            node.traverseCost = terrain !== 'F' ? 1 : (unit.movementType === MOVEMENT.INFANTRY ? 2 : 1); // FOREST COST 2
            node.isBlocked = terrain === 'B'; // WALLS
            node.isEnabledBySkill = false;
            node.landButDoNotTraverse = false;
            node.from = null;
        });

        // update isEnemyNode flag and isOccupied
        this.nodes.forEach(node => {
            node.unit = battle.findUnitAt(node.row, node.col);
            node.isOccupiedByEnemy = node.unit && battle.areFoes(unit, node.unit) ? true : false;
            node.isOccupied = node.unit ? true : false;
        });

        // update from skills
        unit.onQuery(this);
        unit.getAllies().forEach(unit => unit.onUnitQuery(unit, this));
        unit.getEnemies().forEach(unit => unit.onUnitQuery(unit, this));

        // initialize
        this.nodes.forEach(node => node.g = node.f = 999);
        let start = this.nodesAsMatrix[unit.row][unit.col];
        start.g = start.f = 0;
        let open = [start];
        let closed = [];

        // run pathfinding
        while (open.length) {

            // find the node in the open set with the lowest f score
            let current = open.reduce((a, b) => a.f < b.f ? a : b);
            closed.push(removeFromArray(open, current));

            // check if you are allowed land but do not traverse the node
            if (current.landButDoNotTraverse && !this.disableOccupiedByEnemyCheck) continue;

            // check if neighbour's neighbours should be "discovered"
            current.neighbours.forEach(n => {

                // ignore untraversable neighbours (because of terrain)
                if (n.isUntraversable) return;

                // ignore enemy occupied neighbours
                if (n.isOccupiedByEnemy && !this.disableOccupiedByEnemyCheck) return;

                // ignore already evaluated neighbours
                if (closed.includes(n)) return;

                let d = n.traverseCost; // cost from current to neighbour
                let g = current.g + d; // tentative neighbour g score
                let g0 = n.g; // current neighbour g score

                // ignore unreachable neighbours (because they are too far away from start)
                if (g > unit.steps) return;

                // this is not a better path
                if (g >= g0) return;

                // update path
                let h = n.isOccupied ? 1 : 0; // to prefer the clear path :P
                n.g = g;
                n.f = n.g + h;
                n.from = current;

                // discover new node
                open.push(n);
            });
        }

        this.traversableNodes = this.nodes.filter(n => n.g <= unit.steps);

        this.validMovementNodes = this.traversableNodes.filter(n => !ignoreAllies ? !n.isOccupied : !(n.isOccupiedByEnemy && n.isOccupied));
        this.validMovementNodes.push(this.nodesAsMatrix[unit.row][unit.col]);

        this.nodes.filter(n => n.isEnabledBySkill).forEach(n => {
            if (!this.validMovementNodes.includes(n)) {
                n.isEnabledBySkill = true;
                this.validMovementNodes.push(n);
            } else {
                n.isEnabledBySkill = false;
            }
        })

        this.nodesInAttackRange = this.validMovementNodes.map(n => propagate(n, unit.attackRange)).reduce((a, b) => merge(a, b)).filter(n => !n.isBlocked);

        this.nodesInAssistRange = this.validMovementNodes.map(n => propagate(n, unit.assistRange)).reduce((a, b) => merge(a, b)).filter(n => !n.isBlocked);

        // el concat de arriba hace que se repitan nodos

        this.validAttackNodes = this.nodesInAttackRange.filter(n => {
            if (!n.unit || !battle.areFoes(unit, n.unit)) {
                n.attackableFrom.length = 0;
                return;
            }
            if (unit.attackRange == 1) n.attackableFrom = propagate(n, 1).filter(m => this.validMovementNodes.includes(m));
            else if (unit.attackRange == 2) n.attackableFrom = propagate(n, 2).filter(m => this.validMovementNodes.includes(m)).filter(m => !n.neighbours.includes(m));
            else if (unit.attackRange !== 0) throw new Exception(EX.INVALID_PARAM, 'Rango de ataque tres o que!?');
            return n.attackableFrom.length;
        });

        this.validAssistNodes = this.nodesInAssistRange.filter(n => {

            if (!unit.assist) return false;

            if (!n.unit || battle.areFoes(unit, n.unit)) {
                n.assistableFrom.length = 0;
                return;
            }
            if (unit.assistRange == 1) n.assistableFrom = propagate(n, 1).filter(m => this.validMovementNodes.includes(m));
            else if (unit.assistRange == 2) n.assistableFrom = propagate(n, 2).filter(m => this.validMovementNodes.includes(m)).filter(m => !n.neighbours.includes(m));
            else if (unit.assistRange !== 0) throw new Exception(EX.INVALID_PARAM, 'Rango de assist tres o que!?');

            n.assistableFrom = n.assistableFrom.filter(m => unit.assist.isAssistable(unit, m.row, m.col, n.unit));

            return n.assistableFrom.length;
        });

        // YOU CANNOT SELF ASSIST
        while (this.validAssistNodes.includes(start)) this.validAssistNodes.splice(this.validAssistNodes.indexOf(start), 1);

        // INFO
        this.nodes.forEach(node => {
            let info = node.info;
            for (let key in info) info[key] = false
        })
        this.traversableNodes.forEach(node => node.info.inMoveRange = true);
        this.nodesInAssistRange.forEach(node => node.info.inAssistRange = true);
        this.nodesInAttackRange.forEach(node => node.info.inAttackRange = true);
        this.validMovementNodes.forEach(node => node.info.moveable = true);
        this.validAssistNodes.forEach(node => node.info.assistable = true);
        this.validAttackNodes.forEach(node => node.info.attackable = true);
    }
}