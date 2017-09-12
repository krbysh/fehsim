/**
 * BLA3
 * @module Battle
 * */

const KEY_PLAYER = "Player";
const KEY_ENEMY = "Enemy";

const PHASE_SWAP_SPACES = 'Swap Spaces';
const PHASE_PLAYER = 'Player Phase';
const PHASE_ENEMY = 'Enemy Phase';

/**
 * 
 */
class FehBattleListener {

    onStart() {
    }

    /**
     * 
     * @param {String} phase 
     * @param {Number} turn 
     */
    onPhase(phase, turn) {
    }

    /**
     * 
     * @param {FehUnit} unit 
     * @param {Number} row 
     * @param {Number} column 
     */
    onMove(unit, row, column) {
    }

    /**
     * 
     * @param {FehUnit} unit 
     * @param {FehUnit} target 
     */
    onSwap(unit, target) {
    }

    /**
     * 
     * @param {FehUnit} unit 
     * @param {FehUnit} target 
     */
    onAssist(unit, target) {

    }
}

/**
 * 
 */
class FehController {

    /**
     * 
     * @param {FehBattle} battle 
     * @param {string} playerKey 
     */
    constructor(battle, playerKey) {
        this.battle = battle;
        this.playerKey = playerKey;
    }

    fight() {
        this.battle.fight(this.playerKey);
    }

    swapSpaces() {
        this.battle.swapSpaces(this.playerKey);
    }

    endTurn() {
        this.battle.endTurn(this.playerKey);
    }

    getTeam() {
        return this.battle.getTeam(this.playerKey);
    }

    getEnemyTeam() {
        return this.battle.getEnemyTeam(this.playerKey);
    }

    getAvailableHeroes() {
        return this.battle.getAvailableHeroes(this.playerKey);
    }

    getAvailableActions() {
    }

    isPlayerPhase() {
        return this.battle.isPlayerPhase(this.playerKey);
    }

    /**
     * 
     * @param {FehUnit} hero 
     * @param {FehUnit} target 
     * @returns {any[]} 
     */
    getValidActionPosition(hero, target) {
        return this.battle.getValidActionPosition(hero, target);
    }

    /**
     * 
     * @param {FehUnit} hero 
     * @param {nunmber} row 
     * @param {nunmber} column 
     * @param {FehUnit} target 
     */
    doAction(hero, row, column, target) {
        this.battle.doAction(this.playerKey, hero, row, column, target);
    }

    /**
     * 
     * @param {FehUnit} unit 
     */
    owns(unit) {
        if (!unit || !(unit instanceof FehUnit)) throw new FehException(EX_INVALID_TYPE, '"' + unit + '" is not a valid FehUnit');
        return this.battle.belongsToPlayer(unit, this.playerKey)
    }

    /**
     * 
     * @param {FehUnit} hero 
     */
    isEnemy(hero) {
        return this.battle.belongsToEnemy(hero, this.playerKey)
    }
}

/**
 * 
 */
class FehBattle {

    constructor() {

        /**
         * @type {FehMap}
         */
        this.map = null;
        this.playerController = new FehController(this, KEY_PLAYER);
        this.enemyController = new FehController(this, KEY_ENEMY);

        /**
         * @type {FehUnit[]}
         */
        this.heroes = [];

        /**
         * @type {FehUnit[]}
         */
        this.playerTeam = [];

        /**
         * @type {FehUnit[]}
         */
        this.enemyTeam = [];

        this.phase = PHASE_SWAP_SPACES;
        this.turn = 0;
        this.canSwapSpaces = false;

        /**
         * @type {FehBattleListener[]}
         */
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

        // this.playerTeam = buildTeamFromBuild(this.teamBuild1);
        // this.enemyTeam = buildTeamFromBuild(this.teamBuild2);

        this.heroes = [];
        this.playerTeam.forEach(heroe => this.heroes.push(heroe));
        this.enemyTeam.forEach(heroe => this.heroes.push(heroe));
        this.heroes.forEach(unit => {
            unit.battle = this;
            unit.rebuild();
        })


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
     * @param {FehUnit} unit 
     * @param {Number} row 
     * @param {Number} column 
     * @param {FehUnit} target 
     */
    doAction(playerKey, unit, row, column, target) {

        this.validatePhasePlayer(playerKey);
        this.validateHeroOwnership(playerKey, unit);

        if (unit.isWaiting) throw new FehException(EX_ILLEGAL_MOVE, "The unit is waiting and cannot move for the rest of the turn");

        if (this.phase == PHASE_SWAP_SPACES) {
            this.validateHeroOwnership(playerKey, target);
            let row0 = unit.row;
            let col0 = unit.column;
            unit.row = target.row;
            unit.column = target.column;
            target.row = row0;
            target.column = col0;
            this.listeners.forEach(listener => listener.onSwap(unit, target));
            return;
        }

        if (isNullOrUndefined(row) && isNullOrUndefined(column) && isNullOrUndefined(target)) {

            // WAIT
            console.log('WAIT');

        } else if (isNullOrUndefined(target)) {

            // MOVE
            this.validateCoordinates(row, column);

            // Is it a valid move?
            let query = new FehActionQuery();
            let result = query.movementQuery(this, unit, false);
            let node = result.validMovementTiles.find(t => t.row == row && t.column == column);
            if (!node) throw new FehException(EX_ILLEGAL_MOVE, 'The unit cannot move to those coordinates');

            console.log('MOVE');
            unit.isWaiting = true;
            unit.row = row;
            unit.column = column;

            this.listeners.forEach(listener => listener.onMove(unit, row, column));

        } else {

            // ATTACK or ASSIST
            this.validateCoordinates(row, column);
            this.validateUnit(target);

            if (unit.playerKey == target.playerKey) {

                // ASSIST

                // Is it a valid move?
                let query = new FehActionQuery();
                let result = query.movementQuery(this, unit, false);
                let toNode = result.validAssistTargetTiles.find(n => n.row == target.row && n.column == target.column);
                if (!toNode) throw new FehException(EX_ILLEGAL_MOVE, 'The target cannot be assisted by the unit');
                let fromNode = toNode.assistableFrom.find(n => n.row == row && n.column == column);
                if (!fromNode) throw new FehException(EX_ILLEGAL_MOVE, 'The target cannot be assisted from those coordinates');

                console.log('ASSIST');
                unit.isWaiting = true;
                unit.row = row;
                unit.column = column;
                unit.assist.assist(unit, target);

                this.listeners.forEach(listener => listener.onAssist(unit, target));

            } else {
                console.log('ATTACK');
            }
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
     * @returns {FehUnit[]}
     */
    getTeam(playerKey) {

        this.validatePlayerKey(playerKey);

        if (playerKey == KEY_PLAYER) return this.playerTeam;
        if (playerKey == KEY_ENEMY) return this.enemyTeam;
    }

    /**
     * 
     * @param {String} playerKey
     * @returns {FehUnit[]} 
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
     * @returns {FehUnit}
     */
    getUnitAt(row, column) {
        this.validateCoordinates(row, column);
        return this.heroes.find(heroe => heroe.row == row && heroe.column == column);
    }

    /**
     * 
     * @param {FehUnit} hero 
     * @param {Boolean} allyTilesAreValidMovementSpaces
     * @returns {FehMovementQueryResult}
     */
    getRangeOf(hero, allyTilesAreValidMovementSpaces = false) {
        this.validateUnit(hero);
        let query = new FehActionQuery();
        let result = query.movementQuery(this, hero, allyTilesAreValidMovementSpaces);
        return result;
    }

    /**
     * 
     * @param {String} playerKey 
     * @returns {FehUnit[]}
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
     * @param {FehUnit} hero 
     * @param {FehUnit} target 
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
     * @param {FehUnit} hero 
     * @param {FehUnit} target
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
     * @param {FehUnit} hero 
     * @throws {FehException}
     */
    validateUnit(hero) {
        if (hero === null || hero === undefined || !(hero instanceof FehUnit))
            throw new FehException(EX_INVALID_TYPE, "'" + hero + "' is not a FehMapHero");
        if (this.playerTeam.indexOf(hero) < 0 && this.enemyTeam.indexOf(hero) < 0)
            throw new FehException(EX_WRONG_BATTLE, "'" + hero + "' is not in this battle");
    }

    /**
     * 
     * @param {String} playerKey 
     * @param {FehUnit} hero 
     * @throws {FehException}
     */
    validateHeroOwnership(playerKey, hero) {
        this.validateUnit(hero);
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
     * @param {FehUnit} hero
     * @param {String} playerKey 
     */
    belongsToEnemy(hero, playerKey) {
        this.validatePlayerKey(playerKey);
        return hero.playerKey != playerKey;
    }

    /**
 * 
 * @param {FehUnit} hero
 * @param {String} playerKey 
 */
    belongsToPlayer(hero, playerKey) {
        this.validatePlayerKey(playerKey);
        return hero.playerKey == playerKey;
    }
}