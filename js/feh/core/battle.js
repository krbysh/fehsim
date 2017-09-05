const KEY_PLAYER = "Player";
const KEY_ENEMY = "Enemy";

const PHASE_SWAP_SPACES = 'Swap Spaces';
const PHASE_PLAYER = 'Player Phase';
const PHASE_ENEMY = 'Enemy Phase';

/**
 * 
 * @param {any[]} array 
 * @param {any} element 
 * @returns {any}
 */
function removeFromArray(array, element) {
    const index = array.indexOf(element);
    array.splice(index, 1);
    return element;
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
     * @param {FehBattleListener[]} listeners
     */
    constructor(map, teamBuild1, teamBuild2, listeners = []) {

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
        this.listeners = listeners;

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

        this.playerTeam.forEach(hero => hero.teamIndex = 0);
        this.enemyTeam.forEach(hero => hero.teamIndex = 1);

        this.listeners.forEach(listener => listener.onStart());
        this.listeners.forEach(listener => listener.onPhase(PHASE_SWAP_SPACES, 0));
        this.playerController.fight();
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
        this.heroes.forEach(hero => hero.isWaiting = false);
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
            this.getTeam(KEY_PLAYER).forEach(hero => hero.isWaiting = false);
            this.phase = PHASE_ENEMY;
        } else if (this.phase == PHASE_ENEMY) {
            this.getTeam(KEY_ENEMY).forEach(hero => hero.isWaiting = false);
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

        if (hero.isWaiting) throw new FehException(EX_ILLEGAL_MOVE, "The hero is waiting and can't move for the rest of the player phase");

        if (isNullOrUndefined(row) && isNullOrUndefined(column) && isNullOrUndefined(target)) {

            // WAIT
            console.log('WAIT');

        } else if (isNullOrUndefined(target)) {

            // MOVE
            this.validateCoordinates(row, column);

            // Is it a valid move?
            let query = new FehActionQuery();
            let result = query.movementQuery(this, hero, false);
            let node = result.validMovementTiles.find(t => t.row == row && t.column == column);
            if (!node) throw new FehException(EX_ILLEGAL_MOVE, 'The coordinates do not belong to a valid movement tile');

            console.log('MOVE');
            hero.isWaiting = true;
            hero.row = row;
            hero.column = column;

            this.listeners.forEach(listener => listener.onMove(hero, row, column));

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
    getHeroAt(row, column) {
        this.validateCoordinates(row, column);
        return this.heroes.find(heroe => heroe.row == row && heroe.column == column);
    }

    /**
     * 
     * @param {FehMapHero} hero 
     * @param {Boolean} allyTilesAreValidMovementSpaces
     * @returns {FehMovementQueryResult}
     */
    getRangeOf(hero, allyTilesAreValidMovementSpaces = false) {
        this.validateMapHero(hero);
        let query = new FehActionQuery();
        let result = query.movementQuery(this, hero, allyTilesAreValidMovementSpaces);
        return result;
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
     * @returns {any[]} 
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
     * @param {FehMapHero} hero 
     * @param {FehMapHero} target
     * @returns {Boolean}
     */
    areEnemies(hero, target) {
        return hero.playerKey != target.playerKey;
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