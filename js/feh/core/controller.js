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
     * @param {FehMapHero} hero 
     * @param {FehMapHero} target 
     * @returns {[]} 
     */
    getValidActionPosition(hero, target) {
        return this.battle.getValidActionPosition(hero, target);
    }

    /**
     * 
     * @param {FehMapHero} hero 
     * @param {nunmber} row 
     * @param {nunmber} column 
     * @param {FehMapHero} target 
     */
    doAction(hero, row, column, target) {
        this.battle.doAction(this.playerKey, hero, row, column, target);
    }

    /**
     * 
     * @param {FehMapHero} hero 
     */
    owns(hero) {
        return this.battle.belongsToPlayer(hero, this.playerKey)
    }

    /**
     * 
     * @param {FehMapHero} hero 
     */
    isEnemy(hero) {
        return this.battle.belongsToEnemy(hero, this.playerKey)
    }
}