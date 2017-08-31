/**
 * 
 * @param {FehController} controller 
 */
function aiStep(controller) {
    console.log('AI_STEP ' + controller.battle)
    if (controller.isPlayerPhase())
        controller.endTurn();

}