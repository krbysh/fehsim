const MOVEMENT_FLYER = 'MOVEMENT_FLYER';
const MOVEMENT_ARMOR = 'MOVEMENT_ARMOR';
const MOVEMENT_CAVALRY = 'MOVEMENT_CAVALRY';
const MOVEMENT_INFANTRY = 'MOVEMENT_INFANTRY';

class FehMapHero {

    constructor() {
        this.isWaiting = true;
        this.playerKey = null;
        this.row = 0;
        this.column = 0;
        this.maxSteps = 2;
        this.attackRange = 1;
        this.assistRange = 1;
        this.movementType = MOVEMENT_INFANTRY;
        this.teamIndex = 1;
    }
}