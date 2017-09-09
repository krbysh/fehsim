/**
 * BLA3
 * @module Movement
 * */

/**
 * 
 */
class FehMovementQueryNode {

    /**
     * 
     * @param {number} row 
     * @param {number} column 
     * @param {FehMovementQueryNode[]} neighbours
     * @param {number} g
     * @param {number} f
     * @param {FehMovementQueryNode} from
     * @param {Boolean} hasEnemyPresence
     * @param {Boolean} untraversableTerrain
     * @param {Boolean} containsHero
     */
    constructor(row = 0, column = 0, neighbours = [], g = 0, f = 0, from = null, hasEnemyPresence = false, untraversableTerrain = false, containsHero = false) {
        this.row = row;
        this.column = column;
        this.neighbours = neighbours;
        this.g = g;
        this.f = f;
        this.from = from;
        this.untraversableTerrain = untraversableTerrain;
        this.hasEnemyPresence = hasEnemyPresence;
        this.containsHero = containsHero;
        this.blocked = false;
    }

    /**
     * 
     * @param {FehMovementQueryNode} node 
     */
    link(node) {
        if (this.neighbours.indexOf(node) < 0)
            this.neighbours.push(node);
        if (node.neighbours.indexOf(this) < 0)
            node.neighbours.push(this);
    }

    /**
     * 
     * @param {number} range 
     * @param {FehMovementQueryNode[]} result
     */
    getNeighbours(range, result = []) {
        if (range > 0)
            this.neighbours.forEach(n => {
                if (result.indexOf(n) < 0)
                    result.push(n);
                n.getNeighbours(range - 1, result);
            })
        return result;
    }

    toString() {
        return this.row + ", " + this.column
    }
}

/**
 * 
 */
class FehMovementQueryResult {

    /**
     * 
     * @param {FehMovementQueryNode[]} traversableTiles 
     * @param {FehMovementQueryNode[]} validMovementTiles 
     * @param {FehMovementQueryNode[]} tilesInAttackRange 
     * @param {FehMovementQueryNode[]} tilesInAssistRange
     * @param {FehMovementQueryNode[]} validAttackTargetTiles
     * @param {FehMovementQueryNode[]} validAssistTargetTiles
     * @param {FehMovementQueryNode[]} nodes
     */
    constructor(traversableTiles, validMovementTiles, tilesInAttackRange, tilesInAssistRange, validAttackTargetTiles, validAssistTargetTiles, nodes = []) {
        this.traversableTiles = traversableTiles;
        this.validMovementTiles = validMovementTiles;
        this.tilesInAttackRange = tilesInAttackRange;
        this.tilesInAssistRange = tilesInAssistRange;
        this.validAttackTargetTiles = validAttackTargetTiles;
        this.validAssistTargetTiles = validAssistTargetTiles;
        this.nodes = nodes;
        addAllElementsNotInTargetArray(this.nodes, this.traversableTiles);
        addAllElementsNotInTargetArray(this.nodes, this.validMovementTiles);
        addAllElementsNotInTargetArray(this.nodes, this.tilesInAttackRange);
        addAllElementsNotInTargetArray(this.nodes, this.tilesInAssistRange);
        addAllElementsNotInTargetArray(this.nodes, this.validAttackTargetTiles);
        addAllElementsNotInTargetArray(this.nodes, this.validAssistTargetTiles);
    }

    /**
     * 
     * @param {number} row 
     * @param {column} column 
     */
    getNodeAt(row, column) {
        return this.nodes.find(n => n.row == row && n.column == column);
    }
}

/**
 * 
 */
class FehActionQuery {


    /**
     * @returns {FehMovementQueryNode[][]}
     */
    buildSearchSpace() {
        let searchSpace = [];
        for (let row = 0; row < 8; row++) {
            searchSpace[row] = [];
            for (let column = 0; column < 6; column++) {
                let node = new FehMovementQueryNode();
                node.row = row;
                node.column = column;
                if (column > 0) node.link(searchSpace[row][column - 1]);
                if (row > 0) node.link(searchSpace[row - 1][column]);
                searchSpace[row][column] = node;
            }
        }
        return searchSpace;
    }

    /**
     * @param {FehBattle} battle
     * @param {FehUnit} hero 
     * @param {Boolean} allyTilesAreValidMovementSpaces
     * @returns {FehMovementQueryResult}
     */
    movementQuery(battle, hero, allyTilesAreValidMovementSpaces = false) {

        let searchSpace = this.buildSearchSpace();
        let start = searchSpace[hero.row][hero.column];

        // update untraversable terrain flag
        searchSpace.forEach(row => row.forEach(node => {

            let terrain = battle.map.tiles[node.row][node.column];
            let u = false;
            switch (hero.movementType) {
                case MOVEMENT_ARMOR:
                case MOVEMENT_INFANTRY:
                    if (node !== start && terrain === TERRAIN_TREES) u = true;
                    if (terrain !== TERRAIN_PLAIN) u = true;
                    break;
                case MOVEMENT_CAVALRY:
                    if (terrain !== TERRAIN_PLAIN) u = true;
                    break;
                case MOVEMENT_FLIER:
                    if (terrain == TERRAIN_BLOCK) u = true;
                    break;
            }
            node.untraversableTerrain = u;

            if (terrain == TERRAIN_BLOCK || terrain == TERRAIN_WALL1)
                node.blocked = true;

        }));

        // update enemy presence flag and contains hero flag
        searchSpace.forEach(row => row.forEach(node => {
            node.hasEnemyPresence = false;
            node.containsHero = false;
            let heroAtTile = battle.getHeroAt(node.row, node.column);
            if (heroAtTile && heroAtTile.playerKey != hero.playerKey)
                node.hasEnemyPresence = true;
            if (heroAtTile) node.containsHero = true;
        }));

        // init
        searchSpace.forEach(row => row.forEach(node => {
            node.g = 999;
            node.f = 999;
        }));
        start.g = 0;
        start.from = null;
        let openSet = [start];
        let closedSet = [];

        // find traversable tiles
        while (openSet.length > 0) {

            // find the node in the open set with the lowest f score
            let current = openSet.sort((a, b) => a.f - b.f)[0];
            closedSet.push(removeFromArray(openSet, current));

            current.neighbours.forEach(n => {

                // ignore untraversable neighbours (because of block)
                if (n.blocked) return;

                // ignore untraversable neighbours (because of terrain)
                if (n.untraversableTerrain) return;

                // ignore untraversable neighbours (because of enemy presence)
                if (n.hasEnemyPresence) return;

                // ignore already evaluated neighbours
                if (closedSet.indexOf(n) >= 0) return;

                let d = 1; // distance from current to neighbour
                let g = current.g + d; // tentative neighbour g score
                let g0 = n.g; // current neighbour g score

                // ignore unreachable neighbours
                if (g > hero.maxSteps)
                    return;

                // this is not a better path
                if (g >= g0)
                    return;

                // update path
                let h = n.containsHero ? 1 : 0; // to prefer the clear path
                n.from = current;
                n.g = g;
                n.f = n.g + h;

                // discover new nodes
                openSet.push(n);
            })

        }

        let traversableTiles = searchSpace.reduce((a, b) => a.concat(b)).filter(n => n.g <= hero.maxSteps);
        let validMovementTiles = traversableTiles.filter(n => {
            let at = battle.getHeroAt(n.row, n.column);
            if (at == hero) return true;
            if ((allyTilesAreValidMovementSpaces === true) && (at && at.playerKey == hero.playerKey)) return true;
            return !at;
        });
        let tilesInAttackRange = validMovementTiles.map(n => n.getNeighbours(hero.attackRange)).reduce((a, b) => a.concat(b)).filter(n => !n.blocked);
        let tilesInAssistRange = validMovementTiles.map(n => n.getNeighbours(hero.assistRange)).reduce((a, b) => a.concat(b)).filter(n => !n.blocked);
        let validAttackTargetTiles = tilesInAttackRange.filter(n => {
            let target = battle.getHeroAt(n.row, n.column);
            if (target == hero) return false;
            return target && battle.areEnemies(hero, target);
        });
        let validAssistTargetTiles = tilesInAssistRange.filter(n => {
            let target = battle.getHeroAt(n.row, n.column);
            if (target == hero) return false;
            return target && !battle.areEnemies(hero, target);
        });

        return new FehMovementQueryResult(traversableTiles, validMovementTiles, tilesInAttackRange, tilesInAssistRange, validAttackTargetTiles, validAssistTargetTiles);
    }
}