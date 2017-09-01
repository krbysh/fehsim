const MOVEMENT_FLYER = 'MOVEMENT_FLYER';
const MOVEMENT_INFANTRY = 'MOVEMENT_INFANTRY';

class FehMapHero {

    constructor() {
        this.isWaiting = true;
        this.playerKey = null;
        this.row = 0;
        this.column = 0;
        this.maxSteps = 3;
        this.attackRange = 1;
        this.movementType = MOVEMENT_INFANTRY;
    }
}