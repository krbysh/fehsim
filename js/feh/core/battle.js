const KEY_PLAYER = "Player";
const KEY_ENEMY = "Enemy";

const PHASE_SWAP_SPACES = 'Swap Spaces';
const PHASE_PLAYER = 'Player Phase';
const PHASE_ENEMY = 'Enemy Phase';

/**
 * 
 * @param {any[]} array 
 * @param {any} element 
 */
function removeFromArray(array, element) {
    const index = array.indexOf(element);
    array.splice(index, 1);
}

function isNullOrUndefined(value) {
    if (value === null) return true;
    if (value === undefined) return true;
    return false;
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

class FehBattle {

    /**
     * 
     * @param {FehMap} map 
     * @param {FehBuild[]} teamBuild1 
     * @param {FehBuild[]} teamBuild2
     */
    constructor(map, teamBuild1, teamBuild2) {

        this.map = map;
        this.playerController = new FehController(this, KEY_PLAYER);
        this.enemyController = new FehController(this, KEY_ENEMY);
        this.teamBuild1 = teamBuild1;
        this.teamBuild2 = teamBuild2;
        this.playerTeam = null;
        this.enemyTeam = null;
        this.phase = PHASE_SWAP_SPACES;
        this.turn = 0;
        this.canSwapSpaces = false;
        this.listeners = [];

    }

    /**
     * 
     * @param {FehBattleListener} listener
     */
    addBattleListener(listener) {
        if (listener instanceof FehBattleListener)
            this.listeners.push(listener);
    }

    restart() {

        this.canSwapSpaces = true;
        this.phase = PHASE_SWAP_SPACES;
        this.turn = 0;

        let buildTeamFromBuild = teamBuild => {
            let team = [];
            for (let i = 0; i < teamBuild.length; i++) {
                let build = teamBuild[i];
                let hero = build.createInstance();
                team.push(hero);
            }
            return team;
        };

        this.playerTeam = buildTeamFromBuild(this.teamBuild1);
        this.enemyTeam = buildTeamFromBuild(this.teamBuild2);
        this.heroes = []
        this.playerTeam.forEach(heroe => this.heroes.push(heroe));
        this.enemyTeam.forEach(heroe => this.heroes.push(heroe));

        for (let i = 0; i < this.playerTeam.length; i++) {
            let hero = this.playerTeam[i];
            let coord = this.map.playerSpaces[i];
            hero.row = coord[0];
            hero.column = coord[1];
        }

        for (let i = 0; i < this.enemyTeam.length; i++) {
            let enemy = this.enemyTeam[i];
            let coord = this.map.enemySpaces[i];
            enemy.row = coord[0];
            enemy.column = coord[1];
        }

        this.getTeam(KEY_PLAYER).forEach(hero => hero.playerKey = KEY_PLAYER);
        this.getTeam(KEY_ENEMY).forEach(hero => hero.playerKey = KEY_ENEMY);

        this.listeners.forEach(listener => listener.onStart());
        this.listeners.forEach(listener => listener.onPhase(PHASE_SWAP_SPACES, 0));
    }

    /**
     * 
     * @param {String} playerKey 
     * @throws {FehException}
     */
    swapSpaces(playerKey) {
        this.validatePhasePlayer(playerKey);
        if (!this.canSwapSpaces || this.phase != PHASE_PLAYER || this.turn != 1) throw new FehException(EX_WRONG_TIMING,
            "You can only go back to the 'Swap Spaces' phase during the first turn and before you perform any action");
        this.phase = PHASE_SWAP_SPACES;
        this.listeners.forEach(listener => listener.onPhase(this.phase, this.turn));
    }

    /**
     * 
     * @param {String} playerKey 
     * @throws {FehException}
     */
    fight(playerKey) {
        if (this.phase !== PHASE_SWAP_SPACES)
            throw new FehException(EX_WRONG_TIMING, "You can only call fight during the 'Swap Spaces' phase");
        this.phase = PHASE_PLAYER;
        this.turn = 1;
        this.getTeam(KEY_PLAYER).forEach(hero => hero.canTakeAction = true);
        this.listeners.forEach(listener => listener.onPhase(this.phase, this.turn));
    }

    /**
     * 
     * @param {string} playerKey 
     * @throws {FehException}
     */
    endTurn(playerKey) {

        this.validatePlayerKey(playerKey);

        if (!(playerKey === KEY_PLAYER && this.phase === PHASE_PLAYER || playerKey === KEY_ENEMY && this.phase === PHASE_ENEMY))
            throw new FehException(EX_INVALID_PLAYER, "You can only call end turn during your phase");

        if (this.phase == PHASE_PLAYER) {
            this.getTeam(KEY_PLAYER).forEach(hero => hero.canTakeAction = true);
            this.phase = PHASE_ENEMY;
        } else if (this.phase == PHASE_ENEMY) {
            this.getTeam(KEY_ENEMY).forEach(hero => hero.canTakeAction = true);
            this.phase = PHASE_PLAYER;
            this.turn++;
        }

        this.listeners.forEach(listener => listener.onPhase(this.phase, this.turn));
    }

    /**
     * 
     * @param {String} playerKey 
     * @param {FehMapHero} hero 
     * @param {Number} row 
     * @param {Number} column 
     * @param {FehMapHero} target 
     */
    doAction(playerKey, hero, row, column, target) {

        this.validatePhasePlayer(playerKey);
        this.validateHeroOwnership(playerKey, hero);

        if (isNullOrUndefined(row) && isNullOrUndefined(column) && isNullOrUndefined(target)) {

            // WAIT
            console.log('WAIT');

        } else if (isNullOrUndefined(target)) {

            // MOVE
            this.validateCoordinates(row, column);
            console.log('MOVE');

        } else {

            // ATTACK or ASSIST
            this.validateCoordinates(row, column);
            this.validateMapHero(target);

            if (hero.playerKey == target.playerKey) console.log('ASSIST');
            else console.log('ATTACK');

        }

        this.canSwapSpaces = false;

    }

    /**
     * 
     * @param {string} playerKey 
     * @returns {FehController}
     */
    getController(playerKey) {

        this.validatePlayerKey(playerKey);

        if (playerKey == KEY_PLAYER) return this.playerController;
        if (playerKey == KEY_ENEMY) return this.enemyController;
    }

    /**
     * 
     * @param {String} playerKey 
     * @returns {FehMapHero[]}
     */
    getTeam(playerKey) {

        this.validatePlayerKey(playerKey);

        if (playerKey == KEY_PLAYER) return this.playerTeam;
        if (playerKey == KEY_ENEMY) return this.enemyTeam;
    }

    /**
     * 
     * @param {String} playerKey
     * @returns {FehMapHero[]} 
     */
    getEnemyTeam(playerKey) {

        this.validatePlayerKey(playerKey);

        if (playerKey == KEY_PLAYER) return this.enemyTeam;
        if (playerKey == KEY_ENEMY) return this.ream1;
    }

    /**
     * 
     * @param {Number} row 
     * @param {Number} column 
     * @returns {FehMapHero}
     */
    getTileContent(row, column) {
        this.validateCoordinates(row, column);
        return this.heroes.find(heroe => heroe.row == row && heroe.column == column);
    }

    /**
     * 
     * @param {FehMapHero} hero 
     */
    getRangeOf(hero) {

        this.validateMapHero(hero);

        let searchSpace = [];

        // nodes
        for (let row = 0; row < 8; row++) {
            searchSpace[row] = [];
            for (let column = 0; column < 8; column++) {
                let node = {
                    row: row,
                    column: column,
                    g: 999,
                    f: 999,
                    validRestPosition: true,
                    content: null,
                    neighbours: [],
                    getNeighbourNodes: function (range) {
                        let nodes = [this];
                        while (range >= 1) {
                            nodes.forEach(node => {
                                node.neighbours.forEach(neighbour => {
                                    if (nodes.indexOf(neighbour < 0))
                                        nodes.push(neighbour);
                                });
                            })
                            range--;
                        }
                        removeFromArray(nodes, this);
                        return nodes;
                    }
                };
                searchSpace[row][column] = node;
            }
        }

        // neighbours
        for (let row = 0; row < 8; row++) {
            for (let column = 0; column < 8; column++) {
                let neighbours = searchSpace[row][column].neighbours;
                if (row > 0) neighbours.push(searchSpace[row - 1][column]);
                if (row < 7) neighbours.push(searchSpace[row + 1][column]);
                if (column > 0) neighbours.push(searchSpace[row][column - 1]);
                if (column < 5) neighbours.push(searchSpace[row][column + 1]);
            }
        }


        let start = searchSpace[hero.row][hero.column];
        start.g = 0; // The cost of going from start to start is zero.

        /** 
         * The set of nodes already evaluated */
        let closedSet = [];

        /** 
         * The set of currently discovered nodes that are not evaluated yet. 
         * Initially, only the start node is known. */
        let openSet = [start];

        let limit = 0;

        while (openSet.length > 0) {

            /**
             * The node in openSet having the lowest fScore */
            let current = openSet.sort((a, b) => a.f - b.f)[0];

            removeFromArray(openSet, current);
            closedSet.push(current);

            let neighbours = current.neighbours;

            neighbours.forEach(neighbour => {

                // TERRAIN CONSTRAINTS
                let terrain = this.map.tiles[neighbour.row][neighbour.column];
                if (hero.movementType != MOVEMENT_FLYER) {
                    if (terrain != TERRAIN_PLAIN)
                        return;
                }

                // If neighbor in closedSet
                if (closedSet.indexOf(neighbour) >= 0) {
                    // Ignore the neighbor which is already evaluated
                    return;
                }

                // If neighbor not in closedSet
                if (closedSet.indexOf(neighbour) < 0) {
                    // Discover a new node
                    openSet.push(neighbour);
                }

                // All neighbours are at 1 "step" of distance
                let distanceBetweenCurrentNeighbour = 1;

                /** The distance from start to a neighbor */
                let tentativeGScore = current.g + distanceBetweenCurrentNeighbour;

                let currentGScore = neighbour.g;
                if (tentativeGScore >= currentGScore) {
                    // This is not a better path.
                    return;
                }

                // No heuristics please
                let heuristicCostFromNeighbourToGoal = 0;

                neighbour.cameFrom = current;
                neighbour.g = tentativeGScore;
                neighbour.f = neighbour.g + heuristicCostFromNeighbourToGoal;

            });

        }

        // REST POSITIONS
        this.heroes.forEach(hero => {
            let node = searchSpace[hero.row][hero.column];
            node.validRestPosition = false;
            node.content = this.getTileContent(node.row, node.column);
        });

        let range = {
            moveRange: [],
            attackRange: []
        }

        searchSpace.forEach(row => row.forEach(node => {
            if (node.g <= hero.maxSteps)
                range.moveRange.push(node);
        }));

        range.moveRange.forEach(node => {
            let attackRange = node.getNeighbourNodes(hero.attackRange);
            attackRange.forEach(a => {
                range.attackRange.push(a);
            })
        });

        return range;
    }

    /**
     * 
     * @param {String} playerKey 
     * @returns {FehMapHero[]}
     */
    getAvailableHeroes(playerKey) {

        this.validatePlayerKey(playerKey)

        let team = this.getTeam(playerKey);
        let heroes = [];
        team.forEach(e => {
            if (e.canTakeAction)
                heroes.push(e);
        });
        return heroes;
    }

    /**
     * 
     * @param {FehMapHero} hero 
     * @param {FehMapHero} target 
     * @returns {[]} 
     * @throws {FehException}
     */
    getValidActionPosition(hero, target) {
        throw new FehException(EX_NOT_IMPLEMENTED, 'This function has not been implemented');
    }

    /**
     * 
     * @param {String} playerKey 
     */
    isPlayerPhase(playerKey) {
        this.validatePlayerKey(playerKey);
        if (playerKey == KEY_PLAYER) return this.phase == PHASE_PLAYER || this.phase == PHASE_SWAP_SPACES;
        if (playerKey == KEY_ENEMY) return this.phase == PHASE_ENEMY;
    }

    /**
     * 
     * @param {String} playerKey 
     * @throws {FehException}
     */
    validatePlayerKey(playerKey) {
        if (playerKey == KEY_PLAYER) return true;
        if (playerKey == KEY_ENEMY) return true;
        throw new FehException(EX_INVALID_PLAYER, "'" + playerKey + "' is not a valid player key");
    }

    /**
      * 
      * @param {String} playerKey 
      * @throws {FehException}
      */
    validatePhasePlayer(playerKey) {
        this.validatePlayerKey(playerKey);
        if ((this.phase == PHASE_PLAYER && playerKey == KEY_ENEMY) || (this.phase == PHASE_ENEMY && playerKey == KEY_PLAYER))
            throw new FehException(EX_INVALID_PLAYER, "Is not '" + playerKey + "' phase");
    }

    /**
     * 
     * @param {FehMapHero} hero 
     * @throws {FehException}
     */
    validateMapHero(hero) {
        if (hero === null || hero === undefined || !(hero instanceof FehMapHero))
            throw new FehException(EX_INVALID_TYPE, "'" + hero + "' is not a FehMapHero");
        if (this.playerTeam.indexOf(hero) < 0 && this.enemyTeam.indexOf(hero) < 0)
            throw new FehException(EX_WRONG_BATTLE, "'" + hero + "' is not in this battle");
    }

    /**
     * 
     * @param {String} playerKey 
     * @param {FehMapHero} hero 
     * @throws {FehException}
     */
    validateHeroOwnership(playerKey, hero) {
        this.validateMapHero(hero);
        if (playerKey != hero.playerKey) throw new FehException(EX_WRONG_PLAYER, "'" + hero + "' is not on team '" + playerKey + "'");
    }

    /**
     * 
     * @param {Number} row 
     * @param {Number} column 
     * @throws {FehException}
     */
    validateCoordinates(row, column) {
        if (!isNumber(row)) throw new FehException(EX_BAD_PARAM, "row as '" + row + "' is not a Number");
        if (!isNumber(column)) throw new FehException(EX_BAD_PARAM, "column as '" + column + "' is not a Number");
        if (column < 0 || column >= 6) throw new FehException(EX_BAD_PARAM, "row as '" + row + "' is out of range");
        if (row < 0 || row >= 8) throw new FehException(EX_BAD_PARAM, "column as '" + column + "' is out of range");
    }

    toString() {
        return this.phase + ' turn ' + this.turn;
    }

    /**
     * 
     * @param {FehMapHero} hero
     * @param {String} playerKey 
     */
    belongsToEnemy(hero, playerKey) {
        this.validatePlayerKey(playerKey);
        return hero.playerKey != playerKey;
    }

    /**
 * 
 * @param {FehMapHero} hero
 * @param {String} playerKey 
 */
    belongsToPlayer(hero, playerKey) {
        this.validatePlayerKey(playerKey);
        return hero.playerKey == playerKey;
    }
}