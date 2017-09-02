/**
 * 
 * @param {any[]} targetArray 
 * @param {any[]} sourceArray 
 */
function addAllElementsNotInTargetArray(targetArray, sourceArray) {
    sourceArray.forEach(e => {
        if (targetArray.indexOf(e) < 0)
            targetArray.push(e);
    })
}

class FehActionQueryNode {

    /**
     * 
     * @param {number} row 
     * @param {number} column 
     * @param {FehActionQueryNode[]} neighbours
     * @param {number} g
     * @param {number} f
     * @param {FehActionQueryNode} from
     */
    constructor(row = 0, column = 0, neighbours = [], g = 0, f = 0, from = null) {
        this.row = row;
        this.column = column;
        this.neighbours = neighbours;
        this.g = g;
        this.f = f;
        this.from = from;
    }

    /**
     * 
     * @param {FehActionQueryNode} node 
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
     * @param {FehActionQueryNode[]} result
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

class FehActionQueryResult {

    /**
     * 
     * @param {FehActionQueryNode[]} traversableTiles 
     * @param {FehActionQueryNode[]} validMovementTiles 
     * @param {FehActionQueryNode[]} tilesInAttackRange 
     * @param {FehActionQueryNode[]} tilesInAssistRange
     * @param {FehActionQueryNode[]} validAttackTargetTiles
     * @param {FehActionQueryNode[]} validAssistTargetTiles
     * @param {FehActionQueryNode[]} nodes
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

class FehActionQuery {


    /**
     * @returns {FehActionQueryNode[][]}
     */
    buildSearchSpace() {
        let searchSpace = [];
        for (let row = 0; row < 8; row++) {
            searchSpace[row] = [];
            for (let column = 0; column < 6; column++) {
                let node = new FehActionQueryNode();
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
     * @param {FehMapHero} hero 
     * @returns {FehActionQueryResult}
     */
    query(battle, hero) {

        let searchSpace = this.buildSearchSpace();
        let start = searchSpace[hero.row][hero.column];

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

                // ignore untraversable neighbours
                let terrain = battle.map.tiles[n.row][n.column];
                if (hero.movementType != MOVEMENT_FLYER)
                    if (terrain != TERRAIN_PLAIN)
                        return;

                // ignore already evaluated neighbours
                if (closedSet.indexOf(n) >= 0)
                    return;

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
                let h = 0;
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
            return !at;
        });
        let tilesInAttackRange = validMovementTiles.map(n => n.getNeighbours(hero.attackRange)).reduce((a, b) => a.concat(b));
        let tilesInAssistRange = validMovementTiles.map(n => n.getNeighbours(hero.assistRange)).reduce((a, b) => a.concat(b));
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

        return new FehActionQueryResult(traversableTiles, validMovementTiles, tilesInAttackRange, tilesInAssistRange, validAttackTargetTiles, validAssistTargetTiles);
    }
}