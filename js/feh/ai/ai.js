/**
 * BLA3
 * @module AI
 * */

/**
 * Enemy AI refers to the entity / computer controlling the enemy units whenever a player battles on a map. 
 * This includes the decision-making the computer uses to move / attack a player's units.
 * @param {FehController} controller 
 */
function aiStep(controller) {
    if (controller.isPlayerPhase()) {
        let team = controller.getTeam().filter(hero => !hero.isWaiting);
        if (team.length > 0) {
            let hero = team[0];

            // MOVE HERO TO A RANDOM TILE
            let query = new FehActionQuery();
            let movementResult = query.movementQuery(controller.battle, hero, false);
            let movementTiles = movementResult.validMovementTiles;
            if (movementTiles.length > 0) {
                let target = movementTiles[Math.floor(Math.random() * movementTiles.length)];
                controller.doAction(hero, target.row, target.column, null);
                return;
            }
        }
        controller.endTurn();

    }
}

class FehArenaAI {



    constructor() {
        /**
         * @type {FehController}
         */
        this.controller = null;
        this.aggressive = true;
    }

    step() {
        if (!this.enemyUnitsInRange()) {
            
            let movementScore = [];
            this.controller.getAvailableHeroes().forEach(unit => movementScore[unit] = this.getMovementSortScore(unit));

        } else {

        }
    }

    /**
     * @param {FehUnit} unit 
     * @returns {number}
     */
    getMovementSortScore(unit) {

        // The order enemy units will move is as follows:
        // Melee Units (No Support Skill)
        // Ranged Units (No Support Skill)
        // Melee Units (With Support Skill)
        // Ranged Units (With Support Skill)
        // Units with no Attack (eg. Healers)

        let meeleUnit = unit.attackRange === 1;
        let withSupportSkill = unit.assistRange > 0;
        let noSupportSkill = !withSupportSkill;

        let score = 0;
        if (meeleUnit && noSupportSkill) score = 5000;
        if (rangedUnit && noSupportSkill) score = 4000;
        if (meeleUnit && withSupportSkill) score = 3000;
        if (rangedUnit && withSupportSkill) score = 2000;
        score = 1000;

        // If two enemy units are the same type (eg. Two Melee Units with no Support Skills), the unit that will move first is determined by:
        // Whichever unit has the shortest walkable path to a player's ally units
        // It depends on the movement cost per unit. As an example, for infantries the forests count as much as 2 plains for sake of the calculation.

        // TODO va en otro método

        // Slot Order (See Arena Maps for exact slot order / spawn locations for each Arena map, ascending order)

        // TODO va en otro método

    }

    enemyUnitsInRange() {
        throw new FehException(EX_NOT_IMPLEMENTED, 'TODO');
    }
}