/**
 * 
 * @param {FehController} controller 
 */
function aiStep(controller) {

    console.log('AI_STEP ' + controller.battle)

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